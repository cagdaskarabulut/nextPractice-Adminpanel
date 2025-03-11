# Easy-AdminPanel Entegrasyon Rehberi

Bu dosya, Easy-AdminPanel npm paketini kendi projenizde başarıyla entegre etmeniz için gereken adımları içerir. Bu rehberi takip ederek, paketimizin tüm görsel ve işlevsel özelliklerinden tam olarak yararlanabilirsiniz.

## Kurulum Adımları

### 1. Gerekli Paketlerin Kurulumu

Öncelikle, paketimizi npm üzerinden yükleyin:

```bash
npm install easy-adminpanel
```

Bu paket, Next.js projelerinde kullanılmak üzere tasarlanmıştır. Ek bağımlılıkları da kurduğunuzdan emin olun:

```bash
npm install lucide-react
```

Ardından, kurulum yardımcısını çalıştırın:

```bash
npx easy-adminpanel-setup
```

Bu komut, gerekli tüm bileşenleri ve stil dosyalarını projenize ekleyecek ve `/admin` yolunda bir admin paneli oluşturacaktır.

### 2. Stil Dosyalarının Entegrasyonu

Easy-AdminPanel, özel bir CSS stilini kullanır. Bu dosyaları projenize dahil etmek için aşağıdaki adımları izleyin:

#### a. Stil Dosyalarını Kopyalayın

`helper_easy-adminpanel/styles/styles.tsx` dosyasını kendi projenize (`src/styles/adminpanel.tsx` olarak) kopyalayın. Bu dosya, tüm stil tanımlarını içerir.

#### b. Stilleri Global Olarak Ekleyin

Next.js projenizin `_app.tsx` veya `layout.tsx` dosyasına şu kodu ekleyin:

```tsx
import { injectStylesheet } from '../styles/adminpanel';

// ...

// En üst düzey bileşeninizin içinde (useEffect içinde)
useEffect(() => {
  // Stilleri enjekte et
  injectStylesheet();
}, []);
```

### 3. Bileşenlerin Kopyalanması ve Düzenlenmesi

Easy-AdminPanel'in bazı özel bileşenlerini ve tiplerinizi projenize kopyalamanız gerekiyor:

1. `helper_easy-adminpanel/components/ui` klasörünü `src/components/ui` dizinine kopyalayın
2. `helper_easy-adminpanel/components/utils` klasörünü `src/components/utils` dizinine kopyalayın
3. `helper_easy-adminpanel/components/dialogs` klasörünü `src/components/dialogs` dizinine kopyalayın
4. `helper_easy-adminpanel/components/types.ts` dosyasını `src/components/types.ts` olarak kopyalayın

### 4. API Rotalarının Oluşturulması

Easy-AdminPanel, aşağıdaki API rotalarını beklemektedir. API klasörünüzdeki rotaları buna göre oluşturun:

1. `/api/tables` - Kullanılabilir tüm tabloları alma
2. `/api/all-tables` - Veritabanındaki tüm tabloları getirme
3. `/api/save-tables` - Seçilen tabloları kaydetme
4. `/api/create-table` - Yeni tablo oluşturma
5. `/api/resources/[table]` - Tablo verileri için CRUD işlemleri

### 5. Font Entegrasyonu

Panel, Inter fontunu kullanır. Font'u projenize eklemek için:

1. Layout dosyanızın `<head>` bölümüne aşağıdaki kodu ekleyin:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

2. Global CSS dosyanıza, `html` elementine font tanımını ekleyin:

```css
html {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

### 6. AdminPanel Bileşeninin Kullanımı

Artık her şeyi hazırladığınıza göre, AdminPanel bileşenini aşağıdaki gibi kullanabilirsiniz:

```tsx
import { AdminPanel } from 'easy-adminpanel';

export default function AdminPage() {
  return (
    <div className="easy-adminpanel">
      <AdminPanel />
    </div>
  );
}
```

Panel şu adreste erişilebilir olacaktır: `http://localhost:3000/admin`

## Sorun Giderme

Eğer tasarımla ilgili sorunlar yaşıyorsanız, aşağıdakileri kontrol edin:

1. Stil dosyasının doğru şekilde enjekte edildiğinden emin olun
2. `easy-adminpanel` CSS sınıfının en üst düzey kapsayıcıya uygulandığından emin olun
3. Inter fontunun yüklendiğinden emin olun
4. Lucide icon paketinin düzgün yüklendiğinden emin olun

## Özelleştirme

AdminPanel'in stillerini özelleştirmek için, `src/styles/adminpanel.tsx` dosyasını düzenleyebilirsiniz. CSS değişkenlerini değiştirerek panel renklerini ve temel görsel özellikleri güncelleyebilirsiniz.

```css
:root {
  --admin-dark-blue-900: #0D1F36; /* Ana arkaplan rengi */
  --admin-dark-blue-800: #12263F; /* Kart arkaplan rengi */
  --admin-blue-500: #3378FF; /* Birincil renk */
  --admin-blue-400: #4A8CFF; /* Birincil renk (hover) */
  /* Diğer renkler... */
}
```

## API Oluşturma Rehberi

API dosyalarının nasıl oluşturulacağı hakkında daha fazla bilgi için `helper_easy-adminpanel/api-docs.md` dosyasını inceleyebilirsiniz. 