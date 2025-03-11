"use client";

import React, { useEffect, useRef } from "react";

// Admin panel tema renkleri
const THEME = {
  darkBlue900: "#0D1F36",
  darkBlue800: "#12263F",
  darkBlue700: "#183054",
  darkBlue600: "#1D3A6A",
  darkBlue500: "#2E4780",
  blue500: "#3378FF",
  blue400: "#4A8CFF",
  blue300: "#75AAFF",
  gray100: "#F7F9FC",
  gray200: "#EAF0F7",
  gray300: "#D9E2EC",
  gray400: "#B3C2D1",
  gray500: "#8696A7",
};

// Tamamen izole edilmiş stil tanımlaması
const ISOLATED_STYLES = `
  :host, :root {
    --admin-dark-blue-900: ${THEME.darkBlue900};
    --admin-dark-blue-800: ${THEME.darkBlue800};
    --admin-dark-blue-700: ${THEME.darkBlue700};
    --admin-dark-blue-600: ${THEME.darkBlue600};
    --admin-dark-blue-500: ${THEME.darkBlue500};
    --admin-blue-500: ${THEME.blue500};
    --admin-blue-400: ${THEME.blue400};
    --admin-blue-300: ${THEME.blue300};
    --admin-gray-100: ${THEME.gray100};
    --admin-gray-200: ${THEME.gray200};
    --admin-gray-300: ${THEME.gray300};
    --admin-gray-400: ${THEME.gray400};
    --admin-gray-500: ${THEME.gray500};
    
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  .easy-adminpanel {
    min-height: 100vh;
    background-color: var(--admin-dark-blue-900);
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 16px;
    line-height: 1.5;
  }
  
  .admin-container {
    max-width: 1280px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 1rem;
    padding-right: 1rem;
    width: 100%;
  }
  
  .flex {
    display: flex;
  }
  
  .justify-between {
    justify-content: space-between;
  }
  
  .items-center {
    align-items: center;
  }
  
  .easy-adminpanel-header {
    border-bottom: 1px solid var(--admin-dark-blue-700);
    background-color: var(--admin-dark-blue-800);
    padding: 1.25rem 0;
  }
  
  .easy-adminpanel-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin: 0;
  }
  
  .easy-adminpanel-subtitle {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: white;
  }
  
  .easy-adminpanel-card {
    background-color: var(--admin-dark-blue-800);
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 5px 0 rgba(0,0,0,0.05);
  }
  
  .py-6 {
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
  }
  
  .mb-4 {
    margin-bottom: 1rem;
  }
  
  .text-admin-gray-400 {
    color: var(--admin-gray-400);
  }
  
  .easy-adminpanel-button {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    margin-right: 0.5rem;
    border: none;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background-color 0.2s;
  }
  
  .easy-adminpanel-button-primary {
    background-color: var(--admin-blue-500);
    color: white;
  }
  
  .easy-adminpanel-button-primary:hover {
    background-color: var(--admin-blue-400);
  }
  
  .easy-adminpanel-button-secondary {
    background-color: var(--admin-dark-blue-700);
    color: white;
  }
  
  .easy-adminpanel-button-secondary:hover {
    background-color: var(--admin-dark-blue-600);
  }
  
  .db-status {
    display: flex;
    align-items: center;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    background-color: var(--admin-dark-blue-700);
  }
  
  .status-indicator {
    display: inline-block;
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 9999px;
    margin-right: 0.5rem;
  }
  
  .status-connected {
    background-color: #10b981; /* green-500 */
  }
  
  .status-disconnected {
    background-color: #ef4444; /* red-500 */
  }
  
  /* Kaydırma çubuğu stilleri */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: var(--admin-dark-blue-800);
  }
  
  ::-webkit-scrollbar-thumb {
    background: var(--admin-dark-blue-500);
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: var(--admin-blue-500);
  }
  
  /* Tablo stilleri */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
  }
  
  th {
    text-align: left;
    padding: 0.75rem 1rem;
    font-weight: 600;
    border-bottom: 1px solid var(--admin-dark-blue-700);
    color: var(--admin-gray-400);
  }
  
  td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--admin-dark-blue-700);
  }
  
  tr:hover {
    background-color: var(--admin-dark-blue-700);
  }
`;

// Ana AdminPanel component'i tanımı
interface AdminPanelProps {
  /**
   * Bağlantı dizesi
   */
  connectionString?: string;

  /**
   * Veritabanı türü (otomatik tespit edilemezse)
   */
  databaseType?: "postgresql" | "mysql" | "mssql";

  /**
   * Panel başlığı
   */
  title?: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  connectionString,
  databaseType,
  title = "Easy-AdminPanel",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Component tamamen monte olduktan sonra shadow DOM oluştur
    if (containerRef.current) {
      // Shadow DOM oluştur
      const shadowRoot = containerRef.current.attachShadow({ mode: "open" });

      // İzole stilleri ekle
      const styleElement = document.createElement("style");
      styleElement.textContent = ISOLATED_STYLES;
      shadowRoot.appendChild(styleElement);

      // İçeriği oluştur
      const content = document.createElement("div");
      content.className = "easy-adminpanel";
      content.innerHTML = `
        <header class="easy-adminpanel-header">
          <div class="admin-container">
            <div class="flex justify-between items-center">
              <h1 class="easy-adminpanel-title">${title}</h1>
              
              <div class="db-status">
                <span class="status-indicator status-connected"></span>
                <span>Bağlı</span>
              </div>
            </div>
          </div>
        </header>
        
        <div class="admin-container py-6">
          <div class="easy-adminpanel-card">
            <h2 class="easy-adminpanel-subtitle">Veritabanı Tabloları</h2>
            <p class="text-admin-gray-400 mb-4">
              ${
                databaseType
                  ? `${databaseType.toUpperCase()} veritabanınızdaki tablolar yönetilmeye hazır.`
                  : "Veritabanınızdaki tablolar yönetilmeye hazır."
              }
            </p>
            
            <button class="easy-adminpanel-button easy-adminpanel-button-primary">
              Tabloları Yönet
            </button>
          </div>
        </div>
      `;

      shadowRoot.appendChild(content);

      // Event listener'ları ekleyebiliriz
      const manageButton = content.querySelector(
        ".easy-adminpanel-button-primary"
      );
      if (manageButton) {
        manageButton.addEventListener("click", () => {
          console.log("Tabloları yönet butonuna tıklandı");
          // Burada tablo yönetim işlevselliğini tetikleyebiliriz
        });
      }
    }
  }, [title, databaseType]); // title veya databaseType değişirse, yeniden render

  // Sadece bir referans div döndür, içerik shadow DOM'da oluşturulacak
  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

// Default export
export default AdminPanel;
