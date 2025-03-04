import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/utils/db';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { tableName } = await request.json();

    // Tablo adını doğrula
    if (!tableName.match(/^[a-zA-Z][a-zA-Z0-9_]*$/)) {
      return NextResponse.json(
        { error: 'Geçersiz tablo adı. Sadece harf, rakam ve alt çizgi kullanabilirsiniz.' },
        { status: 400 }
      );
    }

    // Tablonun varlığını kontrol et
    const tableCheck = await executeQuery(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `, [tableName]);

    if (!tableCheck[0].exists) {
      return NextResponse.json(
        { error: 'Bu tablo veritabanında mevcut değil.' },
        { status: 404 }
      );
    }

    // config/tables.ts dosyasını oku
    const configPath = path.join(process.cwd(), 'src', 'config', 'tables.ts');
    let content = await fs.readFile(configPath, 'utf-8');

    // Tablo zaten ekli mi kontrol et
    if (content.includes(`'${tableName}'`)) {
      return NextResponse.json(
        { error: 'Bu tablo zaten yönetilen tablolar listesinde mevcut.' },
        { status: 400 }
      );
    }

    // managedTables dizisine yeni tabloyu ekle
    content = content.replace(
      /export const managedTables: string\[\] = \[([\s\S]*?)\];/,
      `export const managedTables: string[] = [$1,\n  '${tableName}', // ${new Date().toISOString()}\n];`
    );

    // tablePermissions nesnesine yeni tablo için izinleri ekle
    content = content.replace(
      /export const tablePermissions: Record<string, TablePermissions> = {([\s\S]*?)};/,
      `export const tablePermissions: Record<string, TablePermissions> = {$1,\n  '${tableName}': {\n    select: true,\n    insert: true,\n    update: true,\n    delete: true,\n  },\n};`
    );

    // Dosyayı kaydet
    await fs.writeFile(configPath, content, 'utf-8');

    return NextResponse.json({ message: 'Tablo başarıyla eklendi' });
  } catch (error: any) {
    console.error('Tablo ekleme hatası:', error);
    return NextResponse.json(
      { error: 'Tablo eklenirken bir hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
} 