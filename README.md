# Easy Admin Panel

Bu paket, Next.js projelerinize kolayca entegre edebileceğiniz, PostgreSQL veritabanınız için otomatik CRUD arayüzü oluşturan bir admin panel çözümüdür.

## Özellikler

- **Kolay Kurulum**: Tek komutla Next.js projenize entegre edilir
- **Dinamik Tablo Yönetimi**: Uygulamanızdaki PostgreSQL tablolarını otomatik olarak algılar
- **Otomatik CRUD Arayüzleri**: Seçilen tablolar için liste, ekleme, düzenleme ve silme ekranları
- **Modern UI**: Tailwind CSS ve ShadCN UI ile modern arayüz
- **Güvenli**: Kendi projenizin içinde çalışır, erişim kontrolü sizin elinizde

## Kurulum

```bash
# NPM ile
npm install easy-adminpanel

# veya Yarn ile
yarn add easy-adminpanel

# veya PNPM ile
pnpm add easy-adminpanel
```

Kurulumdan sonra, aşağıdaki komutu çalıştırarak admin paneli projenize entegre edin:

```bash
npx easy-adminpanel init
```

veya özel seçeneklerle:

```bash
npx easy-adminpanel init --route=/admin --envVar=DATABASE_URL --title="Özel Admin Panel"
```

## Kullanım

Kurulumdan sonra, aşağıdaki adımları izleyin:

1. Veritabanı bağlantı bilgilerinizi `.env` dosyasına ekleyin:
   ```
   POSTGRES_URL="postgres://user:password@host:port/database"
   ```

2. Uygulamanızı başlatın:
   ```bash
   npm run dev
   ```

3. Tarayıcınızdan admin paneline erişin: 
   ```
   http://localhost:3000/easy-adminpanel
   ```

4. İlk kullanımda, yönetmek istediğiniz tabloları seçin.

## Next.js Projenize Entegrasyon

Programatic olarak entegre etmek için, `next.config.js` dosyanızda aşağıdaki şekilde kullanabilirsiniz:

```javascript
const { setupEasyAdminPanel } = require('easy-adminpanel');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... mevcut konfigürasyonunuz
};

module.exports = setupEasyAdminPanel(nextConfig, {
  route: '/admin',   // İsteğe bağlı: Admin panelin erişileceği URL
  envVar: 'DATABASE_URL', // İsteğe bağlı: Veritabanı bağlantı stringinin env değişkeni
  title: 'Yönetim Paneli', // İsteğe bağlı: Panel başlığı
});
```

## Lisans

MIT
