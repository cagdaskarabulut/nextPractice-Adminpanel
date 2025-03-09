import { NextRequest, NextResponse } from 'next/server';
import dbUtils from '@/utils/db';

// GET: Tekil kaydı getir
export async function GET(
  request: NextRequest,
  { params }: { params: { table: string; id: string } }
) {
  try {
    const { table, id } = params;
    const record = await dbUtils.getRecord(table, id);
    return NextResponse.json(record);
  } catch (error: any) {
    console.error('Kayıt getirme hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Kayıt bulunamadı' },
      { status: 404 }
    );
  }
}

// PUT: Kaydı güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { table: string; id: string } }
) {
  try {
    const { table, id } = params;
    const data = await request.json();

    const updatedRecord = await dbUtils.updateRecord(table, id, data);
    return NextResponse.json(updatedRecord);
  } catch (error: any) {
    console.error('Kayıt güncelleme hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Kayıt güncellenemedi' },
      { status: 500 }
    );
  }
}

// DELETE: Kaydı sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { table: string; id: string } }
) {
  try {
    const { table, id } = params;

    const deletedRecord = await dbUtils.deleteRecord(table, id);
    return NextResponse.json(deletedRecord);
  } catch (error: any) {
    console.error('Kayıt silme hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Kayıt silinemedi' },
      { status: 500 }
    );
  }
} 