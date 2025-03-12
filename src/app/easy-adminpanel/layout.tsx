"use client";

import React from "react";
import {
  Database,
  Menu,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const title = process.env.EASY_ADMIN_TITLE || "Easy-AdminPanel";
  const [dbStatus, setDbStatus] = useState<
    "connected" | "disconnected" | "checking"
  >("checking");
  const [dbName, setDbName] = useState<string>("Veritabanı");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Ekran boyutuna göre sidebar durumunu ayarla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsSidebarOpen(!mobile); // Mobil değilse aç, mobilse kapat
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-admin-dark-blue-900 text-white">
      {/* Header - Sabit (Fixed) */}
      <header className="easy-adminpanel-header fixed top-0 left-0 right-0 z-50 border-b border-admin-dark-blue-700 bg-admin-dark-blue-800">
        <div className="admin-container py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="mr-4 p-2 rounded hover:bg-admin-dark-blue-700 transition-colors duration-200"
                aria-label="Toggle sidebar"
                title="Toggle sidebar"
              >
                <Menu size={22} />
              </button>
              <a
                href="/easy-adminpanel"
                className="flex items-center gap-3 hover:text-admin-blue-400 transition-colors cursor-pointer"
              >
                <Database size={26} className="text-admin-blue-500" />
                <h1 className="text-2xl font-bold text-white">{title}</h1>
              </a>
            </div>
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

      {/* Sol Kenar Çubuğu */}
      <div
        className={`easy-adminpanel-sidebar fixed top-0 left-0 h-screen w-64 bg-admin-dark-blue-800 pt-[4.5rem] overflow-y-auto z-40 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Kenar çubuğu içeriği AdminPanel bileşeni tarafından yönetilir */}
      </div>

      {/* Ana İçerik Alanı */}
      <div
        className={`easy-adminpanel-main transition-all duration-300 pt-[4.5rem] ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
