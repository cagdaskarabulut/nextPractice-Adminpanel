"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface TableManagerProps {
  onTablesChange: () => void;
}

export default function TableManager({ onTablesChange }: TableManagerProps) {
  const [tableName, setTableName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isOpen, setIsOpen] = useState(false);

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
      onTablesChange();
      setTimeout(() => {
        setIsOpen(false);
        setSuccess("");
      }, 1500);
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="p-6">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="w-full">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Tablo Ekle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-4">
              <Input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="Tablo adı"
                className="w-full"
              />
              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-sm text-green-600 bg-green-50 p-2 rounded">
                  {success}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Ekle
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
