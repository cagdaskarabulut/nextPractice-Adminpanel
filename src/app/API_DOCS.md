# API Yapısı ve İlişkisi

Bu projede iki farklı API dizini bulunmaktadır:

## 1. `/src/app/api`

Bu, **geliştirme ortamında** kullanılan API endpointlerini içerir. Projeyi geliştirirken ve test ederken kullanılır.

İçerdiği temel endpointler:
- `/api/tables` - Tablo listesini döndürür
- `/api/all-tables` - Tüm tabloları döndürür
- `/api/save-tables` - Tabloları seçip kaydetmek için
- `/api/[table]` - Dinamik tablo işlemleri (CRUD)
- `/api/create-table` - Yeni tablo oluşturmak için
- `/api/db-status` - Veritabanı bağlantı durumunu kontrol için

## 2. `/src/app/easy-adminpanel/api`

Bu, **NPM paketi olarak dağıtıldığında** kullanıcının projesine kopyalanacak şablon API endpointlerini içerir.

İçerdiği temel endpointler:
- `/api/tables` - Tablo listesini döndürür
- `/api/all-tables` - Tüm tabloları döndürür
- `/api/save-tables` - Tabloları seçip kaydetmek için
- `/api/[resource]` - Dinamik kaynak işlemleri (CRUD)

## Paylaşılan Kütüphane

Her iki API seti de `src/shared/api-utils.ts` dosyasındaki ortak işlevleri kullanır:

- `getSelectedTables()` - Seçilen tabloları almak için
- `handleApiError()` - API hata yanıtlarını standartlaştırmak için
- `apiSuccess()` - Başarılı API yanıtlarını standartlaştırmak için

## Nasıl Çalışır?

1. **Geliştirme sürecinde**: `/src/app/api` endpointleri kullanılır.
2. **NPM paketi oluşturulduğunda**: `copy-templates.js` betiği, `/src/app/easy-adminpanel/api` klasöründeki şablonları hedef projeye kopyalar.

## Konfigürasyon Dosyası

API'ler aşağıdaki konfigürasyon dosyasını kullanır:
- `selected-tables.json` (kök dizinde) - Kullanıcının seçtiği tabloları saklar

**Not**: Konfigürasyon dosyası bulunmazsa, sistem tüm tabloları seçili olarak kabul eder ve otomatik olarak `selected-tables.json` dosyasını oluşturur. 