"use client";

import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Filter,
  Plus,
  Check,
  X,
  Database,
  Menu,
  Settings,
  TableProperties,
  LayoutGrid,
  Layers,
} from "lucide-react";
import { Table, AvailableTable, TableRecord, TableColumn } from "./types";
import TableList from "./TableList";
import RecordList from "./RecordList";
import AddRecordForm from "./AddRecordForm";
import EditRecordForm from "./EditRecordForm";
import LoadingSpinner from "./ui/LoadingSpinner";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getInputTypeForColumnType } from "./utils/FormFieldUtils";

export function AdminPanel() {
  const [tables, setTables] = useState<Table[]>([]);
  const [availableTables, setAvailableTables] = useState<AvailableTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Ekran boyutuna göre sidebar durumunu ayarla
  useEffect(() => {
    // Büyük ekranlarda (md breakpoint üzeri) menüyü açık tut
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile); // Mobil değilse aç, mobilse kapat
    };

    // Sayfa yüklendiğinde ve ekran boyutu değiştiğinde çalıştır
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Sayfa yüklendiğinde ve pathname değiştiğinde çalışır
  useEffect(() => {
    // URL tam olarak /easy-adminpanel ise, tablo seçimini sıfırla
    if (pathname === "/easy-adminpanel") {
      setSelectedTable(null);
      setShowRecordList(false);
      setShowAddForm(false);
      setShowEditForm(false);
    }
  }, [pathname]);

  // Tablo verilerini ve formları yönetmek için state'ler
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableRecords, setTableRecords] = useState<TableRecord[]>([]);
  const [showRecordList, setShowRecordList] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [tableColumns, setTableColumns] = useState<TableColumn[]>([]);
  const [newRecord, setNewRecord] = useState<Record<string, any>>({});
  const [editRecord, setEditRecord] = useState<TableRecord | null>(null);
  const [recordLoading, setRecordLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | number | null>(
    null
  );
  const [isNewTableModalOpen, setIsNewTableModalOpen] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [columns, setColumns] = useState<{ name: string; type: string }[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // API endpoint'i - Doğru API rotalarına güncellendi
  // const apiUrl = "/api/admin";

  // Tüm tabloları yükle
  useEffect(() => {
    async function fetchTables() {
      try {
        const response = await fetch(`/api/tables`);
        if (!response.ok) {
          throw new Error("Tablolar yüklenirken bir hata oluştu");
        }

        const data = await response.json();
        setTables(data);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu"
        );
        setLoading(false);
      }
    }

    fetchTables();
  }, []);

  // Kullanılabilir tüm tabloları getir
  const fetchAllTables = async () => {
    try {
      // Tüm tabloları getir
      const response = await fetch(`/api/all-tables`);
      if (!response.ok) {
        throw new Error("Tablolar yüklenirken bir hata oluştu");
      }

      const allTableNames = await response.json();

      // Seçili tabloları kontrol et
      const selectedTableNames = tables.map((t) => t.name);

      // Tabloları birleştir
      const mappedTables = allTableNames.map((name: string) => ({
        table_name: name,
        selected: selectedTableNames.includes(name),
      }));

      setAvailableTables(mappedTables);
      setIsDialogOpen(true);
    } catch (err) {
      alert(
        "Tablolar yüklenirken bir hata oluştu: " +
          (err instanceof Error ? err.message : "Bilinmeyen hata")
      );
    }
  };

  // Tablo seçimini değiştir
  const handleTableSelection = (tableName: string, isSelected: boolean) => {
    setAvailableTables((prev) =>
      prev.map((t) =>
        t.table_name === tableName ? { ...t, selected: isSelected } : t
      )
    );
  };

  // Tüm tabloları seç
  const handleSelectAll = () => {
    setAvailableTables((prev) => prev.map((t) => ({ ...t, selected: true })));
  };

  // Tüm seçimleri kaldır
  const handleDeselectAll = () => {
    setAvailableTables((prev) => prev.map((t) => ({ ...t, selected: false })));
  };

  // Seçimleri kaydet
  const saveTableSelection = async () => {
    try {
      const selectedTables = availableTables
        .filter((t) => t.selected)
        .map((t) => t.table_name);

      const response = await fetch(`/api/save-tables`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tables: selectedTables }),
      });

      if (!response.ok) {
        throw new Error("Tablo seçimleri kaydedilirken bir hata oluştu");
      }

      setIsDialogOpen(false);

      // Sayfayı yenilemek yerine tabloları tekrar yükle
      setLoading(true);
      try {
        const tablesResponse = await fetch(`/api/tables`);
        if (tablesResponse.ok) {
          const data = await tablesResponse.json();
          setTables(data);
        }
      } catch (err) {
        console.error("Tablolar yüklenemedi:", err);
      }
      setLoading(false);
    } catch (err) {
      alert(
        "Seçimler kaydedilirken bir hata oluştu: " +
          (err instanceof Error ? err.message : "Bilinmeyen hata")
      );
    }
  };

  // Tablo kayıtlarını listele
  const handleListTable = async (tableName: string) => {
    setSelectedTable(tableName);
    setShowRecordList(true);
    setShowAddForm(false);
    setShowEditForm(false);
    setRecordLoading(true);

    try {
      // Önce tablo sütunlarını al
      const schemaResponse = await fetch(
        `/api/resources/${tableName}?_schema=true`
      );
      if (schemaResponse.ok) {
        const schema = await schemaResponse.json();
        setTableColumns(schema);
      }

      // Sonra kayıtları al
      const response = await fetch(`/api/resources/${tableName}`);
      if (!response.ok) {
        throw new Error("Kayıtlar alınırken bir hata oluştu");
      }

      const data = await response.json();
      setTableRecords(data);
      setRecordLoading(false);
    } catch (err) {
      alert(
        "Kayıtlar alınırken bir hata oluştu: " +
          (err instanceof Error ? err.message : "Bilinmeyen hata")
      );
      setRecordLoading(false);
    }
  };

  // Tablo kolonlarını getir
  const getTableColumns = (tableName: string) => {
    setTableColumns([]);

    fetch(`/api/resources/${tableName}?_schema=true`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Tablo şeması alınamadı");
        }
        return response.json();
      })
      .then((columns) => {
        setTableColumns(columns);
      })
      .catch((error) => {
        console.error("Tablo şeması alınamadı:", error);
      });
  };

  // Yeni kayıt formunu aç
  const handleAddRecord = (tableName: string) => {
    setSelectedTable(tableName);
    setShowAddForm(true);
    setShowRecordList(false);
    setShowEditForm(false);
    setRecordLoading(true);

    // Tablo sütunlarını al
    getTableColumns(tableName);
  };

  // Kaydı düzenleme formunu aç
  const handleEditRecord = async (id: string | number) => {
    if (!selectedTable) return;

    setShowRecordList(false);
    setShowAddForm(false);
    setShowEditForm(true);
    setRecordLoading(true);

    try {
      // Kaydı getir
      const response = await fetch(`/api/resources/${selectedTable}?id=${id}`);
      if (!response.ok) {
        throw new Error("Kayıt alınırken bir hata oluştu");
      }

      const record = await response.json();
      setEditRecord(record);
      setRecordLoading(false);
    } catch (err) {
      alert(
        "Kayıt alınırken bir hata oluştu: " +
          (err instanceof Error ? err.message : "Bilinmeyen hata")
      );
      setRecordLoading(false);
      setShowRecordList(true);
      setShowEditForm(false);
    }
  };

  // Kaydı silme onay diyaloğunu göster
  const handleDeleteConfirm = (id: string | number) => {
    setRecordToDelete(id);
    setDeleteConfirmOpen(true);
  };

  // Kaydı sil
  const handleDeleteRecord = async () => {
    if (!selectedTable || !recordToDelete) return;

    try {
      const response = await fetch(
        `/api/resources/${selectedTable}?id=${recordToDelete}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Kayıt silinirken bir hata oluştu");
      }

      // Silme başarılı, tabloyu güncelle
      setDeleteConfirmOpen(false);
      setRecordToDelete(null);

      // Tabloyu yeniden yükle
      handleListTable(selectedTable);

      alert("Kayıt başarıyla silindi");
    } catch (err) {
      alert(
        "Kayıt silinirken bir hata oluştu: " +
          (err instanceof Error ? err.message : "Bilinmeyen hata")
      );
    }
  };

  // Form alanı değişikliğini işle (yeni kayıt için)
  const handleInputChange = (
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      | {
          target: {
            name: string;
            value: any;
            checked?: boolean;
            type?: string;
          };
        }
  ) => {
    const target = e.target;
    const name = target.name;
    const value =
      "type" in target && target.type === "checkbox" && "checked" in target
        ? target.checked
        : target.value;

    setNewRecord((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Form alanı değişikliğini işle (düzenleme için)
  const handleEditInputChange = (
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      | {
          target: {
            name: string;
            value: any;
            checked?: boolean;
            type?: string;
          };
        }
  ) => {
    const target = e.target;
    const name = target.name;
    const value =
      "type" in target && target.type === "checkbox" && "checked" in target
        ? target.checked
        : target.value;

    setEditRecord((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  // Yeni kayıt ekle
  const handleSubmitRecord = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTable) return;

    try {
      const response = await fetch(`/api/resources/${selectedTable}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRecord),
      });

      if (!response.ok) {
        throw new Error("Kayıt eklenirken bir hata oluştu");
      }

      alert("Kayıt başarıyla eklendi!");

      // Formu temizle
      const initialValues: Record<string, string> = {};
      tableColumns.forEach((column: TableColumn) => {
        if (column.name !== "id") {
          initialValues[column.name] = "";
        }
      });

      setNewRecord(initialValues);

      // İsteğe bağlı olarak kayıt listesine dön
      handleListTable(selectedTable);
    } catch (err) {
      alert(
        "Kayıt eklenirken bir hata oluştu: " +
          (err instanceof Error ? err.message : "Bilinmeyen hata")
      );
    }
  };

  // Kayıt güncelle
  const handleUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTable || !editRecord) return;

    try {
      const response = await fetch(`/api/resources/${selectedTable}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editRecord),
      });

      if (!response.ok) {
        throw new Error("Kayıt güncellenirken bir hata oluştu");
      }

      alert("Kayıt başarıyla güncellendi!");

      // Kayıt listesine dön
      handleListTable(selectedTable);
    } catch (err) {
      alert(
        "Kayıt güncellenirken bir hata oluştu: " +
          (err instanceof Error ? err.message : "Bilinmeyen hata")
      );
    }
  };

  // Kart görünümüne dönüş
  const handleBackToTables = () => {
    setSelectedTable(null);
    setShowRecordList(false);
    setShowAddForm(false);
    setShowEditForm(false);
    // Menüyü kapat - buradaki atama varsayılan olarak masaüstünde de menünün kapalı başlamasını sağlayacak
    setIsSidebarOpen(false);
  };

  // Sol menüden "Tabloları Yönet" butonuna tıklandığında çalışacak fonksiyon
  const handleManageTablesFromSidebar = () => {
    // Önce mevcut seçili tabloyu ve form durumlarını temizle
    setSelectedTable(null);
    setShowRecordList(false);
    setShowAddForm(false);
    setShowEditForm(false);

    // Sonra tabloları yönet dialogunu aç
    fetchAllTables();
  };

  // Hamburger menü ikonuna tıklandığında çalışacak fonksiyon
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Yeni kolon ekle
  const addColumn = () => {
    setColumns([...columns, { name: "", type: "" }]);
  };

  // Kolon değiştir
  const handleColumnChange = (index: number, field: string, value: string) => {
    setColumns((prevColumns) =>
      prevColumns.map((column, i) =>
        i === index ? { ...column, [field]: value } : column
      )
    );
  };

  // Kolon sil
  const removeColumn = (index: number) => {
    setColumns((prevColumns) => prevColumns.filter((_, i) => i !== index));
  };

  // Tablo oluştur
  const createTable = async () => {
    if (!newTableName || columns.length === 0) {
      setError("Tablo adı ve kolonları gereklidir");
      return;
    }

    try {
      setIsCreating(true);
      const response = await fetch(`/api/tables`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newTableName,
          columns: columns.map((column) => ({
            name: column.name,
            type: column.type,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Tablo oluşturulurken bir hata oluştu");
      }

      alert("Tablo başarıyla oluşturuldu!");

      // Tabloyu yükle
      handleListTable(newTableName);

      // Formu temizle
      setNewTableName("");
      setColumns([]);
    } catch (err) {
      alert(
        "Tablo oluşturulurken bir hata oluştu: " +
          (err instanceof Error ? err.message : "Bilinmeyen hata")
      );
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-300 rounded-md text-red-600">
        <h3 className="text-lg font-medium">Hata</h3>
        <p>{error}</p>
      </div>
    );
  }

  // Return JSX
  return (
    <div className="space-y-6">
      {!selectedTable && !showAddForm && !showEditForm ? (
        <div
          className={`transition-all duration-300 ${
            isSidebarOpen ? "pl-64" : "pl-0"
          }`}
        >
          {/* Ok Şeklinde Menü Açma/Kapama Butonu */}
          <button
            onClick={toggleSidebar}
            className={`fixed z-40 top-[85px] left-0 h-[40px] w-[20px] bg-admin-blue-500 hover:bg-admin-blue-400 text-white rounded-r-md shadow-md flex items-center justify-center transition-all ${
              isSidebarOpen ? "left-64" : "left-0"
            }`}
            aria-label={isSidebarOpen ? "Menüyü Kapat" : "Menüyü Aç"}
          >
            {isSidebarOpen ? (
              <ChevronLeft size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>

          {/* Karanlık Overlay - Menü açıkken sadece mobil görünümde */}
          {isSidebarOpen && isMobile && (
            <div
              className="fixed inset-0 bg-black/50 z-20 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Sol Menü - Tablo Listesi (Ana Sayfa) */}
          <div
            className={`w-64 bg-admin-dark-blue-800 p-4 h-screen fixed top-0 left-0 bottom-0 pt-[83px] overflow-y-auto z-10 transition-transform duration-300 ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            {/* Kart Görünümü Butonu - En Üstte */}
            <button
              onClick={handleBackToTables}
              className="w-full mb-4 text-left px-3 py-2 rounded text-sm transition-colors flex items-center gap-1.5 text-admin-blue-500 hover:bg-admin-dark-blue-700"
            >
              <LayoutGrid size={18} className="text-admin-blue-500" />
              <span className="font-medium">Kart Görünümü</span>
            </button>

            {/* Tabloları Yönet Butonu */}
            <button
              onClick={handleManageTablesFromSidebar}
              className="w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 text-admin-blue-500 hover:bg-admin-dark-blue-700 mb-4"
            >
              <TableProperties size={18} className="text-admin-blue-500" />
              <span className="font-medium">Tabloları Yönet</span>
            </button>

            <h3 className="text-sm uppercase text-admin-gray-400 font-bold mb-4 pl-2 mt-4">
              Tablolar
            </h3>
            <div className="space-y-1">
              {tables.map((table) => (
                <button
                  key={table.name}
                  onClick={() => handleListTable(table.name)}
                  className="w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center text-admin-gray-300 hover:bg-admin-dark-blue-700"
                >
                  <Database size={16} className="mr-2" />
                  {table.displayName}
                </button>
              ))}
            </div>
          </div>

          {/* Tablo Yönetimi */}
          <div className="flex justify-between items-center mb-6 pl-8">
            <h2 className="admin-title">Veritabanı Tabloları</h2>
            <button
              onClick={fetchAllTables}
              className="admin-button-primary flex items-center gap-2"
            >
              <TableProperties size={18} />
              <span>Tabloları Yönet</span>
            </button>
          </div>

          {/* Tablo Seçim Diyaloğu */}
          {isDialogOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="admin-card max-w-2xl w-full">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="admin-subtitle">Tabloları Seçin</h2>
                  <button
                    onClick={() => setIsDialogOpen(false)}
                    className="text-admin-gray-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Yeni Tablo Butonu */}
                <button
                  onClick={() => {
                    setIsDialogOpen(false);
                    setIsNewTableModalOpen(true);
                  }}
                  className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 bg-admin-blue-500 text-white rounded-md hover:bg-admin-blue-400 transition-colors"
                >
                  <Layers size={18} />
                  <span className="font-medium">Yeni Tablo Oluştur</span>
                </button>

                {/* Toplu Seçim Butonları */}
                <div className="flex gap-3 mb-6 border-b border-admin-dark-blue-700 pb-4">
                  <button
                    onClick={handleSelectAll}
                    className="admin-button-secondary text-sm flex items-center gap-1 px-3 py-1.5"
                  >
                    <Check size={16} />
                    <span>Tümünü Seç</span>
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="admin-button-secondary text-sm flex items-center gap-1 px-3 py-1.5"
                  >
                    <X size={16} />
                    <span>Tüm Seçimleri Kaldır</span>
                  </button>
                </div>

                {/* Tablo Listesi */}
                <div className="max-h-80 overflow-y-auto mb-6">
                  <div className="space-y-3">
                    {availableTables.map((table) => (
                      <div
                        key={table.table_name}
                        className="flex items-center space-x-3"
                      >
                        <label className="flex items-center cursor-pointer w-full">
                          <input
                            type="checkbox"
                            checked={table.selected}
                            onChange={(e) =>
                              handleTableSelection(
                                table.table_name,
                                e.target.checked
                              )
                            }
                            className="form-checkbox h-5 w-5 text-admin-blue-500 rounded border-admin-gray-400 bg-admin-dark-blue-900"
                          />
                          <span className="ml-2 text-white">
                            {table.table_name}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsDialogOpen(false)}
                    className="admin-button-secondary"
                  >
                    İptal
                  </button>
                  <button
                    onClick={saveTableSelection}
                    className="admin-button-primary flex items-center gap-2"
                  >
                    <Check size={18} />
                    <span>Seçimleri Kaydet</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="p-8 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="admin-card">
              <p className="text-red-500">{error}</p>
            </div>
          ) : tables.length === 0 ? (
            <div className="admin-card flex flex-col items-center p-12 text-center mx-8">
              <Database size={48} className="text-admin-gray-600 mb-4" />
              <h3 className="admin-subtitle mb-2">Henüz Tablo Bulunmuyor</h3>
              <p className="text-admin-gray-400 mb-6">
                Veritabanı yönetimi için tablolar eklemelisiniz
              </p>
              <button
                onClick={fetchAllTables}
                className="admin-button-primary flex items-center gap-2"
              >
                <TableProperties size={18} />
                <span>Tabloları Yönet</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-8">
              {tables.map((table) => (
                <div key={table.name} className="admin-card">
                  <h3 className="admin-subtitle mb-1">{table.displayName}</h3>
                  <p className="text-admin-gray-400 text-sm mb-4">
                    {table.name}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleListTable(table.name)}
                      className="admin-button-primary flex items-center gap-1 text-sm flex-1"
                    >
                      <Filter size={16} />
                      <span>Listele</span>
                    </button>
                    <button
                      onClick={() => handleAddRecord(table.name)}
                      className="admin-button-secondary flex items-center gap-1 text-sm"
                    >
                      <Plus size={16} />
                      <span>Ekle</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex">
          {/* Ok Şeklinde Menü Açma/Kapama Butonu */}
          <button
            onClick={toggleSidebar}
            className={`fixed z-40 top-[85px] left-0 h-[40px] w-[20px] bg-admin-blue-500 hover:bg-admin-blue-400 text-white rounded-r-md shadow-md flex items-center justify-center transition-all ${
              isSidebarOpen ? "left-64" : "left-0"
            }`}
            aria-label={isSidebarOpen ? "Menüyü Kapat" : "Menüyü Aç"}
          >
            {isSidebarOpen ? (
              <ChevronLeft size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>

          {/* Karanlık Overlay - Menü açıkken sadece mobil görünümde */}
          {isSidebarOpen && isMobile && (
            <div
              className="fixed inset-0 bg-black/50 z-20 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Sol Menü - Tablo Listesi */}
          <div
            className={`w-64 bg-admin-dark-blue-800 p-4 h-screen fixed top-0 left-0 bottom-0 pt-[83px] overflow-y-auto z-10 transition-transform duration-300 ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            {/* Kart Görünümü Butonu - En Üstte */}
            <button
              onClick={handleBackToTables}
              className="w-full mb-4 text-left px-3 py-2 rounded text-sm transition-colors flex items-center gap-1.5 text-admin-blue-500 hover:bg-admin-dark-blue-700"
            >
              <LayoutGrid size={18} className="text-admin-blue-500" />
              <span className="font-medium">Kart Görünümü</span>
            </button>

            {/* Tabloları Yönet Butonu */}
            <button
              onClick={handleManageTablesFromSidebar}
              className="w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 text-admin-blue-500 hover:bg-admin-dark-blue-700 mb-4"
            >
              <TableProperties size={18} className="text-admin-blue-500" />
              <span className="font-medium">Tabloları Yönet</span>
            </button>

            <h3 className="text-sm uppercase text-admin-gray-400 font-bold mb-4 pl-2 mt-4">
              Tablolar
            </h3>
            <div className="space-y-1">
              {tables.map((table) => (
                <button
                  key={table.name}
                  onClick={() => handleListTable(table.name)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center ${
                    selectedTable === table.name
                      ? "bg-admin-blue-500 text-white"
                      : "text-admin-gray-300 hover:bg-admin-dark-blue-700"
                  }`}
                >
                  <Database size={16} className="mr-2" />
                  {table.displayName}
                </button>
              ))}
            </div>
          </div>

          {/* Ana İçerik - Her Ekranda Menü Durumuna Göre Adapte Olur */}
          <div
            className={`flex-1 transition-all duration-300 ${
              isSidebarOpen ? "pl-32" : "pl-0"
            }`}
          >
            <div className="p-4 md:p-6 pl-16">
              {showRecordList && (
                <div>
                  {/* Tablo Başlığı ve Yeni Kayıt Butonu */}
                  <div className="overflow-x-auto mb-6">
                    <div
                      className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-full pr-2 transition-all duration-300 ${
                        isSidebarOpen ? "pl-2" : "pl-8"
                      }`}
                    >
                      <h2 className="admin-title truncate">
                        {
                          tables.find((t) => t.name === selectedTable)
                            ?.displayName
                        }
                      </h2>
                    </div>
                  </div>

                  {recordLoading ? (
                    <div className="p-8 flex justify-center">
                      <LoadingSpinner />
                    </div>
                  ) : (
                    <div
                      className={`admin-card overflow-hidden transition-all duration-300 ${
                        isSidebarOpen ? "mx-2" : "ml-8"
                      }`}
                    >
                      <div className="overflow-x-auto">
                        <button
                          onClick={() => handleAddRecord(selectedTable!)}
                          className="admin-button-primary flex-shrink-0 flex items-center gap-2 whitespace-nowrap"
                        >
                          <Plus size={18} />
                          <span>Yeni Kayıt</span>
                        </button>
                        <table className="admin-table w-full min-w-[800px] table-auto mt-5">
                          <colgroup>
                            {tableColumns.map((column) => (
                              <col
                                key={column.name}
                                className={
                                  column.name === "id" ? "w-[80px]" : ""
                                }
                              />
                            ))}
                            <col className="w-[100px]" />
                          </colgroup>
                          <thead>
                            <tr>
                              {tableColumns.map((column) => (
                                <th
                                  key={column.name}
                                  className="whitespace-nowrap p-3 text-left"
                                >
                                  {column.name}
                                </th>
                              ))}
                              <th className="text-right w-24 p-3">İşlemler</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tableRecords.map((record, index) => (
                              <tr key={index}>
                                {tableColumns.map((column) => (
                                  <td
                                    key={column.name}
                                    className="whitespace-nowrap p-3 max-w-[300px] overflow-hidden text-ellipsis"
                                  >
                                    {record[column.name]?.toString() || "-"}
                                  </td>
                                ))}
                                <td className="text-right whitespace-nowrap p-3">
                                  <button
                                    onClick={() => handleEditRecord(record.id)}
                                    className="text-admin-blue-500 hover:text-admin-blue-400 mr-3"
                                    title="Düzenle"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteConfirm(record.id)
                                    }
                                    className="text-red-500 hover:text-red-400"
                                    title="Sil"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {deleteConfirmOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                      <div className="admin-card max-w-md w-full">
                        <h3 className="admin-subtitle mb-4">Kaydı Sil</h3>
                        <p className="text-admin-gray-300 mb-6">
                          Bu kaydı silmek istediğinize emin misiniz? Bu işlem
                          geri alınamaz.
                        </p>
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setDeleteConfirmOpen(false)}
                            className="admin-button-secondary"
                          >
                            İptal
                          </button>
                          <button
                            onClick={handleDeleteRecord}
                            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded flex items-center gap-2"
                          >
                            <Trash2 size={16} />
                            <span>Sil</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {showAddForm && (
                <AddRecordForm
                  tables={tables}
                  selectedTable={selectedTable || ""}
                  tableColumns={tableColumns}
                  newRecord={newRecord}
                  recordLoading={recordLoading}
                  onBackToTables={handleBackToTables}
                  onInputChange={handleInputChange}
                  onSubmitRecord={handleSubmitRecord}
                />
              )}

              {showEditForm && (
                <EditRecordForm
                  tables={tables}
                  selectedTable={selectedTable || ""}
                  tableColumns={tableColumns}
                  editRecord={editRecord}
                  recordLoading={recordLoading}
                  onBackToList={() =>
                    selectedTable && handleListTable(selectedTable)
                  }
                  onEditInputChange={handleEditInputChange}
                  onUpdateRecord={handleUpdateRecord}
                />
              )}
            </div>
          </div>
        </div>
      )}

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
                {columns.map((column, index) => (
                  <div key={index} className="flex gap-3 mb-3">
                    <input
                      type="text"
                      value={column.name}
                      onChange={(e) =>
                        handleColumnChange(index, "name", e.target.value)
                      }
                      className="flex-1 bg-admin-dark-blue-900 border border-admin-dark-blue-700 rounded-md px-3 py-2 text-white focus:border-admin-blue-500 focus:outline-none"
                      placeholder="Kolon adı"
                      required
                    />
                    <select
                      value={column.type}
                      onChange={(e) =>
                        handleColumnChange(index, "type", e.target.value)
                      }
                      className="w-40 bg-admin-dark-blue-900 border border-admin-dark-blue-700 rounded-md px-3 py-2 text-white focus:border-admin-blue-500 focus:outline-none"
                      required
                    >
                      <option value="">Tip seçin</option>
                      <option value="text">Metin</option>
                      <option value="number">Sayı</option>
                      <option value="boolean">Evet/Hayır</option>
                      <option value="date">Tarih</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeColumn(index)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addColumn}
                  className="mt-3 text-admin-blue-500 hover:text-admin-blue-400 flex items-center gap-1 text-sm"
                >
                  <Plus size={14} />
                  <span>Kolon Ekle</span>
                </button>
              </div>

              <div className="flex justify-end gap-3">
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
