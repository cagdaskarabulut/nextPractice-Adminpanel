"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface AvailableTable {
  table_name: string;
  selected: boolean;
}

export function TableManager() {
  const [availableTables, setAvailableTables] = useState<AvailableTable[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Tüm tabloları getir
  useEffect(() => {
    async function fetchAllTables() {
      try {
        const response = await fetch("/api/admin/all-tables");
        if (!response.ok) {
          throw new Error("Tablolar yüklenirken bir hata oluştu");
        }

        const data = await response.json();

        // Seçili tabloları getir
        const selectedResponse = await fetch("/api/admin/tables");
        if (!selectedResponse.ok) {
          throw new Error("Seçili tablolar yüklenirken bir hata oluştu");
        }

        const selectedData = await selectedResponse.json();
        const selectedTableNames = selectedData.map((t: any) => t.name);

        // Tabloları birleştir
        const tables = data.map((t: string) => ({
          table_name: t,
          selected: selectedTableNames.includes(t),
        }));

        setAvailableTables(tables);
        setSelectedTables(selectedTableNames);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu"
        );
        setLoading(false);
      }
    }

    fetchAllTables();
  }, []);

  // Tablo seçimini değiştir
  const handleTableSelection = (tableName: string, selected: boolean) => {
    setAvailableTables((prev) =>
      prev.map((t) => (t.table_name === tableName ? { ...t, selected } : t))
    );
  };

  // Seçimleri kaydet
  const saveTableSelection = async () => {
    try {
      const selectedTables = availableTables
        .filter((t) => t.selected)
        .map((t) => t.table_name);

      const response = await fetch("/api/admin/save-tables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tables: selectedTables }),
      });

      if (!response.ok) {
        throw new Error("Tablo seçimleri kaydedilirken bir hata oluştu");
      }

      setSelectedTables(selectedTables);
      setOpen(false);
      window.location.reload(); // Sayfayı yenile
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu"
      );
    }
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (error) {
    return <div className="text-red-500">Hata: {error}</div>;
  }

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Tabloları Yönet</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Yönetilecek Tabloları Seçin</DialogTitle>
            <DialogDescription>
              Admin panelinde gösterilecek tabloları seçin. İşaretlenen tablolar
              için otomatik CRUD arayüzleri oluşturulacaktır.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 max-h-[400px] overflow-y-auto">
            {availableTables.map((table) => (
              <div
                key={table.table_name}
                className="flex items-center space-x-2 mb-2"
              >
                <Checkbox
                  id={table.table_name}
                  checked={table.selected}
                  onCheckedChange={(checked) =>
                    handleTableSelection(table.table_name, checked === true)
                  }
                />
                <Label htmlFor={table.table_name}>{table.table_name}</Label>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="submit" onClick={saveTableSelection}>
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
