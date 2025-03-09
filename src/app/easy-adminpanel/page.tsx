"use client";

import { AdminPanel } from "@/components/AdminPanel";
import {
  Database,
  Layers,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function EasyAdminPage() {
  const router = useRouter();
  const title = process.env.EASY_ADMIN_TITLE || "Easy-AdminPanel";
  const [isNewTableModalOpen, setIsNewTableModalOpen] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [columns, setColumns] = useState([
    { name: "id", type: "serial primary key" },
    { name: "", type: "text" },
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
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

  // Kolon ekle
  const addColumn = () => {
    setColumns([...columns, { name: "", type: "text" }]);
  };

  // Kolon sil
  const removeColumn = (index: number) => {
    if (index === 0) return; // id kolonunu silmeyi engelle
    const newColumns = [...columns];
    newColumns.splice(index, 1);
    setColumns(newColumns);
  };

  // Kolon adını güncelle
  const updateColumnName = (index: number, value: string) => {
    const newColumns = [...columns];
    newColumns[index].name = value;
    setColumns(newColumns);
  };

  // Kolon tipini güncelle
  const updateColumnType = (index: number, value: string) => {
    const newColumns = [...columns];
    newColumns[index].type = value;
    setColumns(newColumns);
  };

  // Yeni tablo oluştur
  const createTable = async () => {
    // Validasyon
    if (!newTableName.trim()) {
      setError("Tablo adı boş olamaz");
      return;
    }

    if (columns.some((column) => !column.name.trim())) {
      setError("Kolon adları boş olamaz");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const response = await fetch("/api/create-table", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tableName: newTableName,
          columns,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Tablo oluşturulurken bir hata oluştu");
      }

      // Başarılı
      setIsNewTableModalOpen(false);
      setNewTableName("");
      setColumns([
        { name: "id", type: "serial primary key" },
        { name: "", type: "text" },
      ]);

      // Sayfayı yenile
      window.location.href = "/easy-adminpanel";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

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
              <button
                className="admin-button-primary flex items-center gap-2"
                onClick={() => setIsNewTableModalOpen(true)}
              >
                <Layers size={18} />
                <span>Yeni Tablo</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Header için boşluk bırak */}
      <div className="pt-[73px]"></div>
      <main className="admin-container py-8">
        <AdminPanel />
      </main>

      {/* Yeni Tablo Oluşturma Modal */}
      {isNewTableModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="admin-card max-w-3xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="admin-subtitle">Yeni Tablo Oluştur</h2>
              <button
                onClick={() => setIsNewTableModalOpen(false)}
                className="text-admin-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createTable();
              }}
            >
              {error && (
                <div className="bg-red-900/30 border border-red-500 text-red-300 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-admin-gray-300 mb-2">
                  Tablo Adı
                </label>
                <input
                  type="text"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="w-full bg-admin-dark-blue-900 border border-admin-dark-blue-700 rounded-md px-3 py-2 text-white focus:border-admin-blue-500 focus:outline-none"
                  placeholder="tablo_adi (küçük harfler ve alt çizgi kullanın)"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-admin-gray-300 mb-2">
                  Kolonlar
                </label>
                <div className="space-y-3">
                  {columns.map((column, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        value={column.name}
                        onChange={(e) =>
                          updateColumnName(index, e.target.value)
                        }
                        className="w-full bg-admin-dark-blue-900 border border-admin-dark-blue-700 rounded-md px-3 py-2 text-white focus:border-admin-blue-500 focus:outline-none"
                        placeholder="Kolon adı"
                        disabled={index === 0} // id kolonunu düzenlemeyi engelle
                        required
                      />
                      <select
                        value={column.type}
                        onChange={(e) =>
                          updateColumnType(index, e.target.value)
                        }
                        className="w-full bg-admin-dark-blue-900 border border-admin-dark-blue-700 rounded-md px-3 py-2 text-white focus:border-admin-blue-500 focus:outline-none"
                        disabled={index === 0} // id kolonunu düzenlemeyi engelle
                      >
                        {index === 0 ? (
                          <option value="serial primary key">
                            serial primary key
                          </option>
                        ) : (
                          <>
                            <option value="text">text</option>
                            <option value="integer">integer</option>
                            <option value="bigint">bigint</option>
                            <option value="decimal">decimal</option>
                            <option value="boolean">boolean</option>
                            <option value="date">date</option>
                            <option value="timestamp">timestamp</option>
                            <option value="json">json</option>
                            <option value="uuid">uuid</option>
                          </>
                        )}
                      </select>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeColumn(index)}
                          className="bg-red-500/30 hover:bg-red-500/50 text-white px-3 py-1 rounded-md transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addColumn}
                  className="mt-3 text-admin-blue-500 hover:text-admin-blue-400 flex items-center gap-1 text-sm"
                >
                  <Plus size={14} />
                  <span>Kolon Ekle</span>
                </button>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsNewTableModalOpen(false)}
                  className="admin-button-secondary"
                  disabled={isCreating}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="admin-button-primary flex items-center gap-2"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></span>
                      <span>Oluşturuluyor...</span>
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      <span>Tablo Oluştur</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
