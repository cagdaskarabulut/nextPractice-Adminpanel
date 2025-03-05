import { NextConfig } from 'next';

export interface EasyAdminPanelOptions {
  route?: string;
  envVar?: string;
  title?: string;
}

// Next.js uygulamasında kullanılacak setup fonksiyonu
export function setupEasyAdminPanel(
  nextConfig: NextConfig = {},
  options: EasyAdminPanelOptions = {}
): NextConfig {
  const route = options.route || '/easy-adminpanel';
  const envVar = options.envVar || 'POSTGRES_URL';
  const title = options.title || 'Easy Admin Panel';

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