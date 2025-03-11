import { NextResponse } from 'next/server';
import * as db from '@/utils/db';
import { readFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    // Tüm tabloları veritabanından al
    const allTables = await db.getTables();

    // Seçilen tabloları JSON dosyasından oku
    let selectedTableNames: string[] = [];
    const configPath = path.join(process.cwd(), 'selected-tables.json');

    // Dosya varsa oku, yoksa tüm tabloları göster
    if (fs.existsSync(configPath)) {
      const configData = await readFile(configPath, 'utf-8');
      const config = JSON.parse(configData);
      selectedTableNames = config.tables || [];
    } else {
      // Konfigürasyon dosyası yoksa, tüm tabloları göster
      selectedTableNames = allTables.map(table => table.name);
    }

    // Sadece seçilen tabloları filtrele
    const selectedTables = allTables
      .filter(table => selectedTableNames.includes(table.name))
      .map(table => ({
        name: table.name,
        displayName: table.name.charAt(0).toUpperCase() + table.name.slice(1).replace(/_/g, ' ')
      }));

    return NextResponse.json(selectedTables);
  } catch (error: any) {
    console.error('Tablolar alınamadı:', error);
    return NextResponse.json(
      { error: error.message || 'Veritabanı tabloları alınamadı' },
      { status: 500 }
    );
  }
} 