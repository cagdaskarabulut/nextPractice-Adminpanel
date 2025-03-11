# API Yapısı ve İlişkisi

Bu projede tek bir ana API dizini bulunmaktadır: `/src/app/api`

## API Organizasyonu

API'ler aşağıdaki yapıda organize edilmiştir:

### 1. Tablo Yönetimi
- `/api/tables` - Seçilen tabloların listesini döndürür (GET) ve yeni tablo oluşturur (POST)
- `/api/all-tables` - Tüm tabloları döndürür (GET)
- `/api/save-tables` - Tablo seçimlerini kaydeder (POST)

### 2. Tablo Veri İşlemleri
- `/api/resources/[resource]` - Dinamik kaynak işlemleri (CRUD):
  - GET: Tüm kayıtları veya ID ile belirli bir kaydı getirir
  - POST: Yeni kayıt ekler
  - PUT: Mevcut kaydı günceller
  - DELETE: Kaydı siler

### 3. Altyapı ve Durum
- `/api/db-status` - Veritabanı bağlantı durumunu kontrol eder (GET)

## Ortak Kütüphane

Tüm API'ler `src/shared/api-utils.ts` dosyasındaki ortak işlevleri kullanır:

- `getSelectedTables()` - Seçilen tabloları almak için
- `handleApiError()` - API hata yanıtlarını standartlaştırmak için
- `apiSuccess()` - Başarılı API yanıtlarını standartlaştırmak için

## Yapılan İyileştirmeler:

1. **Kod Tekrarını Azaltma**: Ortak işlevler tek bir kütüphaneye taşındı
2. **Tutarlı API Yanıtları**: Tüm API'ler aynı formatta yanıtlar döndürüyor
3. **Merkezi Hata Yönetimi**: Tüm hatalar tek bir fonksiyonla yönetiliyor
4. **Daha İyi Organizasyon**: API'ler yaptıkları işlere göre sınıflandırıldı
5. **Tek Bir API Seti**: Tüm API'ler tek bir `/api` klasörü altında toplandı, duplicate endpointler kaldırıldı

## API İstek Örnekleri

### Tablo Oluşturma

```javascript
// POST /api/tables
{
  "name": "yeni_tablo",  // veya "tableName": "yeni_tablo"
  "columns": [
    { "name": "ad", "type": "varchar(100)", "nullable": false },
    { "name": "soyad", "type": "varchar(100)" },
    { "name": "yas", "type": "integer" }
  ]
}
```

### Kayıt İşlemleri

```javascript
// GET /api/resources/users
// GET /api/resources/users?id=1
// POST /api/resources/users
{
  "ad": "Ahmet",
  "soyad": "Yılmaz",
  "yas": 30
}
// PUT /api/resources/users
{
  "id": 1,
  "ad": "Ahmet",
  "soyad": "Yılmaz",
  "yas": 31
}
// DELETE /api/resources/users?id=1
```

## Konfigürasyon Dosyası

API'ler aşağıdaki konfigürasyon dosyasını kullanır:
- `selected-tables.json` (kök dizinde) - Kullanıcının seçtiği tabloları saklar

**Not**: Konfigürasyon dosyası bulunmazsa, sistem tüm tabloları seçili olarak kabul eder ve otomatik olarak `selected-tables.json` dosyasını oluşturur. 