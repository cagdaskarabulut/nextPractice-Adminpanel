import React from "react";
import { Calendar, Check } from "lucide-react";
import { TableColumn } from "../types";

// PostgreSQL veri tiplerini JavaScript/form elemanı tiplerine eşleştirme
export const getInputTypeForColumnType = (
  columnType: string | undefined
): string => {
  if (!columnType) return "text";

  const type = columnType.toLowerCase();

  if (
    type.includes("int") ||
    type.includes("serial") ||
    type.includes("decimal") ||
    type.includes("numeric") ||
    type.includes("real") ||
    type.includes("double")
  ) {
    return "number";
  }
  if (type.includes("bool")) {
    return "checkbox";
  }
  if (type.includes("date") && !type.includes("timestamp")) {
    return "date";
  }
  if (type.includes("timestamp")) {
    return "datetime-local";
  }
  if (type.includes("time") && !type.includes("timestamp")) {
    return "time";
  }
  if (type.includes("json")) {
    return "textarea-json";
  }

  return "text";
};

// Değeri form tipine uygun şekilde dönüştürme
export const formatValueForInput = (
  value: any,
  inputType: string
): string | number | boolean => {
  if (value === null || value === undefined) {
    switch (inputType) {
      case "number":
        return "";
      case "checkbox":
        return false;
      case "date":
        return "";
      case "datetime-local":
        return "";
      case "time":
        return "";
      case "textarea-json":
        return "";
      default:
        return "";
    }
  }

  switch (inputType) {
    case "number":
      return value === "" ? "" : Number(value);
    case "checkbox":
      return Boolean(value);
    case "date":
      if (typeof value === "string" && value.includes("T")) {
        // ISO string'den sadece tarih kısmını al
        return value.split("T")[0];
      }
      return value;
    case "datetime-local":
      if (typeof value === "string") {
        // ISO string'i datetime-local için formatla
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toISOString().slice(0, 16); // "yyyy-MM-ddThh:mm" formatı
        }
      }
      return value;
    case "textarea-json":
      if (typeof value === "object") {
        return JSON.stringify(value, null, 2);
      }
      try {
        // Düzgün JSON formatında göster
        return JSON.stringify(JSON.parse(value), null, 2);
      } catch {
        return value;
      }
    default:
      return value;
  }
};

// Form değerini veritabanı tipine uygun şekilde dönüştürme
export const parseValueFromInput = (
  value: any,
  inputType: string,
  columnType: string | undefined
): any => {
  switch (inputType) {
    case "number":
      return value === "" ? null : Number(value);
    case "checkbox":
      return Boolean(value);
    case "textarea-json":
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    default:
      return value;
  }
};

// Sütun tipine göre uygun form alanını oluştur
interface DynamicFieldProps {
  column: TableColumn;
  value: any;
  onChange: (
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      | { target: { name: string; value: any; checked?: boolean } }
  ) => void;
  disabled?: boolean;
}

export const DynamicField: React.FC<DynamicFieldProps> = ({
  column,
  value,
  onChange,
  disabled = false,
}) => {
  const inputType = getInputTypeForColumnType(column.type);
  const formattedValue = formatValueForInput(value, inputType);

  switch (inputType) {
    case "checkbox":
      return (
        <div className="flex items-center">
          <input
            type="checkbox"
            id={column.name}
            name={column.name}
            checked={Boolean(formattedValue)}
            onChange={(e) => {
              onChange({
                target: {
                  name: column.name,
                  value: e.target.checked,
                  checked: e.target.checked,
                },
              });
            }}
            disabled={disabled}
            className="h-5 w-5 rounded border-admin-dark-blue-700 bg-admin-dark-blue-900 text-admin-blue-500 focus:ring-admin-blue-500"
          />
          <label
            htmlFor={column.name}
            className="ml-2 block text-sm font-medium text-admin-gray-300"
          >
            {formattedValue ? "Evet" : "Hayır"}
          </label>
        </div>
      );

    case "textarea-json":
      return (
        <textarea
          id={column.name}
          name={column.name}
          value={formattedValue as string}
          onChange={onChange}
          disabled={disabled}
          rows={5}
          className={`admin-input w-full font-mono ${
            disabled
              ? "bg-admin-dark-blue-800 text-admin-gray-500 cursor-not-allowed"
              : ""
          }`}
        />
      );

    case "date":
      return (
        <div className="relative">
          <input
            type="date"
            id={column.name}
            name={column.name}
            value={formattedValue as string}
            onChange={onChange}
            disabled={disabled}
            className={`admin-input w-full pr-10 ${
              disabled
                ? "bg-admin-dark-blue-800 text-admin-gray-500 cursor-not-allowed"
                : ""
            }`}
          />
          <Calendar
            size={16}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-admin-gray-400 pointer-events-none"
          />
        </div>
      );

    case "datetime-local":
      return (
        <div className="relative">
          <input
            type="datetime-local"
            id={column.name}
            name={column.name}
            value={formattedValue as string}
            onChange={onChange}
            disabled={disabled}
            className={`admin-input w-full pr-10 ${
              disabled
                ? "bg-admin-dark-blue-800 text-admin-gray-500 cursor-not-allowed"
                : ""
            }`}
          />
          <Calendar
            size={16}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-admin-gray-400 pointer-events-none"
          />
        </div>
      );

    default:
      return (
        <input
          type={inputType}
          id={column.name}
          name={column.name}
          value={formattedValue as string}
          onChange={onChange}
          disabled={disabled}
          className={`admin-input w-full ${
            disabled
              ? "bg-admin-dark-blue-800 text-admin-gray-500 cursor-not-allowed"
              : ""
          }`}
        />
      );
  }
};
