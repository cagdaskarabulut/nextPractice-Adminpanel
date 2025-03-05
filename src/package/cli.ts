#!/usr/bin/env node

import { installEasyAdminPanel, defaultConfig } from './index';
import path from 'path';
import fs from 'fs';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'init' || command === 'install') {
    const targetDir = process.cwd();

    // Klasik Next.js proje yapısını kontrol et
    const packageJsonPath = path.join(targetDir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.error('❌ package.json bulunamadı. Lütfen bir Next.js proje dizininde çalıştırın.');
      process.exit(1);
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (!packageJson.dependencies?.next) {
        console.warn('⚠️  Bu projede Next.js bağımlılığı tespit edilemedi. Kurulum devam ediyor ama sorunlar çıkabilir.');
      }
    } catch (err) {
      console.error('❌ package.json dosyası okunamadı:', err);
      process.exit(1);
    }

    // Varsa özel konfigürasyon parametrelerini al
    const options: Record<string, string> = {};
    for (let i = 1; i < args.length; i++) {
      if (args[i].startsWith('--')) {
        const [key, value] = args[i].slice(2).split('=');
        if (key && value) {
          options[key] = value;
        }
      }
    }

    // Kurulumu başlat
    console.log('🚀 Easy Admin Panel kuruluyor...');

    try {
      await installEasyAdminPanel(targetDir, {
        route: options.route || defaultConfig.route,
        envVar: options.envVar || defaultConfig.envVar,
        title: options.title || defaultConfig.title,
      });

      console.log('\n📝 Kurulum sonrası yapılması gerekenler:');
      console.log('1. Veritabanı bağlantı bilgilerinizi .env dosyasına ekleyin:');
      console.log(`   ${options.envVar || defaultConfig.envVar}="postgres://user:password@host:port/database"`);
      console.log('2. Uygulamanızı başlatın:');
      console.log('   npm run dev');
      console.log(`3. Tarayıcınızdan admin paneline erişin: http://localhost:3000${options.route || defaultConfig.route}\n`);
    } catch (err) {
      console.error('❌ Kurulum sırasında bir hata oluştu:', err);
      process.exit(1);
    }
  } else {
    console.log('Easy Admin Panel CLI');
    console.log('Kullanım:');
    console.log('  npx easy-adminpanel init [seçenekler]');
    console.log('  npx easy-adminpanel install [seçenekler]');
    console.log('\nSeçenekler:');
    console.log('  --route=YOUR_ROUTE    Admin panel route\'u (varsayılan: /easy-adminpanel)');
    console.log('  --envVar=ENV_VAR_NAME Veritabanı bağlantı stringi için env değişkeni (varsayılan: POSTGRES_URL)');
    console.log('  --title=PANEL_TITLE   Admin panel başlığı (varsayılan: Easy Admin Panel)');
  }
}

main().catch(err => {
  console.error('❌ Beklenmeyen bir hata oluştu:', err);
  process.exit(1);
}); 