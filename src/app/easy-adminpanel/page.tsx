"use client";

import { AdminPanel } from "@/components/AdminPanel";
import { Database, AlertCircle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function EasyAdminPage() {
  const router = useRouter();
  const title = process.env.EASY_ADMIN_TITLE || "Easy-AdminPanel";
  const [dbStatus, setDbStatus] = useState<
    "connected" | "disconnected" | "checking"
  >("checking");
  const [dbName, setDbName] = useState<string>("Veritabanı");

  // Logo/başlığa tıklandığında çalışacak fonksiyon
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Sayfayı yeniden yükleyerek tüm state'leri sıfırla
    router.refresh();

    // URL'yi değiştirmeden sayfayı yenile (opsiyonel)
    window.location.href = "/easy-adminpanel";
  };

  // Veritabanı durumunu kontrol et
  useEffect(() => {
    const checkDbConnection = async () => {
      try {
        setDbStatus("checking");
        const response = await fetch("/api/db-status");
        if (response.ok) {
          const data = await response.json();
          setDbStatus("connected");
          setDbName(data.dbName || "PostgreSQL Veritabanı");
        } else {
          setDbStatus("disconnected");
        }
      } catch (error) {
        setDbStatus("disconnected");
      }
    };

    checkDbConnection();
  }, []);

  return (
    <div className="min-h-screen bg-admin-dark-blue-900 text-white">
      {/* Header - Sabit (Fixed) */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-admin-dark-blue-700 bg-admin-dark-blue-800">
        <div className="admin-container py-5">
          <div className="flex justify-between items-center">
            <a
              href="/easy-adminpanel"
              onClick={handleLogoClick}
              className="flex items-center gap-3 hover:text-admin-blue-400 transition-colors cursor-pointer"
            >
              <Database size={26} className="text-admin-blue-500" />
              <h1 className="text-2xl font-bold text-white">
                {title || "Easy-AdminPanel"}
              </h1>
            </a>
            <div className="flex items-center gap-4">
              {/* Veritabanı Durumu */}
              <div className="relative group">
                <div className="flex items-center gap-2 px-3 py-2 rounded bg-admin-dark-blue-700 cursor-default">
                  {dbStatus === "connected" ? (
                    <CheckCircle size={18} className="text-green-500" />
                  ) : dbStatus === "disconnected" ? (
                    <AlertCircle size={18} className="text-red-500" />
                  ) : (
                    <div className="w-[18px] h-[18px] rounded-full border-2 border-admin-gray-400 border-t-admin-blue-500 animate-spin" />
                  )}
                  <span className="hidden sm:inline text-sm">
                    {dbStatus === "connected"
                      ? "Bağlı"
                      : dbStatus === "disconnected"
                      ? "Bağlantı Yok"
                      : "Kontrol Ediliyor"}
                  </span>
                </div>
                {/* Tooltip */}
                <div className="absolute right-0 top-full mt-1 w-64 p-3 bg-admin-dark-blue-700 rounded shadow-lg z-50 invisible group-hover:visible transition-all opacity-0 group-hover:opacity-100 text-sm">
                  <p className="font-medium mb-1">{dbName}</p>
                  <p className="text-admin-gray-400">
                    {dbStatus === "connected"
                      ? "Veritabanına bağlantı kuruldu"
                      : dbStatus === "disconnected"
                      ? "Veritabanı bağlantısı kurulamadı"
                      : "Bağlantı kontrol ediliyor..."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Header için boşluk bırak */}
      <div className="pt-[73px]"></div>
      <main className="admin-container py-2">
        <AdminPanel />
      </main>
    </div>
  );
}
