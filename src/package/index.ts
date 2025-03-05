import path from 'path';
import * as fs from 'fs-extra';
import { setupEasyAdminPanel } from './setup';

export { setupEasyAdminPanel };

// Varsayılan konfigürasyon
export const defaultConfig = {
  route: '/easy-adminpanel',  // Admin panelinin erişilebileceği route
  envVar: 'POSTGRES_URL',     // Veritabanı bağlantı stringinin bulunduğu env değişkeni
  title: 'Easy Admin Panel',  // Panel başlığı
};

// CLI tarafından çağrılan kurulum fonksiyonu
export async function installEasyAdminPanel(
  targetDir: string,
  options: {
    route?: string;
    envVar?: string;
    title?: string;
  } = {}
) {
  const config = {
    ...defaultConfig,
    ...options,
  };

  // Paket içindeki template klasörünü kopyala
  const templateDir = path.join(__dirname, '../templates');
  const easyAdminDir = path.join(targetDir, 'app', config.route.replace(/^\//, ''));

  // Klasör oluştur
  await fs.ensureDir(easyAdminDir);

  // Template dosyalarını kopyala
  await fs.copy(templateDir, easyAdminDir);

  // Konfigürasyon dosyasını oluştur
  const configFile = path.join(easyAdminDir, 'config.ts');
  const configContent = `
export const adminConfig = {
  route: '${config.route}',
  envVar: '${config.envVar}',
  title: '${config.title}',
};
  `.trim();

  await fs.writeFile(configFile, configContent);

  console.log(`✅ Easy Admin Panel başarıyla kuruldu!`);
  console.log(`📂 Dosyalar şuraya kopyalandı: ${easyAdminDir}`);
  console.log(`🚀 Admin paneline şu adresten erişebilirsiniz: http://localhost:3000${config.route}`);

  return { easyAdminDir, config };
} 