import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Seçilen tabloları kaydet
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { tables } = data;

    if (!Array.isArray(tables)) {
      return NextResponse.json(
        { error: 'Geçersiz veri formatı. "tables" bir dizi olmalıdır.' },
        { status: 400 }
      );
    }

    // Konfigürasyon dosyasının yolu
    const configDir = path.join(process.cwd(), 'src', 'config');
    const configFile = path.join(configDir, 'tables.json');

    // Dizinin var olduğundan emin ol
    try {
      await fs.mkdir(configDir, { recursive: true });
    } catch (err) {
      // Dizin zaten varsa hata vermez
    }

    // Tabloları JSON olarak kaydet
    await fs.writeFile(
      configFile,
      JSON.stringify({ selectedTables: tables }, null, 2)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tablolar kaydedilirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Tablolar kaydedilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 