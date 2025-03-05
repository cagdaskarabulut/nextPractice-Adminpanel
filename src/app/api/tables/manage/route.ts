import { NextRequest, NextResponse } from 'next/server';
import { managedTables, tablePermissions } from '@/config/tables';
import { checkTableExists } from '@/utils/db';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { tableName } = await request.json();

    if (!tableName) {
      return NextResponse.json(
        { error: "Tablo adı gerekli" },
        { status: 400 }
      );
    }

    // Tablo adını doğrula (sadece harf, rakam ve alt çizgi içermeli)
    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
      return NextResponse.json(
        { error: "Tablo adı sadece harf, rakam ve alt çizgi içerebilir" },
        { status: 400 }
      );
    }

    // Tablo zaten ekli mi kontrol et
    if (managedTables.includes(tableName)) {
      return NextResponse.json(
        { error: "Bu tablo zaten eklenmiş" },
        { status: 400 }
      );
    }

    // Veritabanında tablonun var olup olmadığını kontrol et
    const tableExists = await checkTableExists(tableName);
    if (!tableExists) {
      return NextResponse.json(
        { error: "Bu tablo veritabanında mevcut değil. Lütfen geçerli bir tablo adı girin." },
        { status: 404 }
      );
    }

    // tables.ts dosyasını güncelle
    const tablesPath = path.join(process.cwd(), 'src', 'config', 'tables.ts');
    let content = await fs.readFile(tablesPath, 'utf-8');

    // Yeni tabloyu managedTables listesine ekle
    content = content.replace(
      /export const managedTables: string\[\] = \[([\s\S]*?)\];/,
      `export const managedTables: string[] = [\n  ${[...managedTables, tableName]
        .map(t => `'${t}'`)
        .join(',\n  ')}\n];`
    );

    // Yeni tablo için izinleri ekle
    const newPermissions = {
      select: true,
      insert: true,
      update: true,
      delete: true
    };

    content = content.replace(
      /export const tablePermissions: Record<string, TablePermissions> = {([\s\S]*?)};/,
      `export const tablePermissions: Record<string, TablePermissions> = {$1,\n  '${tableName}': ${JSON.stringify(
        newPermissions,
        null,
        2
      ).replace(/\n/g, '\n  ').replace(/"([^"]+)":/g, '$1:')}\n};`
    );

    await fs.writeFile(tablesPath, content, 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error adding table:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('tableName');

    if (!tableName) {
      return NextResponse.json(
        { error: "Tablo adı gerekli" },
        { status: 400 }
      );
    }

    if (!managedTables.includes(tableName)) {
      return NextResponse.json(
        { error: "Tablo bulunamadı" },
        { status: 404 }
      );
    }

    console.log(`Deleting table: ${tableName}`);

    // tables.ts dosyasını güncelle
    const tablesPath = path.join(process.cwd(), 'src', 'config', 'tables.ts');
    let content = await fs.readFile(tablesPath, 'utf-8');

    // Tabloyu managedTables listesinden kaldır
    const updatedTables = managedTables.filter(t => t !== tableName);
    content = content.replace(
      /export const managedTables: string\[\] = \[([\s\S]*?)\];/,
      `export const managedTables: string[] = [\n  ${updatedTables
        .map(t => `'${t}'`)
        .join(',\n  ')}\n];`
    );

    // tablePermissions nesnesinden tabloyu kaldır
    const updatedPermissions = { ...tablePermissions };
    delete updatedPermissions[tableName];

    let permissionsString = '{\n';
    Object.keys(updatedPermissions).forEach((table, index, array) => {
      permissionsString += `  '${table}': {\n`;
      permissionsString += `    select: true,\n`;
      permissionsString += `    insert: true,\n`;
      permissionsString += `    update: true,\n`;
      permissionsString += `    delete: true${index === array.length - 1 ? '\n  }' : '\n  },'}`;
    });
    permissionsString += '\n}';

    content = content.replace(
      /export const tablePermissions: Record<string, TablePermissions> = {([\s\S]*?)};/,
      `export const tablePermissions: Record<string, TablePermissions> = ${permissionsString};`
    );

    await fs.writeFile(tablesPath, content, 'utf-8');
    console.log(`Table ${tableName} deleted successfully`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting table:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 