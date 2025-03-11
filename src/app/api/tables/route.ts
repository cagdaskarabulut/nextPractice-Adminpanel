import { NextResponse } from 'next/server';
import { getSelectedTables, handleApiError, apiSuccess } from '@/shared/api-utils';
import * as db from '@/utils/db';
import { writeFile } from 'fs/promises';
import path from 'path';

// Tablo listesini getir
export async function GET() {
  try {
    // Ortak kütüphanedeki fonksiyonu kullan
    const selectedTables = await getSelectedTables();
    return NextResponse.json(selectedTables);
  } catch (error: any) {
    return handleApiError(error, 'Veritabanı tabloları alınamadı');
  }
}

// Yeni tablo ekle
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { tableName, columns } = data;

    if (!tableName || !columns || !Array.isArray(columns) || columns.length === 0) {
      return NextResponse.json(
        { error: 'Geçersiz tablo yapısı. Tablo adı ve en az bir kolon gereklidir.' },
        { status: 400 }
      );
    }

    // Veritabanında tabloyu oluştur
    await db.createTable(tableName, columns);

    // Seçili tablolara yeni tabloyu ekle
    const configPath = path.join(process.cwd(), 'selected-tables.json');
    const configData = await getSelectedTables();
    const currentTables = configData.map(t => t.name);

    // Eğer tablo listede yoksa ekle
    if (!currentTables.includes(tableName)) {
      currentTables.push(tableName);
      await writeFile(
        configPath,
        JSON.stringify({ tables: currentTables }, null, 2)
      );
    }

    return apiSuccess({ success: true, message: `${tableName} tablosu başarıyla oluşturuldu.` });
  } catch (error: any) {
    return handleApiError(error, 'Tablo oluşturulurken bir hata oluştu');
  }
} 