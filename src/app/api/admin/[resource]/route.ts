import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

// Veritabanı bağlantısı oluştur
async function getClient() {
  const envVarName = process.env.EASY_ADMIN_ENV_VAR || 'POSTGRES_URL';
  const connectionString = process.env[envVarName];

  if (!connectionString) {
    throw new Error(`${envVarName} çevre değişkeni tanımlanmamış!`);
  }

  const client = new Client({ connectionString });
  await client.connect();
  return client;
}

// Tablo şemasını getir
async function getTableSchema(client: Client, tableName: string) {
  const query = `
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = $1
    ORDER BY ordinal_position;
  `;

  const result = await client.query(query, [tableName]);
  return result.rows.map(col => ({
    name: col.column_name,
    type: col.data_type,
    isNullable: col.is_nullable === 'YES',
    defaultValue: col.column_default
  }));
}

// GET - Tüm kayıtları veya tek bir kaydı getir
export async function GET(
  request: NextRequest,
  { params }: { params: { resource: string } }
) {
  try {
    const client = await getClient();
    const resource = params.resource;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const schema = url.searchParams.get('_schema') === 'true';

    // Şema bilgisini döndür
    if (schema) {
      const schemaInfo = await getTableSchema(client, resource);
      await client.end();
      return NextResponse.json(schemaInfo);
    }

    if (id) {
      // Tek bir kaydı getir
      const query = `SELECT * FROM ${resource} WHERE id = $1`;
      const result = await client.query(query, [id]);
      await client.end();

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 });
      }

      return NextResponse.json(result.rows[0]);
    } else {
      // Tüm kayıtları getir - Sayfalama desteği ile
      const _start = parseInt(url.searchParams.get('_start') || '0');
      const _end = parseInt(url.searchParams.get('_end') || '100');
      const _sort = url.searchParams.get('_sort') || 'id';
      const _order = url.searchParams.get('_order') || 'ASC';

      // Toplam kayıt sayısını al
      const countQuery = `SELECT COUNT(*) FROM ${resource}`;
      const countResult = await client.query(countQuery);
      const total = parseInt(countResult.rows[0].count);

      // Kayıtları getir
      const query = `
        SELECT * FROM ${resource}
        ORDER BY ${_sort} ${_order}
        LIMIT ${_end - _start} OFFSET ${_start}
      `;

      const result = await client.query(query);
      await client.end();

      const response = NextResponse.json(result.rows);
      response.headers.set('X-Total-Count', total.toString());
      response.headers.set('Access-Control-Expose-Headers', 'X-Total-Count');

      return response;
    }
  } catch (error) {
    console.error('Kayıtlar alınırken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Kayıtlar alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Yeni kayıt oluştur
export async function POST(
  request: NextRequest,
  { params }: { params: { resource: string } }
) {
  try {
    const client = await getClient();
    const resource = params.resource;
    const data = await request.json();

    // Tablo şemasını al
    const schema = await getTableSchema(client, resource);

    // Kolon adlarını ve değerlerini hazırla
    const columns = Object.keys(data)
      .filter(key => schema.some(col => col.name === key))
      .join(', ');

    const placeholders = Object.keys(data)
      .filter(key => schema.some(col => col.name === key))
      .map((_, i) => `$${i + 1}`)
      .join(', ');

    const values = Object.keys(data)
      .filter(key => schema.some(col => col.name === key))
      .map(key => data[key]);

    // Kayıt oluştur
    const query = `
      INSERT INTO ${resource} (${columns})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await client.query(query, values);
    await client.end();

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Kayıt oluşturulurken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Kayıt oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT - Kayıt güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { resource: string } }
) {
  try {
    const client = await getClient();
    const resource = params.resource;
    const data = await request.json();
    const id = data.id;

    if (!id) {
      return NextResponse.json(
        { error: 'ID alanı gereklidir' },
        { status: 400 }
      );
    }

    // Tablo şemasını al
    const schema = await getTableSchema(client, resource);

    // Güncellenecek alanları oluştur
    const updateFields = Object.keys(data)
      .filter(key => key !== 'id' && schema.some(col => col.name === key))
      .map((key, i) => `${key} = $${i + 2}`);

    const values = [id];
    Object.keys(data)
      .filter(key => key !== 'id' && schema.some(col => col.name === key))
      .forEach(key => values.push(data[key]));

    // Kayıt güncelle
    const query = `
      UPDATE ${resource}
      SET ${updateFields.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await client.query(query, values);
    await client.end();

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Güncellenecek kayıt bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Kayıt güncellenirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Kayıt güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Kayıt sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { resource: string } }
) {
  try {
    const client = await getClient();
    const resource = params.resource;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID parametresi gereklidir' },
        { status: 400 }
      );
    }

    // Kayıt sil
    const query = `
      DELETE FROM ${resource}
      WHERE id = $1
      RETURNING id
    `;

    const result = await client.query(query, [id]);
    await client.end();

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Silinecek kayıt bulunamadı' },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Kayıt silinirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Kayıt silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 