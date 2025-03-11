# Easy-AdminPanel API Entegrasyon Rehberi

Bu rehber, Easy-AdminPanel'in veritabanı ile iletişim kurabilmesi için gerekli API uç noktalarını nasıl oluşturacağınızı açıklar.

## API Yapısı

Easy-AdminPanel, çeşitli API rotalarını kullanarak çalışır:

1. `/api/tables` - Kullanıcının seçtiği, panel üzerinde gösterilecek tabloları listeler
2. `/api/all-tables` - Veritabanından tüm tabloları getirir
3. `/api/save-tables` - Kullanıcının seçtiği tabloları kaydeder
4. `/api/resources/[table]` - Belirli bir tablo üzerinde CRUD işlemleri yapar
5. `/api/create-table` - Yeni bir tablo oluşturur

## API Örnekleri

Her bir API için örnek bir implementasyon aşağıda verilmiştir:

### 1. `/api/tables` (GET)

```typescript
// src/app/api/tables/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const tablesPath = path.join(process.cwd(), 'tables.json');
    
    if (!fs.existsSync(tablesPath)) {
      return NextResponse.json({ tables: [] });
    }
    
    const tablesData = fs.readFileSync(tablesPath, 'utf8');
    const tables = JSON.parse(tablesData);
    
    return NextResponse.json({ tables });
  } catch (error) {
    console.error('Tablolar alınırken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Tablolar alınamadı' },
      { status: 500 }
    );
  }
}
```

### 2. `/api/all-tables` (GET)

```typescript
// src/app/api/all-tables/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    client.release();
    
    const tables = result.rows.map(row => row.table_name);
    
    return NextResponse.json({ tables });
  } catch (error) {
    console.error('Veritabanı tabloları alınırken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Veritabanı tabloları alınamadı' },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
```

### 3. `/api/save-tables` (POST)

```typescript
// src/app/api/save-tables/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { tables } = await request.json();
    
    const tablesPath = path.join(process.cwd(), 'tables.json');
    fs.writeFileSync(tablesPath, JSON.stringify(tables, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tablolar kaydedilirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Tablolar kaydedilemedi' },
      { status: 500 }
    );
  }
}
```

### 4. `/api/resources/[table]` (GET, POST, PUT, DELETE)

```typescript
// src/app/api/resources/[table]/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// GET - Tüm kayıtları veya belirli bir kaydı al
export async function GET(
  request: Request,
  { params }: { params: { table: string } }
) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const range = searchParams.get('range');
  const sort = searchParams.get('sort');
  const filter = searchParams.get('filter');
  
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();
    let query = '';
    let result;
    
    // Tek bir kayıt sorgusu
    if (id) {
      query = `SELECT * FROM ${params.table} WHERE id = $1`;
      result = await client.query(query, [id]);
      client.release();
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Kayıt bulunamadı' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(result.rows[0]);
    }
    
    // Aralık sorgusu
    else if (range) {
      const [start, end] = JSON.parse(range);
      const limit = end - start + 1;
      const offset = start;
      
      // Sıralama
      let orderBy = '';
      if (sort) {
        const [field, order] = JSON.parse(sort);
        orderBy = `ORDER BY ${field} ${order === 'ASC' ? 'ASC' : 'DESC'}`;
      }
      
      // Filtreleme
      let whereClause = '';
      let queryParams: any[] = [];
      if (filter) {
        const filterObj = JSON.parse(filter);
        const conditions = [];
        let paramIndex = 1;
        
        for (const [key, value] of Object.entries(filterObj)) {
          if (value !== undefined && value !== null) {
            conditions.push(`${key} = $${paramIndex}`);
            queryParams.push(value);
            paramIndex++;
          }
        }
        
        if (conditions.length > 0) {
          whereClause = `WHERE ${conditions.join(' AND ')}`;
        }
      }
      
      // Toplam sayı sorgusu
      const countQuery = `SELECT COUNT(*) FROM ${params.table} ${whereClause}`;
      const countResult = await client.query(countQuery, queryParams);
      const totalCount = parseInt(countResult.rows[0].count);
      
      // Veri sorgusu
      query = `
        SELECT * FROM ${params.table}
        ${whereClause}
        ${orderBy}
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      result = await client.query(query, queryParams);
      client.release();
      
      // Content-Range header'ı ile yanıt
      const headers = new Headers();
      headers.append('Content-Range', `${params.table} ${start}-${end}/${totalCount}`);
      
      return new NextResponse(JSON.stringify(result.rows), {
        headers,
        status: 200
      });
    }
    
    // Tüm kayıtları getir
    else {
      query = `SELECT * FROM ${params.table}`;
      result = await client.query(query);
      client.release();
      
      return NextResponse.json(result.rows);
    }
  } catch (error) {
    console.error(`${params.table} tablosundan veri alınırken hata:`, error);
    return NextResponse.json(
      { error: 'Veriler alınamadı' },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}

// POST - Yeni kayıt oluştur
export async function POST(
  request: Request,
  { params }: { params: { table: string } }
) {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const data = await request.json();
    const client = await pool.connect();
    
    // Veri nesnesinden alan ve değer dizileri oluştur
    const fields = Object.keys(data);
    const values = Object.values(data);
    
    // Parametrize edilmiş sorgu oluştur
    const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
    const query = `
      INSERT INTO ${params.table} (${fields.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    const result = await client.query(query, values);
    client.release();
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error(`${params.table} tablosuna kayıt eklenirken hata:`, error);
    return NextResponse.json(
      { error: 'Kayıt oluşturulamadı' },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}

// PUT - Mevcut kaydı güncelle
export async function PUT(
  request: Request,
  { params }: { params: { table: string } }
) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json(
      { error: 'ID parametresi gerekli' },
      { status: 400 }
    );
  }
  
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const data = await request.json();
    const client = await pool.connect();
    
    // Güncellenecek alanları hazırla
    const updates = Object.entries(data)
      .map(([key, _], index) => `${key} = $${index + 1}`)
      .join(', ');
    
    // id değerini en sona koy
    const values = [...Object.values(data), id];
    
    const query = `
      UPDATE ${params.table}
      SET ${updates}
      WHERE id = $${values.length}
      RETURNING *
    `;
    
    const result = await client.query(query, values);
    client.release();
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Güncellenecek kayıt bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(`${params.table} tablosundaki kayıt güncellenirken hata:`, error);
    return NextResponse.json(
      { error: 'Kayıt güncellenemedi' },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}

// DELETE - Kaydı sil
export async function DELETE(
  request: Request,
  { params }: { params: { table: string } }
) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json(
      { error: 'ID parametresi gerekli' },
      { status: 400 }
    );
  }
  
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();
    
    const query = `
      DELETE FROM ${params.table}
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await client.query(query, [id]);
    client.release();
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Silinecek kayıt bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(`${params.table} tablosundaki kayıt silinirken hata:`, error);
    return NextResponse.json(
      { error: 'Kayıt silinemedi' },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
```

### 5. `/api/create-table` (POST)

```typescript
// src/app/api/create-table/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function POST(request: Request) {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const { tableName, columns } = await request.json();
    
    if (!tableName || !columns || !Array.isArray(columns) || columns.length === 0) {
      return NextResponse.json(
        { error: 'Geçersiz tablo bilgileri' },
        { status: 400 }
      );
    }
    
    const client = await pool.connect();
    
    // Kolon tanımlarını oluştur
    const columnDefinitions = columns
      .map(col => `${col.name} ${col.type}${col.constraints ? ' ' + col.constraints : ''}`)
      .join(', ');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id SERIAL PRIMARY KEY,
        ${columnDefinitions}
      )
    `;
    
    await client.query(createTableQuery);
    client.release();
    
    return NextResponse.json({ 
      success: true,
      message: `${tableName} tablosu başarıyla oluşturuldu` 
    });
  } catch (error) {
    console.error('Tablo oluşturulurken hata:', error);
    return NextResponse.json(
      { error: 'Tablo oluşturulamadı' },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
```

## Özel API İpuçları

1. Güvenlik: Gerçek bir uygulama için, bu API'lere erişimi kimlik doğrulama ve yetkilendirme ile sınırlamanız önerilir.

2. Tablo Adları: SQL enjeksiyon saldırılarını önlemek için tablo adlarını parametrize etmek önemlidir. Yukarıdaki örnekler basitleştirilmiştir.

3. İlişkisel Veriler: İlişkisel verileri işlemek için, bu API'leri join sorgularını destekleyecek şekilde genişletebilirsiniz.

4. Hata İşleme: Daha kapsamlı hata işleme, hata günlüğü oluşturma ve kullanıcıya anlamlı hata mesajları sunmak önemlidir.

5. Performans Optimizasyonu: Büyük veri setleri için sayfalama, filtreleme ve önbelleğe alma stratejileri düşünün. 