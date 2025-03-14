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
    <div className="bg-gradient-to-r from-slate-50 to-slate-100 min-h-screen p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            className="flex items-center gap-1 px-3 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-200 shadow-sm mr-4 border border-slate-300"
            onClick={onBackToTables}
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
          onClick={() => onAddRecord(selectedTable)}
        >
          <Plus size={18} />
          <span>Yeni Ekle</span>
        </button>
      </div>

      {/* Silme Onay Diyaloğu */}
      {deleteConfirmOpen && (
        <DeleteConfirmDialog
          onConfirm={onDeleteRecord}
          onCancel={onCancelDelete}
        />
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
            onClick={() => onAddRecord(selectedTable)}
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
                          onClick={() => onEditRecord(record.id)}
                          title="Düzenle"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="inline-flex items-center gap-1 p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200"
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
