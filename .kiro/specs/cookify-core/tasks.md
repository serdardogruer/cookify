# Cookify Core v2.0 - Görev Listesi

## Genel Bakış

Bu görev listesi, Cookify Core v2.0'ın modüler yapıda geliştirilmesi için gereken tüm adımları içerir. Her görev, önceki görevlerin tamamlanmasına bağlı olarak ilerler.

---

## Görevler

- [x] 1. Proje yapısını ve temel konfigürasyonu oluştur



  - Monorepo yapısı (frontend + backend) veya ayrı repolar oluştur
  - Package.json dosyalarını yapılandır
  - TypeScript konfigürasyonlarını ayarla
  - ESLint ve Prettier ayarlarını yap
  - _Gereksinimler: 1.1, 1.2, 1.3_

- [x] 1.1 Backend proje yapısını oluştur


  - Express.js kurulumu ve temel yapılandırma
  - Klasör yapısını oluştur (routes, controllers, services, middleware)
  - Environment variables yapılandırması (.env)
  - _Gereksinimler: 1.1, 1.2_

- [x] 1.2 Frontend proje yapısını oluştur


  - Next.js 14 kurulumu (App Router)
  - TailwindCSS kurulumu ve dark tema konfigürasyonu
  - Klasör yapısını oluştur (app, components, hooks, lib)
  - _Gereksinimler: 9.1, 9.2, 9.3_

- [x] 1.3 Prisma ORM kurulumu ve veritabanı bağlantısı


  - Prisma kurulumu ve init
  - PostgreSQL bağlantı ayarları
  - UTF8 ve Turkish_CI collation ayarları
  - _Gereksinimler: 8.7_

- [x] 2. Veritabanı şemasını ve seed verilerini oluştur



  - Prisma schema dosyasını yaz
  - Tüm modelleri tanımla (User, Kitchen, PantryItem, MarketItem, Module vb.)
  - Migration dosyalarını oluştur
  - _Gereksinimler: Tüm veri modelleri_


- [x] 2.1 Seed verilerini hazırla

  - Kategori verilerini oluştur (Sebzeler, Meyveler, Et Ürünleri vb.)
  - Yaygın malzeme verilerini oluştur
  - Temel modül verilerini oluştur (Dolabım, Market, Profil)
  - Birim dönüşüm verilerini oluştur
  - Seed script'ini yaz ve çalıştır
  - _Gereksinimler: 6.1, 6.2, 6.3_

- [x] 3. Authentication sistemi



  - JWT ve bcrypt utility fonksiyonlarını yaz
  - Auth middleware oluştur
  - Kayıt endpoint'i (/api/auth/register)
  - Giriş endpoint'i (/api/auth/login)
  - Çıkış endpoint'i (/api/auth/logout)
  - _Gereksinimler: 1.1, 1.2, 1.3, 1.6, 1.7, 1.8, 8.1, 8.2, 8.3, 8.4_

- [x] 3.1 Kayıt işlemi sırasında otomatik mutfak oluşturma



  - Kullanıcı kaydı sonrası mutfak oluşturma servisi
  - Benzersiz davet kodu üretme fonksiyonu
  - Kitchen_members tablosuna owner kaydı ekleme
  - _Gereksinimler: 1.3, 1.4, 1.5_

- [x] 3.2 Frontend auth sayfaları
  - Login sayfası (/login)
  - Register sayfası (/register)
  - useAuth hook'u
  - Token storage ve yönetimi
  - Protected route wrapper
  - _Gereksinimler: 1.1, 1.6_

- [x] 4. Profil yönetimi modülü
  - Profil bilgilerini getirme endpoint'i
  - Profil güncelleme endpoint'i
  - Profil resmi yükleme endpoint'i
  - Profil resmi silme endpoint'i
  - _Gereksinimler: 2.1, 2.2, 2.8_

- [ ] 4.1 Profil resmi yükleme sistemi
  - Multer middleware kurulumu
  - Dosya boyutu validasyonu (max 5MB)
  - Dosya tipi validasyonu (jpg, png, webp)
  - Eski resim silme fonksiyonu
  - Varsayılan avatar sistemi
  - _Gereksinimler: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 8.6, 8.8_

- [x] 4.2 Frontend profil sayfası
  - Profil bilgileri bileşeni
  - Profil resmi yükleme bileşeni
  - Mutfak bilgileri bileşeni
  - Sidebar menüsü (Site Ayarları, Profil Ayarları, Mutfak Değişimi, Modül Yükseltme, Çıkış)
  - _Gereksinimler: 2.1, 9.4, 9.5_

- [x] 5. Mutfak yönetimi modülü
  - Aktif mutfak bilgilerini getirme endpoint'i
  - Mutfak üyelerini listeleme endpoint'i
  - Davet kodu ile mutfağa katılma endpoint'i
  - Mutfaktan ayrılma endpoint'i
  - _Gereksinimler: 3.1, 3.10_

- [x] 5.1 Mutfağa katılma işlemi
  - Davet kodu validasyonu
  - Eski mutfağı pasif yapma
  - Yeni mutfağa üye ekleme
  - Kitchen_members kaydı oluşturma
  - _Gereksinimler: 3.5, 3.6, 3.7_

- [x] 5.2 Mutfaktan ayrılma işlemi
  - Pasif mutfağı aktif yapma veya yeni mutfak oluşturma
  - Kitchen_members kaydını güncelleme
  - _Gereksinimler: 3.8, 3.9_

- [x] 5.3 Frontend mutfak yönetimi
  - Mutfak bilgileri bileşeni
  - Davet kodu kopyalama butonu
  - WhatsApp paylaşım butonu
  - Mutfak değiştirme modal'ı
  - Mutfaktan ayrılma onay modal'ı
  - _Gereksinimler: 3.1, 3.2, 3.3, 3.4_

- [x] 6. Kategori ve malzeme API'leri
  - Kategorileri listeleme endpoint'i
  - Malzeme arama endpoint'i (autocomplete)
  - Malzeme önerileri endpoint'i
  - _Gereksinimler: 6.4, 6.5, 6.6_

- [x] 7. Dolap (Pantry) modülü
  - Dolap malzemelerini listeleme endpoint'i
  - Kategori filtreleme
  - Malzeme ekleme endpoint'i (tekli)
  - Malzeme ekleme endpoint'i (toplu)
  - Malzeme güncelleme endpoint'i
  - Malzeme silme endpoint'i
  - Malzemeyi market'e taşıma endpoint'i
  - _Gereksinimler: 4.1, 4.2, 4.5, 4.6, 4.8, 4.9, 4.10, 4.12_

- [x] 7.1 Dolap malzeme validasyonları
  - Zorunlu alan kontrolü (ad, adet, birim, kategori)
  - SKT tarih formatı validasyonu
  - Kitchen_id bazlı erişim kontrolü
  - _Gereksinimler: 4.5, 4.11, 8.5_

- [x] 7.2 Frontend dolap sayfası
  - Dolap listesi bileşeni (tablo)
  - Kategori filtreleme sidebar'ı
  - Malzeme ekleme formu (modal)
  - Malzeme düzenleme formu (modal)
  - Malzeme silme onay modal'ı
  - Market'e taşıma butonu
  - Autocomplete input bileşeni
  - _Gereksinimler: 4.1, 4.2, 4.3, 4.4, 4.12_

- [x] 8. Market modülü
  - Market ürünlerini listeleme endpoint'i
  - Kategori filtreleme
  - Ürün ekleme endpoint'i
  - Ürün güncelleme endpoint'i
  - Ürün silme endpoint'i
  - Ürünü dolaba taşıma endpoint'i (alındı)
  - WhatsApp export endpoint'i
  - PDF export endpoint'i
  - _Gereksinimler: 5.1, 5.2, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11_

- [x] 8.1 Market ürün validasyonları
  - Zorunlu alan kontrolü (ad, adet, birim, kategori)
  - Kitchen_id bazlı erişim kontrolü
  - _Gereksinimler: 5.4, 5.5, 8.5_

- [x] 8.2 Frontend market sayfası
  - Market listesi bileşeni (tablo)
  - Kategori filtreleme sidebar'ı
  - Ürün ekleme formu (modal)
  - Ürün düzenleme formu (modal)
  - Ürün silme onay modal'ı
  - Alındı butonu (dolaba taşı)
  - WhatsApp paylaşım butonu
  - Yazdır butonu
  - _Gereksinimler: 5.1, 5.2, 5.3, 5.11_

- [x] 9. Modül yönetimi sistemi
  - Modülleri listeleme endpoint'i
  - Mutfak modüllerini getirme endpoint'i
  - Modül aktif/pasif etme endpoint'i
  - _Gereksinimler: 9.2, 9.3, 9.5, 9.6, 9.7, 9.8_

- [x] 9.1 Frontend modül yönetimi sayfası
  - Mevcut modülleri listeleme
  - Temel modülleri gösterme (her zaman aktif)
  - Gelecek modülleri gösterme (yakında)
  - Modül aktif/pasif toggle
  - _Gereksinimler: 9.3, 9.4, 9.7_

- [x] 10. Ortak mutfak senkronizasyonu
  - Kitchen_id bazlı veri filtreleme
  - Tüm CRUD işlemlerinde mutfak kontrolü
  - _Gereksinimler: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 8.5_

- [x] 11. Hata yönetimi ve validasyon
  - Global error handler middleware
  - Validation middleware (Zod veya Joi)
  - Hata yanıt formatı standardizasyonu
  - Frontend hata gösterimi (toast/notification)
  - _Gereksinimler: 8.4, 9.8_

- [x] 12. UI/UX iyileştirmeleri
  - Loading state'leri
  - Empty state'ler
  - Success/error mesajları
  - Responsive tasarım kontrolü
  - Dark tema ince ayarları
  - _Gereksinimler: 9.1, 9.2, 9.3, 9.8_

- [ ] 13. Test yazımı
  - Backend unit testleri (services)
  - Backend integration testleri (API endpoints)
  - Frontend component testleri
  - E2E testler (kritik akışlar)
  - _Gereksinimler: Tüm gereksinimler_

- [ ] 14. Deployment hazırlığı
  - Environment variables dokümantasyonu
  - Production build testleri
  - Database migration stratejisi
  - Seed data production hazırlığı
  - _Gereksinimler: Tüm gereksinimler_

---

## Notlar

- Her görev tamamlandığında checkbox işaretlenecek
- Görevler sırayla yapılmalı (bağımlılıklar var)
- Tüm görevler zorunludur (testler dahil)
- Her görev için ilgili gereksinim numaraları belirtilmiştir
