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
    <div className="easy-adminpanel-content">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            className="mr-4 p-2 rounded hover:bg-admin-dark-blue-700 transition-colors duration-200"
            onClick={onBackToTables}
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">
            {tables.find((t) => t.name === selectedTable)?.displayName ||
              selectedTable}
          </h1>
        </div>
        <button
          className="easy-adminpanel-button easy-adminpanel-button-primary"
          onClick={() => onAddRecord(selectedTable)}
        >
          <Plus size={18} />
          <span>Yeni Kayıt</span>
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-blue-500"></div>
        </div>
      ) : tableRecords.length === 0 ? (
        <div className="easy-adminpanel-card flex flex-col items-center p-8">
          <div className="mb-4 p-3 bg-admin-dark-blue-700 rounded-full">
            <Filter className="w-8 h-8 text-admin-gray-300" />
          </div>
          <p className="text-admin-gray-300 text-center mb-4">
            Bu tabloda henüz kayıt bulunmuyor.
          </p>
          <button
            className="easy-adminpanel-button easy-adminpanel-button-primary"
            onClick={() => onAddRecord(selectedTable)}
          >
            <Plus size={16} />
            <span>Yeni Kayıt Ekle</span>
          </button>
        </div>
      ) : (
        <div className="overflow-hidden bg-admin-dark-blue-800 rounded-lg shadow-lg border border-admin-dark-blue-700">
          <div className="overflow-x-auto">
            <table className="admin-table w-full">
              <thead>
                <tr>
                  {tableColumns.map((column) => (
                    <th
                      key={column.name}
                      scope="col"
                      className={
                        column.name.toUpperCase() === "İŞLEMLER" ||
                        column.name.toUpperCase() === "ISLEMLER" ||
                        column.name.toUpperCase() === "ACTIONS"
                          ? "İŞLEMLER"
                          : ""
                      }
                    >
                      {column.name.toUpperCase()}
                    </th>
                  ))}
                  {!tableColumns.some(
                    (col) =>
                      col.name.toUpperCase() === "İŞLEMLER" ||
                      col.name.toUpperCase() === "ISLEMLER" ||
                      col.name.toUpperCase() === "ACTIONS"
                  ) && (
                    <th scope="col" className="İŞLEMLER">
                      İŞLEMLER
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {tableRecords.map((record, index) => (
                  <tr key={index} className="hover:bg-admin-dark-blue-700">
                    {tableColumns.map((column) => (
                      <td key={column.name}>
                        {String(record[column.name] || "-")}
                      </td>
                    ))}
                    {!tableColumns.some(
                      (col) =>
                        col.name.toUpperCase() === "İŞLEMLER" ||
                        col.name.toUpperCase() === "ISLEMLER" ||
                        col.name.toUpperCase() === "ACTIONS"
                    ) && (
                      <td className="admin-action-buttons">
                        <button
                          className="admin-edit-button"
                          onClick={() => onEditRecord(record.id)}
                          title="Düzenle"
                        >
                          <Pencil size={16} className="mr-1" />
                        </button>
                        <button
                          className="admin-delete-button"
                          onClick={() => onDeleteConfirm(record.id)}
                          title="Sil"
                        >
                          <Trash2 size={16} className="mr-1" />
                        </button>
                      </td>
                    )}
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
