import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  try {
    // PostgreSQL bağlantı havuzu
    const pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    // Bağlantıyı test et
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');

      // Veritabanı adını al
      const result = await client.query(`
        SELECT current_database() as db_name;
      `);

      const dbName = result.rows[0]?.db_name || 'PostgreSQL';

      return NextResponse.json({
        status: 'connected',
        dbName
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Veritabanı bağlantı hatası:', error);
    return NextResponse.json({
      status: 'disconnected',
      error: 'Veritabanına bağlanılamadı'
    }, { status: 500 });
  }
} 