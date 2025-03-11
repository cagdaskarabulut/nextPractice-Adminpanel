import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { handleApiError, apiSuccess } from '@/shared/api-utils';

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

// Liste veya tekil kayıt getir
export async function GET(
  request: NextRequest,
  { params }: { params: { resource: string } }
) {
  const client = await getClient();
  try {
    const tableName = params.resource;

    // URL'den id parametresini al
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    // Tekil kayıt isteniyorsa
    if (id) {
      const result = await client.query(
        `SELECT * FROM "${tableName}" WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 });
      }

      return apiSuccess(result.rows[0]);
    }

    // Liste isteniyorsa
    // Sayfalama ve filtreleme için parametreleri al
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('perPage') || '10');
    const sortField = url.searchParams.get('sortField') || 'id';
    const sortOrder = url.searchParams.get('sortOrder') || 'ASC';

    // Limit ve offset hesapla
    const offset = (page - 1) * perPage;

    // Toplam kayıt sayısı
    const countResult = await client.query(`SELECT COUNT(*) FROM "${tableName}"`);
    const total = parseInt(countResult.rows[0].count);

    // Kayıtları getir
    const result = await client.query(
      `SELECT * FROM "${tableName}" ORDER BY "${sortField}" ${sortOrder} LIMIT $1 OFFSET $2`,
      [perPage, offset]
    );

    return apiSuccess({
      data: result.rows,
      total,
      page,
      perPage,
      lastPage: Math.ceil(total / perPage)
    });
  } catch (error: any) {
    return handleApiError(error, `${params.resource} kayıtları alınırken bir hata oluştu`);
  } finally {
    client.end();
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