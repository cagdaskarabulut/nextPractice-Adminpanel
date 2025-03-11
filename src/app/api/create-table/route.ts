import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// PostgreSQL bağlantı havuzu
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

    // Tablo var mı kontrol et
    const client = await pool.connect();
    try {
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
          ${columnDefinitions}
        );
      `;

      // Tabloyu oluştur
      await client.query(createTableQuery);

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