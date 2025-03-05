import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6">
          Easy Admin Panel
        </h1>

        <p className="mb-8 text-gray-600 text-center">
          PostgreSQL veritabanınız için otomatik CRUD arayüzü oluşturan admin
          panel çözümü.
        </p>

        <div className="flex justify-center">
          <Link
            href="/easy-adminpanel"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Admin Paneline Git
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold mb-2">Nasıl Kullanılır?</h2>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700">
            <li>Admin paneline gidin</li>
            <li>"Tabloları Yönet" butonuna tıklayın</li>
            <li>Yönetmek istediğiniz PostgreSQL tablolarını seçin</li>
            <li>Otomatik oluşturulan CRUD arayüzlerini kullanmaya başlayın</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
