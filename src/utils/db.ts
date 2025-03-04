import { Pool } from 'pg';
import { format } from 'sql-formatter';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function executeQuery(query: string, values?: any[]) {
  try {
    // SQL sorgusunu formatla ve logla
    const formattedQuery = format(query, {
      language: 'postgresql',
      keywordCase: 'upper'
    });
    console.log('Executing query:', formattedQuery);
    if (values) {
      console.log('Values:', values);
    }

    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

// Tablo oluşturma fonksiyonları
export async function createTables() {
  try {
    // yellcord_users tablosunu oluştur
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS "yellcord_users" (
        "id" SERIAL PRIMARY KEY,
        "username" VARCHAR(255) NOT NULL,
        "email" VARCHAR(255) UNIQUE NOT NULL,
        "password" VARCHAR(255) NOT NULL,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // rooms tablosunu oluştur
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS "rooms" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "created_by" INTEGER REFERENCES "yellcord_users"("id"),
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Tablolar başarıyla oluşturuldu');
  } catch (error) {
    console.error('Tablo oluşturma hatası:', error);
    throw error;
  }
}

export async function getTableSchema(tableName: string) {
  const query = `
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = $1;
  `;
  return executeQuery(query, [tableName]);
}

export async function getTables() {
  const query = `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public';
  `;
  return executeQuery(query);
}

export async function getTableData(tableName: string) {
  const query = `SELECT * FROM "${tableName}"`;
  return executeQuery(query);
}

export async function getTableRow(tableName: string, id: string | number) {
  const query = `
    SELECT * FROM "${tableName}"
    WHERE id = $1
    LIMIT 1;
  `;
  const result = await executeQuery(query, [id]);
  return result[0] || null;
}

export async function createTableRow(tableName: string, data: Record<string, any>) {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

  const query = `
    INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')})
    VALUES (${placeholders})
    RETURNING *;
  `;

  return executeQuery(query, values);
}

export async function updateTableRow(tableName: string, id: string | number, data: Record<string, any>) {
  const updates = Object.keys(data)
    .map((key, i) => `"${key}" = $${i + 1}`)
    .join(', ');

  const values = [...Object.values(data), id];

  const query = `
    UPDATE "${tableName}"
    SET ${updates}
    WHERE id = $${values.length}
    RETURNING *;
  `;

  return executeQuery(query, values);
}

export async function deleteTableRow(tableName: string, id: string | number) {
  const query = `
    DELETE FROM "${tableName}"
    WHERE id = $1
    RETURNING *;
  `;

  return executeQuery(query, [id]);
} 