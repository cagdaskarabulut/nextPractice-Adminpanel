import { NextRequest, NextResponse } from 'next/server';
import dbUtils from '@/utils/db';

// GET: Tablo kayıtlarını getir veya şemasını getir
export async function GET(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  try {
    const table = params.table;
    const url = new URL(request.url);
    const isSchema = url.searchParams.has('_schema');

    if (isSchema) {
      // Tablo şemasını döndür
      const columns = await dbUtils.getTableColumns(table);
      return NextResponse.json(columns);
    } else {
      // Tablo kayıtlarını döndür
      const records = await dbUtils.getTableRecords(table);
      return NextResponse.json(records);
    }
  } catch (error: any) {
    console.error('Tablo kayıt listeleme hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Kayıtlar alınamadı' },
      { status: 500 }
    );
  }
}

// POST: Yeni kayıt ekle
export async function POST(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  try {
    const table = params.table;
    const data = await request.json();

    // Kayıt ekleme işlemi
    const newRecord = await dbUtils.addRecord(table, data);

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error: any) {
    console.error('Kayıt ekleme hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Kayıt eklenemedi' },
      { status: 500 }
    );
  }
} 