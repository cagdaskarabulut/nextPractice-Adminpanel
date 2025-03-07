// AdminPanel bileşenleri için tip tanımlamaları

export interface Table {
  name: string;
  displayName: string;
}

export interface AvailableTable {
  table_name: string;
  selected: boolean;
}

export interface TableRecord {
  id: string | number;
  [key: string]: any;
}

export interface TableColumn {
  name: string;
  type?: string;
  isNullable?: boolean;
  defaultValue?: string;
  [key: string]: any;
} 