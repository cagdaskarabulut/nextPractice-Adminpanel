"use client";

import React, { useEffect } from "react";

// CSS dosyasını içe aktarmak için bir fonksiyon
export const injectStylesheet = () => {
  // Eğer stil zaten yüklenmişse tekrar yükleme
  if (document.getElementById("easy-adminpanel-styles")) {
    return;
  }

  // CSS kodunu doğrudan burada tanımlıyoruz
  const cssContent = `/* Easy AdminPanel Styles */
  :root {
    --admin-dark-blue-900: #0D1F36;
    --admin-dark-blue-800: #12263F;
    --admin-dark-blue-700: #183054;
    --admin-dark-blue-600: #1D3A6A;
    --admin-dark-blue-500: #2E4780;
    --admin-blue-500: #3378FF;
    --admin-blue-400: #4A8CFF;
    --admin-blue-300: #75AAFF;
    --admin-gray-100: #F7F9FC;
    --admin-gray-200: #EAF0F7;
    --admin-gray-300: #D9E2EC;
    --admin-gray-400: #B3C2D1;
    --admin-gray-500: #8696A7;
  }
  
  /* Temel Konteyner Stilleri */
  .admin-container {
    max-width: 95%;
    margin-left: auto;
    margin-right: auto;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  
  .admin-card {
    background-color: var(--admin-dark-blue-800);
    border-radius: 0.5rem;
    box-shadow: 0 2px 5px 0 rgba(0,0,0,0.05);
    transition: box-shadow 0.2s;
    padding: 1.5rem;
  }
  
  .admin-card:hover {
    box-shadow: 0 5px 15px 0 rgba(0,0,0,0.1);
  }
  
  /* Sidebar Stilleri */
  .admin-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100%;
    width: 16rem;
    background-color: var(--admin-dark-blue-800);
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
  }
  
  .admin-sidebar-link {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    color: var(--admin-gray-400);
    border-radius: 0.375rem;
    transition: all 0.2s;
  }
  
  .admin-sidebar-link:hover {
    color: white;
    background-color: var(--admin-dark-blue-700);
  }
  
  .admin-sidebar-link.active {
    color: white;
    background-color: var(--admin-dark-blue-600);
  }
  
  /* Tipografi Stilleri */
  .admin-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
  }
  
  .admin-subtitle {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--admin-gray-200);
  }
  
  /* Buton Stilleri */
  .admin-button-primary {
    background-color: var(--admin-blue-500);
    color: white;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    transition: background-color 0.2s;
  }
  
  .admin-button-primary:hover {
    background-color: var(--admin-blue-400);
  }
  
  .admin-button-secondary {
    background-color: var(--admin-dark-blue-700);
    color: white;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    transition: background-color 0.2s;
  }
  
  .admin-button-secondary:hover {
    background-color: var(--admin-dark-blue-600);
  }
  
  /* Tablo Stilleri */
  .admin-table {
    width: 100%;
    text-align: left;
  }
  
  .admin-table th {
    padding: 0.75rem 1rem;
    color: var(--admin-gray-400);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    border-bottom: 1px solid var(--admin-dark-blue-700);
  }
  
  .admin-table td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--admin-dark-blue-700);
  }
  
  .admin-table tr:hover {
    background-color: var(--admin-dark-blue-700);
  }
  
  /* Form Stilleri */
  .admin-input {
    background-color: var(--admin-dark-blue-700);
    border: 1px solid var(--admin-dark-blue-600);
    color: white;
    border-radius: 0.375rem;
    padding: 0.5rem 1rem;
  }
  
  .admin-input:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--admin-blue-500);
  }
  
  .admin-search {
    background-color: var(--admin-dark-blue-700);
    border: 1px solid var(--admin-dark-blue-600);
    color: white;
    border-radius: 0.375rem;
    padding: 0.5rem 2.5rem 0.5rem 1rem;
    width: 100%;
  }
  
  .admin-search:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--admin-blue-500);
  }
  
  /* Toggle Stilleri */
  .admin-toggle {
    position: relative;
    display: inline-flex;
    height: 1.5rem;
    width: 2.75rem;
    align-items: center;
    border-radius: 9999px;
    background-color: var(--admin-dark-blue-700);
  }
  
  .admin-toggle-active {
    background-color: var(--admin-blue-500);
  }
  
  .admin-toggle-circle {
    display: inline-block;
    height: 1rem;
    width: 1rem;
    transform: translateX(0.25rem);
    border-radius: 9999px;
    background-color: white;
    transition: transform 0.2s;
  }
  
  .admin-toggle-active .admin-toggle-circle {
    transform: translateX(1.25rem);
  }
  
  /* Scroll Bar Stilleri */
  .easy-adminpanel ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  .easy-adminpanel ::-webkit-scrollbar-track {
    background: var(--admin-dark-blue-800);
  }
  
  .easy-adminpanel ::-webkit-scrollbar-thumb {
    background: var(--admin-dark-blue-500);
    border-radius: 4px;
  }
  
  .easy-adminpanel ::-webkit-scrollbar-thumb:hover {
    background: var(--admin-blue-500);
  }
  
  /* Animasyonlar */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-in-out;
  }
  
  /* AdminPanel Komponent Stilleri */
  .easy-adminpanel {
    min-height: 100vh;
    background-color: var(--admin-dark-blue-900);
    color: white;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  
  .easy-adminpanel-header {
    border-bottom: 1px solid var(--admin-dark-blue-700);
    background-color: var(--admin-dark-blue-800);
    padding: 1.25rem 0;
  }
  
  .easy-adminpanel-card {
    background-color: var(--admin-dark-blue-800);
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .easy-adminpanel-button {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    margin-right: 0.5rem;
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
  
  .easy-adminpanel-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin-bottom: 1rem;
  }
  
  .easy-adminpanel-subtitle {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }
  `;

  const style = document.createElement("style");
  style.id = "easy-adminpanel-styles";
  style.innerHTML = cssContent;
  document.head.appendChild(style);

  // Font eklemek için link elementi
  const fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href =
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
  document.head.appendChild(fontLink);
};

// Ana AdminPanel componenti
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
  useEffect(() => {
    // Component monte edildiğinde stilleri enjekte et
    injectStylesheet();
  }, []);

  return (
    <div className="easy-adminpanel">
      {/* Header */}
      <header className="easy-adminpanel-header">
        <div className="admin-container">
          <div className="flex justify-between items-center">
            <h1 className="easy-adminpanel-title">{title}</h1>

            {/* Veritabanı durumu göstergesi */}
            <div className="px-3 py-2 rounded bg-admin-dark-blue-700">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
              <span>Bağlı</span>
            </div>
          </div>
        </div>
      </header>

      <div className="admin-container py-6">
        {/* İstediğiniz içeriği burada render edin */}
        <div className="easy-adminpanel-card">
          <h2 className="easy-adminpanel-subtitle">Veritabanı Tabloları</h2>
          <p className="text-admin-gray-400 mb-4">
            {databaseType
              ? `${databaseType.toUpperCase()} veritabanınızdaki tablolar yönetilmeye hazır.`
              : "Veritabanınızdaki tablolar yönetilmeye hazır."}
          </p>

          <button className="easy-adminpanel-button easy-adminpanel-button-primary">
            Tabloları Yönet
          </button>
        </div>
      </div>
    </div>
  );
};

// Default export
export default AdminPanel;
