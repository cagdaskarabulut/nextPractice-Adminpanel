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
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [schemas, setSchemas] = useState<Record<string, any[]>>({});
  const [refresh, setRefresh] = useState(0);
  const [tableName, setTableName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isOpen, setIsOpen] = useState(false);

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
        setIsOpen(false);
        setSuccess("");
      }, 1500);
    } catch (error: any) {
      setError(error.message);
    }
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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex flex-col gap-4">
            <DialogTrigger asChild>
              <div className="mt-8">
                <br />
                <br />
                <br />
                <Button variant="outline" size="icon" className="w-full">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </DialogTrigger>
          </div>
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
