# Dinamik CRUD Admin Paneli

Bu proje, Next.js ve React-Admin kullanılarak geliştirilmiş dinamik bir admin panel uygulamasıdır. Vercel PostgreSQL veritabanındaki tablolar için otomatik CRUD (Create, Read, Update, Delete) arayüzleri oluşturur.

## Özellikler

- **Dinamik Tablo Yönetimi**: Kullanıcılar istedikleri tabloları admin paneline ekleyebilir
- **Otomatik CRUD Arayüzleri**: Seçilen tablolar için otomatik olarak liste, ekleme, düzenleme ve silme ekranları oluşturulur
- **Şema Algılama**: Tablo yapısı otomatik olarak algılanır ve uygun form elemanları oluşturulur
- **Modern UI**: Tailwind CSS ve ShadCN UI kullanılarak modern ve kullanıcı dostu bir arayüz

## Kurulum

1. Projeyi klonlayın:
```bash
git clone [repo-url]
cd adminpanel
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyasını oluşturun ve veritabanı bağlantı bilgilerini ekleyin:
```env
POSTGRES_URL="postgres://user:password@host:port/database"
```

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

5. Tarayıcınızda [http://localhost:3000/admin](http://localhost:3000/admin) adresine gidin

## Kullanım

1. Admin paneline giriş yapın
2. Sol menüdeki "+" butonuna tıklayarak yeni bir tablo ekleyin
3. Tablo adını girin (örn: users, products, orders)
4. Tablo eklendikten sonra otomatik olarak CRUD ekranları oluşturulacaktır
5. Sol menüden ilgili tabloya tıklayarak CRUD işlemlerini gerçekleştirebilirsiniz

## Teknik Detaylar

- **Frontend**: Next.js, React-Admin, Tailwind CSS, ShadCN UI
- **Backend**: Next.js API Routes
- **Veritabanı**: Vercel PostgreSQL
- **State Yönetimi**: React Hooks
- **API**: RESTful endpoints

## Geliştirme

Projeye katkıda bulunmak için:

1. Bir fork oluşturun
2. Feature branch'i oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## İletişim

Proje Sahibi - [@your-twitter](https://twitter.com/your-twitter)
Proje Linki: [https://github.com/username/repo](https://github.com/username/repo)
