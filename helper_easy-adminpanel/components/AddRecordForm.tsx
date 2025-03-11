"use client";

import React from "react";
import { ChevronLeft, Save } from "lucide-react";
import { Table, TableColumn } from "./types";
import { DynamicField, parseValueFromInput } from "./utils/FormFieldUtils";

interface AddRecordFormProps {
  tables: Table[];
  selectedTable: string;
  tableColumns: TableColumn[];
  newRecord: Record<string, any>;
  recordLoading: boolean;
  onBackToTables: () => void;
  onInputChange: (
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      | { target: { name: string; value: any; checked?: boolean } }
  ) => void;
  onSubmitRecord: (e: React.FormEvent) => Promise<void>;
}

const AddRecordForm: React.FC<AddRecordFormProps> = ({
  tables,
  selectedTable,
  tableColumns,
  newRecord,
  recordLoading,
  onBackToTables,
  onInputChange,
  onSubmitRecord,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <button
          className="admin-button-secondary flex items-center gap-2 mr-4"
          onClick={onBackToTables}
        >
          <ChevronLeft size={18} />
          <span>Geri</span>
        </button>
        <h2 className="admin-title">
          {tables.find((t) => t.name === selectedTable)?.displayName ||
            selectedTable}{" "}
          Ekle
        </h2>
      </div>

      {recordLoading ? (
        <div className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-blue-500"></div>
        </div>
      ) : (
        <div className="admin-card mx-0 sm:mx-2">
          <form onSubmit={onSubmitRecord} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tableColumns.map((column: TableColumn) => {
                // id kolonunu formda gösterme, genellikle otomatik atanır
                if (column.name === "id") return null;

                return (
                  <div key={column.name} className="space-y-2">
                    <label
                      htmlFor={column.name}
                      className="block text-sm font-medium text-admin-gray-300"
                    >
                      {column.name}
                    </label>
                    <DynamicField
                      column={column}
                      value={newRecord[column.name]}
                      onChange={onInputChange}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
              <button
                type="button"
                className="admin-button-secondary w-full sm:w-auto"
                onClick={onBackToTables}
              >
                İptal
              </button>
              <button
                type="submit"
                className="admin-button-primary flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Save size={18} />
                <span>Kaydet</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddRecordForm;
