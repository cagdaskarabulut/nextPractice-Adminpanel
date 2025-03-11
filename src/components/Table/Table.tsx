"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Table.css";

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
  className?: string;
  emptyMessage?: string;
}

export const Table = <T extends Record<string, any>>({
  data,
  columns,
  keyField,
  onRowClick,
  actions,
  className = "",
  emptyMessage = "Veri bulunamadı",
}: TableProps<T>) => {
  return (
    <div className={`admin-table-container ${className}`}>
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.header}</th>
            ))}
            {actions && <th>İşlemler</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="admin-table-empty"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={String(row[keyField])}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={onRowClick ? { cursor: "pointer" } : undefined}
              >
                {columns.map((column) => (
                  <td key={`${String(row[keyField])}-${column.key}`}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="admin-table-actions">{actions(row)}</td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export const TablePagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Sayfa numaralarını sınırlayalım
  let displayedPages = pages;
  if (totalPages > 5) {
    if (currentPage <= 3) {
      displayedPages = [...pages.slice(0, 5), -1, totalPages];
    } else if (currentPage >= totalPages - 2) {
      displayedPages = [1, -1, ...pages.slice(totalPages - 5)];
    } else {
      displayedPages = [
        1,
        -1,
        currentPage - 1,
        currentPage,
        currentPage + 1,
        -1,
        totalPages,
      ];
    }
  }

  return (
    <div className="admin-table-pagination">
      <div className="admin-table-pagination-info">
        {totalItems && itemsPerPage
          ? `Toplam ${totalItems} kayıttan ${
              (currentPage - 1) * itemsPerPage + 1
            } - ${Math.min(
              currentPage * itemsPerPage,
              totalItems
            )} arası gösteriliyor`
          : `Sayfa ${currentPage} / ${totalPages}`}
      </div>
      <div className="admin-table-pagination-controls">
        <button
          className="admin-table-pagination-button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={16} />
        </button>

        {displayedPages.map((page, index) =>
          page === -1 ? (
            <span
              key={`ellipsis-${index}`}
              className="admin-table-pagination-ellipsis"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              className={`admin-table-pagination-button ${
                page === currentPage ? "active" : ""
              }`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          )
        )}

        <button
          className="admin-table-pagination-button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Table;
