"use client";

import React from "react";
import { ChevronLeft, Plus, Pencil, Trash2, Filter } from "lucide-react";
import { Table, TableRecord, TableColumn } from "./types";
import DeleteConfirmDialog from "./dialogs/DeleteConfirmDialog";

interface RecordListProps {
  tables: Table[];
  selectedTable: string;
  tableRecords: TableRecord[];
  tableColumns: TableColumn[];
  recordLoading: boolean;
  deleteConfirmOpen: boolean;
  onBackToTables: () => void;
  onAddRecord: (tableName: string) => void;
  onEditRecord: (id: string | number) => Promise<void>;
  onDeleteConfirm: (id: string | number) => void;
  onDeleteRecord: () => Promise<void>;
  onCancelDelete: () => void;
}

const RecordList: React.FC<RecordListProps> = ({
  tables,
  selectedTable,
  tableRecords,
  tableColumns,
  recordLoading,
  deleteConfirmOpen,
  onBackToTables,
  onAddRecord,
  onEditRecord,
  onDeleteConfirm,
  onDeleteRecord,
  onCancelDelete,
}) => {
  return (
    <div className="easy-adminpanel-content bg-admin-dark-blue-800 min-h-screen p-6 rounded-lg">
      {/* Silme Onay Diyaloğu */}
      {deleteConfirmOpen && (
        <DeleteConfirmDialog
          onConfirm={onDeleteRecord}
          onCancel={onCancelDelete}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          {tables.find((t) => t.name === selectedTable)?.displayName ||
            selectedTable}
        </h1>
        <button
          className="admin-button-primary flex items-center gap-2"
          onClick={() => onAddRecord(selectedTable)}
        >
          <Plus size={18} />
          <span>Yeni Kayıt</span>
        </button>
      </div>

      {recordLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-blue-500"></div>
        </div>
      ) : tableRecords.length === 0 ? (
        <div className="bg-admin-dark-blue-700 p-8 rounded-xl shadow-md border border-admin-dark-blue-600 flex flex-col items-center">
          <div className="mb-4 p-3 bg-admin-dark-blue-600 rounded-full">
            <Filter className="w-8 h-8 text-admin-gray-400" />
          </div>
          <p className="text-admin-gray-300 text-center">
            Bu tabloda henüz kayıt bulunmuyor.
          </p>
          <button
            className="mt-4 admin-button-primary flex items-center gap-2"
            onClick={() => onAddRecord(selectedTable)}
          >
            <Plus size={16} />
            <span>Yeni Kayıt Ekle</span>
          </button>
        </div>
      ) : (
        <div className="overflow-hidden bg-admin-dark-blue-700 shadow-md rounded-xl border border-admin-dark-blue-600">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-admin-dark-blue-600">
              <thead className="bg-admin-dark-blue-800">
                <tr>
                  {tableColumns.map((column) => (
                    <th
                      key={column.name}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-admin-gray-400 uppercase tracking-wider"
                    >
                      {column.name}
                    </th>
                  ))}
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-admin-gray-400 uppercase tracking-wider"
                  >
                    İŞLEMLER
                  </th>
                </tr>
              </thead>
              <tbody className="bg-admin-dark-blue-700 divide-y divide-admin-dark-blue-600">
                {tableRecords.map((record, index) => (
                  <tr
                    key={index}
                    className="hover:bg-admin-dark-blue-600 transition-colors"
                  >
                    {tableColumns.map((column) => (
                      <td
                        key={column.name}
                        className="px-6 py-4 whitespace-nowrap text-sm text-admin-gray-300"
                      >
                        {String(record[column.name] || "-")}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          className="inline-flex items-center gap-1 p-1.5 bg-admin-blue-900 text-admin-blue-300 rounded hover:bg-admin-blue-800"
                          onClick={() => onEditRecord(record.id)}
                          title="Düzenle"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="inline-flex items-center gap-1 p-1.5 bg-admin-red-900 text-admin-red-300 rounded hover:bg-admin-red-800"
                          onClick={() => onDeleteConfirm(record.id)}
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
};

export default RecordList;
