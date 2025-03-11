import { NextResponse } from 'next/server';
import { getSelectedTables, handleApiError } from '@/shared/api-utils';

export async function GET() {
  try {
    // Ortak kütüphanedeki fonksiyonu kullan
    const selectedTables = await getSelectedTables();
    return NextResponse.json(selectedTables);
  } catch (error: any) {
    return handleApiError(error, 'Veritabanı tabloları alınamadı');
  }
} 