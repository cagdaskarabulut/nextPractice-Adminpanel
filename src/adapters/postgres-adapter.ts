import { Pool, PoolClient } from 'pg';
import { DatabaseAdapter, mapColumnType } from './base-adapter';

export default function createPostgresAdapter(connectionString: string): DatabaseAdapter {
  let pool: Pool | null = null;

  const adapter: DatabaseAdapter = {
    async connect(): Promise<void> {
      try {
        pool = new Pool({ connectionString });
        // Bağlantıyı test et
        const client = await pool.connect();
        client.release();
      } catch (error) {
        console.error('PostgreSQL bağlantı hatası:', error);
        throw new Error('Veritabanına bağlanılamadı');
      }
    },

    async disconnect(): Promise<void> {
      if (pool) {
        await pool.end();
        pool = null;
      }
    },

    async listTables(): Promise<string[]> {
      if (!pool) throw new Error('Veritabanına bağlanılmadı');

      const client = await pool.connect();
      try {
        const result = await client.query(`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
          ORDER BY table_name
        `);

        return result.rows.map(row => row.table_name);
      } finally {
        client.release();
      }
    },

    async getTableColumns(tableName: string): Promise<Array<{ name: string, type: string, isNullable: boolean, isPrimary: boolean }>> {
      if (!pool) throw new Error('Veritabanına bağlanılmadı');

      const client = await pool.connect();
      try {
        // Sütun bilgilerini al
        const columnsQuery = `
          SELECT 
            c.column_name, 
            c.data_type, 
            c.is_nullable = 'YES' as is_nullable,
            (
              SELECT EXISTS (
                SELECT 1
                FROM information_schema.table_constraints tc
                JOIN information_schema.constraint_column_usage ccu 
                  ON tc.constraint_name = ccu.constraint_name
                WHERE tc.constraint_type = 'PRIMARY KEY'
                  AND tc.table_name = $1
                  AND ccu.column_name = c.column_name
              )
            ) as is_primary
          FROM information_schema.columns c
          WHERE c.table_name = $1
          ORDER BY c.ordinal_position
        `;

        const result = await client.query(columnsQuery, [tableName]);

        return result.rows.map(row => ({
          name: row.column_name,
          type: mapColumnType(row.data_type),
          isNullable: row.is_nullable,
          isPrimary: row.is_primary
        }));
      } finally {
        client.release();
      }
    },

    async query(sql: string, params?: any[]): Promise<any[]> {
      if (!pool) throw new Error('Veritabanına bağlanılmadı');

      const client = await pool.connect();
      try {
        const result = await client.query(sql, params);
        return result.rows;
      } finally {
        client.release();
      }
    },

    async getRecords(
      tableName: string,
      options: { page?: number; perPage?: number; sort?: { field: string; order: 'ASC' | 'DESC' }; filter?: Record<string, any> } = {}
    ): Promise<{ data: any[]; total: number }> {
      if (!pool) throw new Error('Veritabanına bağlanılmadı');

      const {
        page = 1,
        perPage = 10,
        sort = { field: 'id', order: 'ASC' },
        filter = {}
      } = options;

      const offset = (page - 1) * perPage;

      // Parametreleri hazırla
      const params: any[] = [];
      let filterQuery = '';

      if (Object.keys(filter).length > 0) {
        const conditions = [];
        let paramIndex = 1;

        for (const [key, value] of Object.entries(filter)) {
          if (value !== undefined && value !== null) {
            conditions.push(`${key} = $${paramIndex}`);
            params.push(value);
            paramIndex++;
          }
        }

        if (conditions.length > 0) {
          filterQuery = `WHERE ${conditions.join(' AND ')}`;
        }
      }

      const client = await pool.connect();
      try {
        // Toplam kayıt sayısını al
        const countQuery = `SELECT COUNT(*) FROM "${tableName}" ${filterQuery}`;
        const countResult = await client.query(countQuery, [...params]);
        const total = parseInt(countResult.rows[0].count, 10);

        // Kayıtları al
        const dataQuery = `
          SELECT * FROM "${tableName}" 
          ${filterQuery}
          ORDER BY "${sort.field}" ${sort.order}
          LIMIT ${perPage} OFFSET ${offset}
        `;

        const dataResult = await client.query(dataQuery, [...params]);

        return {
          data: dataResult.rows,
          total
        };
      } finally {
        client.release();
      }
    },

    async createRecord(tableName: string, data: Record<string, any>): Promise<any> {
      if (!pool) throw new Error('Veritabanına bağlanılmadı');

      const keys = Object.keys(data);
      const values = Object.values(data);

      if (keys.length === 0) {
        throw new Error('Kayıt için veri girilmedi');
      }

      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const columns = keys.map(key => `"${key}"`).join(', ');

      const query = `
        INSERT INTO "${tableName}" (${columns})
        VALUES (${placeholders})
        RETURNING *
      `;

      const client = await pool.connect();
      try {
        const result = await client.query(query, values);
        return result.rows[0];
      } finally {
        client.release();
      }
    },

    async updateRecord(tableName: string, id: any, data: Record<string, any>): Promise<any> {
      if (!pool) throw new Error('Veritabanına bağlanılmadı');

      // Önce tablonun birincil anahtar sütununu bul
      const columns = await this.getTableColumns(tableName);
      const primaryKey = columns.find(col => col.isPrimary)?.name || 'id';

      const keys = Object.keys(data);
      const values = Object.values(data);

      if (keys.length === 0) {
        throw new Error('Güncellenecek veri girilmedi');
      }

      const setClause = keys.map((key, i) => `"${key}" = $${i + 1}`).join(', ');

      const query = `
        UPDATE "${tableName}"
        SET ${setClause}
        WHERE "${primaryKey}" = $${keys.length + 1}
        RETURNING *
      `;

      const client = await pool.connect();
      try {
        const result = await client.query(query, [...values, id]);

        if (result.rows.length === 0) {
          throw new Error(`${primaryKey} = ${id} olan kayıt bulunamadı`);
        }

        return result.rows[0];
      } finally {
        client.release();
      }
    },

    async deleteRecord(tableName: string, id: any): Promise<void> {
      if (!pool) throw new Error('Veritabanına bağlanılmadı');

      // Önce tablonun birincil anahtar sütununu bul
      const columns = await this.getTableColumns(tableName);
      const primaryKey = columns.find(col => col.isPrimary)?.name || 'id';

      const query = `
        DELETE FROM "${tableName}"
        WHERE "${primaryKey}" = $1
      `;

      const client = await pool.connect();
      try {
        const result = await client.query(query, [id]);

        if (result.rowCount === 0) {
          throw new Error(`${primaryKey} = ${id} olan kayıt bulunamadı`);
        }
      } finally {
        client.release();
      }
    },

    async getRecordById(tableName: string, id: any): Promise<any> {
      if (!pool) throw new Error('Veritabanına bağlanılmadı');

      // Önce tablonun birincil anahtar sütununu bul
      const columns = await this.getTableColumns(tableName);
      const primaryKey = columns.find(col => col.isPrimary)?.name || 'id';

      const query = `
        SELECT * FROM "${tableName}"
        WHERE "${primaryKey}" = $1
      `;

      const client = await pool.connect();
      try {
        const result = await client.query(query, [id]);

        if (result.rows.length === 0) {
          throw new Error(`${primaryKey} = ${id} olan kayıt bulunamadı`);
        }

        return result.rows[0];
      } finally {
        client.release();
      }
    }
  };

  return adapter;
} 