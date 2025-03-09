import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

// Seçilen tabloları JSON dosyasına kaydeden API endpoint'i
export async function POST(request: NextRequest) {
  try {
    const { tables } = await request.json();

    // Seçilen tabloları bir JSON dosyasına kaydet
    const configPath = path.join(process.cwd(), 'selected-tables.json');
    await writeFile(configPath, JSON.stringify({ tables }, null, 2), 'utf-8');

    return NextResponse.json({ success: true, tables });
  } catch (error: any) {
    console.error('Tablolar kaydedilemedi:', error);
    return NextResponse.json(
      { error: error.message || 'Tablolar kaydedilemedi' },
      { status: 500 }
    );
  }
} 