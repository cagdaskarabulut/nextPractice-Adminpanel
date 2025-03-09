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

export default {
  getTables,
  getTableColumns,
  getTableRecords,
  getRecord,
  addRecord,
  updateRecord,
  deleteRecord
}; 