#!/usr/bin/env node
"use strict";

const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");
const { execSync } = require("child_process");

// Renklendirme için ansi renk kodları
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
};

console.log(`${colors.bright}${colors.cyan}██████╗ ██████╗${colors.blue}██╗   ██╗███╗   ██╗███╗   ███╗██╗███╗   ██╗
${colors.cyan}██╔══██╗██╔══██╗${colors.blue}██║   ██║████╗  ██║████╗ ████║██║████╗  ██║
${colors.cyan}██║  ██║██║  ██║${colors.blue}██║   ██║██╔██╗ ██║██╔████╔██║██║██╔██╗ ██║
${colors.cyan}██║  ██║██║  ██║${colors.blue}██║   ██║██║╚██╗██║██║╚██╔╝██║██║██║╚██╗██║
${colors.cyan}██████╔╝██████╔╝${colors.blue}╚██████╔╝██║ ╚████║██║ ╚═╝ ██║██║██║ ╚████║
${colors.cyan}╚═════╝ ╚═════╝${colors.blue} ╚═════╝ ╚═╝  ╚═══╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝${colors.reset}
                                                         
${colors.bright}${colors.yellow}Easy AdminPanel Kurulum Aracı${colors.reset} - Vercel PostgreSQL için otomatik admin paneli
`);

// Uygulamanın çalıştığı dizin
const appDir = process.cwd();

function createDirectories() {
  const directories = [
    path.join(appDir, "src", "app", "api", "tables"),
    path.join(appDir, "src", "app", "api", "all-tables"),
    path.join(appDir, "src", "app", "api", "save-tables"),
    path.join(appDir, "src", "app", "api", "create-table"),
    path.join(appDir, "src", "app", "api", "resources"),
    // src/app/admin dizinini kullan, easy-adminpanel dizinini kaldır
    path.join(appDir, "src", "app", "admin"),
  ];

  console.log(`${colors.yellow}» ${colors.reset}Dizinler oluşturuluyor...`);

  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(
        `  ${colors.green}✓ ${colors.reset}Dizin oluşturuldu: ${
          colors.bright
        }${dir.replace(appDir, "")}${colors.reset}`
      );
    } else {
      console.log(
        `  ${colors.blue}ℹ ${colors.reset}Dizin zaten mevcut: ${
          colors.bright
        }${dir.replace(appDir, "")}${colors.reset}`
      );
    }
  }
}

function copyApiFiles() {
  console.log(
    `\n${colors.yellow}» ${colors.reset}API endpoint'leri oluşturuluyor...`
  );

  // Şablon dizini
  const templateDir = path.join(__dirname, "..", "templates");

  // API dosyaları
  const apiFiles = [
    {
      src: "api-tables.ts",
      dest: path.join(appDir, "src", "app", "api", "tables", "route.ts"),
    },
    {
      src: "api-all-tables.ts",
      dest: path.join(appDir, "src", "app", "api", "all-tables", "route.ts"),
    },
    {
      src: "api-save-tables.ts",
      dest: path.join(appDir, "src", "app", "api", "save-tables", "route.ts"),
    },
    {
      src: "api-create-table.ts",
      dest: path.join(appDir, "src", "app", "api", "create-table", "route.ts"),
    },
    {
      src: "api-resources.ts",
      dest: path.join(
        appDir,
        "src",
        "app",
        "api",
        "resources",
        "[table]",
        "route.ts"
      ),
    },
  ];

  apiFiles.forEach((file) => {
    const srcPath = path.join(templateDir, file.src);
    if (!fs.existsSync(path.dirname(file.dest))) {
      fs.mkdirSync(path.dirname(file.dest), { recursive: true });
    }

    if (!fs.existsSync(file.dest)) {
      fse.copySync(srcPath, file.dest);
      console.log(
        `  ${colors.green}✓ ${colors.reset}API endpoint oluşturuldu: ${
          colors.bright
        }${file.dest.replace(appDir, "")}${colors.reset}`
      );
    } else {
      console.log(
        `  ${colors.blue}ℹ ${colors.reset}API endpoint zaten mevcut: ${
          colors.bright
        }${file.dest.replace(appDir, "")}${colors.reset}`
      );
    }
  });
}

function copyAdminFiles() {
  console.log(
    `\n${colors.yellow}» ${colors.reset}Admin paneli dosyaları oluşturuluyor...`
  );

  // Şablon dizini
  const templateDir = path.join(__dirname, "..", "templates");

  // Admin panel dosyaları - easy-adminpanel yerine admin klasörü
  const adminFiles = [
    {
      src: "page.tsx",
      dest: path.join(appDir, "src", "app", "admin", "page.tsx"),
    },
    {
      src: "layout.tsx",
      dest: path.join(appDir, "src", "app", "admin", "layout.tsx"),
    },
  ];

  adminFiles.forEach((file) => {
    const srcPath = path.join(templateDir, file.src);
    if (!fs.existsSync(file.dest)) {
      fse.copySync(srcPath, file.dest);
      console.log(
        `  ${colors.green}✓ ${colors.reset}Admin paneli dosyası oluşturuldu: ${
          colors.bright
        }${file.dest.replace(appDir, "")}${colors.reset}`
      );
    } else {
      console.log(
        `  ${colors.blue}ℹ ${colors.reset}Admin paneli dosyası zaten mevcut: ${
          colors.bright
        }${file.dest.replace(appDir, "")}${colors.reset}`
      );
    }
  });
}

function updateNextConfig() {
  console.log(
    `\n${colors.yellow}» ${colors.reset}Next.js yapılandırması kontrol ediliyor...`
  );

  const nextConfigPath = path.join(appDir, "next.config.js");
  if (!fs.existsSync(nextConfigPath)) {
    const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pg'],
  },
  transpilePackages: ['easy-adminpanel'],
}

module.exports = nextConfig`;

    fs.writeFileSync(nextConfigPath, nextConfigContent);
    console.log(
      `  ${colors.green}✓ ${colors.reset}Next.js yapılandırması oluşturuldu: ${colors.bright}next.config.js${colors.reset}`
    );
  } else {
    let nextConfigContent = fs.readFileSync(nextConfigPath, "utf8");

    if (
      !nextConfigContent.includes("serverComponentsExternalPackages") ||
      !nextConfigContent.includes("pg")
    ) {
      console.log(
        `  ${colors.yellow}⚠ ${colors.reset}Next.js yapılandırması güncellendi: Lütfen next.config.js dosyanıza aşağıdaki ayarları ekleyin:`
      );
      console.log(`
${colors.cyan}experimental: {
  serverComponentsExternalPackages: ['pg'],
},
transpilePackages: ['easy-adminpanel'],${colors.reset}
      `);
    } else {
      console.log(
        `  ${colors.blue}ℹ ${colors.reset}Next.js yapılandırması zaten uygun.`
      );
    }
  }
}

function checkEnvFile() {
  console.log(
    `\n${colors.yellow}» ${colors.reset}Çevre değişkenleri kontrol ediliyor...`
  );

  const envPath = path.join(appDir, ".env");
  const envRequiredVars = [
    "POSTGRES_URL",
    "POSTGRES_PRISMA_URL",
    "POSTGRES_URL_NON_POOLING",
    "POSTGRES_USER",
    "POSTGRES_HOST",
    "POSTGRES_PASSWORD",
    "POSTGRES_DATABASE",
  ];

  if (!fs.existsSync(envPath)) {
    const envContent = envRequiredVars
      .map((v) => `# ${v}=your_value_here`)
      .join("\n");
    fs.writeFileSync(envPath, envContent);
    console.log(
      `  ${colors.green}✓ ${colors.reset}Örnek .env dosyası oluşturuldu.`
    );
    console.log(
      `  ${colors.yellow}⚠ ${colors.reset}Lütfen .env dosyasını Vercel PostgreSQL bilgilerinizle güncelleyin.`
    );
  } else {
    const envContent = fs.readFileSync(envPath, "utf8");
    const missingVars = envRequiredVars.filter((v) => !envContent.includes(v));

    if (missingVars.length > 0) {
      console.log(
        `  ${colors.yellow}⚠ ${
          colors.reset
        }Eksik çevre değişkenleri: ${missingVars.join(", ")}`
      );
      console.log(
        `  ${colors.yellow}⚠ ${colors.reset}Lütfen .env dosyanıza gerekli PostgreSQL bilgilerini ekleyin.`
      );
    } else {
      console.log(
        `  ${colors.blue}ℹ ${colors.reset}Çevre değişkenleri dosyası (.env) zaten mevcut.`
      );
    }
  }
}

function checkDependencies() {
  console.log(
    `\n${colors.yellow}» ${colors.reset}Gerekli bağımlılıklar kontrol ediliyor...`
  );

  const packageJsonPath = path.join(appDir, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    console.log(
      `  ${colors.red}✗ ${colors.reset}package.json bulunamadı! Bu bir Next.js projesi değil mi?`
    );
    return false;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const dependencies = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
    };

    const requiredDeps = ["pg", "fs-extra", "react-admin"];
    const missingDeps = requiredDeps.filter((dep) => !dependencies[dep]);

    if (missingDeps.length > 0) {
      console.log(
        `  ${colors.yellow}⚠ ${
          colors.reset
        }Eksik bağımlılıklar: ${missingDeps.join(", ")}`
      );
      console.log(
        `  ${colors.yellow}⚠ ${colors.reset}Aşağıdaki komutu çalıştırarak eksik bağımlılıkları yükleyin:`
      );
      console.log(
        `  ${colors.bright}npm install ${missingDeps.join(" ")}${colors.reset}`
      );

      const installDeps = missingDeps.join(" ");
      try {
        console.log(
          `\n${colors.yellow}» ${colors.reset}Eksik bağımlılıklar yükleniyor...`
        );
        execSync(`npm install ${installDeps}`, { stdio: "inherit" });
        console.log(
          `  ${colors.green}✓ ${colors.reset}Bağımlılıklar başarıyla yüklendi.`
        );
      } catch (error) {
        console.log(
          `  ${colors.red}✗ ${colors.reset}Bağımlılıklar yüklenirken hata oluştu. Lütfen manuel olarak yükleyin.`
        );
      }
    } else {
      console.log(
        `  ${colors.green}✓ ${colors.reset}Tüm gerekli bağımlılıklar zaten yüklenmiş.`
      );
    }

    return true;
  } catch (error) {
    console.log(
      `  ${colors.red}✗ ${colors.reset}package.json ayrıştırılırken hata oluştu:`,
      error.message
    );
    return false;
  }
}

// Eski easy-adminpanel klasörünü temizle (eğer varsa)
function cleanupOldDirectory() {
  console.log(
    `\n${colors.yellow}» ${colors.reset}Eski dizinler kontrol ediliyor...`
  );

  // Eski easy-adminpanel dizinini temizle
  const easyAdminDir = path.join(appDir, "src", "app", "easy-adminpanel");
  if (fs.existsSync(easyAdminDir)) {
    console.log(
      `  ${colors.yellow}⚠ ${colors.reset}Eski easy-adminpanel dizini bulundu, kaldırılıyor...`
    );
    try {
      fse.removeSync(easyAdminDir);
      console.log(
        `  ${colors.green}✓ ${colors.reset}Eski easy-adminpanel dizini başarıyla kaldırıldı.`
      );
    } catch (error) {
      console.log(
        `  ${colors.red}✗ ${colors.reset}Dizin kaldırılırken hata: ${error.message}`
      );
    }
  } else {
    console.log(
      `  ${colors.blue}ℹ ${colors.reset}Eski easy-adminpanel dizini bulunamadı, bu normal.`
    );
  }
}

function runInstall() {
  try {
    console.log(
      `\n${colors.bright}${colors.cyan}Easy AdminPanel kurulumu başlatılıyor...${colors.reset}\n`
    );

    // Dizinleri temizle
    cleanupOldDirectory();

    // Gerekli dizinleri oluştur
    createDirectories();

    // API dosyalarını kopyala
    copyApiFiles();

    // Admin panel dosyalarını kopyala
    copyAdminFiles();

    // next.config.js kontrolü
    updateNextConfig();

    // .env dosyası kontrolü
    checkEnvFile();

    // Bağımlılık kontrolü
    checkDependencies();

    console.log(
      `\n${colors.bright}${colors.green}✓ Easy AdminPanel kurulumu tamamlandı!${colors.reset}\n`
    );
    console.log(`${colors.bright}Nasıl Kullanılır:${colors.reset}`);
    console.log(
      `1. ${colors.yellow}Veritabanı bağlantısını kontrol edin:${colors.reset} .env dosyasındaki PostgreSQL bilgilerinizi güncelleyin`
    );
    console.log(
      `2. ${colors.yellow}Admin Paneline Erişin:${colors.reset} http://localhost:3000/admin adresinden panele ulaşabilirsiniz`
    );
    console.log(
      `3. ${colors.yellow}Tabloları Yönetin:${colors.reset} Paneldeki "Tabloları Yönet" butonunu kullanarak gösterilecek tabloları seçin\n`
    );

    console.log(
      `${colors.bright}${colors.blue}Daha fazla bilgi için:${colors.reset} https://github.com/cagdas_karabulut/easy-adminpanel\n`
    );
  } catch (error) {
    console.error(
      `\n${colors.red}✗ Kurulum sırasında bir hata oluştu:${colors.reset}`,
      error
    );
    process.exit(1);
  }
}

// Ana fonksiyonu çalıştır
runInstall();
