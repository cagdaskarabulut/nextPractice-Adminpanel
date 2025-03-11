/**
 * Tüm veritabanı adaptörleri için temel arayüz.
 * Her veritabanı adaptörü bu arayüzü uygulamalıdır.
 */
export interface DatabaseAdapter {
  /**
   * Veritabanına bağlanır
   */
  connect(): Promise<void>;

  /**
   * Veritabanı bağlantısını kapatır
   */
  disconnect(): Promise<void>;

  /**
   * Tüm tabloları listeler
   */
  listTables(): Promise<string[]>;

  /**
   * Bir tablonun sütunlarını ve türlerini alır
   */
  getTableColumns(tableName: string): Promise<Array<{ name: string, type: string, isNullable: boolean, isPrimary: boolean }>>;

  /**
   * Bir sorgu çalıştırır ve sonuçları döndürür
   */
  query(sql: string, params?: any[]): Promise<any[]>;

  /**
   * Bir tablodaki tüm kayıtları alır
   */
  getRecords(tableName: string, options?: {
    page?: number;
    perPage?: number;
    sort?: { field: string; order: 'ASC' | 'DESC' };
    filter?: Record<string, any>;
  }): Promise<{ data: any[]; total: number }>;

  /**
   * Bir tabloya yeni bir kayıt ekler
   */
  createRecord(tableName: string, data: Record<string, any>): Promise<any>;

  /**
   * Bir tablodan bir kaydı günceller
   */
  updateRecord(tableName: string, id: any, data: Record<string, any>): Promise<any>;

  /**
   * Bir tablodan bir kaydı siler
   */
  deleteRecord(tableName: string, id: any): Promise<void>;

  /**
   * Bir tablodan bir kaydı ID'ye göre alır
   */
  getRecordById(tableName: string, id: any): Promise<any>;
}

/**
 * Adaptör fabrikası - doğru veritabanı adaptörünü oluşturur
 */
export function createAdapter(type: string, connectionString: string): DatabaseAdapter {
  switch (type.toLowerCase()) {
    case 'postgres':
    case 'postgresql':
      // PostgreSQL adaptörünü dinamik olarak import et
      return require('./postgres-adapter').default(connectionString);
    case 'mysql':
      // MySQL adaptörünü dinamik olarak import et
      return require('./mysql-adapter').default(connectionString);
    case 'mssql':
      // MSSQL adaptörünü dinamik olarak import et
      return require('./mssql-adapter').default(connectionString);
    default:
      throw new Error(`${type} veritabanı türü desteklenmiyor. Desteklenen türler: postgresql, mysql, mssql`);
  }
}

/**
 * Bağlantı dizesinden veritabanı türünü algılar
 */
export function detectDatabaseType(connectionString: string): string {
  if (connectionString.startsWith('postgres://') || connectionString.startsWith('postgresql://')) {
    return 'postgresql';
  } else if (connectionString.startsWith('mysql://')) {
    return 'mysql';
  } else if (connectionString.startsWith('mssql://') || connectionString.includes('sqlserver')) {
    return 'mssql';
  } else {
    throw new Error('Veritabanı türü bağlantı dizesinden tespit edilemiyor. Lütfen manuel olarak belirtin.');
  }
}

/**
 * Veritabanı sütun tiplerinin eşleştirilmesi
 */
export const columnTypeMap = {
  // PostgreSQL'den ortak türlere
  'character varying': 'string',
  'varchar': 'string',
  'text': 'string',
  'integer': 'number',
  'int': 'number',
  'smallint': 'number',
  'bigint': 'number',
  'boolean': 'boolean',
  'bool': 'boolean',
  'date': 'date',
  'timestamp': 'datetime',
  'real': 'number',
  'double precision': 'number',
  'numeric': 'number',
  'decimal': 'number',
  'json': 'json',
  'jsonb': 'json',

  // MySQL'den ortak türlere
  'tinyint(1)': 'boolean', // MySQL'de boolean olarak kullanılır
  'datetime': 'datetime',
  'float': 'number',
  'double': 'number',

  // MSSQL'den ortak türlere
  'nvarchar': 'string',
  'ntext': 'string',
  'bit': 'boolean',
  'datetime2': 'datetime',
  'money': 'number',
};

/**
 * Veritabanı türünü ortak bir türe çevirir
 */
export function mapColumnType(dbType: string): string {
  const normalizedType = dbType.toLowerCase().trim();

  // Parantez içindeki uzunluk bilgilerini temizle (varchar(255) -> varchar)
  const baseType = normalizedType.replace(/\([^)]*\)/, '');

  return columnTypeMap[baseType] || 'string'; // Bilinmeyen türler için varsayılan string
} 