import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Seçilen tabloları getir
export async function GET() {
  try {
    // Konfigürasyon dosyasının yolu
    const configFile = path.join(process.cwd(), 'src', 'config', 'tables.json');

    try {
      // Dosyayı oku
      const fileContent = await fs.readFile(configFile, 'utf-8');
      const config = JSON.parse(fileContent);

      // Tabloları formatlayarak döndür
      const tables = config.selectedTables.map((tableName: string) => ({
        name: tableName,
        displayName: tableName.charAt(0).toUpperCase() + tableName.slice(1).replace(/_/g, ' ')
      }));

      return NextResponse.json(tables);
    } catch (err) {
      // Dosya bulunamadıysa boş dizi döndür
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json([]);
      }
      throw err;
    }
  } catch (error) {
    console.error('Seçili tablolar alınırken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Seçili tablolar alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 