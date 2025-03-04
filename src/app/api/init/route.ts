import { NextResponse } from 'next/server';
import { createTables } from '@/utils/db';

export async function POST() {
  try {
    await createTables();
    return NextResponse.json({ message: 'Tablolar başarıyla oluşturuldu' });
  } catch (error) {
    console.error('Tablo oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Tablo oluşturma hatası' },
      { status: 500 }
    );
  }
} 