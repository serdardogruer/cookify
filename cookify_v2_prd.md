# 🍳 Cookify Core v2.0 – Çoklu Mutfak ve Ortak Dolap Sistemi

## 📘 Genel Bilgiler

- **Proje Adı:** Cookify Core
- **Versiyon:** 2.0
- **Amaç:**
  Kullanıcıların kendi mutfaklarını yönetebilmesi, aile üyeleriyle ortak mutfak paylaşımı yapabilmesi ve dolap/market yönetimini dijitalleştirmesi.

- **Teknolojiler:**
  - **Frontend:** React (Next.js 14, TailwindCSS)
  - **Backend:** Node.js + Express
  - **Veritabanı:** PostgreSQL (UTF8 + Turkish_CI)
  - **ORM:** Prisma
  - **Auth:** JWT + bcrypt
  - **Tema:** Dark (Koyu Tema)

---

## 👤 Kullanıcı Akışı

### 1. Kayıt
- Kullanıcı kayıt olduktan sonra otomatik olarak:
  - `{Adı} Mutfağı` isminde bir mutfak oluşturulur.
  - Bu mutfak aktif olur ve `kitchens` tablosuna eklenir.
  - Her mutfağa benzersiz bir `invite_code` atanır (örn: `AYSE-MTF-2024`).
  - `users` tablosunda `kitchen_id` olarak atanır.
- Kullanıcı **doğrudan profil sayfasına** yönlendirilir.

### 2. Profil Sayfası

**Sidebar Menüsü:**
- 🏠 Site Ayarları
- 👤 Profil Ayarları
- 🔄 Mutfak Değişimi
- ⬆️ Modül Yükseltme
- 🚪 Çıkış

**Ana İçerik:**
- Her kullanıcıya özel alan:
  - **Profil fotoğrafı yükleme / değiştirme**
    - Maksimum dosya boyutu: 5MB
    - İzin verilen formatlar: jpg, png, webp
    - Varsayılan avatar sistemi
  - Aktif mutfak bilgisi görüntüleme
  - **Mutfak davet kodu** (kopyalama butonu ile WhatsApp'a gönderilebilir)
  - Mutfak değiştirme veya katılma işlemleri
  - Mutfaktan ayrılma (ayrıldığında kendi mutfağı yeniden aktifleşir)
- Eski mutfaklar **silinmez**, sadece `status = passive` durumuna alınır.
- Kullanıcı isterse daha sonra tekrar kendi eski mutfağına dönebilir.

**Profil örneği:**
```
👤 Profil Bilgilerim
- Ad Soyad: Ayşe Demir
- E-posta: ayse@example.com
- Profil Fotoğrafı: [Değiştir]

🏠 Mutfak Bilgilerim
- Aktif Mutfak: Ayşe Mutfağı
- Üye Sayısı: 1 kişi
- Mutfak Kodu: AYSE-MTF-2024 [Kopyala] [WhatsApp'a Gönder]

[ Mutfak Değiştir 🔄 ]
[ Mutfaktan Ayrıl 🚪 ]
```

### 3. Mutfak Katılımı
- Bir kullanıcı başka bir mutfağa katılmak isterse:
  - Mutfak sahibinden **davet kodunu** alır.
  - Profil sayfasından "Mutfak Değiştir" butonuna tıklar.
  - Davet kodunu girer.
  - Otomatik olarak o mutfağa katılır (onay gerektirmez).
  - `kitchen_members` tablosuna yeni kayıt eklenir.
  - Kendi mutfağı `passive` durumuna geçer.
- Katıldıktan sonra "Dolap" ve "Market" sayfaları ortak olur.

### 4. Ortak Kullanım
- Aynı mutfaktaki tüm kullanıcılar:
  - **Dolap** ve **Market** verilerini paylaşır.
  - Eklenen, silinen veya düzenlenen her veri anında senkronize olur.

---

## 🧺 Dolap Sayfası (Pantry)

### 📑 Yapı:
**Sidebar:**
- **Malzeme Ekle** (tekli veya toplu ekleme)
- **Kategori Filtreleri:**
  - Sebzeler
  - Meyveler
  - Et Ürünleri
  - Bakliyatlar
  - Süt Ürünleri
  - Tahıllar
  - İçecekler
  - Diğer

**Ana İçerik:**
- Malzemeler kategori bazlı listelenir:
  - **Kolonlar:** Adı | Adet | Birim | Kategori | SKT | Market | Düzenle | Sil

**Örnek tablo:**
| Adı | Adet | Birim | Kategori | SKT | Market | Düzenle | Sil |
|-----|------|--------|----------|------|---------|----------|------|
| Soğan | 2 | kg | Sebzeler | 11.01.2025 | 🛒 | ✏️ | ❌ |
| Domates | 2 | kg | Sebzeler | 11.01.2025 | 🛒 | ✏️ | ❌ |

### 🔧 Özellikler:
- **Tekli veya toplu malzeme ekleme**
- **Malzeme öneri sistemi (autocomplete):** Kullanıcı "do" yazmaya başladığında "domates", "domates salçası" gibi öneriler getirir
- **Stok azalma takibi:** Bir malzeme "stokta az" olarak işaretlenebilir ve otomatik olarak market listesine eklenir
- Market butonu ile "Market" sekmesine aktarım (kategori bilgisi korunur)
- SKT (Son Kullanma Tarihi) alanı isteğe bağlı
- Malzemeler **kategoriye göre gruplanır**
- Malzemeler veritabanına önceden yüklenecek (seed data)

---

## 🏪 Market Sayfası

### 📑 Yapı:
**Sidebar:**
- **Malzeme Ekle**
- **WhatsApp'a Aktar**
- **Yazdır**
- **"Alındı" → Dolaba Ekle**

**Ana İçerik:**
- Dolaptan aktarılan malzemeler burada listelenir.
- Malzemeler **kategoriye göre gruplanır**.
- **Kolonlar:** Adı | Adet | Birim | Kategori | Düzenle | Sil

**Örnek tablo:**
| Adı | Adet | Birim | Kategori | Düzenle | Sil |
|-----|------|--------|----------|----------|------|
| Soğan | 2 | kg | Sebzeler | ✏️ | ❌ |
| Domates | 2 | kg | Sebzeler | ✏️ | ❌ |

### 🔧 Özellikler:
- WhatsApp entegrasyonu (alışveriş listesi paylaşımı)
- Yazdırma fonksiyonu (PDF olarak)
- **"Alındı" butonuyla seçilen ürünleri otomatik olarak dolaba ekler**
  - Ürün hangi kategoride eklenmişse aynı kategoriyle dolaba kaydedilir
- Market sayfası da mutfak bazlıdır (ortak kullanım)
- Kategori filtreleme

---

## 🧩 Veritabanı Yapısı

### `users`
| Alan | Tip | Açıklama |
|------|-----|-----------|
| id | int | Benzersiz kullanıcı ID |
| name | varchar | Kullanıcı adı |
| email | varchar | Kullanıcı e-posta |
| password | varchar | Hashlenmiş parola |
| kitchen_id | int | Aktif mutfak |
| profile_image | varchar | Profil resmi URL |
| created_at | timestamp | Kayıt tarihi |

### `kitchens`
| Alan | Tip | Açıklama |
|------|-----|-----------|
| id | int | Mutfak ID |
| name | varchar | Mutfak adı |
| owner_id | int | Mutfak sahibi |
| invite_code | varchar(unique) | Benzersiz mutfak davet kodu |
| status | enum(active, passive) | Mutfak durumu |
| created_at | timestamp | Oluşturma tarihi |

### `kitchen_members`
| Alan | Tip | Açıklama |
|------|-----|-----------|
| id | int | Kayıt ID |
| kitchen_id | int | Mutfak ID |
| user_id | int | Üye ID |
| role | enum(owner, member) | Kullanıcı rolü |
| joined_at | timestamp | Katılım tarihi |

### `pantry_items`
| Alan | Tip | Açıklama |
|------|-----|-----------|
| id | int | Malzeme ID |
| kitchen_id | int | Mutfak ID |
| name | varchar | Malzeme adı |
| category | varchar | Kategori |
| quantity | float | Adet |
| unit | varchar | Birim |
| expiry_date | date | SKT |
| created_at | timestamp | Eklenme tarihi |

### `market_items`
| Alan | Tip | Açıklama |
|------|-----|-----------|
| id | int | Ürün ID |
| kitchen_id | int | Mutfak ID |
| name | varchar | Ürün adı |
| category | varchar | Kategori |
| quantity | float | Adet |
| unit | varchar | Birim |
| status | enum(pending, done) | Alındı mı? |
| created_at | timestamp | Eklenme tarihi |

### `categories`
| Alan | Tip | Açıklama |
|------|-----|-----------|
| id | int | Kategori ID |
| name | varchar | Kategori adı |
| icon | varchar | Kategori ikonu (opsiyonel) |
| created_at | timestamp | Oluşturma tarihi |

### `ingredients`
| Alan | Tip | Açıklama |
|------|-----|-----------|
| id | int | Malzeme ID |
| name | varchar | Malzeme adı |
| category_id | int | Kategori ID |
| default_unit | varchar | Varsayılan birim |
| created_at | timestamp | Oluşturma tarihi |

### `unit_conversion`
| Alan | Tip | Açıklama |
|------|-----|-----------|
| id | int | ID |
| unit_from | varchar | Dönüştürülecek birim |
| unit_to | varchar | Hedef birim |
| multiplier | float | Dönüşüm katsayısı |

### `modules`
| Alan | Tip | Açıklama |
|------|-----|-----------|
| id | int | Modül ID |
| name | varchar | Modül adı |
| slug | varchar | URL dostu modül adı |
| description | text | Modül açıklaması |
| icon | varchar | Modül ikonu |
| is_core | boolean | Temel modül mü? |
| is_active | boolean | Aktif mi? |
| created_at | timestamp | Oluşturma tarihi |

### `kitchen_modules`
| Alan | Tip | Açıklama |
|------|-----|-----------|
| id | int | Kayıt ID |
| kitchen_id | int | Mutfak ID |
| module_id | int | Modül ID |
| is_enabled | boolean | Mutfak için aktif mi? |
| enabled_at | timestamp | Aktif edilme tarihi |

---

## 🔒 Güvenlik ve Teknik Detaylar

- Şifreler `bcrypt` ile hashlenir
- JWT tabanlı auth yapısı
- PostgreSQL veritabanı UTF8 + Turkish_CI (Türkçe karakter desteği)
- Rol bazlı erişim kontrolü (owner / member)
- Pasif mutfaklara erişim kısıtlıdır
- **Profil resmi güvenliği:**
  - Maksimum dosya boyutu: 5MB
  - İzin verilen formatlar: jpg, png, webp
  - Dosya tipi validasyonu
  - Eski resim otomatik silinir
- **Mutfak davet kodu:**
  - Benzersiz ve tahmin edilemez kod üretimi
  - Kod ile doğrudan katılım (onaysız)

---

## 🎨 Tema

- Varsayılan tema: **Koyu (Dark Mode)**
- TailwindCSS üzerinden dinamik renk geçişi (dark-light toggle opsiyonu ileride)
- UI minimalist, mobil uyumlu (responsive grid layout)

---

## 🧩 Modüler Yapı

### Temel Modüller (v2.0)
- **Dolabım (Pantry)** - Evdeki malzemeleri yönetme
- **Market** - Alışveriş listesi yönetimi
- **Profil** - Kullanıcı ve mutfak ayarları

### Gelecek Modüller
- **Tarifler** - Tarif arama ve ekleme
- **AI Öneri** - Dolaptaki malzemelere göre tarif önerisi
- **Sohbet** - Mutfak içi aile sohbeti
- **Menü Planlama** - Haftalık menü oluşturma
- **Bütçe Takibi** - Market harcama analizi

### Modül Yönetimi
- Her mutfak farklı modüllere sahip olabilir
- Temel modüller (Dolabım, Market, Profil) her zaman aktiftir
- Ek modüller kullanıcı tarafından aktif edilebilir
- Modüller veritabanında `modules` tablosunda saklanır
- Mutfak-modül ilişkisi `kitchen_modules` tablosunda yönetilir

## 🚀 Gelecek Sürümler

- Mobil sürüm (React Native + Expo)
- Modül marketplace (topluluk modülleri)
- API entegrasyonları (market fiyat karşılaştırma)

---

## 🧭 Özet Mantık

- Her kullanıcı **1 aktif mutfağa** sahip olur.
- Aile üyeleri **mutfak davet kodu ile ortak mutfağa katılabilir.**
- Katıldığında "Dolap" ve "Market" **ortaklaşa yönetilir.**
- Mutfaktan ayrıldığında eski mutfağı **pasif durumdan aktife döner.**
- Tüm işlemler veritabanında mutfak ID'sine bağlı olarak çalışır.
- Profil kişiye özel, Dolap/Market mutfak bazlıdır.
- Malzemeler ve kategoriler veritabanına önceden yüklenecek (seed data).
- Hem Dolap hem Market sayfasında kategori bazlı gruplama ve filtreleme vardır.

---

## 📡 API Endpoint'leri (Temel)

### Authentication
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/logout` - Çıkış

### Profil
- `GET /api/profile` - Profil bilgilerini getir
- `PUT /api/profile/update` - Profil bilgilerini güncelle
- `POST /api/profile/upload-image` - Profil resmi yükle
- `DELETE /api/profile/remove-image` - Profil resmini sil

### Mutfak
- `GET /api/kitchen` - Aktif mutfak bilgilerini getir
- `POST /api/kitchen/join` - Davet kodu ile mutfağa katıl
- `POST /api/kitchen/leave` - Mutfaktan ayrıl
- `GET /api/kitchen/members` - Mutfak üyelerini listele

### Dolap (Pantry)
- `GET /api/pantry` - Dolaptaki malzemeleri listele
- `POST /api/pantry/add` - Yeni malzeme ekle
- `PUT /api/pantry/:id` - Malzeme güncelle
- `DELETE /api/pantry/:id` - Malzeme sil
- `POST /api/pantry/:id/move-to-market` - Malzemeyi market'e taşı

### Market
- `GET /api/market` - Market listesini getir
- `POST /api/market/add` - Market'e ürün ekle
- `PUT /api/market/:id` - Ürün güncelle
- `DELETE /api/market/:id` - Ürün sil
- `POST /api/market/:id/move-to-pantry` - Ürünü dolaba taşı (alındı)
- `GET /api/market/export/whatsapp` - WhatsApp formatında liste
- `GET /api/market/export/pdf` - PDF olarak liste

### Kategoriler ve Malzemeler
- `GET /api/categories` - Tüm kategorileri listele
- `GET /api/ingredients` - Malzeme önerileri (autocomplete)
- `GET /api/ingredients/search?q=domates` - Malzeme ara
