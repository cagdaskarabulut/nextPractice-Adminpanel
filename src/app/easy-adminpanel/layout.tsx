export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen">{children}</div>;
}

export const metadata = {
  title: "Easy AdminPanel - Vercel PostgreSQL Yönetim Arayüzü",
  description:
    "Next.js projeleri için otomatik PostgreSQL tablo yönetimi ve CRUD arayüzü",
};
