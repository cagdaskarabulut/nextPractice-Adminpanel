// Güvenli postinstall script çalıştırma işlemi
try {
  const fs = require("fs");
  const path = require("path");

  function copyFile(source, target) {
    try {
      if (!fs.existsSync(source)) {
        console.log(`× Kaynak dosya bulunamadı: ${source}`);
        return;
      }

      if (!fs.existsSync(path.dirname(target))) {
        fs.mkdirSync(path.dirname(target), { recursive: true });
      }
      fs.copyFileSync(source, target);
      console.log(`✓ ${path.basename(target)} başarıyla kopyalandı`);
    } catch (err) {
      console.error(
        `× ${path.basename(target)} kopyalanırken hata oluştu:`,
        err
      );
    }
  }

  function updateTailwindConfig() {
    const projectRoot = process.env.INIT_CWD || process.cwd();
    const tailwindConfigPath = path.join(projectRoot, "tailwind.config.js");

    if (!fs.existsSync(tailwindConfigPath)) {
      console.log("× tailwind.config.js bulunamadı");
      return;
    }

    try {
      let configContent = fs.readFileSync(tailwindConfigPath, "utf8");
      const adminColors = `
        colors: {
          "admin-dark-blue": {
            900: "#0D1F36",
            800: "#12263F",
            700: "#183054",
            600: "#1D3A6A",
            500: "#2E4780",
          },
          "admin-blue": {
            500: "#3378FF",
            400: "#4A8CFF",
            300: "#75AAFF",
          },
          "admin-gray": {
            100: "#F7F9FC",
            200: "#EAF0F7",
            300: "#D9E2EC",
            400: "#B3C2D1",
            500: "#8696A7",
          },
        },
        fontFamily: {
          sans: ["Inter", "sans-serif"],
        },
        boxShadow: {
          card: "0 2px 5px 0 rgba(0,0,0,0.05)",
          "card-hover": "0 5px 15px 0 rgba(0,0,0,0.1)",
        },`;

      // Eğer extend zaten varsa, içine ekle
      if (configContent.includes("extend: {")) {
        configContent = configContent.replace(
          "extend: {",
          `extend: {\n      ${adminColors}`
        );
      } else {
        // Yoksa theme içine ekle
        configContent = configContent.replace(
          "theme: {",
          `theme: {\n    extend: {\n      ${adminColors}\n    },`
        );
      }

      fs.writeFileSync(tailwindConfigPath, configContent);
      console.log("✓ tailwind.config.js güncellendi");
    } catch (err) {
      console.error("× tailwind.config.js güncellenirken hata oluştu:", err);
    }
  }

  function injectStyles() {
    const projectRoot = process.env.INIT_CWD || process.cwd();
    const packageRoot = path.join(__dirname, "..");

    // Stil dosyalarını kopyala
    const sourceStyles = path.join(packageRoot, "src", "styles", "admin.css");
    const targetStyles = path.join(projectRoot, "src", "styles", "admin.css");

    if (fs.existsSync(sourceStyles)) {
      copyFile(sourceStyles, targetStyles);
    } else {
      console.error("× admin.css dosyası pakette bulunamadı");
    }

    // globals.css'e import ekle
    const globalsPath = path.join(projectRoot, "src", "app", "globals.css");
    if (fs.existsSync(globalsPath)) {
      let globalsContent = fs.readFileSync(globalsPath, "utf8");
      if (!globalsContent.includes('@import "../styles/admin.css"')) {
        globalsContent = `@import "../styles/admin.css";\n${globalsContent}`;
        fs.writeFileSync(globalsPath, globalsContent);
        console.log("✓ globals.css güncellendi");
      }
    } else {
      console.log("× globals.css bulunamadı, stil importu yapılamadı");
    }

    // Tailwind config'i güncelle
    updateTailwindConfig();
  }

  // Script'i çalıştır
  injectStyles();
} catch (err) {
  console.error("× Postinstall script çalıştırılırken bir hata oluştu:", err);
  console.log("× Hata oluştuğu için otomatik stiller uygulanamadı.");
  console.log(
    "× Lütfen https://github.com/cagdas_karabulut/easy-adminpanel adresindeki kurulum talimatlarını izleyerek manuel olarak stiller uygulayın."
  );
  // Script başarısız olsa bile paket kurulumunu etkilemesin
  process.exit(0);
}
