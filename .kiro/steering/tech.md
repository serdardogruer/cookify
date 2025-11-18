---
inclusion: always
---

# Teknoloji Stack

## İletişim Dili
- Kod yazılırken ve geliştirme sırasında **Türkçe** iletişim kurulmalı
- Kod içi yorumlar Türkçe olmalı
- Commit mesajları Türkçe olmalı
- Değişken ve fonksiyon isimleri İngilizce (standart)

## Tercih Edilen Teknolojiler

### Backend
- **Node.js + TypeScript** (PHP yerine tercih edilir - hata oranı düşük)
- **Express.js** framework
- **Prisma ORM** (veritabanı işlemleri için)
- **JWT** authentication

### Veritabanı
- **PostgreSQL** (Production ve Development)
- **Prisma ORM** ile yönetim
- Mevcut veritabanı yapısı korunmalı

### Kod Standartları
- Modern JavaScript (ES6+)
- async/await kullanımı
- Minimal ve verbose olmayan kod
- TypeScript tip güvenliği

## Yaygın Komutlar

### Geliştirme
```bash
# Tüm projeyi başlat (root dizinde)
npm run dev

# Sadece backend
cd backend && npm run dev

# Sadece frontend
cd frontend && npm run dev
```

### Production Build
```bash
# Backend build
cd backend && npm run build

# Frontend build
cd frontend && npm run build
```

### Test
- Test dosyaları `temp/` klasöründe oluşturulmalı
- Her kod bloğu çalışır durumda test edilmeli
- Gerçek verilerle test yapılmalı
- Edge case'ler düşünülmeli
- **Kiro, değişiklik yaptıktan sonra otomatik olarak `npm run dev` ile test etmeli**

## kod yazılırken 
- türkçe iletişim kutulacak

```

## Migration Kuralları

- Her migration adımı test edilmeli
- Geri dönüş planı hazırlanmalı
- Veritabanı backup'ı alınmalı
- Aşamalı geçiş yapılmalı (paralel çalıştırma)
- Her adımda kullanıcı onayı alınmalı
- Downtime minimize edilmeli

## Güvenlik

- Büyük değişiklikler öncesi backup
- Git branch'leri kullanımı (feature/temp-*)
- Test ortamında önce deneme
- Production'a dokunmama

## VDS Deployment Kuralları

### Deployment Garantileri
Kiro, VDS'ye deployment yaparken aşağıdaki sorunların OLMAYACAĞINI garanti eder:

#### ✅ Port Sorunları
- Backend: Port 5000 (Nginx reverse proxy ile 80/443'e yönlendirilir)
- Frontend: Port 3000 (Nginx reverse proxy ile 80/443'e yönlendirilir)
- PostgreSQL: Port 5432 (sadece localhost, dışarıya kapalı)
- Nginx doğru yapılandırılır, port çakışması olmaz
- Firewall kuralları doğru ayarlanır

#### ✅ CSS ve Asset Sorunları
- Next.js production build doğru yapılır
- CSS dosyaları doğru yüklenir
- Tailwind CSS production'da çalışır
- Static dosyalar (images, fonts) doğru serve edilir
- Next.js image optimization aktif ve çalışır durumda
- Cache ayarları doğru yapılandırılır

#### ✅ Fotoğraf/Dosya Yükleme
- Multer middleware doğru yapılandırılır
- Upload klasörü (/var/www/cookify-backend/uploads) oluşturulur
- Klasör izinleri doğru ayarlanır (755 veya 775)
- Nginx, uploads klasörünü doğru serve eder
- File size limitleri ayarlanır (backend ve nginx)
- Desteklenen dosya formatları kontrol edilir
- Yüklenen dosyalar API üzerinden erişilebilir olur

#### ✅ Veritabanı Kurulumu
- PostgreSQL doğru kurulur ve başlatılır
- cookify veritabanı oluşturulur
- cookify_user kullanıcısı oluşturulur ve yetkilendirilir
- Prisma migration sorunsuz çalışır
- Prisma client generate edilir
- Database connection string doğru yapılandırılır
- Seed data (varsa) yüklenir

#### ✅ Environment Variables
- .env.production dosyaları .env olarak kopyalanır
- Tüm gerekli environment variables tanımlanır
- Güvenli şifreler oluşturulur
- CORS ayarları production domain'leri içerir
- JWT secret güvenli ve unique olur

#### ✅ PM2 Process Management
- Backend PM2 ile başlatılır ve çalışır durumda olur
- Frontend PM2 ile başlatılır ve çalışır durumda olur
- PM2 startup script oluşturulur (sunucu yeniden başlatıldığında otomatik başlar)
- PM2 logs düzgün çalışır
- Process'ler crash olursa otomatik restart olur

#### ✅ Nginx Yapılandırması
- Reverse proxy doğru yapılandırılır
- SSL sertifikası (Let's Encrypt) kurulur
- HTTPS yönlendirmesi aktif olur
- Gzip compression aktif olur
- Client max body size ayarlanır (dosya yükleme için)
- Proxy headers doğru ayarlanır
- Cache headers optimize edilir

#### ✅ DNS ve Domain
- A record'lar doğru ayarlanır
- cookify.tr → VDS IP
- api.cookify.tr → VDS IP
- www.cookify.tr → VDS IP (opsiyonel)
- DNS propagation kontrol edilir

### Deployment Checklist
Kiro, deployment yaparken şu adımları takip eder:

1. **Ön Kontrol**
   - VDS'ye SSH bağlantısı test edilir
   - Gerekli paketler kurulu mu kontrol edilir (Node.js, PostgreSQL, Nginx)
   - Disk alanı yeterli mi kontrol edilir

2. **Veritabanı Kurulumu**
   - PostgreSQL kurulur ve başlatılır
   - Veritabanı ve kullanıcı oluşturulur
   - Connection test edilir

3. **Backend Deployment**
   - Dosyalar /var/www/cookify-backend'e yüklenir
   - npm install çalıştırılır
   - .env.production → .env kopyalanır ve düzenlenir
   - Prisma migration çalıştırılır
   - Build yapılır (npm run build)
   - PM2 ile başlatılır
   - Health check yapılır (curl localhost:5000)

4. **Frontend Deployment**
   - Dosyalar /var/www/cookify-frontend'e yüklenir
   - npm install çalıştırılır
   - .env.production kullanılır
   - Build yapılır (npm run build)
   - PM2 ile başlatılır
   - Health check yapılır (curl localhost:3000)

5. **Nginx Yapılandırması**
   - Config dosyası oluşturulur
   - Syntax test edilir (nginx -t)
   - Symlink oluşturulur
   - Nginx restart edilir
   - HTTP erişim test edilir

6. **SSL Kurulumu**
   - Certbot kurulur
   - SSL sertifikası alınır
   - HTTPS erişim test edilir
   - Auto-renewal test edilir

7. **Son Kontroller**
   - PM2 list kontrol edilir
   - Nginx status kontrol edilir
   - PostgreSQL status kontrol edilir
   - Port'lar kontrol edilir
   - Logs kontrol edilir
   - Frontend'e tarayıcıdan erişim test edilir
   - Backend API'ye istek atılır
   - Dosya yükleme test edilir
   - Veritabanı bağlantısı test edilir

### Sorun Giderme
Eğer deployment sırasında sorun çıkarsa:
- Detaylı log kayıtları tutulur
- Her adım test edilir
- Sorun tespit edilir ve çözülür
- Kullanıcıya bilgi verilir
- Gerekirse rollback yapılır

## 🎯 Deployment Not Sistemi

### ZORUNLU KURAL: Deployment Log Tutma
Kiro, VDS'ye deployment yaparken **MUTLAKA** aşağıdaki işlemleri yapar:

#### 1. Deployment Öncesi
- `tools/deployment-log.md` dosyasını oku (varsa)
- Önceki deployment'larda yapılan değişiklikleri gör
- Önceki sorunları ve çözümleri hatırla

#### 2. Deployment Sırasında
- Her adımı `tools/deployment-log.md` dosyasına yaz
- Hangi komutları çalıştırdığını kaydet
- Hangi dosyaları değiştirdiğini kaydet
- Hangi ayarları yaptığını kaydet
- Karşılaşılan sorunları ve çözümleri kaydet

#### 3. Deployment Sonrası
- Yapılan tüm değişiklikleri özetle
- Test sonuçlarını kaydet
- Çalışan/çalışmayan özellikleri listele
- Sonraki deployment için notlar bırak

### Deployment Log Formatı
```markdown
# Deployment Log

## [Tarih: 2025-11-18 15:00] - İlk Deployment

### Yapılan İşlemler:
1. PostgreSQL kuruldu
2. Backend deploy edildi
3. Frontend deploy edildi
4. Nginx yapılandırıldı
5. SSL kuruldu

### Değiştirilen Dosyalar:
- /etc/nginx/sites-available/cookify
- /var/www/cookify-backend/.env
- /var/www/cookify-frontend/.env.local

### Çalıştırılan Komutlar:
```bash
sudo apt install postgresql
npm install
npm run build
pm2 start
```

### Karşılaşılan Sorunlar:
- Sorun 1: Port 5000 çakışması → Çözüm: Eski process öldürüldü
- Sorun 2: CSS yüklenmiyor → Çözüm: Next.js cache temizlendi

### Test Sonuçları:
✅ Backend API çalışıyor
✅ Frontend açılıyor
✅ CSS yükleniyor
✅ Fotoğraf yükleme çalışıyor
✅ Veritabanı bağlantısı OK

### Sonraki Deployment İçin Notlar:
- PM2 process'leri önce durdur
- Cache'i temizle
- Migration'ları kontrol et
```

### 🔴 ÖNEMLİ: Lokal = VDS Garantisi

**KURAL:** Lokalde nasıl çalışıyorsa, VDS'de de AYNEN öyle çalışmalı!

#### Lokal Test Zorunluluğu:
1. **Her değişiklikten sonra lokalde test et**
   - Backend değişikliği → `cd backend && npm run dev` → Test et
   - Frontend değişikliği → `cd frontend && npm run dev` → Test et
   - Veritabanı değişikliği → Migration çalıştır → Test et

2. **Lokal çalışıyorsa, VDS'ye deploy et**
   - Aynı Node.js versiyonu kullan
   - Aynı npm paketleri kullan
   - Aynı environment variables kullan (sadece URL'ler değişir)
   - Aynı port yapılandırması kullan

3. **VDS'de sorun çıkarsa, lokalde tekrar test et**
   - Sorunu lokalde reproduce et
   - Lokalde çöz
   - Lokalde test et
   - VDS'ye tekrar deploy et

#### Environment Parity (Ortam Eşitliği):
```
Lokal Development          VDS Production
─────────────────          ──────────────
Node.js 18+         →      Node.js 18+
PostgreSQL 14+      →      PostgreSQL 14+
npm 9+              →      npm 9+
Prisma 5.x          →      Prisma 5.x
Next.js 14          →      Next.js 14
Express 4.x         →      Express 4.x

localhost:5000      →      api.cookify.tr (Nginx → :5000)
localhost:3000      →      cookify.tr (Nginx → :3000)
localhost:5432      →      localhost:5432
```

#### Deployment Öncesi Checklist:
- [ ] Lokalde backend çalışıyor mu? (`npm run dev`)
- [ ] Lokalde frontend çalışıyor mu? (`npm run dev`)
- [ ] Lokalde CSS düzgün yükleniyor mu?
- [ ] Lokalde fotoğraf yükleme çalışıyor mu?
- [ ] Lokalde veritabanı bağlantısı çalışıyor mu?
- [ ] Lokalde API istekleri çalışıyor mu?
- [ ] Production build çalışıyor mu? (`npm run build`)
- [ ] .env.production dosyaları hazır mı?
- [ ] Deployment log okundu mu?

### 📝 Deployment Log Okuma Zorunluluğu

**HER DEPLOYMENT ÖNCESİ:**
```bash
# 1. Deployment log'u oku
cat tools/deployment-log.md

# 2. Önceki sorunları hatırla
# 3. Önceki çözümleri uygula
# 4. Yeni değişiklikleri kaydet
```

**Kiro, deployment yapmadan önce MUTLAKA şunları yapar:**
1. `tools/deployment-log.md` dosyasını okur
2. Önceki deployment'larda ne yapıldığını görür
3. Önceki sorunları ve çözümleri hatırlar
4. Aynı hataları tekrar yapmaz
5. Yeni deployment'ı log'a ekler

### 🚨 Kritik Hatırlatmalar

1. **Her deployment'ı logla**
2. **Lokal test et, sonra deploy et**
3. **Önceki log'u oku, sonra deploy et**
4. **Sorun çıkarsa, log'a yaz**
5. **Çözüm bulursan, log'a yaz**
6. **Sonraki deployment için not bırak**
