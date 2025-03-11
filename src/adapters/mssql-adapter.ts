import * as sql from 'mssql';
import { DatabaseAdapter, mapColumnType } from './base-adapter';

export default function createMSSQLAdapter(connectionString: string): DatabaseAdapter {
  let pool: sql.ConnectionPool | null = null;

  const adapter: DatabaseAdapter = {
    async connect(): Promise<void> {
      try {
        pool = await new sql.ConnectionPool(connectionString).connect();
      } catch (error) {
        console.error('MSSQL bağlantı hatası:', error);
        throw new Error('Veritabanına bağlanılamadı');
      }
    },

    async disconnect(): Promise<void> {
      if (pool) {
        await pool.close();
        pool = null;
      }
    },

    async listTables(): Promise<string[]> {
      if (!pool) throw new Error('Veritabanına bağlanılmadı');

      const result = await pool.request().query(`
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_NAME
      `);

      return result.recordset.map(row => row.TABLE_NAME);
    },

    async getTableColumns(tableName: string): Promise<Array<{ name: string, type: string, isNullable: boolean, isPrimary: boolean }>> {
      if (!pool) throw new Error('Veritabanına bağlanılmadı');

      // Sütun bilgilerini al
      const columnsResult = await pool.request()
        .input('tableName', sql.VarChar, tableName)
        .query(`
          SELECT 
            c.COLUMN_NAME,
            c.DATA_TYPE,
            c.IS_NULLABLE = 'YES' as IS_NULLABLE,
            CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 1 ELSE 0 END as IS_PRIMARY
          FROM 
            INFORMATION_SCHEMA.COLUMNS c
          LEFT JOIN (
            SELECT ku.TABLE_CATALOG, ku.TABLE_SCHEMA, ku.TABLE_NAME, ku.COLUMN_NAME
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
            JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku
              ON tc.CONSTRAINT_TYPE = 'PRIMARY KEY' 
              AND tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
          ) pk 
          ON 
            c.TABLE_CATALOG = pk.TABLE_CATALOG
            AND c.TABLE_SCHEMA = pk.TABLE_SCHEMA
            AND c.TABLE_NAME = pk.TABLE_NAME
            AND c.COLUMN_NAME = pk.COLUMN_NAME
          WHERE 
            c.TABLE_NAME = @tableName
          ORDER BY 
            c.ORDINAL_POSITION
        `);

      return columnsResult.recordset.map(row => ({
        name: row.COLUMN_NAME,
        type: mapColumnType(row.DATA_TYPE),
        isNullable: row.IS_NULLABLE,
        isPrimary: row.IS_PRIMARY === 1
      }));
    },

    async query(sql: string, params?: any[]): Promise<any[]> {
      if (!pool) throw new Error('Veritabanına bağlanılmadı');

      const request = pool.request();

      // Parametreleri ekle
      if (params) {
        params.forEach((param, index) => {
          request.input(`p${index}`, param);
        });
      }

      const result = await request.query(sql);
      return result.recordset;
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
      const request = pool.request();
      let filterQuery = '';

      if (Object.keys(filter).length > 0) {
        const conditions = [];
        let paramIndex = 0;

        for (const [key, value] of Object.entries(filter)) {
          if (value !== undefined && value !== null) {
            const paramName = `filter${paramIndex}`;
            conditions.push(`[${key}] = @${paramName}`);
            request.input(paramName, value);
            paramIndex++;
          }
        }

        if (conditions.length > 0) {
          filterQuery = `WHERE ${conditions.join(' AND ')}`;
        }
      }

      // MSSQL için pagination sorgu yapısı (SQL Server 2012+)
      const query = `
        SELECT COUNT(*) as total FROM [${tableName}] ${filterQuery};
        
        SELECT * FROM [${tableName}]
        ${filterQuery}
        ORDER BY [${sort.field}] ${sort.order}
        OFFSET ${offset} ROWS FETCH NEXT ${perPage} ROWS ONLY;
      `;

      const result = await request.query(query);

      return {
        data: result.recordsets[1],
        total: result.recordsets[0][0].total
      };
    },

    async createRecord(tableName: string, data: Record<string, any>): Promise<any> {
      if (!pool) throw new Error('Veritabanına bağlanılmadı');

      const keys = Object.keys(data);
      const values = Object.values(data);

      if (keys.length === 0) {
        throw new Error('Kayıt için veri girilmedi');
      }

      const request = pool.request();

      // Parametreleri ekle
      const params = keys.map((key, index) => {
        const paramName = `p${index}`;
        request.input(paramName, values[index]);
        return `@${paramName}`;
      });

      const columns = keys.map(key => `[${key}]`).join(', ');
      const placeholders = params.join(', ');

      // MSSQL'de SCOPE_IDENTITY() ile son eklenen kaydın ID'sini alıyoruz
      const query = `
        INSERT INTO [${tableName}] (${columns})
        VALUES (${placeholders});
        
        SELECT * FROM [${tableName}]
        WHERE @@IDENTITY = SCOPE_IDENTITY();
      `;

      const result = await request.query(query);

      if (result.recordset && result.recordset.length > 0) {
        return result.recordset[0];
      }

      throw new Error('Kayıt eklendi ancak geri döndürülemedi');
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

      const request = pool.request();

      // Parametreleri ekle
      const setParams = keys.map((key, index) => {
        const paramName = `p${index}`;
        request.input(paramName, values[index]);
        return `[${key}] = @${paramName}`;
      });

      // ID parametresi
      request.input('id', id);

      const setClause = setParams.join(', ');

      const query = `
        UPDATE [${tableName}]
        SET ${setClause}
        WHERE [${primaryKey}] = @id;
        
        SELECT @@ROWCOUNT as affectedRows;
        
        SELECT * FROM [${tableName}]
        WHERE [${primaryKey}] = @id;
      `;

      const result = await request.query(query);

      if (result.recordsets[1].length === 0) {
        throw new Error(`${primaryKey} = ${id} olan kayıt bulunamadı`);
      }

      return result.recordsets[1][0];
    },

    async deleteRecord(tableName: string, id: any): Promise<void> {
      if (!pool) throw new Error('Veritabanına bağlanılmadı');

      // Önce tablonun birincil anahtar sütununu bul
      const columns = await this.getTableColumns(tableName);
      const primaryKey = columns.find(col => col.isPrimary)?.name || 'id';

      const request = pool.request();
      request.input('id', id);

      const query = `
        DELETE FROM [${tableName}]
        WHERE [${primaryKey}] = @id;
        
        SELECT @@ROWCOUNT as affectedRows;
      `;

      const result = await request.query(query);

      if (result.recordset[0].affectedRows === 0) {
        throw new Error(`${primaryKey} = ${id} olan kayıt bulunamadı`);
      }
    },

    async getRecordById(tableName: string, id: any): Promise<any> {
      if (!pool) throw new Error('Veritabanına bağlanılmadı');

      // Önce tablonun birincil anahtar sütununu bul
      const columns = await this.getTableColumns(tableName);
      const primaryKey = columns.find(col => col.isPrimary)?.name || 'id';

      const request = pool.request();
      request.input('id', id);

      const query = `
        SELECT * FROM [${tableName}]
        WHERE [${primaryKey}] = @id
      `;

      const result = await request.query(query);

      if (result.recordset.length === 0) {
        throw new Error(`${primaryKey} = ${id} olan kayıt bulunamadı`);
      }

      return result.recordset[0];
    }
  };

  return adapter;
} 