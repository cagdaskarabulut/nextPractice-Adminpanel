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
      case "datetime-local":
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
      return value === "true" || value === true;
    case "date":
      if (typeof value === "string") {
        if (value.includes("T")) {
          return value.split("T")[0];
        }
        return value;
      }
      return "";
    case "datetime-local":
      if (typeof value === "string") {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toISOString().slice(0, 16);
        }
      }
      return "";
    case "textarea-json":
      if (typeof value === "object") {
        return JSON.stringify(value, null, 2);
      }
      try {
        return JSON.stringify(JSON.parse(value), null, 2);
      } catch {
        return value;
      }
    default:
      return value?.toString() || "";
  }
};

// Form değerini veritabanı tipine uygun şekilde dönüştürme
export const parseValueFromInput = (
  value: any,
  inputType: string,
  columnType: string | undefined
): any => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  switch (inputType) {
    case "number":
      const num = Number(value);
      return isNaN(num) ? null : num;
    case "checkbox":
      return value === "true" || value === true;
    case "date":
    case "datetime-local":
      if (!value) return null;
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date.toISOString();
    case "textarea-json":
      try {
        return typeof value === "string" ? JSON.parse(value) : value;
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
              const target = {
                name: column.name,
                type: "checkbox",
                checked: e.target.checked,
                value: e.target.checked.toString(),
              };
              onChange({ target });
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
