import { NextResponse } from 'next/server';
import * as db from '@/utils/db';

export async function GET() {
  try {
    const tables = await db.getTables();
    return NextResponse.json(tables.map(table => table.name));
  } catch (error: any) {
    console.error('Tablolar alınamadı:', error);
    return NextResponse.json(
      { error: error.message || 'Veritabanı tabloları alınamadı' },
      { status: 500 }
    );
  }
} 