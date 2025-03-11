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
    // API dizinleri
    path.join(projectRoot, "src", "app", "api", "tables"),
    path.join(projectRoot, "src", "app", "api", "all-tables"),
    path.join(projectRoot, "src", "app", "api", "save-tables"),
    path.join(projectRoot, "src", "app", "api", "create-table"),
    path.join(projectRoot, "src", "app", "api", "resources", "[table]"),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`${colors.green}✓ ${colors.reset}Dizin oluşturuldu: ${dir}`);
    }
  });
};

// API dosyalarını oluştur
const createApiRoutes = () => {
  console.log(
    `${colors.yellow}» ${colors.reset}API route dosyaları oluşturuluyor...`
  );

  // API dosyaları için içerikler
  const tablesApiContent = `import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const tablesPath = path.join(process.cwd(), 'tables.json');
    
    if (!fs.existsSync(tablesPath)) {
      return NextResponse.json({ tables: [] });
    }
    
    const tablesData = fs.readFileSync(tablesPath, 'utf8');
    const tables = JSON.parse(tablesData);
    
    return NextResponse.json({ tables });
  } catch (error) {
    console.error('Tablolar alınırken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Tablolar alınamadı' },
      { status: 500 }
    );
  }
}`;

  const allTablesApiContent = `import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();
    
    const result = await client.query(\`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    \`);
    
    client.release();
    
    const tables = result.rows.map(row => row.table_name);
    
    return NextResponse.json({ tables });
  } catch (error) {
    console.error('Veritabanı tabloları alınırken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Veritabanı tabloları alınamadı' },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}`;

  const saveTablesApiContent = `import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { tables } = await request.json();
    
    const tablesPath = path.join(process.cwd(), 'tables.json');
    fs.writeFileSync(tablesPath, JSON.stringify(tables, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tablolar kaydedilirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Tablolar kaydedilemedi' },
      { status: 500 }
    );
  }
}`;

  const createTableApiContent = `import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function POST(request: Request) {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const { tableName, columns } = await request.json();
    
    if (!tableName || !columns || !Array.isArray(columns) || columns.length === 0) {
      return NextResponse.json(
        { error: 'Geçersiz tablo bilgileri' },
        { status: 400 }
      );
    }
    
    const client = await pool.connect();
    
    // Kolon tanımlarını oluştur
    const columnDefinitions = columns
      .map(col => \`\${col.name} \${col.type}\${col.constraints ? ' ' + col.constraints : ''}\`)
      .join(', ');
    
    const createTableQuery = \`
      CREATE TABLE IF NOT EXISTS \${tableName} (
        id SERIAL PRIMARY KEY,
        \${columnDefinitions}
      )
    \`;
    
    await client.query(createTableQuery);
    client.release();
    
    return NextResponse.json({ 
      success: true,
      message: \`\${tableName} tablosu başarıyla oluşturuldu\` 
    });
  } catch (error) {
    console.error('Tablo oluşturulurken hata:', error);
    return NextResponse.json(
      { error: 'Tablo oluşturulamadı' },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}`;

  const resourcesApiContent = `import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// GET - Tüm kayıtları veya belirli bir kaydı al
export async function GET(
  request: Request,
  { params }: { params: { table: string } }
) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const range = searchParams.get('range');
  const sort = searchParams.get('sort');
  const filter = searchParams.get('filter');
  
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();
    let query = '';
    let result;
    
    // Tek bir kayıt sorgusu
    if (id) {
      query = \`SELECT * FROM \${params.table} WHERE id = $1\`;
      result = await client.query(query, [id]);
      client.release();
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Kayıt bulunamadı' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(result.rows[0]);
    }
    
    // Aralık sorgusu
    else if (range) {
      const [start, end] = JSON.parse(range);
      const limit = end - start + 1;
      const offset = start;
      
      // Sıralama
      let orderBy = '';
      if (sort) {
        const [field, order] = JSON.parse(sort);
        orderBy = \`ORDER BY \${field} \${order === 'ASC' ? 'ASC' : 'DESC'}\`;
      }
      
      // Filtreleme
      let whereClause = '';
      let queryParams: any[] = [];
      if (filter) {
        const filterObj = JSON.parse(filter);
        const conditions = [];
        let paramIndex = 1;
        
        for (const [key, value] of Object.entries(filterObj)) {
          if (value !== undefined && value !== null) {
            conditions.push(\`\${key} = $\${paramIndex}\`);
            queryParams.push(value);
            paramIndex++;
          }
        }
        
        if (conditions.length > 0) {
          whereClause = \`WHERE \${conditions.join(' AND ')}\`;
        }
      }
      
      // Toplam sayı sorgusu
      const countQuery = \`SELECT COUNT(*) FROM \${params.table} \${whereClause}\`;
      const countResult = await client.query(countQuery, queryParams);
      const totalCount = parseInt(countResult.rows[0].count);
      
      // Veri sorgusu
      query = \`
        SELECT * FROM \${params.table}
        \${whereClause}
        \${orderBy}
        LIMIT \${limit} OFFSET \${offset}
      \`;
      
      result = await client.query(query, queryParams);
      client.release();
      
      // Content-Range header'ı ile yanıt
      const headers = new Headers();
      headers.append('Content-Range', \`\${params.table} \${start}-\${end}/\${totalCount}\`);
      
      return new NextResponse(JSON.stringify(result.rows), {
        headers,
        status: 200
      });
    }
    
    // Tüm kayıtları getir
    else {
      query = \`SELECT * FROM \${params.table}\`;
      result = await client.query(query);
      client.release();
      
      return NextResponse.json(result.rows);
    }
  } catch (error) {
    console.error(\`\${params.table} tablosundan veri alınırken hata:\`, error);
    return NextResponse.json(
      { error: 'Veriler alınamadı' },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}

// POST - Yeni kayıt oluştur
export async function POST(
  request: Request,
  { params }: { params: { table: string } }
) {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const data = await request.json();
    const client = await pool.connect();
    
    // Veri nesnesinden alan ve değer dizileri oluştur
    const fields = Object.keys(data);
    const values = Object.values(data);
    
    // Parametrize edilmiş sorgu oluştur
    const placeholders = fields.map((_, index) => \`$\${index + 1}\`).join(', ');
    const query = \`
      INSERT INTO \${params.table} (\${fields.join(', ')})
      VALUES (\${placeholders})
      RETURNING *
    \`;
    
    const result = await client.query(query, values);
    client.release();
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error(\`\${params.table} tablosuna kayıt eklenirken hata:\`, error);
    return NextResponse.json(
      { error: 'Kayıt oluşturulamadı' },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}

// PUT - Mevcut kaydı güncelle
export async function PUT(
  request: Request,
  { params }: { params: { table: string } }
) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json(
      { error: 'ID parametresi gerekli' },
      { status: 400 }
    );
  }
  
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const data = await request.json();
    const client = await pool.connect();
    
    // Güncellenecek alanları hazırla
    const updates = Object.entries(data)
      .map(([key, _], index) => \`\${key} = $\${index + 1}\`)
      .join(', ');
    
    // id değerini en sona koy
    const values = [...Object.values(data), id];
    
    const query = \`
      UPDATE \${params.table}
      SET \${updates}
      WHERE id = $\${values.length}
      RETURNING *
    \`;
    
    const result = await client.query(query, values);
    client.release();
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Güncellenecek kayıt bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(\`\${params.table} tablosundaki kayıt güncellenirken hata:\`, error);
    return NextResponse.json(
      { error: 'Kayıt güncellenemedi' },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}

// DELETE - Kaydı sil
export async function DELETE(
  request: Request,
  { params }: { params: { table: string } }
) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json(
      { error: 'ID parametresi gerekli' },
      { status: 400 }
    );
  }
  
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();
    
    const query = \`
      DELETE FROM \${params.table}
      WHERE id = $1
      RETURNING *
    \`;
    
    const result = await client.query(query, [id]);
    client.release();
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Silinecek kayıt bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(\`\${params.table} tablosundaki kayıt silinirken hata:\`, error);
    return NextResponse.json(
      { error: 'Kayıt silinemedi' },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}`;

  // API dosyalarını oluştur
  const tablesApiPath = path.join(
    projectRoot,
    "src",
    "app",
    "api",
    "tables",
    "route.ts"
  );
  const allTablesApiPath = path.join(
    projectRoot,
    "src",
    "app",
    "api",
    "all-tables",
    "route.ts"
  );
  const saveTablesApiPath = path.join(
    projectRoot,
    "src",
    "app",
    "api",
    "save-tables",
    "route.ts"
  );
  const createTableApiPath = path.join(
    projectRoot,
    "src",
    "app",
    "api",
    "create-table",
    "route.ts"
  );
  const resourcesApiPath = path.join(
    projectRoot,
    "src",
    "app",
    "api",
    "resources",
    "[table]",
    "route.ts"
  );

  // API dosyalarını yazma
  fs.writeFileSync(tablesApiPath, tablesApiContent);
  console.log(`${colors.green}✓ ${colors.reset}Oluşturuldu: ${tablesApiPath}`);

  fs.writeFileSync(allTablesApiPath, allTablesApiContent);
  console.log(
    `${colors.green}✓ ${colors.reset}Oluşturuldu: ${allTablesApiPath}`
  );

  fs.writeFileSync(saveTablesApiPath, saveTablesApiContent);
  console.log(
    `${colors.green}✓ ${colors.reset}Oluşturuldu: ${saveTablesApiPath}`
  );

  fs.writeFileSync(createTableApiPath, createTableApiContent);
  console.log(
    `${colors.green}✓ ${colors.reset}Oluşturuldu: ${createTableApiPath}`
  );

  fs.writeFileSync(resourcesApiPath, resourcesApiContent);
  console.log(
    `${colors.green}✓ ${colors.reset}Oluşturuldu: ${resourcesApiPath}`
  );
};

// Admin sayfalarını oluştur
const createAdminPages = () => {
  console.log(
    `${colors.yellow}» ${colors.reset}Admin sayfaları oluşturuluyor...`
  );

  // Admin sayfaları için varsayılan içerikler
  const defaultLayoutContent = `import React from "react";
import ClientStyleInjector from "./ClientStyleInjector";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <ClientStyleInjector />
      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  );
}`.trim();

  const defaultPageContent = `"use client";

import { AdminPanel } from "@/styles/adminpanel";

export default function EasyAdminPage() {
  const title = process.env.EASY_ADMIN_TITLE || "Easy Admin Panel";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">{title}</h1>
      <AdminPanel />
    </div>
  );
}`.trim();

  const defaultClientStyleInjectorContent = `"use client";

import { useEffect } from "react";
import { injectStylesheet } from "../../styles/adminpanel";

export default function ClientStyleInjector() {
  useEffect(() => {
    // Stilleri enjekte et
    injectStylesheet();
  }, []);

  // Hiçbir şey render etmeyen bir bileşen
  return null;
}`.trim();

  // Admin sayfalarını oluştur
  const layoutPath = path.join(
    projectRoot,
    "src",
    "app",
    "admin",
    "layout.tsx"
  );
  const pagePath = path.join(projectRoot, "src", "app", "admin", "page.tsx");
  const clientStyleInjectorPath = path.join(
    projectRoot,
    "src",
    "app",
    "admin",
    "ClientStyleInjector.tsx"
  );

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

        // Template dosyaları var ancak biz yine de istenilen custom dosyaları kullanacağız
        templatesFound = true;
        break;
      }
    }
  } catch (error) {
    console.log(
      `${colors.yellow}⚠️ ${colors.reset}Template arama hatası: ${error.message}`
    );
  }

  // Template dosyalarının durumuna bakmaksızın istenilen özel içerikle dosyaları oluşturuyoruz
  console.log(
    `${colors.green}✓ ${colors.reset}Özel admin sayfaları oluşturuluyor...`
  );

  // Layout dosyasını oluştur
  fs.writeFileSync(layoutPath, defaultLayoutContent);
  console.log(
    `${colors.green}✓ ${colors.reset}Layout.tsx oluşturuldu: ${layoutPath}`
  );

  // Page dosyasını oluştur
  fs.writeFileSync(pagePath, defaultPageContent);
  console.log(
    `${colors.green}✓ ${colors.reset}Page.tsx oluşturuldu: ${pagePath}`
  );

  // ClientStyleInjector dosyasını oluştur
  fs.writeFileSync(clientStyleInjectorPath, defaultClientStyleInjectorContent);
  console.log(
    `${colors.green}✓ ${colors.reset}ClientStyleInjector.tsx oluşturuldu: ${clientStyleInjectorPath}`
  );
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
  createApiRoutes(); // API dosyalarını oluştur
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
