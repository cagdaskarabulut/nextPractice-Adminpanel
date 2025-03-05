# Katkıda Bulunma Rehberi

Easy Admin Panel projesine katkıda bulunmak istediğiniz için teşekkür ederiz! Bu rehber, projeye nasıl katkıda bulunabileceğinizi açıklar.

## Geliştirme Ortamı

1. Projeyi klonlayın:
   ```bash
   git clone https://github.com/kullanici/easy-adminpanel.git
   cd easy-adminpanel
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

4. `.env` dosyasını oluşturun (`.env.example` dosyasını kopyalayabilirsiniz):
   ```bash
   cp .env.example .env
   ```
   Ve PostgreSQL bağlantı bilgilerinizi ekleyin.

## Kod Yapısı

- `src/package/`: NPM paketi olarak dağıtılan kodlar
- `src/app/easy-adminpanel/`: Admin panel şablonu
- `src/components/`: React bileşenleri
- `src/config/`: Konfigürasyon dosyaları
- `scripts/`: Build ve paketleme scriptleri

## Katkıda Bulunma Süreci

1. Yeni bir branch oluşturun:
   ```bash
   git checkout -b feature/yeni-ozellik
   ```

2. Değişikliklerinizi yapın ve commit edin:
   ```bash
   git commit -m "feat: Yeni özellik eklendi"
   ```

3. Branch'inizi push edin:
   ```bash
   git push origin feature/yeni-ozellik
   ```

4. GitHub üzerinden bir Pull Request oluşturun.

## Commit Mesajları

Commit mesajlarınızı [Conventional Commits](https://www.conventionalcommits.org/) formatında yazın:

- `feat:` - Yeni bir özellik
- `fix:` - Hata düzeltmesi
- `docs:` - Sadece dokümantasyon değişiklikleri
- `style:` - Kod stilini etkileyen değişiklikler (boşluklar, biçimlendirme vb.)
- `refactor:` - Kod değişiklikleri (hata düzeltmesi veya yeni özellik içermeyen)
- `test:` - Test eklemeleri veya düzeltmeleri
- `chore:` - Yapılandırma, derleme süreci vb. değişiklikler

## Test

Değişikliklerinizi göndermeden önce testleri çalıştırın:

```bash
npm run test
```

## Paket Oluşturma

Paket oluşturmak için:

```bash
npm run build:package
```

Bu komut, `dist/` dizininde dağıtılabilir paket dosyalarını oluşturur.

## Lisans

Bu projeye katkıda bulunarak, katkılarınızın projenin lisansı (MIT) altında lisanslanacağını kabul etmiş olursunuz. 