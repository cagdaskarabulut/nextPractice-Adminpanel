"use client";

import React, { useState, useEffect } from "react";
import {
  Admin,
  Resource,
  ListGuesser,
  EditGuesser,
  ShowGuesser,
} from "react-admin";
import jsonServerProvider from "ra-data-json-server";
import { TableManager } from "./TableManager";

interface Table {
  name: string;
  displayName: string;
}

export function AdminPanel() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = "/api/admin"; // API endpoint dizini
  const dataProvider = jsonServerProvider(apiUrl);

  useEffect(() => {
    async function fetchTables() {
      try {
        const response = await fetch(`${apiUrl}/tables`);
        if (!response.ok) {
          throw new Error("Tablolar yüklenirken bir hata oluştu");
        }

        const data = await response.json();
        setTables(data);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu"
        );
        setLoading(false);
      }
    }

    fetchTables();
  }, []);

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (error) {
    return <div className="text-red-500">Hata: {error}</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <TableManager />
      </div>

      {tables.length === 0 ? (
        <div className="p-8 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Henüz hiç tablo eklenmemiş
          </h2>
          <p className="mb-4">
            Admin panelinde gösterilecek tabloları seçmek için "Tabloları Yönet"
            butonunu kullanın.
          </p>
          <p className="text-sm text-gray-500">
            Seçilen tablolar için otomatik CRUD arayüzleri oluşturulacaktır.
          </p>
        </div>
      ) : (
        <Admin dataProvider={dataProvider}>
          {tables.map((table) => (
            <Resource
              key={table.name}
              name={table.name}
              options={{ label: table.displayName }}
              list={ListGuesser}
              edit={EditGuesser}
              show={ShowGuesser}
            />
          ))}
        </Admin>
      )}
    </div>
  );
}
