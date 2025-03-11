#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Renklendirme için console output fonksiyonları
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

console.log(
  `${colors.bright}${colors.blue}Easy-AdminPanel ${colors.yellow}Entegrasyon Yardımcısı${colors.reset}\n`
);

// Proje kök dizini
const projectRoot = process.cwd();

// Helper klasörünün olduğu yer
const helperDir = path.join(__dirname);

// Eski easy-adminpanel klasörünü temizle (eğer varsa)
const cleanupOldFiles = () => {
  const easyAdminPanelDir = path.join(
    projectRoot,
    "src",
    "app",
    "easy-adminpanel"
  );
  if (fs.existsSync(easyAdminPanelDir)) {
    console.log(
      `${colors.yellow}⚠️ ${colors.reset}Eski easy-adminpanel klasörü bulundu. Kaldırılıyor...`
    );
    try {
      fs.rmSync(easyAdminPanelDir, { recursive: true, force: true });
      console.log(
        `${colors.green}✓ ${colors.reset}Eski klasör başarıyla kaldırıldı.`
      );
    } catch (error) {
      console.error(
        `${colors.red}✗ ${colors.reset}Eski klasör kaldırılamadı: ${error.message}`
      );
    }
  }
};

// Hedef dizinlerin oluşturulması
const createDirectories = () => {
  const dirs = [
    path.join(projectRoot, "src", "components", "ui"),
    path.join(projectRoot, "src", "components", "utils"),
    path.join(projectRoot, "src", "components", "dialogs"),
    path.join(projectRoot, "src", "styles"),
    path.join(projectRoot, "src", "app", "admin"), // easy-adminpanel yerine doğrudan admin klasörü
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`${colors.green}✓ ${colors.reset}Dizin oluşturuldu: ${dir}`);
    }
  });
};

// Admin sayfalarını oluştur
const createAdminPages = () => {
  console.log(
    `${colors.yellow}» ${colors.reset}Admin sayfaları oluşturuluyor...`
  );

  // Admin sayfaları için varsayılan içerikler
  const defaultLayoutContent = `
export default function AdminLayout({ children }) {
  return (
    <div className="easy-adminpanel">
      {children}
    </div>
  );
}
  `.trim();

  const defaultPageContent = `
import { AdminPanel } from 'easy-adminpanel';

export default function AdminPage() {
  return <AdminPanel />;
}
  `.trim();

  // Admin sayfalarını oluştur
  const layoutPath = path.join(
    projectRoot,
    "src",
    "app",
    "admin",
    "layout.tsx"
  );
  const pagePath = path.join(projectRoot, "src", "app", "admin", "page.tsx");

  // Önce templates klasöründen kopyalamayı dene
  let templatesFound = false;
  try {
    // Farklı potansiyel template dizinlerini dene
    const possibleTemplateDirs = [
      path.join(path.dirname(path.dirname(helperDir)), "templates"),
      path.join(path.dirname(helperDir), "templates"),
      path.join(helperDir, "templates"),
      path.join(projectRoot, "node_modules", "easy-adminpanel", "templates"),
      path.join(
        projectRoot,
        "node_modules",
        "easy-adminpanel",
        "dist",
        "templates"
      ),
    ];

    for (const templateDir of possibleTemplateDirs) {
      if (fs.existsSync(templateDir)) {
        console.log(
          `${colors.blue}ℹ ${colors.reset}Templates dizini bulundu: ${templateDir}`
        );

        // Layout dosyasını kopyala
        const layoutTemplatePath = path.join(templateDir, "layout.tsx");
        if (fs.existsSync(layoutTemplatePath)) {
          fs.copyFileSync(layoutTemplatePath, layoutPath);
          console.log(
            `${colors.green}✓ ${colors.reset}Layout dosyası kopyalandı: ${layoutPath}`
          );
          templatesFound = true;
        }

        // Page dosyasını kopyala
        const pageTemplatePath = path.join(templateDir, "page.tsx");
        if (fs.existsSync(pageTemplatePath)) {
          fs.copyFileSync(pageTemplatePath, pagePath);
          console.log(
            `${colors.green}✓ ${colors.reset}Page dosyası kopyalandı: ${pagePath}`
          );
          templatesFound = true;
        }

        if (templatesFound) break;
      }
    }
  } catch (error) {
    console.log(
      `${colors.yellow}⚠️ ${colors.reset}Template arama hatası: ${error.message}`
    );
  }

  // Eğer templates bulunamadıysa varsayılan dosyaları oluştur
  if (!templatesFound) {
    console.log(
      `${colors.yellow}⚠️ ${colors.reset}Template dosyaları bulunamadı, varsayılan dosyalar oluşturuluyor...`
    );

    // Layout dosyasını oluştur
    if (!fs.existsSync(layoutPath)) {
      fs.writeFileSync(layoutPath, defaultLayoutContent);
      console.log(
        `${colors.green}✓ ${colors.reset}Varsayılan layout.tsx oluşturuldu: ${layoutPath}`
      );
    }

    // Page dosyasını oluştur
    if (!fs.existsSync(pagePath)) {
      fs.writeFileSync(pagePath, defaultPageContent);
      console.log(
        `${colors.green}✓ ${colors.reset}Varsayılan page.tsx oluşturuldu: ${pagePath}`
      );
    }
  }
};

// Dosyaların kopyalanması
const copyFiles = () => {
  // UI bileşenleri
  const uiFiles = fs.readdirSync(path.join(helperDir, "components", "ui"));
  uiFiles.forEach((file) => {
    const src = path.join(helperDir, "components", "ui", file);
    const dest = path.join(projectRoot, "src", "components", "ui", file);
    fs.copyFileSync(src, dest);
    console.log(`${colors.green}✓ ${colors.reset}Kopyalandı: ${dest}`);
  });

  // Utils bileşenleri
  const utilsFiles = fs.readdirSync(
    path.join(helperDir, "components", "utils")
  );
  utilsFiles.forEach((file) => {
    const src = path.join(helperDir, "components", "utils", file);
    const dest = path.join(projectRoot, "src", "components", "utils", file);
    fs.copyFileSync(src, dest);
    console.log(`${colors.green}✓ ${colors.reset}Kopyalandı: ${dest}`);
  });

  // Dialog bileşenleri
  const dialogFiles = fs.readdirSync(
    path.join(helperDir, "components", "dialogs")
  );
  dialogFiles.forEach((file) => {
    const src = path.join(helperDir, "components", "dialogs", file);
    const dest = path.join(projectRoot, "src", "components", "dialogs", file);
    fs.copyFileSync(src, dest);
    console.log(`${colors.green}✓ ${colors.reset}Kopyalandı: ${dest}`);
  });

  // Ana bileşenler
  const componentFiles = fs
    .readdirSync(path.join(helperDir, "components"))
    .filter((file) => file.endsWith(".tsx") || file.endsWith(".ts"));

  componentFiles.forEach((file) => {
    const src = path.join(helperDir, "components", file);
    const dest = path.join(projectRoot, "src", "components", file);
    fs.copyFileSync(src, dest);
    console.log(`${colors.green}✓ ${colors.reset}Kopyalandı: ${dest}`);
  });

  // Stiller
  const stylesFile = path.join(helperDir, "styles", "styles.tsx");
  const stylesDest = path.join(projectRoot, "src", "styles", "adminpanel.tsx");
  fs.copyFileSync(stylesFile, stylesDest);
  console.log(`${colors.green}✓ ${colors.reset}Kopyalandı: ${stylesDest}`);
};

// Belge kontrolü
const checkDocumentation = () => {
  const readmePath = path.join(helperDir, "README.md");
  if (fs.existsSync(readmePath)) {
    console.log(
      `\n${colors.bright}${colors.yellow}ÖNEMLİ:${colors.reset} Entegrasyon rehberi için lütfen okuyun: ${readmePath}`
    );
  }

  const apiDocsPath = path.join(helperDir, "api-docs.md");
  if (fs.existsSync(apiDocsPath)) {
    console.log(
      `${colors.bright}${colors.yellow}ÖNEMLİ:${colors.reset} API entegrasyonu için lütfen okuyun: ${apiDocsPath}`
    );
  }
};

// Lucide React bağımlılık kontrolü
const checkDependencies = () => {
  try {
    const packageJsonPath = path.join(projectRoot, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    const hasDependency =
      packageJson.dependencies && packageJson.dependencies["lucide-react"];
    const hasDevDependency =
      packageJson.devDependencies &&
      packageJson.devDependencies["lucide-react"];

    if (!hasDependency && !hasDevDependency) {
      console.log(
        `\n${colors.bright}${colors.yellow}UYARI:${colors.reset} lucide-react paketi bulunamadı. Yüklemeniz gerekebilir.`
      );
      console.log(
        `Yüklemek için: ${colors.bright}npm install lucide-react${colors.reset} veya ${colors.bright}yarn add lucide-react${colors.reset}`
      );
    }
  } catch (error) {
    console.log(
      `\n${colors.bright}${colors.red}HATA:${colors.reset} package.json okunamadı. Bağımlılıklar kontrol edilemedi.`
    );
  }
};

// Ana işlemleri çalıştır
try {
  cleanupOldFiles();
  createDirectories();
  copyFiles();
  createAdminPages(); // Admin sayfalarını oluştur
  checkDependencies();
  checkDocumentation();

  console.log(
    `\n${colors.bright}${colors.green}Entegrasyon tamamlandı!${colors.reset} Easy-AdminPanel bileşenleri başarıyla projenize eklendi.\n`
  );
  console.log(
    `Admin paneline şu adresten erişebilirsiniz: ${colors.bright}${colors.blue}http://localhost:3000/admin${colors.reset}\n`
  );
} catch (error) {
  console.error(
    `\n${colors.bright}${colors.red}HATA:${colors.reset} ${error.message}`
  );
  process.exit(1);
}
