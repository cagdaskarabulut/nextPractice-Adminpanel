/**
 * API İşlemleri için Ortak Yardımcı Fonksiyonlar
 * Bu modül, hem src/app/api hem de src/app/easy-adminpanel/api tarafından
 * kullanılabilecek paylaşılan fonksiyonları içerir.
 */

import { NextResponse } from 'next/server';
import * as db from '@/utils/db';
import { readFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

/**
 * Seçili tabloları görüntülemek için kullanılan ortak fonksiyon.
 * Kök dizindeki selected-tables.json dosyasını kontrol eder.
 */
export async function getSelectedTables() {
  try {
    // Tüm tabloları veritabanından al
    const allTables = await db.getTables();

    // Kök dizindeki selected-tables.json'ı kontrol et
    let selectedTableNames: string[] = [];
    const rootConfigPath = path.join(process.cwd(), 'selected-tables.json');

    if (fs.existsSync(rootConfigPath)) {
      const configData = await readFile(rootConfigPath, 'utf-8');
      const config = JSON.parse(configData);
      selectedTableNames = config.tables || [];
    } else {
      // Konfigürasyon dosyası bulunamazsa, tüm tabloları göster
      selectedTableNames = allTables.map(table => table.name);

      // Konfigürasyon dosyasını oluştur
      const defaultConfig = {
        tables: selectedTableNames
      };

      try {
        fs.writeFileSync(rootConfigPath, JSON.stringify(defaultConfig, null, 2));
        console.log('✓ selected-tables.json oluşturuldu');
      } catch (err) {
        console.error('× selected-tables.json oluşturulamadı:', err);
      }
    }

    // Sadece seçilen tabloları filtrele ve formatla
    const selectedTables = allTables
      .filter(table => selectedTableNames.includes(table.name))
      .map(table => ({
        name: table.name,
        displayName: table.name.charAt(0).toUpperCase() + table.name.slice(1).replace(/_/g, ' ')
      }));

    return selectedTables;
  } catch (error: any) {
    console.error('Seçili tablolar alınamadı:', error);
    throw new Error(error.message || 'Veritabanı tabloları alınamadı');
  }
}

/**
 * API yanıt hata işleyicisi
 */
export function handleApiError(error: any, message: string = 'İşlem sırasında bir hata oluştu') {
  console.error(`API Hatası: ${message}`, error);

  return NextResponse.json(
    { error: error.message || message },
    { status: 500 }
  );
}

/**
 * API başarı yanıtı
 */
export function apiSuccess(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
} 