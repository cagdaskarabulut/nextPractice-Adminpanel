"use client";

import React from "react";
import { Check } from "lucide-react";
import { AvailableTable } from "../types";

interface TableManageDialogProps {
  availableTables: AvailableTable[];
  onTableSelection: (tableName: string, isSelected: boolean) => void;
  onSaveTableSelection: () => Promise<void>;
  onCloseDialog: () => void;
}

const TableManageDialog: React.FC<TableManageDialogProps> = ({
  availableTables,
  onTableSelection,
  onSaveTableSelection,
  onCloseDialog,
}) => {
  return (
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
                    onTableSelection(table.table_name, e.target.checked)
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
            onClick={onCloseDialog}
          >
            İptal
          </button>
          <button
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm"
            onClick={onSaveTableSelection}
          >
            <Check size={16} />
            <span>Kaydet</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableManageDialog;
