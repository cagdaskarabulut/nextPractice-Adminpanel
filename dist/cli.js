#!/usr/bin/env node
"use strict";

const path = require("path");
const fs = require("fs");

console.log("🚀 Easy Admin Panel kuruluyor...");

// Hedef dizin
const targetDir = process.cwd();
const args = process.argv.slice(2);

// Varsayılan konfigürasyon
const defaultConfig = {
  route: "/easy-adminpanel",
  envVar: "POSTGRES_URL",
  title: "Easy Admin Panel",
};

// Argümanlardan seçenekleri al
const options = {};
for (let i = 1; i < args.length; i++) {
  if (args[i].startsWith("--")) {
    const [key, value] = args[i].slice(2).split("=");
    if (key && value) {
      options[key] = value;
    }
  }
}

// Konfigürasyonu birleştir
const config = {
  ...defaultConfig,
  ...options,
};

// Template klasörünü kopyala
const templateDir = path.join(__dirname, "templates");

// src/app/ veya app/ dizinini kontrol et
let appPath = path.join(targetDir, "src", "app");
if (!fs.existsSync(appPath)) {
  appPath = path.join(targetDir, "app");
  if (!fs.existsSync(appPath)) {
    // Her iki dizin de yoksa src/app dizinini oluştur
    fs.mkdirSync(appPath, { recursive: true });
  }
}

const easyAdminDir = path.join(appPath, config.route.replace(/^\//, ""));
const componentsDir = path.join(targetDir, "src", "components");
const apiDir = path.join(appPath, "api", "admin");

// Klasör oluştur
if (!fs.existsSync(easyAdminDir)) {
  fs.mkdirSync(easyAdminDir, { recursive: true });
}

// API dizinini oluştur
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

// Components dizinini oluştur
if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
}

// Template dosyalarını kopyala (basit bir kopyalama fonksiyonu)
function copyDir(src, dest) {
  const files = fs.readdirSync(src);

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  for (const file of files) {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  // API ve diğer klasörleri kopyala
  copyDir(templateDir, easyAdminDir);

  // API endpoint dosyalarını kopyala
  const apiTemplateDir = path.join(templateDir, "api");
  if (fs.existsSync(apiTemplateDir)) {
    copyDir(apiTemplateDir, apiDir);
  }

  // AdminPanel bileşenini oluştur
  const adminPanelPath = path.join(componentsDir, "AdminPanel.tsx");

  const adminPanelContent = `"use client";

import React, { useState, useEffect } from 'react';

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
  const [tableColumns, setTableColumns] = useState<any[]>([]);
  const [newRecord, setNewRecord] = useState<{[key: string]: any}>({});
  const [editRecord, setEditRecord] = useState<TableRecord | null>(null);
  const [recordLoading, setRecordLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | number | null>(null);

  // API endpoint'i - uygulamanızda Next.js API routes yapısına uygun
  const apiUrl = '/api/admin'; 
  
  // Tüm tabloları yükle
  useEffect(() => {
    async function fetchTables() {
      try {
        const response = await fetch(\`\${apiUrl}/tables\`);
        if (!response.ok) {
          throw new Error('Tablolar yüklenirken bir hata oluştu');
        }
        
        const data = await response.json();
        setTables(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu');
        setLoading(false);
      }
    }
    
    fetchTables();
  }, []);

  // Kullanılabilir tüm tabloları getir
  const fetchAllTables = async () => {
    try {
      // Tüm tabloları getir
      const response = await fetch(\`\${apiUrl}/all-tables\`);
      if (!response.ok) {
        throw new Error('Tablolar yüklenirken bir hata oluştu');
      }
      
      const allTableNames = await response.json();
      
      // Seçili tabloları kontrol et
      const selectedTableNames = tables.map(t => t.name);
      
      // Tabloları birleştir
      const mappedTables = allTableNames.map((name) => ({
        table_name: name,
        selected: selectedTableNames.includes(name)
      }));
      
      setAvailableTables(mappedTables);
      setIsDialogOpen(true);
    } catch (err) {
      alert('Tablolar yüklenirken bir hata oluştu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
    }
  };

  // Tablo seçimini değiştir
  const handleTableSelection = (tableName, isSelected) => {
    setAvailableTables(prev => 
      prev.map(t => t.table_name === tableName ? { ...t, selected: isSelected } : t)
    );
  };

  // Seçimleri kaydet
  const saveTableSelection = async () => {
    try {
      const selectedTables = availableTables
        .filter(t => t.selected)
        .map(t => t.table_name);
      
      const response = await fetch(\`\${apiUrl}/save-tables\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tables: selectedTables }),
      });
      
      if (!response.ok) {
        throw new Error('Tablo seçimleri kaydedilirken bir hata oluştu');
      }
      
      setIsDialogOpen(false);
      window.location.reload(); // Sayfayı yenile
    } catch (err) {
      alert('Seçimler kaydedilirken bir hata oluştu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
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
      const schemaResponse = await fetch(\`\${apiUrl}/\${tableName}?_schema=true\`);
      if (schemaResponse.ok) {
        const schema = await schemaResponse.json();
        setTableColumns(schema);
      }
      
      // Sonra kayıtları al
      const response = await fetch(\`\${apiUrl}/\${tableName}\`);
      if (!response.ok) {
        throw new Error('Kayıtlar alınırken bir hata oluştu');
      }
      
      const data = await response.json();
      setTableRecords(data);
      setRecordLoading(false);
    } catch (err) {
      alert('Kayıtlar alınırken bir hata oluştu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
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
    fetch(\`\${apiUrl}/\${tableName}?_schema=true\`)
      .then(res => res.json())
      .then(schema => {
        setTableColumns(schema);
        
        // Başlangıç değerlerini oluştur
        const initialValues = {};
        schema.forEach(column => {
          if (column.name !== 'id') {
            initialValues[column.name] = '';
          }
        });
        
        setNewRecord(initialValues);
        setRecordLoading(false);
      })
      .catch(err => {
        alert('Tablo şeması alınırken bir hata oluştu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
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
      const response = await fetch(\`\${apiUrl}/\${selectedTable}?id=\${id}\`);
      if (!response.ok) {
        throw new Error('Kayıt alınırken bir hata oluştu');
      }
      
      const record = await response.json();
      setEditRecord(record);
      setRecordLoading(false);
    } catch (err) {
      alert('Kayıt alınırken bir hata oluştu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
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
      const response = await fetch(\`\${apiUrl}/\${selectedTable}?id=\${recordToDelete}\`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Kayıt silinirken bir hata oluştu');
      }
      
      // Silme başarılı, tabloyu güncelle
      setDeleteConfirmOpen(false);
      setRecordToDelete(null);
      
      // Tabloyu yeniden yükle
      handleListTable(selectedTable);
      
      alert('Kayıt başarıyla silindi');
    } catch (err) {
      alert('Kayıt silinirken bir hata oluştu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
    }
  };
  
  // Form alanı değişikliğini işle (yeni kayıt için)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewRecord(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Form alanı değişikliğini işle (düzenleme için)
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditRecord(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: value
      };
    });
  };
  
  // Yeni kayıt ekle
  const handleSubmitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTable) return;
    
    try {
      const response = await fetch(\`\${apiUrl}/\${selectedTable}\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRecord),
      });
      
      if (!response.ok) {
        throw new Error('Kayıt eklenirken bir hata oluştu');
      }
      
      alert('Kayıt başarıyla eklendi!');
      
      // Formu temizle
      const initialValues = {};
      tableColumns.forEach(column => {
        if (column.name !== 'id') {
          initialValues[column.name] = '';
        }
      });
      
      setNewRecord(initialValues);
      
      // İsteğe bağlı olarak kayıt listesine dön
      handleListTable(selectedTable);
    } catch (err) {
      alert('Kayıt eklenirken bir hata oluştu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
    }
  };
  
  // Kayıt güncelle
  const handleUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTable || !editRecord) return;
    
    try {
      const response = await fetch(\`\${apiUrl}/\${selectedTable}\`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editRecord),
      });
      
      if (!response.ok) {
        throw new Error('Kayıt güncellenirken bir hata oluştu');
      }
      
      alert('Kayıt başarıyla güncellendi!');
      
      // Kayıt listesine dön
      handleListTable(selectedTable);
    } catch (err) {
      alert('Kayıt güncellenirken bir hata oluştu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
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
    return <div className="text-gray-800">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="text-red-500">Hata: {error}</div>;
  }
  
  // Tablo listesi paneli
  if (!selectedTable && !showRecordList && !showAddForm && !showEditForm) {
    return (
      <div>
        <div className="mb-6">
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={fetchAllTables}
          >
            Tabloları Yönet
          </button>
        </div>
        
        {/* Tablo Yönetim Diyaloğu */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-full">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Yönetilecek Tabloları Seçin</h2>
              <p className="mb-4 text-gray-600">Admin panelinde gösterilecek tabloları seçin.</p>
              
              <div className="max-h-60 overflow-y-auto mb-4">
                {availableTables.map(table => (
                  <div key={table.table_name} className="flex items-center mb-2">
                    <input 
                      type="checkbox" 
                      id={table.table_name}
                      checked={table.selected}
                      onChange={(e) => handleTableSelection(table.table_name, e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor={table.table_name} className="text-gray-800">{table.table_name}</label>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-2">
                <button 
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  onClick={() => setIsDialogOpen(false)}
                >
                  İptal
                </button>
                <button 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={saveTableSelection}
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        )}
        
        {tables.length === 0 ? (
          <div className="p-8 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Henüz hiç tablo eklenmemiş</h2>
            <p className="mb-4 text-gray-800">Admin panelinde gösterilecek tabloları seçmek için "Tabloları Yönet" butonunu kullanın.</p>
            <p className="text-sm text-gray-600">Seçilen tablolar için otomatik CRUD arayüzleri oluşturulacaktır.</p>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Tablolar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map((table) => (
                <div key={table.name} className="p-4 border rounded shadow hover:shadow-md">
                  <h3 className="font-semibold text-gray-800">{table.displayName}</h3>
                  <div className="mt-2 space-x-2">
                    <button 
                      className="px-2 py-1 bg-blue-500 text-white text-sm rounded"
                      onClick={() => handleListTable(table.name)}
                    >
                      Listele
                    </button>
                    <button 
                      className="px-2 py-1 bg-green-500 text-white text-sm rounded"
                      onClick={() => handleAddRecord(table.name)}
                    >
                      Ekle
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
      <div>
        <div className="mb-6 flex items-center">
          <button 
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 mr-3"
            onClick={handleBackToTables}
          >
            ← Geri
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            {tables.find(t => t.name === selectedTable)?.displayName || selectedTable} Listesi
          </h2>
          <button 
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 ml-auto"
            onClick={() => handleAddRecord(selectedTable)}
          >
            + Yeni Ekle
          </button>
        </div>
        
        {/* Silme Onay Diyaloğu */}
        {deleteConfirmOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-full">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Kaydı Sil</h2>
              <p className="mb-6 text-gray-600">Bu kaydı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
              
              <div className="flex justify-end space-x-2">
                <button 
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  onClick={() => setDeleteConfirmOpen(false)}
                >
                  İptal
                </button>
                <button 
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={handleDeleteRecord}
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        )}
        
        {recordLoading ? (
          <div className="text-gray-800">Yükleniyor...</div>
        ) : tableRecords.length === 0 ? (
          <div className="p-8 bg-white rounded-lg shadow">
            <p className="text-gray-800">Bu tabloda henüz kayıt bulunmuyor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  {tableColumns.map(column => (
                    <th key={column.name} className="border px-4 py-2 text-left text-gray-800">
                      {column.name}
                    </th>
                  ))}
                  <th className="border px-4 py-2 text-left text-gray-800">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {tableRecords.map((record, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {tableColumns.map(column => (
                      <td key={column.name} className="border px-4 py-2 text-gray-800">
                        {String(record[column.name] || '-')}
                      </td>
                    ))}
                    <td className="border px-4 py-2">
                      <button 
                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded mr-1"
                        onClick={() => handleEditRecord(record.id)}
                      >
                        Düzenle
                      </button>
                      <button 
                        className="px-2 py-1 bg-red-500 text-white text-xs rounded"
                        onClick={() => handleDeleteConfirm(record.id)}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
  
  // Yeni kayıt ekleme formu
  if (showAddForm && selectedTable) {
    return (
      <div>
        <div className="mb-6 flex items-center">
          <button 
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 mr-3"
            onClick={handleBackToTables}
          >
            ← Geri
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            {tables.find(t => t.name === selectedTable)?.displayName || selectedTable} Ekle
          </h2>
        </div>
        
        {recordLoading ? (
          <div className="text-gray-800">Yükleniyor...</div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            <form onSubmit={handleSubmitRecord}>
              {tableColumns.map(column => {
                // id kolonunu formda gösterme, genellikle otomatik atanır
                if (column.name === 'id') return null;
                
                return (
                  <div key={column.name} className="mb-4">
                    <label className="block text-gray-800 mb-2" htmlFor={column.name}>
                      {column.name}
                    </label>
                    <input
                      type="text"
                      id={column.name}
                      name={column.name}
                      value={newRecord[column.name] || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded text-gray-800"
                    />
                  </div>
                );
              })}
              
              <div className="flex justify-end mt-6">
                <button 
                  type="button" 
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 mr-2"
                  onClick={handleBackToTables}
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Kaydet
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
      <div>
        <div className="mb-6 flex items-center">
          <button 
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 mr-3"
            onClick={() => handleListTable(selectedTable)}
          >
            ← Geri
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            {tables.find(t => t.name === selectedTable)?.displayName || selectedTable} Düzenle
          </h2>
        </div>
        
        {recordLoading ? (
          <div className="text-gray-800">Yükleniyor...</div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            <form onSubmit={handleUpdateRecord}>
              {tableColumns.map(column => {
                // id kolonunu salt okunur göster
                if (column.name === 'id') {
                  return (
                    <div key={column.name} className="mb-4">
                      <label className="block text-gray-800 mb-2" htmlFor={column.name}>
                        {column.name}
                      </label>
                      <input
                        type="text"
                        id={column.name}
                        value={editRecord[column.name] || ''}
                        disabled
                        className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-800"
                      />
                    </div>
                  );
                }
                
                return (
                  <div key={column.name} className="mb-4">
                    <label className="block text-gray-800 mb-2" htmlFor={column.name}>
                      {column.name}
                    </label>
                    <input
                      type="text"
                      id={column.name}
                      name={column.name}
                      value={editRecord[column.name] || ''}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border rounded text-gray-800"
                    />
                  </div>
                );
              })}
              
              <div className="flex justify-end mt-6">
                <button 
                  type="button" 
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 mr-2"
                  onClick={() => handleListTable(selectedTable)}
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }
  
  return <div className="text-gray-800">Yükleniyor...</div>;
}
`;

  fs.writeFileSync(adminPanelPath, adminPanelContent);

  // page.tsx içeriğini güncelle (basitleştirilmiş)
  const pagePath = path.join(easyAdminDir, "page.tsx");
  const pageContent = `"use client";

import { AdminPanel } from '@/components/AdminPanel';

export default function EasyAdminPage() {
  const title = process.env.EASY_ADMIN_TITLE || 'Easy Admin Panel';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">{title}</h1>
      <AdminPanel />
    </div>
  );
}`;

  fs.writeFileSync(pagePath, pageContent);

  // Konfigürasyon dosyasını oluştur
  const configFile = path.join(easyAdminDir, "config.ts");
  const configContent = `
export const adminConfig = {
  route: '${config.route}',
  envVar: '${config.envVar}',
  title: '${config.title}',
};
  `.trim();

  fs.writeFileSync(configFile, configContent);

  console.log(`✅ Easy Admin Panel başarıyla kuruldu!`);
  console.log(`📂 Dosyalar şuraya kopyalandı: ${easyAdminDir}`);
  console.log(`📂 AdminPanel bileşenini şuraya eklendi: ${adminPanelPath}`);
  console.log(
    `🚀 Admin paneline şu adresten erişebilirsiniz: http://localhost:3000${config.route}`
  );

  console.log("\n📝 Kurulum sonrası yapılması gerekenler:");
  console.log("1. Veritabanı bağlantı bilgilerinizi .env dosyasına ekleyin:");
  console.log(
    `   ${config.envVar}="postgres://user:password@host:port/database"`
  );
  console.log("2. Uygulamanızı başlatın:");
  console.log("   npm run dev");
  console.log(
    `3. Tarayıcınızdan admin paneline erişin: http://localhost:3000${config.route}\n`
  );
  console.log(
    "\n⚠️ Not: Eğer hata alırsanız, projenizdeki tsconfig.json dosyasında '@' alias tanımlamasını kontrol edin!"
  );
} catch (err) {
  console.error("❌ Kurulum sırasında bir hata oluştu:", err);
  process.exit(1);
}
