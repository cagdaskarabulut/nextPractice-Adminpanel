"use client";

import React from "react";
import { ChevronLeft, Check } from "lucide-react";
import { Table, TableRecord, TableColumn } from "./types";

interface EditRecordFormProps {
  tables: Table[];
  selectedTable: string;
  tableColumns: TableColumn[];
  editRecord: TableRecord | null;
  recordLoading: boolean;
  onBackToList: () => void;
  onEditInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdateRecord: (e: React.FormEvent) => Promise<void>;
}

const EditRecordForm: React.FC<EditRecordFormProps> = ({
  tables,
  selectedTable,
  tableColumns,
  editRecord,
  recordLoading,
  onBackToList,
  onEditInputChange,
  onUpdateRecord,
}) => {
  return (
    <div className="bg-gradient-to-r from-slate-50 to-slate-100 min-h-screen p-6 rounded-lg">
      <div className="flex items-center mb-6">
        <button
          className="flex items-center gap-1 px-3 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-200 shadow-sm mr-4 border border-slate-300"
          onClick={onBackToList}
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
          <form onSubmit={onUpdateRecord} className="space-y-6">
            {tableColumns.map((column: TableColumn) => {
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
                      value={editRecord?.[column.name] || ""}
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
                    value={editRecord?.[column.name] || ""}
                    onChange={onEditInputChange}
                    className="block w-full px-4 py-3 rounded-md border border-slate-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
                  />
                </div>
              );
            })}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                onClick={onBackToList}
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
};

export default EditRecordForm;
