import { createConnection, Connection, RowDataPacket, OkPacket } from 'mysql2/promise';
import { DatabaseAdapter, mapColumnType } from './base-adapter';

export default function createMySQLAdapter(connectionString: string): DatabaseAdapter {
  let connection: Connection | null = null;

  const adapter: DatabaseAdapter = {
    async connect(): Promise<void> {
      try {
        connection = await createConnection(connectionString);
      } catch (error) {
        console.error('MySQL bağlantı hatası:', error);
        throw new Error('Veritabanına bağlanılamadı');
      }
    },

    async disconnect(): Promise<void> {
      if (connection) {
        await connection.end();
        connection = null;
      }
    },

    async listTables(): Promise<string[]> {
      if (!connection) throw new Error('Veritabanına bağlanılmadı');

      const [rows] = await connection.query<RowDataPacket[]>('SHOW TABLES');
      // MySQL'de SHOW TABLES sorgusu ilk sütun olarak tablo isimlerini döndürür
      return rows.map(row => Object.values(row)[0] as string);
    },

    async getTableColumns(tableName: string): Promise<Array<{ name: string, type: string, isNullable: boolean, isPrimary: boolean }>> {
      if (!connection) throw new Error('Veritabanına bağlanılmadı');

      // Tablo yapısını al
      const [columns] = await connection.query<RowDataPacket[]>(`DESCRIBE \`${tableName}\``);

      return columns.map(column => ({
        name: column.Field,
        type: mapColumnType(column.Type),
        isNullable: column.Null === 'YES',
        isPrimary: column.Key === 'PRI'
      }));
    },

    async query(sql: string, params?: any[]): Promise<any[]> {
      if (!connection) throw new Error('Veritabanına bağlanılmadı');

      const [rows] = await connection.query(sql, params || []);
      return rows as RowDataPacket[];
    },

    async getRecords(
      tableName: string,
      options: { page?: number; perPage?: number; sort?: { field: string; order: 'ASC' | 'DESC' }; filter?: Record<string, any> } = {}
    ): Promise<{ data: any[]; total: number }> {
      if (!connection) throw new Error('Veritabanına bağlanılmadı');

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

        for (const [key, value] of Object.entries(filter)) {
          if (value !== undefined && value !== null) {
            conditions.push(`\`${key}\` = ?`);
            params.push(value);
          }
        }

        if (conditions.length > 0) {
          filterQuery = `WHERE ${conditions.join(' AND ')}`;
        }
      }

      // Toplam kayıt sayısını al
      const countQuery = `SELECT COUNT(*) as total FROM \`${tableName}\` ${filterQuery}`;
      const [countRows] = await connection.query<RowDataPacket[]>(countQuery, params);
      const total = countRows[0].total;

      // Kayıtları al
      const dataQuery = `
        SELECT * FROM \`${tableName}\` 
        ${filterQuery}
        ORDER BY \`${sort.field}\` ${sort.order}
        LIMIT ${perPage} OFFSET ${offset}
      `;

      const [dataRows] = await connection.query<RowDataPacket[]>(dataQuery, params);

      return {
        data: dataRows,
        total
      };
    },

    async createRecord(tableName: string, data: Record<string, any>): Promise<any> {
      if (!connection) throw new Error('Veritabanına bağlanılmadı');

      const keys = Object.keys(data);
      const values = Object.values(data);

      if (keys.length === 0) {
        throw new Error('Kayıt için veri girilmedi');
      }

      const placeholders = keys.map(() => '?').join(', ');
      const columns = keys.map(key => `\`${key}\``).join(', ');

      const query = `
        INSERT INTO \`${tableName}\` (${columns})
        VALUES (${placeholders})
      `;

      const [result] = await connection.query<OkPacket>(query, values);

      // Yeni eklenen kaydı getir
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT * FROM \`${tableName}\` WHERE id = ?`,
        [result.insertId]
      );

      return rows[0];
    },

    async updateRecord(tableName: string, id: any, data: Record<string, any>): Promise<any> {
      if (!connection) throw new Error('Veritabanına bağlanılmadı');

      // Önce tablonun birincil anahtar sütununu bul
      const columns = await this.getTableColumns(tableName);
      const primaryKey = columns.find(col => col.isPrimary)?.name || 'id';

      const keys = Object.keys(data);
      const values = Object.values(data);

      if (keys.length === 0) {
        throw new Error('Güncellenecek veri girilmedi');
      }

      const setClause = keys.map(key => `\`${key}\` = ?`).join(', ');

      const query = `
        UPDATE \`${tableName}\`
        SET ${setClause}
        WHERE \`${primaryKey}\` = ?
      `;

      const [result] = await connection.query<OkPacket>(query, [...values, id]);

      if (result.affectedRows === 0) {
        throw new Error(`${primaryKey} = ${id} olan kayıt bulunamadı`);
      }

      // Güncellenen kaydı getir
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT * FROM \`${tableName}\` WHERE \`${primaryKey}\` = ?`,
        [id]
      );

      return rows[0];
    },

    async deleteRecord(tableName: string, id: any): Promise<void> {
      if (!connection) throw new Error('Veritabanına bağlanılmadı');

      // Önce tablonun birincil anahtar sütununu bul
      const columns = await this.getTableColumns(tableName);
      const primaryKey = columns.find(col => col.isPrimary)?.name || 'id';

      const query = `
        DELETE FROM \`${tableName}\`
        WHERE \`${primaryKey}\` = ?
      `;

      const [result] = await connection.query<OkPacket>(query, [id]);

      if (result.affectedRows === 0) {
        throw new Error(`${primaryKey} = ${id} olan kayıt bulunamadı`);
      }
    },

    async getRecordById(tableName: string, id: any): Promise<any> {
      if (!connection) throw new Error('Veritabanına bağlanılmadı');

      // Önce tablonun birincil anahtar sütununu bul
      const columns = await this.getTableColumns(tableName);
      const primaryKey = columns.find(col => col.isPrimary)?.name || 'id';

      const query = `
        SELECT * FROM \`${tableName}\`
        WHERE \`${primaryKey}\` = ?
      `;

      const [rows] = await connection.query<RowDataPacket[]>(query, [id]);

      if (rows.length === 0) {
        throw new Error(`${primaryKey} = ${id} olan kayıt bulunamadı`);
      }

      return rows[0];
    }
  };

  return adapter;
} 