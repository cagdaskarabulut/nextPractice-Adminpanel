"use client";

import { AdminPanel } from "@/components/AdminPanel";
import { Database, ServerCog, Layers } from "lucide-react";

export default function EasyAdminPage() {
  const title = process.env.EASY_ADMIN_TITLE || "DigiBoard";

  return (
    <div className="min-h-screen bg-admin-dark-blue-900 text-white">
      {/* Header */}
      <header className="border-b border-admin-dark-blue-700 bg-admin-dark-blue-800">
        <div className="admin-container py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Database size={26} className="text-admin-blue-500" />
              <h1 className="text-2xl font-bold text-white">{title}</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="admin-button-secondary flex items-center gap-2">
                <ServerCog size={18} />
                <span>Sistem Durumu</span>
              </button>
              <button className="admin-button-primary flex items-center gap-2">
                <Layers size={18} />
                <span>Yeni Tablo</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-container py-8">
        <AdminPanel />
      </main>
    </div>
  );
}
