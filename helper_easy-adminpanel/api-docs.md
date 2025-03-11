# Easy-AdminPanel API Entegrasyon Rehberi

Easy-AdminPanel paketi, veritabanı tablolarınız için dinamik olarak CRUD işlemleri yapabilmenize olanak tanır. Bu rehber, paket tarafından beklenen API rotalarının nasıl oluşturulacağını detaylı olarak açıklayacaktır.

## Gerekli API Rotaları

Easy-AdminPanel, aşağıdaki API rotalarını kullanır:

1. `GET /api/tables`: Kullanıcı tarafından seçilmiş tüm tabloları getirir
2. `GET /api/all-tables`: Veritabanındaki tüm tabloları listeler
3. `POST /api/save-tables`: Kullanıcının seçtiği tabloları kaydeder
4. `POST /api/create-table`: Yeni bir tablo oluşturur
5. `GET/POST/PUT/DELETE /api/resources/[table]`: Tablolar üzerinde CRUD işlemleri yapar

Aşağıda her bir API için örnek implementasyonlar bulunmaktadır.

## 1. Tabloları Getirme API'si

```tsx
// src/app/api/tables/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// PostgreSQL bağlantı havuzu oluştur
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      // Seçilmiş tabloları getir
      const query = `
        SELECT table_name, display_name 
        FROM selected_tables 
        ORDER BY display_name;
      `;
      const result = await client.query(query);
      
      // Tablolar için uygun formata çevir
      const tables = result.rows.map(row => ({
        name: row.table_name,
        displayName: row.display_name || row.table_name
      }));
      
      return NextResponse.json(tables);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Tablolar getirilirken hata oluştu:', error);
    return NextResponse.json({ error: 'Tablolar getirilirken bir hata oluştu' }, { status: 500 });
  }
}
```

## 2. Tüm Tabloları Getirme API'si

```tsx
// src/app/api/all-tables/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      // Veritabanındaki tüm tabloları getir
      const query = `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `;
      const result = await client.query(query);
      
      // Tablo adlarını dizi olarak döndür
      const tableNames = result.rows.map(row => row.table_name);
      
      return NextResponse.json(tableNames);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Tüm tablolar getirilirken hata oluştu:', error);
    return NextResponse.json({ error: 'Tüm tablolar getirilirken bir hata oluştu' }, { status: 500 });
  }
}
```

## 3. Tabloları Kaydetme API'si

```tsx
// src/app/api/save-tables/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function POST(request: NextRequest) {
  try {
    const { tables } = await request.json();
    
    if (!Array.isArray(tables)) {
      return NextResponse.json({ error: 'Geçersiz veri formatı' }, { status: 400 });
    }
    
    const client = await pool.connect();
    try {
      // Önce mevcut tüm tabloları temizle
      await client.query('DELETE FROM selected_tables');
      
      // Yeni tabloları ekle
      if (tables.length > 0) {
        const placeholders = tables.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(', ');
        const values = tables.flatMap(table => [table, table.replace(/_/g, ' ')]);
        
        const query = `
          INSERT INTO selected_tables (table_name, display_name)
          VALUES ${placeholders};
        `;
        await client.query(query, values);
      }
      
      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Tablolar kaydedilirken hata oluştu:', error);
    return NextResponse.json({ error: 'Tablolar kaydedilirken bir hata oluştu' }, { status: 500 });
  }
}
```

## 4. Tablo Oluşturma API'si

```tsx
// src/app/api/create-table/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

interface Column {
  name: string;
  type: string;
}

interface CreateTableRequest {
  tableName: string;
  columns: Column[];
}

export async function POST(request: NextRequest) {
  try {
    const data: CreateTableRequest = await request.json();
    const { tableName, columns } = data;

    // Tablo adı validasyonu
    if (!tableName.match(/^[a-z0-9_]+$/)) {
      return NextResponse.json(
        { error: 'Tablo adı sadece küçük harfler, rakamlar ve alt çizgi içerebilir' },
        { status: 400 }
      );
    }

    // Kolon adları validasyonu
    for (const column of columns) {
      if (!column.name.match(/^[a-z0-9_]+$/)) {
        return NextResponse.json(
          { error: 'Kolon adları sadece küçük harfler, rakamlar ve alt çizgi içerebilir' },
          { status: 400 }
        );
      }
    }

    const client = await pool.connect();
    try {
      // Tablo var mı kontrol et
      const tableExistsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `;
      const tableExistsResult = await client.query(tableExistsQuery, [tableName]);

      if (tableExistsResult.rows[0].exists) {
        return NextResponse.json(
          { error: 'Bu isimde bir tablo zaten var' },
          { status: 400 }
        );
      }

      // Tablo oluşturma SQL'i hazırla
      const columnDefinitions = columns
        .map(column => `"${column.name}" ${column.type}`)
        .join(', ');

      const createTableQuery = `
        CREATE TABLE "${tableName}" (
          id SERIAL PRIMARY KEY,
          ${columnDefinitions}
        );
      `;

      // Tabloyu oluştur
      await client.query(createTableQuery);
      
      // Oluşturulan tabloyu seçili tablolara ekle
      const insertSelectedQuery = `
        INSERT INTO selected_tables (table_name, display_name)
        VALUES ($1, $2);
      `;
      await client.query(insertSelectedQuery, [tableName, tableName.replace(/_/g, ' ')]);

      return NextResponse.json({
        success: true,
        message: 'Tablo başarıyla oluşturuldu',
        tableName
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Tablo oluşturma hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Tablo oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
```

## 5. Tablo CRUD API'si

Bu API, dinamik olarak tüm tablolar için CRUD işlevselliği sağlar. Aşağıdaki endpoint'ler paket tarafından kullanılır:

- `GET /api/resources/[table]?_schema=true`: Tablo şemasını döndürür
- `GET /api/resources/[table]`: Tüm kayıtları getirir
- `GET /api/resources/[table]?id=X`: Belirli bir kaydı getirir
- `POST /api/resources/[table]`: Yeni kayıt ekler
- `PUT /api/resources/[table]`: Mevcut kaydı günceller
- `DELETE /api/resources/[table]?id=X`: Belirli bir kaydı siler

```tsx
// src/app/api/resources/[table]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Şema bilgisini getir
async function getTableSchema(client: any, table: string) {
  const query = `
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = $1
    ORDER BY ordinal_position;
  `;
  const result = await client.query(query, [table]);
  
  return result.rows.map((column: any) => ({
    name: column.column_name,
    type: column.data_type,
    isNullable: column.is_nullable === 'YES',
    defaultValue: column.column_default
  }));
}

// Tüm kayıtları getir
export async function GET(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  const { table } = params;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const schema = url.searchParams.get('_schema') === 'true';
  
  try {
    const client = await pool.connect();
    try {
      // Şema isteniyorsa şema bilgilerini döndür
      if (schema) {
        const columns = await getTableSchema(client, table);
        return NextResponse.json(columns);
      }
      
      // Belirli bir kayıt isteniyorsa
      if (id) {
        const query = `SELECT * FROM "${table}" WHERE id = $1`;
        const result = await client.query(query, [id]);
        
        if (result.rows.length === 0) {
          return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 });
        }
        
        return NextResponse.json(result.rows[0]);
      }
      
      // Tüm kayıtları getir
      const query = `SELECT * FROM "${table}" ORDER BY id`;
      const result = await client.query(query);
      
      return NextResponse.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Tablo işleminde hata (${table}):`, error);
    return NextResponse.json({ error: 'Tablo işleminde bir hata oluştu' }, { status: 500 });
  }
}

// Yeni kayıt ekle
export async function POST(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  const { table } = params;
  
  try {
    const data = await request.json();
    const client = await pool.connect();
    
    try {
      // Şemanın doğruluğunu kontrol et
      const schema = await getTableSchema(client, table);
      const columns = Object.keys(data).filter(col => col !== 'id');
      
      if (columns.length === 0) {
        return NextResponse.json({ error: 'Eklenecek veri bulunamadı' }, { status: 400 });
      }
      
      const columnNames = columns.join('", "');
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      const values = columns.map(col => data[col]);
      
      const query = `
        INSERT INTO "${table}" ("${columnNames}")
        VALUES (${placeholders})
        RETURNING *;
      `;
      
      const result = await client.query(query, values);
      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Kayıt ekleme hatası (${table}):`, error);
    return NextResponse.json({ error: 'Kayıt eklenirken bir hata oluştu' }, { status: 500 });
  }
}

// Kayıt güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  const { table } = params;
  
  try {
    const data = await request.json();
    if (!data.id) {
      return NextResponse.json({ error: 'Güncellenecek kaydın ID bilgisi eksik' }, { status: 400 });
    }
    
    const client = await pool.connect();
    try {
      const columns = Object.keys(data).filter(col => col !== 'id');
      if (columns.length === 0) {
        return NextResponse.json({ error: 'Güncellenecek veri bulunamadı' }, { status: 400 });
      }
      
      const setClause = columns.map((col, i) => `"${col}" = $${i + 1}`).join(', ');
      const values = [...columns.map(col => data[col]), data.id];
      
      const query = `
        UPDATE "${table}"
        SET ${setClause}
        WHERE id = $${columns.length + 1}
        RETURNING *;
      `;
      
      const result = await client.query(query, values);
      
      if (result.rowCount === 0) {
        return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 });
      }
      
      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Kayıt güncelleme hatası (${table}):`, error);
    return NextResponse.json({ error: 'Kayıt güncellenirken bir hata oluştu' }, { status: 500 });
  }
}

// Kayıt sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  const { table } = params;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Silinecek kaydın ID bilgisi eksik' }, { status: 400 });
  }
  
  try {
    const client = await pool.connect();
    try {
      const query = `DELETE FROM "${table}" WHERE id = $1 RETURNING id`;
      const result = await client.query(query, [id]);
      
      if (result.rowCount === 0) {
        return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, id });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Kayıt silme hatası (${table}):`, error);
    return NextResponse.json({ error: 'Kayıt silinirken bir hata oluştu' }, { status: 500 });
  }
}
```

## Veritabanı Tablosu Oluşturma

Paket, seçilen tabloları takip eden bir `selected_tables` tablosuna ihtiyaç duyar. Bu tabloyu oluşturmak için:

```sql
CREATE TABLE selected_tables (
  table_name VARCHAR(255) PRIMARY KEY,
  display_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Özel Tablo Tipleri

API tarafından döndürülen şema bilgisinde, postgres veri tipleri ile eşleşen şekilde kolonlar için uygun React form input tipleri otomatik olarak belirlenir. Eğer özel tablo tipleri kullanıyorsanız, `src/components/utils/FormFieldUtils.tsx` dosyasını projenize uygun şekilde düzenleyebilirsiniz. 