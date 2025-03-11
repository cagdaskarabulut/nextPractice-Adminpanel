"use client";

import React, { useEffect } from "react";

// CSS dosyasını içe aktarmak için bir fonksiyon
const injectStylesheet = () => {
  // Eğer stil zaten yüklenmişse tekrar yükleme
  if (document.getElementById("easy-adminpanel-styles")) {
    return;
  }

  // CSS dosyasının içeriğini package içerisindeki admin.css'den alıyoruz
  const cssContent = `/* Easy AdminPanel Styles */
@import url('/node_modules/easy-adminpanel/src/styles/admin.css');`;

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
