"use client";

import React from "react";
import { ChevronLeft, Save } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <button
          className="admin-button-secondary flex items-center gap-2 mr-4"
          onClick={onBackToList}
        >
          <ChevronLeft size={18} />
          <span>Geri</span>
        </button>
        <h2 className="admin-title">
          {tables.find((t) => t.name === selectedTable)?.displayName ||
            selectedTable}{" "}
          Düzenle
        </h2>
      </div>

      {recordLoading ? (
        <div className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-blue-500"></div>
        </div>
      ) : (
        <div className="admin-card">
          <form onSubmit={onUpdateRecord} className="space-y-6">
            {tableColumns.map((column: TableColumn) => {
              // id kolonunu salt okunur göster
              if (column.name === "id") {
                return (
                  <div key={column.name} className="space-y-2">
                    <label
                      htmlFor={column.name}
                      className="block text-sm font-medium text-admin-gray-300"
                    >
                      {column.name}
                    </label>
                    <input
                      type="text"
                      id={column.name}
                      value={editRecord?.[column.name] || ""}
                      disabled
                      className="admin-input w-full bg-admin-dark-blue-800 text-admin-gray-500 cursor-not-allowed"
                    />
                  </div>
                );
              }

              return (
                <div key={column.name} className="space-y-2">
                  <label
                    htmlFor={column.name}
                    className="block text-sm font-medium text-admin-gray-300"
                  >
                    {column.name}
                  </label>
                  <input
                    type="text"
                    id={column.name}
                    name={column.name}
                    value={editRecord?.[column.name] || ""}
                    onChange={onEditInputChange}
                    className="admin-input w-full"
                  />
                </div>
              );
            })}

            <div className="flex justify-end gap-3 pt-6">
              <button
                type="button"
                className="admin-button-secondary"
                onClick={onBackToList}
              >
                İptal
              </button>
              <button
                type="submit"
                className="admin-button-primary flex items-center gap-2"
              >
                <Save size={18} />
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
