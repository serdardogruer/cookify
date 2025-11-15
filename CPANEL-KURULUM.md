# 🚀 Cookify - cPanel Kurulum Rehberi

cPanel hosting'e Cookify frontend kurulumu.

## 📋 Gereksinimler

- cPanel hosting hesabı
- Domain: cookify.tr (cPanel IP'ye yönlendirilmiş)
- FTP veya File Manager erişimi

---

## 1️⃣ Local'de Build

```bash
# Frontend klasörüne git
cd frontend

# Production build
npm install
npm run build

# out/ klasörü oluşacak
ls -la out/
```

---

## 2️⃣ cPanel'e Yükleme

### Yöntem 1: File Manager (Önerilen)

1. cPanel'e giriş yap
2. **File Manager** aç
3. `public_html/` klasörüne git
4. Mevcut dosyaları sil (varsa)
5. `out/` klasöründeki **TÜM** dosyaları yükle
6. Dosya yapısı:

```
public_html/
├── index.html
├── _next/
│   ├── static/
│   └── ...
├── dashboard/
├── auth/
└── ...
```

### Yöntem 2: FTP

```bash
# FileZilla veya benzeri FTP client
# Host: ftp.cookify.tr
# Username: cPanel kullanıcı adı
# Password: cPanel şifresi

# out/ klasörünü public_html/'e yükle
```

---

## 3️⃣ Domain Ayarları

### cPanel'de

1. **Domains** → **Domains**
2. **Create a New Domain**
3. Domain: `cookify.tr`
4. Document Root: `/public_html`
5. **Submit**

### www Yönlendirme

1. **Domains** → **Redirects**
2. Type: **Permanent (301)**
3. From: `www.cookify.tr`
4. To: `https://cookify.tr`
5. **Add**

---

## 4️⃣ SSL Sertifikası

### AutoSSL (Otomatik - Önerilen)

1. **Security** → **SSL/TLS Status**
2. `cookify.tr` için **Run AutoSSL**
3. 5-10 dakika bekle
4. ✅ Yeşil tik görünecek

### Let's Encrypt (Manuel)

1. **Security** → **SSL/TLS**
2. **Manage SSL Sites**
3. Domain seç: `cookify.tr`
4. **AutoSSL** veya **Let's Encrypt**
5. **Install**

---

## 5️⃣ .htaccess Ayarları

cPanel File Manager'da `public_html/.htaccess` oluştur:

```apache
# HTTPS Yönlendirme
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# www olmadan yönlendir
RewriteCond %{HTTP_HOST} ^www\.(.*)$ [NC]
RewriteRule ^(.*)$ https://%1/$1 [R=301,L]

# SPA Routing (Next.js için)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Cache Control
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
</IfModule>

# Gzip Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE text/javascript
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/json
</IfModule>
```

---

## 6️⃣ Test

### Browser'da Test

1. https://cookify.tr aç
2. Ana sayfa yüklenmeli
3. Dashboard'a giriş yap
4. API çağrıları çalışmalı

### Developer Tools

```javascript
// Console'da
console.log(process.env.NEXT_PUBLIC_API_URL)
// Çıktı: https://api.cookify.tr
```

---

## 7️⃣ Güncelleme (Yeni Deploy)

```bash
# Local'de
cd frontend
git pull
npm install
npm run build

# out/ klasörünü cPanel'e yükle
# Eski dosyaları sil, yenileri yükle
```

---

## 🔧 Sorun Giderme

### Sayfa 404 Hatası

- `.htaccess` dosyasını kontrol et
- `RewriteEngine On` olmalı
- SPA routing kuralları olmalı

### CSS/JS Yüklenmiyor

- `_next/` klasörü yüklendi mi kontrol et
- Browser cache temizle (Ctrl+Shift+R)
- File permissions kontrol et (644)

### API Çağrıları Çalışmıyor

- `.env.production` doğru mu kontrol et
- CORS ayarları backend'de doğru mu
- Network tab'da API URL'i kontrol et

### SSL Hatası

- AutoSSL çalıştı mı kontrol et
- Domain DNS'i doğru mu
- 24 saat bekle (DNS propagation)

---

## 📊 Performans

### Sayfa Hızı

- Google PageSpeed Insights kullan
- GTmetrix ile test et
- Lighthouse raporu al

### Cache

- Browser cache çalışıyor mu
- CDN kullan (Cloudflare - opsiyonel)

---

## 📝 Notlar

- Her deploy'da `out/` klasörünü tamamen değiştir
- `.htaccess` dosyasını sakla
- SSL sertifikası otomatik yenilenir
- cPanel backup'ları düzenli al

---

## ✅ Kurulum Tamamlandı!

Frontend: https://cookify.tr
Backend: https://api.cookify.tr
