#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");

async function main() {
  try {
    console.log("📦 Template dosyaları kopyalanıyor...");

    // Kaynak dizini
    const templatesDir = path.join(__dirname, "../src/app/easy-adminpanel");

    // Hedef dizin
    const destDir = path.join(__dirname, "../dist/templates");

    // Template dizininin var olduğundan emin ol
    if (!fs.existsSync(templatesDir)) {
      console.error(`❌ Template dizini bulunamadı: ${templatesDir}`);
      process.exit(1);
    }

    // Hedef dizini temizle ve oluştur
    await fs.ensureDir(destDir);
    await fs.emptyDir(destDir);

    // Dosyaları kopyala
    await fs.copy(templatesDir, destDir, {
      filter: (src) => {
        // node_modules veya .next gibi klasörleri hariç tut
        return !src.includes("node_modules") && !src.includes(".next");
      },
    });

    console.log("✅ Template dosyaları başarıyla kopyalandı!");
  } catch (err) {
    console.error("❌ Hata:", err);
    process.exit(1);
  }
}

main();
