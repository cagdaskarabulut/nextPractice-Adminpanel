import Link from "next/link";
import {
  Terminal,
  Server,
  BarChart,
  Database,
  LineChart,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-admin-dark-blue-900 text-white">
      {/* Navbar */}
      <nav className="border-b border-admin-dark-blue-700 bg-admin-dark-blue-800">
        <div className="admin-container py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Terminal size={24} className="text-admin-blue-500" />
            <span className="text-xl font-bold">Easy-AdminPanel</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-admin-gray-400 hover:text-white transition-colors"
            >
              Docs
            </a>
            <a
              href="#"
              className="text-admin-gray-400 hover:text-white transition-colors"
            >
              API
            </a>
            <a
              href="#"
              className="text-admin-gray-400 hover:text-white transition-colors"
            >
              Support
            </a>
            <Link
              href="/easy-adminpanel"
              className="admin-button-primary ml-4 flex items-center gap-2"
            >
              <span>Admin Panel</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="admin-container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 text-white leading-tight">
              PostgreSQL İçin Dinamik{" "}
              <span className="text-admin-blue-500">CRUD</span> Panel
            </h1>
            <p className="text-xl text-admin-gray-300 mb-10">
              Vercel PostgreSQL veritabanınız için otomatik CRUD arayüzleri
              oluşturan modern admin panel çözümü.
            </p>
            <div className="flex justify-center gap-5">
              <Link
                href="/easy-adminpanel"
                className="admin-button-primary text-lg py-3 px-8 flex items-center gap-2"
              >
                <span>Admin Paneline Git</span>
                <ArrowRight size={18} />
              </Link>
              <a
                href="#features"
                className="admin-button-secondary text-lg py-3 px-8"
              >
                Özellikler
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-admin-dark-blue-800">
        <div className="admin-container">
          <h2 className="admin-title text-center mb-16">
            Öne Çıkan Özellikler
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="admin-card flex flex-col items-center text-center p-8">
              <Database size={48} className="text-admin-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">
                Otomatik Tablo Tespiti
              </h3>
              <p className="text-admin-gray-300">
                PostgreSQL veritabanınızdaki tabloları otomatik olarak tespit
                eder ve yönetim için sunar.
              </p>
            </div>

            <div className="admin-card flex flex-col items-center text-center p-8">
              <Server size={48} className="text-admin-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Dinamik CRUD</h3>
              <p className="text-admin-gray-300">
                Seçtiğiniz tablolar için otomatik olarak CRUD arayüzleri
                oluşturur.
              </p>
            </div>

            <div className="admin-card flex flex-col items-center text-center p-8">
              <BarChart size={48} className="text-admin-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">
                Gelişmiş Veri Yönetimi
              </h3>
              <p className="text-admin-gray-300">
                Verilerinizi filtreleme, sıralama ve düzenleme için modern
                araçlar sunar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Usage Section */}
      <section className="py-16">
        <div className="admin-container">
          <div className="admin-card p-8">
            <h2 className="admin-title mb-6">Nasıl Kullanılır?</h2>
            <ol className="space-y-4 text-admin-gray-200">
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-admin-blue-500 text-white font-bold">
                  1
                </span>
                <div>
                  <h3 className="text-white text-lg font-medium mb-1">
                    Admin Paneline Giriş Yapın
                  </h3>
                  <p className="text-admin-gray-300">
                    "Admin Paneline Git" butonuna tıklayarak Easy-AdminPanel
                    yönetim paneline giriş yapın.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-admin-blue-500 text-white font-bold">
                  2
                </span>
                <div>
                  <h3 className="text-white text-lg font-medium mb-1">
                    Tabloları Seçin
                  </h3>
                  <p className="text-admin-gray-300">
                    "Tabloları Yönet" butonuna tıklayın ve yönetmek istediğiniz
                    veritabanı tablolarını seçin.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-admin-blue-500 text-white font-bold">
                  3
                </span>
                <div>
                  <h3 className="text-white text-lg font-medium mb-1">
                    CRUD İşlemlerini Gerçekleştirin
                  </h3>
                  <p className="text-admin-gray-300">
                    Otomatik oluşturulan arayüz ile veri ekleme, okuma,
                    güncelleme ve silme işlemlerini kolayca yapın.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-admin-blue-500 text-white font-bold">
                  4
                </span>
                <div>
                  <h3 className="text-white text-lg font-medium mb-1">
                    Verileri Analiz Edin
                  </h3>
                  <p className="text-admin-gray-300">
                    Dahili veri görselleştirme araçlarıyla verilerinizi analiz
                    edin ve rapor alın.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-admin-dark-blue-700">
        <div className="admin-container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Terminal size={20} className="text-admin-blue-500" />
              <span className="font-bold">Easy-AdminPanel</span>
            </div>
            <div className="text-admin-gray-400 text-sm">
              © 2024 Easy-AdminPanel. Tüm hakları saklıdır.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
