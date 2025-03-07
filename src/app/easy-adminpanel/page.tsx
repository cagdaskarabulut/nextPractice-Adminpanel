"use client";

import { AdminPanel } from "@/components/AdminPanel";

export default function EasyAdminPage() {
  const title = process.env.EASY_ADMIN_TITLE || "Easy Admin Panel";

  return (
    <div className="container mx-auto px-4 py-8 bg-red-400">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">{title}</h1>
      <AdminPanel />
    </div>
  );
}
