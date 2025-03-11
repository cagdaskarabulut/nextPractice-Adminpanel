// PostgreSQL bağlantısı için yardımcı fonksiyonlar
import { Pool } from 'pg';

// PostgreSQL bağlantı havuzu
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Tablo listesini getir
export async function getTables() {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT table_name AS name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    client.release();
    return result.rows;
  } catch (error) {
    console.error('PostgreSQL tabloları alınamadı:', error);
    throw new Error('Veritabanı tabloları alınamadı');
  }
}

// Tablo yapısını getir
export async function getTableColumns(tableName: string) {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT 
        column_name AS name, 
        data_type AS type,
        is_nullable AS nullable,
        column_default AS default_value
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);
    client.release();
    return result.rows;
  } catch (error) {
    console.error(`${tableName} tablosunun yapısı alınamadı:`, error);
    throw new Error('Tablo yapısı alınamadı');
  }
}

// Tablo kayıtlarını getir
export async function getTableRecords(tableName: string) {
  try {
    const client = await pool.connect();
    const result = await client.query(`SELECT * FROM "${tableName}" LIMIT 100`);
    client.release();
    return result.rows;
  } catch (error) {
    console.error(`${tableName} tablosu kayıtları alınamadı:`, error);
    throw new Error('Tablo kayıtları alınamadı');
  }
}

// Tekil kaydı getir
export async function getRecord(tableName: string, id: string | number) {
  try {
    const client = await pool.connect();
    const result = await client.query(`SELECT * FROM "${tableName}" WHERE id = $1`, [id]);
    client.release();

    if (result.rows.length === 0) {
      throw new Error('Kayıt bulunamadı');
    }

    return result.rows[0];
  } catch (error) {
    console.error(`${tableName} tablosundan kayıt alınamadı:`, error);
    throw new Error('Kayıt alınamadı');
  }
}

// Yeni kayıt ekle
export async function addRecord(tableName: string, record: Record<string, any>) {
  try {
    const keys = Object.keys(record);
    const values = Object.values(record);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO "${tableName}" (${keys.map(k => `"${k}"`).join(', ')}) 
       VALUES (${placeholders})
       RETURNING *`,
      values
    );
    client.release();

    return result.rows[0];
  } catch (error) {
    console.error(`${tableName} tablosuna kayıt eklenemedi:`, error);
    throw new Error('Kayıt eklenemedi');
  }
}

// Kaydı güncelle
export async function updateRecord(tableName: string, id: string | number, record: Record<string, any>) {
  try {
    const keys = Object.keys(record);
    const values = Object.values(record);
    const updates = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');

    const client = await pool.connect();
    const result = await client.query(
      `UPDATE "${tableName}" 
       SET ${updates}
       WHERE id = $${keys.length + 1}
       RETURNING *`,
      [...values, id]
    );
    client.release();

    if (result.rows.length === 0) {
      throw new Error('Güncellenecek kayıt bulunamadı');
    }

    return result.rows[0];
  } catch (error) {
    console.error(`${tableName} tablosundaki kayıt güncellenemedi:`, error);
    throw new Error('Kayıt güncellenemedi');
  }
}

// Kaydı sil
export async function deleteRecord(tableName: string, id: string | number) {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `DELETE FROM "${tableName}" WHERE id = $1 RETURNING *`,
      [id]
    );
    client.release();

    if (result.rows.length === 0) {
      throw new Error('Silinecek kayıt bulunamadı');
    }

    return result.rows[0];
  } catch (error) {
    console.error(`${tableName} tablosundan kayıt silinemedi:`, error);
    throw new Error('Kayıt silinemedi');
  }
}

// Yeni tablo oluştur
export async function createTable(tableName: string, columns: Array<{ name: string; type: string; nullable?: boolean; default_value?: string }>) {
  try {
    const client = await pool.connect();

    // SQL injection koruması için tablo adını doğrula
    const tableNamePattern = /^[a-zA-Z0-9_]+$/;
    if (!tableNamePattern.test(tableName)) {
      throw new Error('Geçersiz tablo adı. Sadece harf, rakam ve alt çizgi kullanılabilir.');
    }

    // Tablo oluşturma SQL cümlesini hazırla
    const columnDefinitions = columns.map(column => {
      // SQL injection koruması için kolon adını doğrula
      if (!tableNamePattern.test(column.name)) {
        throw new Error(`Geçersiz kolon adı: ${column.name}. Sadece harf, rakam ve alt çizgi kullanılabilir.`);
      }

      // Güvenli bir tip listesi oluştur ve sadece bu tiplere izin ver
      const allowedTypes = [
        'text', 'varchar', 'character varying', 'char', 'character',
        'integer', 'int', 'smallint', 'bigint', 'serial', 'bigserial',
        'numeric', 'decimal', 'real', 'double precision', 'float',
        'boolean', 'bool',
        'date', 'time', 'timestamp', 'timestamptz', 'timestamp with time zone',
        'json', 'jsonb', 'uuid'
      ];

      const lowerType = column.type.toLowerCase();
      if (!allowedTypes.includes(lowerType) && !lowerType.startsWith('varchar(')) {
        throw new Error(`Desteklenmeyen kolon tipi: ${column.type}`);
      }

      let columnDef = `"${column.name}" ${column.type}`;

      // Null durumunu ekle
      if (column.nullable === false) {
        columnDef += ' NOT NULL';
      }

      // Varsayılan değeri ekle (eğer varsa)
      if (column.default_value) {
        columnDef += ` DEFAULT ${column.default_value}`;
      }

      return columnDef;
    });

    // id kolonunu otomatik ekle
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS "${tableName}" (
        id SERIAL PRIMARY KEY,
        ${columnDefinitions.join(',\n        ')}
      )
    `;

    await client.query(createTableQuery);
    client.release();

    return { success: true, message: `Tablo ${tableName} başarıyla oluşturuldu.` };
  } catch (error: any) {
    console.error(`Tablo ${tableName} oluşturulamadı:`, error);
    throw new Error(error.message || 'Tablo oluşturulamadı');
  }
}

export default {
  getTables,
  getTableColumns,
  getTableRecords,
  getRecord,
  addRecord,
  updateRecord,
  deleteRecord,
  createTable
}; 