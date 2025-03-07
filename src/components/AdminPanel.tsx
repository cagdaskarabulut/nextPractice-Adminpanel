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

  // Tablo listesi paneli - Ana görünüm
  if (!selectedTable && !showRecordList && !showAddForm && !showEditForm) {
    return (
      <TableList
        tables={tables}
        isDialogOpen={isDialogOpen}
        availableTables={availableTables}
        onFetchAllTables={fetchAllTables}
        onTableSelection={handleTableSelection}
        onSaveTableSelection={saveTableSelection}
        onCloseDialog={() => setIsDialogOpen(false)}
        onListTable={handleListTable}
        onAddRecord={handleAddRecord}
      />
    );
  }

  // Kayıt listesi görünümü
  if (showRecordList && selectedTable) {
    return (
      <RecordList
        tables={tables}
        selectedTable={selectedTable}
        tableRecords={tableRecords}
        tableColumns={tableColumns}
        recordLoading={recordLoading}
        deleteConfirmOpen={deleteConfirmOpen}
        onBackToTables={handleBackToTables}
        onAddRecord={handleAddRecord}
        onEditRecord={handleEditRecord}
        onDeleteConfirm={handleDeleteConfirm}
        onDeleteRecord={handleDeleteRecord}
        onCancelDelete={() => setDeleteConfirmOpen(false)}
      />
    );
  }

  // Yeni kayıt ekleme formu
  if (showAddForm && selectedTable) {
    return (
      <AddRecordForm
        tables={tables}
        selectedTable={selectedTable}
        tableColumns={tableColumns}
        newRecord={newRecord}
        recordLoading={recordLoading}
        onBackToTables={handleBackToTables}
        onInputChange={handleInputChange}
        onSubmitRecord={handleSubmitRecord}
      />
    );
  }

  // Kayıt düzenleme formu
  if (showEditForm && selectedTable && editRecord) {
    return (
      <EditRecordForm
        tables={tables}
        selectedTable={selectedTable}
        tableColumns={tableColumns}
        editRecord={editRecord}
        recordLoading={recordLoading}
        onBackToList={() => handleListTable(selectedTable)}
        onEditInputChange={handleEditInputChange}
        onUpdateRecord={handleUpdateRecord}
      />
    );
  }

  return <LoadingSpinner />;
}
