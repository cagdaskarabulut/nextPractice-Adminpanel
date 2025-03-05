"use client";

import {
  Admin,
  Resource,
  ListGuesser,
  EditGuesser,
  Create,
  SimpleForm,
  TextInput,
} from "react-admin";
import { useState, useEffect } from "react";
import dataProvider from "@/utils/dataProvider";
import { managedTables } from "@/config/tables";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, CheckSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [schemas, setSchemas] = useState<Record<string, any[]>>({});
  const [refresh, setRefresh] = useState(0);
  const [tableName, setTableName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [deleteSuccess, setDeleteSuccess] = useState("");

  const loadSchemas = async () => {
    try {
      const schemaPromises = managedTables.map(async (table) => {
        const response = await fetch(`/api/schema/${table}`);
        const schema = await response.json();
        return [table, schema];
      });

      const schemaResults = await Promise.all(schemaPromises);
      const schemaMap = Object.fromEntries(schemaResults);
      setSchemas(schemaMap);
      setLoading(false);
    } catch (error) {
      console.error("Error loading schemas:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!tableName.trim()) {
      setError("Tablo adı boş olamaz");
      return;
    }

    try {
      const response = await fetch("/api/tables/manage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tableName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Tablo eklenirken bir hata oluştu");
      }

      setSuccess("Tablo başarıyla eklendi");
      setTableName("");

      // Şemaları yeniden yükle
      setLoading(true);
      await loadSchemas();

      setTimeout(() => {
        setIsAddOpen(false);
        setSuccess("");
      }, 1500);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDelete = async (tableName: string) => {
    try {
      const response = await fetch(
        `/api/tables/manage?tableName=${tableName}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Tablo silinirken bir hata oluştu");
      }

      // Şemaları yeniden yükle
      setLoading(true);
      await loadSchemas();
    } catch (error: any) {
      console.error("Error deleting table:", error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTables.length === 0) return;

    try {
      // Her seçili tablo için silme isteği gönder
      const deletePromises = selectedTables.map((table) =>
        fetch(`/api/tables/manage?tableName=${table}`, {
          method: "DELETE",
        })
      );

      await Promise.all(deletePromises);

      setDeleteSuccess(`${selectedTables.length} tablo başarıyla silindi`);
      setSelectedTables([]);

      // 2 saniye sonra mesajı temizle ve modalı kapat
      setTimeout(() => {
        setIsDeleteOpen(false);
        setDeleteSuccess("");

        // Şemaları yeniden yükle
        setLoading(true);
        loadSchemas();
      }, 2000);
    } catch (error: any) {
      console.error("Error deleting tables:", error);
    }
  };

  const toggleTableSelection = (table: string) => {
    setSelectedTables((prev) =>
      prev.includes(table) ? prev.filter((t) => t !== table) : [...prev, table]
    );
  };

  useEffect(() => {
    loadSchemas();
  }, [refresh]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1976d2]"></div>
        <span className="ml-3 text-gray-600">Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="w-64 bg-gray-100 p-4 flex flex-col mt-16">
        <div className="mt-[64px]">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="flex-1">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[400px]">
              <DialogHeader className="pb-4 border-b">
                <DialogTitle className="text-xl font-semibold text-center">
                  Yeni Tablo Ekle
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 py-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Tablo Adı
                    </label>
                    <Input
                      type="text"
                      value={tableName}
                      onChange={(e) => setTableName(e.target.value)}
                      placeholder="Örn: users, products, orders"
                      className="w-full"
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
                      {error}
                    </p>
                  )}
                  {success && (
                    <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-100">
                      {success}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#1976d2] hover:bg-[#1565c0]"
                >
                  Ekle
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="flex-1 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[400px]">
              <DialogHeader className="pb-4 border-b">
                <DialogTitle className="text-xl font-semibold text-center">
                  Tabloları Sil
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <div className="text-sm text-gray-600 mb-4">
                  Silmek istediğiniz tabloları seçin:
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {managedTables.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Henüz tablo eklenmemiş
                    </p>
                  ) : (
                    managedTables.map((table) => (
                      <div key={table} className="flex items-center space-x-2">
                        <Checkbox
                          id={`table-${table}`}
                          checked={selectedTables.includes(table)}
                          onCheckedChange={() => toggleTableSelection(table)}
                        />
                        <Label
                          htmlFor={`table-${table}`}
                          className="text-sm font-medium"
                        >
                          {table}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
                {deleteSuccess && (
                  <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-100 mt-4">
                    {deleteSuccess}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button
                  onClick={handleBulkDelete}
                  disabled={selectedTables.length === 0}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300"
                >
                  {selectedTables.length === 0
                    ? "Tablo seçin"
                    : `${selectedTables.length} tabloyu sil`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex-1">
        <Admin dataProvider={dataProvider}>
          {managedTables.map((table) => (
            <Resource
              key={table}
              name={table}
              list={ListGuesser}
              edit={EditGuesser}
              create={() => (
                <Create>
                  <SimpleForm>
                    {schemas[table]?.map((field: any) => (
                      <TextInput
                        key={field.column_name}
                        source={field.column_name}
                        label={field.column_name}
                      />
                    ))}
                  </SimpleForm>
                </Create>
              )}
            />
          ))}
        </Admin>
      </div>
    </div>
  );
}
