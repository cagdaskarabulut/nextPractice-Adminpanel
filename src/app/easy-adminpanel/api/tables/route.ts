import { NextResponse } from 'next/server';
import { getSelectedTables, handleApiError } from '@/shared/api-utils';

// Seçilen tabloları getir
export async function GET() {
  try {
    // Ortak kütüphanedeki fonksiyonu kullan
    const selectedTables = await getSelectedTables();
    return NextResponse.json(selectedTables);
  } catch (error) {
    return handleApiError(error, 'Seçili tablolar alınırken bir hata oluştu');
  }
} 