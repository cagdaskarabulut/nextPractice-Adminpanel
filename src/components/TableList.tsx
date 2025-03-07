"use client";

import React from "react";
import { PlusCircle, Filter, Plus } from "lucide-react";
import { Table, AvailableTable } from "./types";
import TableManageDialog from "./dialogs/TableManageDialog";

interface TableListProps {
  tables: Table[];
  isDialogOpen: boolean;
  availableTables: AvailableTable[];
  onFetchAllTables: () => Promise<void>;
  onTableSelection: (tableName: string, isSelected: boolean) => void;
  onSaveTableSelection: () => Promise<void>;
  onCloseDialog: () => void;
  onListTable: (tableName: string) => Promise<void>;
  onAddRecord: (tableName: string) => void;
}

const TableList: React.FC<TableListProps> = ({
  tables,
  isDialogOpen,
  availableTables,
  onFetchAllTables,
  onTableSelection,
  onSaveTableSelection,
  onCloseDialog,
  onListTable,
  onAddRecord,
}) => {
  return (
    <div className="bg-gradient-to-r from-slate-50 to-slate-100 min-h-screen p-6 rounded-lg">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          Tablo Yönetimi
        </h1>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
          onClick={onFetchAllTables}
        >
          <PlusCircle size={18} />
          <span>Tabloları Yönet</span>
        </button>
      </div>

      {/* Tablo Yönetim Diyaloğu */}
      {isDialogOpen && (
        <TableManageDialog
          availableTables={availableTables}
          onTableSelection={onTableSelection}
          onSaveTableSelection={onSaveTableSelection}
          onCloseDialog={onCloseDialog}
        />
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
              onClick={onFetchAllTables}
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
                    onClick={() => onListTable(table.name)}
                  >
                    <Filter size={16} />
                    <span>Listele</span>
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                    onClick={() => onAddRecord(table.name)}
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
};

export default TableList;
