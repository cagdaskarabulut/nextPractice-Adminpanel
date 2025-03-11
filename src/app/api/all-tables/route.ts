import { NextResponse } from 'next/server';
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

// Tüm tabloları getir
export async function GET() {
  try {
    const client = await getClient();

    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    const result = await client.query(query);
    await client.end();

    // Sadece tablo adlarını dizi olarak döndür
    const tables = result.rows.map(row => row.table_name);

    return NextResponse.json(tables);
  } catch (error) {
    console.error('Tablolar alınırken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Tablolar alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 