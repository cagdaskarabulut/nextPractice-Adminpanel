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
} from "lucide-react";

interface Table {
  name: string;
  displayName: string;
}

interface AvailableTable {
  table_name: string;
  selected: boolean;
}

interface TableRecord {
  id: string | number;
  [key: string]: any;
}

interface TableColumn {
  name: string;
  type?: string;
  [key: string]: any;
}

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

  // API endpoint'i - uygulamanızda Next.js API routes yapısına uygun
  const apiUrl = "/api/admin";

  // Tüm tabloları yükle
  useEffect(() => {
    async function fetchTables() {
      try {
        const response = await fetch(`${apiUrl}/tables`);
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
      const response = await fetch(`${apiUrl}/all-tables`);
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

  // Seçimleri kaydet
  const saveTableSelection = async () => {
    try {
      const selectedTables = availableTables
        .filter((t) => t.selected)
        .map((t) => t.table_name);

      const response = await fetch(`${apiUrl}/save-tables`, {
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
      window.location.reload(); // Sayfayı yenile
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
      const schemaResponse = await fetch(`${apiUrl}/${tableName}?_schema=true`);
      if (schemaResponse.ok) {
        const schema = await schemaResponse.json();
        setTableColumns(schema);
      }

      // Sonra kayıtları al
      const response = await fetch(`${apiUrl}/${tableName}`);
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
    fetch(`${apiUrl}/${tableName}?_schema=true`)
      .then((res) => res.json())
      .then((schema) => {
        setTableColumns(schema);

        // Başlangıç değerlerini oluştur
        const initialValues = {};
        schema.forEach((column) => {
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
      const response = await fetch(`${apiUrl}/${selectedTable}?id=${id}`);
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
        `${apiUrl}/${selectedTable}?id=${recordToDelete}`,
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
      const response = await fetch(`${apiUrl}/${selectedTable}`, {
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
      const initialValues = {};
      tableColumns.forEach((column) => {
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
      const response = await fetch(`${apiUrl}/${selectedTable}`, {
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
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-300 rounded-md text-red-600">
        <h3 className="text-lg font-medium">Hata</h3>
        <p>{error}</p>
      </div>
    );
  }

  // Tablo listesi paneli
  if (!selectedTable && !showRecordList && !showAddForm && !showEditForm) {
    return (
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 min-h-screen p-6 rounded-lg">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Tablo Yönetimi
          </h1>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
            onClick={fetchAllTables}
          >
            <PlusCircle size={18} />
            <span>Tabloları Yönet</span>
          </button>
        </div>

        {/* Tablo Yönetim Diyaloğu */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
            <div className="bg-white rounded-xl p-6 w-96 max-w-full shadow-2xl transform transition-all duration-300 scale-100 opacity-100">
              <h2 className="text-xl font-semibold mb-4 text-slate-800">
                Yönetilecek Tabloları Seçin
              </h2>
              <p className="mb-4 text-slate-600">
                Admin panelinde gösterilecek tabloları seçin.
              </p>

              <div className="max-h-60 overflow-y-auto mb-4 pr-2 space-y-2">
                {availableTables.map((table) => (
                  <div
                    key={table.table_name}
                    className="flex items-center p-2 rounded hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        id={table.table_name}
                        checked={table.selected}
                        onChange={(e) =>
                          handleTableSelection(
                            table.table_name,
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <label
                      htmlFor={table.table_name}
                      className="ml-3 text-gray-800 text-sm font-medium select-none"
                    >
                      {table.table_name}
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium rounded-lg hover:bg-slate-100"
                  onClick={() => setIsDialogOpen(false)}
                >
                  İptal
                </button>
                <button
                  className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm"
                  onClick={saveTableSelection}
                >
                  <Check size={16} />
                  <span>Kaydet</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {tables.length === 0 ? (
          <div className="p-8 bg-white rounded-xl shadow-md border border-slate-200">
            <div className="flex flex-col items-center justify-center text-center p-6">
              <div className="mb-4 p-4 bg-slate-100 rounded-full">
                <PlusCircle className="w-12 h-12 text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-slate-800">
                Henüz hiç tablo eklenmemiş
              </h2>
              <p className="mb-4 text-slate-600 max-w-lg">
                Admin panelinde gösterilecek tabloları seçmek için "Tabloları
                Yönet" butonunu kullanın.
              </p>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
                onClick={fetchAllTables}
              >
                <PlusCircle size={18} />
                <span>Tabloları Yönet</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tables.map((table) => (
                <div
                  key={table.name}
                  className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-slate-200 overflow-hidden"
                >
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">
                    {table.displayName}
                  </h3>
                  <div className="flex space-x-2 mt-4">
                    <button
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                      onClick={() => handleListTable(table.name)}
                    >
                      <Filter size={16} />
                      <span>Listele</span>
                    </button>
                    <button
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                      onClick={() => handleAddRecord(table.name)}
                    >
                      <Plus size={16} />
                      <span>Ekle</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Kayıt listesi
  if (showRecordList && selectedTable) {
    return (
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 min-h-screen p-6 rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              className="flex items-center gap-1 px-3 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-200 shadow-sm mr-4 border border-slate-300"
              onClick={handleBackToTables}
            >
              <ChevronLeft size={18} />
              <span>Geri</span>
            </button>
            <h2 className="text-2xl font-bold text-slate-800">
              {tables.find((t) => t.name === selectedTable)?.displayName ||
                selectedTable}
            </h2>
          </div>
          <button
            className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-md transition-all duration-200"
            onClick={() => handleAddRecord(selectedTable)}
          >
            <Plus size={18} />
            <span>Yeni Ekle</span>
          </button>
        </div>

        {/* Silme Onay Diyaloğu */}
        {deleteConfirmOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
            <div className="bg-white rounded-xl p-6 w-96 max-w-full shadow-2xl">
              <h2 className="text-xl font-semibold mb-2 text-slate-800">
                Kaydı Sil
              </h2>
              <p className="mb-6 text-slate-600">
                Bu kaydı silmek istediğinizden emin misiniz? Bu işlem geri
                alınamaz.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                  onClick={() => setDeleteConfirmOpen(false)}
                >
                  İptal
                </button>
                <button
                  className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  onClick={handleDeleteRecord}
                >
                  <Trash2 size={16} />
                  <span>Sil</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {recordLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : tableRecords.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 flex flex-col items-center">
            <div className="mb-4 p-3 bg-slate-100 rounded-full">
              <Filter className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 text-center">
              Bu tabloda henüz kayıt bulunmuyor.
            </p>
            <button
              className="mt-4 flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-md"
              onClick={() => handleAddRecord(selectedTable)}
            >
              <Plus size={16} />
              <span>Yeni Kayıt Ekle</span>
            </button>
          </div>
        ) : (
          <div className="overflow-hidden bg-white shadow-md rounded-xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    {tableColumns.map((column) => (
                      <th
                        key={column.name}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        {column.name}
                      </th>
                    ))}
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {tableRecords.map((record, index) => (
                    <tr
                      key={index}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {tableColumns.map((column) => (
                        <td
                          key={column.name}
                          className="px-6 py-4 whitespace-nowrap text-sm text-slate-700"
                        >
                          {String(record[column.name] || "-")}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            className="inline-flex items-center gap-1 p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            onClick={() => handleEditRecord(record.id)}
                            title="Düzenle"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="inline-flex items-center gap-1 p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200"
                            onClick={() => handleDeleteConfirm(record.id)}
                            title="Sil"
                          >
                            <Trash2 size={16} />
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
    );
  }

  // Yeni kayıt ekleme formu
  if (showAddForm && selectedTable) {
    return (
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 min-h-screen p-6 rounded-lg">
        <div className="flex items-center mb-6">
          <button
            className="flex items-center gap-1 px-3 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-200 shadow-sm mr-4 border border-slate-300"
            onClick={handleBackToTables}
          >
            <ChevronLeft size={18} />
            <span>Geri</span>
          </button>
          <h2 className="text-2xl font-bold text-slate-800">
            {tables.find((t) => t.name === selectedTable)?.displayName ||
              selectedTable}{" "}
            Ekle
          </h2>
        </div>

        {recordLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <form onSubmit={handleSubmitRecord} className="space-y-6">
              {tableColumns.map((column: TableColumn) => {
                // id kolonunu formda gösterme, genellikle otomatik atanır
                if (column.name === "id") return null;

                return (
                  <div key={column.name} className="space-y-1">
                    <label
                      htmlFor={column.name}
                      className="block text-sm font-medium text-slate-700"
                    >
                      {column.name}
                    </label>
                    <input
                      type="text"
                      id={column.name}
                      name={column.name}
                      value={newRecord[column.name] || ""}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 rounded-md border border-slate-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
                    />
                  </div>
                );
              })}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                  onClick={handleBackToTables}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-md"
                >
                  <Check size={16} />
                  <span>Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  // Kayıt düzenleme formu
  if (showEditForm && selectedTable && editRecord) {
    return (
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 min-h-screen p-6 rounded-lg">
        <div className="flex items-center mb-6">
          <button
            className="flex items-center gap-1 px-3 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-200 shadow-sm mr-4 border border-slate-300"
            onClick={() => handleListTable(selectedTable)}
          >
            <ChevronLeft size={18} />
            <span>Geri</span>
          </button>
          <h2 className="text-2xl font-bold text-slate-800">
            {tables.find((t) => t.name === selectedTable)?.displayName ||
              selectedTable}{" "}
            Düzenle
          </h2>
        </div>

        {recordLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <form onSubmit={handleUpdateRecord} className="space-y-6">
              {tableColumns.map((column) => {
                // id kolonunu salt okunur göster
                if (column.name === "id") {
                  return (
                    <div key={column.name} className="space-y-1">
                      <label
                        htmlFor={column.name}
                        className="block text-sm font-medium text-slate-700"
                      >
                        {column.name}
                      </label>
                      <input
                        type="text"
                        id={column.name}
                        value={editRecord[column.name] || ""}
                        disabled
                        className="block w-full px-4 py-3 rounded-md border border-slate-300 bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  );
                }

                return (
                  <div key={column.name} className="space-y-1">
                    <label
                      htmlFor={column.name}
                      className="block text-sm font-medium text-slate-700"
                    >
                      {column.name}
                    </label>
                    <input
                      type="text"
                      id={column.name}
                      name={column.name}
                      value={editRecord[column.name] || ""}
                      onChange={handleEditInputChange}
                      className="block w-full px-4 py-3 rounded-md border border-slate-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
                    />
                  </div>
                );
              })}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                  onClick={() => handleListTable(selectedTable)}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
                >
                  <Check size={16} />
                  <span>Güncelle</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}
