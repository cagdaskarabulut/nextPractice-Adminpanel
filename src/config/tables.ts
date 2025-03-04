// Yönetilecek tabloların listesi
export const managedTables: string[] = [
  'yellcord_users',  // Örnek tablo
  'rooms',           // Örnek tablo
  'commercial',      // Örnek tablo
  'yellcord_rooms'   // Yeni eklenen tablo
,
  'article_like', // 2025-03-04T22:03:39.765Z
];

// Tablo izinleri
export interface TablePermissions {
  select: boolean;
  insert: boolean;
  update: boolean;
  delete: boolean;
}

// Her tablo için izinler
export const tablePermissions: Record<string, TablePermissions> = {
  'yellcord_users': {
    select: true,
    insert: true,
    update: true,
    delete: true,
  },
  'rooms': {
    select: true,
    insert: true,
    update: true,
    delete: true,
  },
  'commercial': {
    select: true,
    insert: true,
    update: true,
    delete: true,
  },
  'yellcord_rooms': {
    select: true,
    insert: true,
    update: true,
    delete: true,
  }
,
  'article_like': {
    select: true,
    insert: true,
    update: true,
    delete: true,
  },
};

// Varsayılan izinler
export const defaultPermissions: TablePermissions = {
  select: true,
  insert: true,
  update: true,
  delete: true,
};

// Tablo izinlerini kontrol et
export function hasTablePermission(table: string, operation: keyof TablePermissions): boolean {
  if (!managedTables.includes(table)) {
    return false;
  }

  const permissions = tablePermissions[table] || defaultPermissions;
  return permissions[operation];
}

// Tablo yönetimde mi kontrol et
export function isTableManaged(table: string): boolean {
  return managedTables.includes(table);
} 