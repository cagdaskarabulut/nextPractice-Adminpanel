"use client";

import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  ChevronLeft,
  Pencil,
  Trash2,
  Filter,
  Plus,
  Check,
  X,
  Database,
} from "lucide-react";
import { Table, AvailableTable, TableRecord, TableColumn } from "./types";
import TableList from "./TableList";
import RecordList from "./RecordList";
import AddRecordForm from "./AddRecordForm";
import EditRecordForm from "./EditRecordForm";
import LoadingSpinner from "./ui/LoadingSpinner";

export function AdminPanel() {
  const [tables, setTables] = useState<Table[]>([]);
  const [availableTables, setAvailableTables] = useState<AvailableTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      const schemaResponse = await fetch(`/api/${tableName}?_schema=true`);
      if (schemaResponse.ok) {
        const schema = await schemaResponse.json();
        setTableColumns(schema);
      }

      // Sonra kayıtları al
      const response = await fetch(`/api/${tableName}`);
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

  // Yeni kayıt formunu aç
  const handleAddRecord = (tableName: string) => {
    setSelectedTable(tableName);
    setShowAddForm(true);
    setShowRecordList(false);
    setShowEditForm(false);
    setRecordLoading(true);
    setNewRecord({});

    // Tablo sütunlarını al
    fetch(`/api/${tableName}?_schema=true`)
      .then((res) => res.json())
      .then((schema) => {
        setTableColumns(schema);

        // Başlangıç değerlerini oluştur
        const initialValues: Record<string, string> = {};
        schema.forEach((column: TableColumn) => {
          if (column.name !== "id") {
            initialValues[column.name] = "";
          }
        });

        setNewRecord(initialValues);
        setRecordLoading(false);
      })
      .catch((err) => {
        alert(
          "Tablo şeması alınırken bir hata oluştu: " +
            (err instanceof Error ? err.message : "Bilinmeyen hata")
        );
        setRecordLoading(false);
      });
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
      const response = await fetch(`/api/${selectedTable}/${id}`);
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
      const response = await fetch(`/api/${selectedTable}/${recordToDelete}`, {
        method: "DELETE",
      });

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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewRecord((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Form alanı değişikliğini işle (düzenleme için)
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
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
      const response = await fetch(`/api/${selectedTable}`, {
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
      const response = await fetch(`/api/${selectedTable}/${editRecord.id}`, {
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

  // Panele geri dön
  const handleBackToTables = () => {
    setSelectedTable(null);
    setShowRecordList(false);
    setShowAddForm(false);
    setShowEditForm(false);
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
        <div>
          {/* Tablo Yönetimi */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="admin-title">Veritabanı Tabloları</h2>
            <button
              onClick={fetchAllTables}
              className="admin-button-primary flex items-center gap-2"
            >
              <PlusCircle size={18} />
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
                        className="flex items-center p-3 bg-admin-dark-blue-700 rounded-md"
                      >
                        <input
                          type="checkbox"
                          id={`table_${table.table_name}`}
                          checked={table.selected}
                          onChange={(e) =>
                            handleTableSelection(
                              table.table_name,
                              e.target.checked
                            )
                          }
                          className="mr-3 h-5 w-5 accent-admin-blue-500"
                        />
                        <label
                          htmlFor={`table_${table.table_name}`}
                          className="flex-1 cursor-pointer text-admin-gray-200"
                        >
                          {table.table_name}
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

          {/* Tablo Listesi */}
          {loading ? (
            <div className="p-8 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="admin-card">
              <p className="text-red-500">{error}</p>
            </div>
          ) : tables.length === 0 ? (
            <div className="admin-card flex flex-col items-center p-12 text-center">
              <Database size={48} className="text-admin-gray-600 mb-4" />
              <h3 className="admin-subtitle mb-2">Henüz Tablo Bulunmuyor</h3>
              <p className="text-admin-gray-400 mb-6">
                Veritabanı yönetimi için tablolar eklemelisiniz
              </p>
              <button
                onClick={fetchAllTables}
                className="admin-button-primary flex items-center gap-2"
              >
                <PlusCircle size={18} />
                <span>Tabloları Yönet</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tables.map((table) => (
                <div
                  key={table.name}
                  className="admin-card hover:border-admin-blue-500 border border-transparent transition-colors"
                >
                  <div className="p-6">
                    <h3 className="admin-subtitle mb-2">
                      {table.displayName || table.name}
                    </h3>
                    <p className="text-admin-gray-400 mb-4 text-sm">
                      {table.name}
                    </p>

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleListTable(table.name)}
                        className="admin-button-primary flex items-center gap-2 flex-1"
                      >
                        <Filter size={16} />
                        <span>Listele</span>
                      </button>
                      <button
                        onClick={() => handleAddRecord(table.name)}
                        className="admin-button-secondary flex items-center gap-2 flex-1"
                      >
                        <Plus size={16} />
                        <span>Ekle</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : showRecordList ? (
        <div>
          {/* Kayıt Listesi */}
          <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setSelectedTable(null);
                  setShowRecordList(false);
                  setTableRecords([]);
                }}
                className="admin-button-secondary flex items-center gap-2"
              >
                <ChevronLeft size={18} />
                <span>Geri</span>
              </button>
              <h2 className="admin-title">
                {selectedTable
                  ? tables.find((t) => t.name === selectedTable)?.displayName ||
                    selectedTable
                  : ""}
              </h2>
            </div>

            <button
              onClick={() => {
                if (selectedTable) {
                  handleAddRecord(selectedTable);
                }
              }}
              className="admin-button-primary flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Yeni Kayıt</span>
            </button>
          </div>

          {/* Silme Onay Diyaloğu */}
          {deleteConfirmOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="admin-card max-w-md w-full p-6">
                <h3 className="admin-subtitle mb-4">
                  Kaydı Silmek İstiyor musunuz?
                </h3>
                <p className="text-admin-gray-300 mb-6">
                  Bu işlem geri alınamaz ve kayıt kalıcı olarak silinecektir.
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteConfirmOpen(false)}
                    className="admin-button-secondary"
                  >
                    İptal
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteRecord();
                      setDeleteConfirmOpen(false);
                    }}
                    className="bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={18} />
                    <span>Sil</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {recordLoading ? (
            <div className="p-8 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : tableRecords.length === 0 ? (
            <div className="admin-card flex flex-col items-center p-12 text-center">
              <Database size={48} className="text-admin-gray-600 mb-4" />
              <h3 className="admin-subtitle mb-2">Kayıt Bulunamadı</h3>
              <p className="text-admin-gray-400 mb-6">
                Bu tabloda henüz kayıt bulunmuyor
              </p>
              <button
                onClick={() => {
                  if (selectedTable) {
                    handleAddRecord(selectedTable);
                  }
                }}
                className="admin-button-primary flex items-center gap-2"
              >
                <Plus size={18} />
                <span>Yeni Kayıt Ekle</span>
              </button>
            </div>
          ) : (
            <div className="admin-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="admin-table">
                  <thead>
                    <tr>
                      {tableColumns.map((column) => (
                        <th
                          key={column.name}
                          scope="col"
                          className={column.name === "id" ? "w-24" : ""}
                        >
                          {column.name}
                        </th>
                      ))}
                      <th scope="col" className="w-24 text-right">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRecords.map((record) => (
                      <tr key={record.id}>
                        {tableColumns.map((column) => (
                          <td key={`${record.id}_${column.name}`}>
                            {record[column.name] !== null
                              ? String(record[column.name])
                              : ""}
                          </td>
                        ))}
                        <td className="text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditRecord(record.id)}
                              className="p-1.5 text-admin-blue-500 hover:text-white hover:bg-admin-blue-500 rounded-md transition-colors"
                              title="Düzenle"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteConfirm(record.id)}
                              className="p-1.5 text-red-400 hover:text-white hover:bg-red-500 rounded-md transition-colors"
                              title="Sil"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : showAddForm ? (
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
      ) : showEditForm ? (
        <EditRecordForm
          tables={tables}
          selectedTable={selectedTable || ""}
          tableColumns={tableColumns}
          editRecord={editRecord}
          recordLoading={recordLoading}
          onBackToList={() => selectedTable && handleListTable(selectedTable)}
          onEditInputChange={handleEditInputChange}
          onUpdateRecord={handleUpdateRecord}
        />
      ) : null}
    </div>
  );
}
