"use strict";

const path = require("path");
const fs = require("fs");

// Next.js uygulamasında kullanılacak setup fonksiyonu
function setupEasyAdminPanel(nextConfig = {}, options = {}) {
  const route = options.route || "/easy-adminpanel";
  const envVar = options.envVar || "POSTGRES_URL";
  const title = options.title || "Easy Admin Panel";

  // Mevcut Next.js konfigürasyonunu genişlet
  return {
    ...nextConfig,
    // Ayarları runtime'da erişilebilir hale getir
    env: {
      ...(nextConfig.env || {}),
      EASY_ADMIN_ROUTE: route,
      EASY_ADMIN_ENV_VAR: envVar,
      EASY_ADMIN_TITLE: title,
    },
    // Burada rewrite kuralları eklenebilir, ancak App Router ile genellikle gerekli değildir
  };
}

// Varsayılan konfigürasyon
const defaultConfig = {
  route: "/easy-adminpanel", // Admin panelinin erişilebileceği route
  envVar: "POSTGRES_URL", // Veritabanı bağlantı stringinin bulunduğu env değişkeni
  title: "Easy Admin Panel", // Panel başlığı
};

// CLI tarafından çağrılan kurulum fonksiyonu
async function installEasyAdminPanel(targetDir, options = {}) {
  const config = {
    ...defaultConfig,
    ...options,
  };

  // Paket içindeki template klasörünü kopyala
  const templateDir = path.join(__dirname, "templates");
  const easyAdminDir = path.join(
    targetDir,
    "app",
    config.route.replace(/^\//, "")
  );

  // Klasör oluştur
  if (!fs.existsSync(easyAdminDir)) {
    fs.mkdirSync(easyAdminDir, { recursive: true });
  }

  // Template dosyalarını kopyala (basit bir kopyalama fonksiyonu)
  function copyDir(src, dest) {
    const files = fs.readdirSync(src);

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    for (const file of files) {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);

      const stat = fs.statSync(srcPath);

      if (stat.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  // Klasörleri kopyala
  copyDir(templateDir, easyAdminDir);

  // Konfigürasyon dosyasını oluştur
  const configFile = path.join(easyAdminDir, "config.ts");
  const configContent = `
export const adminConfig = {
  route: '${config.route}',
  envVar: '${config.envVar}',
  title: '${config.title}',
};
  `.trim();

  fs.writeFileSync(configFile, configContent);

  return { easyAdminDir, config };
}

module.exports = {
  setupEasyAdminPanel,
  installEasyAdminPanel,
  defaultConfig,
};
