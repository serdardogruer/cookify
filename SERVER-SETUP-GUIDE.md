# 🚀 Cookify Sunucu Kurulum Rehberi

Bu rehber, Cookify projesini Hosting Dünyam VDS sunucusuna kurmanız için adım adım talimatlar içerir.

## 📋 Sunucu Bilgileri

- **Backend (API):** Sanal Sunucu #4 - IP: 80.253.246.134
- **Frontend:** CPHost-2 - cookify.tr
- **Domain Yapısı:**
  - Frontend: `https://cookify.tr`
  - Backend API: `https://api.cookify.tr`

## 🔧 Ön Hazırlık

### 1. Domain DNS Ayarları (Hosting Dünyam Paneli)

DNS kayıtlarınızı şu şekilde ayarlayın:

```
A     @              80.253.246.134     (cookify.tr -> Frontend)
A     api           80.253.246.134     (api.cookify.tr -> Backend API)
CNAME www           cookify.tr         (www.cookify.tr -> cookify.tr)
```

### 2. SSH Erişimi

Hosting Dünyam'dan aldığınız SSH bilgileriyle sunucuya bağlanın:

```bash
ssh root@80.253.246.134
# veya
ssh kullanici_adi@80.253.246.134
```

## 🛠️ Sunucu Kurulumu

### Adım 1: Sistem Güncellemesi

```bash
# Sistem paketlerini güncelleyin
sudo apt update && sudo apt upgrade -y

# Gerekli araçları yükleyin
sudo apt install -y curl wget git build-essential
```

### Adım 2: Node.js Kurulumu

```bash
# NodeSource repository ekleyin (Node.js 20.x LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Node.js ve npm yükleyin
sudo apt install -y nodejs

# Versiyonu kontrol edin
node --version  # v20.x.x olmalı
npm --version   # 10.x.x olmalı
```

### Adım 3: PostgreSQL Kurulumu

```bash
# PostgreSQL yükleyin
sudo apt install -y postgresql postgresql-contrib

# PostgreSQL servisini başlatın
sudo systemctl start postgresql
sudo systemctl enable postgresql

# PostgreSQL versiyonu kontrol edin
psql --version
```

### Adım 4: PostgreSQL Database Ayarları

```bash
# PostgreSQL kullanıcısına geçin
sudo -u postgres psql

# SQL komutlarını çalıştırın:
```

```sql
-- Veritabanı kullanıcısı oluşturun
CREATE USER cookify_user WITH PASSWORD 'dgrr1213';

-- Veritabanı oluşturun
CREATE DATABASE cookify OWNER cookify_user;

-- Gerekli yetkileri verin
GRANT ALL PRIVILEGES ON DATABASE cookify TO cookify_user;

-- Çıkış
\q
```

### Adım 5: Nginx Kurulumu (Web Server)

```bash
# Nginx yükleyin
sudo apt install -y nginx

# Nginx'i başlatın
sudo systemctl start nginx
sudo systemctl enable nginx

# Duvarı yapılandırın
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## 📦 Proje Kurulumu

### Adım 6: Proje Dosyalarını Yükleyin

Projenizi sunucuya yüklemek için iki yöntem:

**Yöntem 1: Git ile (Önerilen)**

```bash
# Web dizinine gidin
cd /var/www

# Projeyi klonlayın
sudo git clone https://github.com/serdardogruer/cookify.git
sudo chown -R $USER:$USER cookify
cd cookify
```

**Yöntem 2: FTP/SFTP ile**

FileZilla veya WinSCP kullanarak proje dosyalarını `/var/www/cookify` dizinine yükleyin.

### Adım 7: Backend Kurulumu

```bash
# Backend dizinine gidin
cd /var/www/cookify/backend

# Package'ları yükleyin
npm install

# .env dosyasını oluşturun
cp .env.production .env
nano .env
```

**.env dosyasını düzenleyin:**

```env
# Database
DATABASE_URL="postgresql://cookify_user:dgrr1213@localhost:5432/cookify"

# JWT (GÜVENLİK İÇİN DEĞİŞTİRİN!)
JWT_SECRET="BURAYA-ÇOK-GÜVENLİ-BİR-ŞİFRE-YAZIN-$(openssl rand -base64 32)"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="production"

# CORS
FRONTEND_URL="https://cookify.tr"

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR="uploads"

# Google OAuth (Opsiyonel)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
```

### Adım 8: Prisma Migration ve Build

```bash
# Prisma Client oluşturun
npx prisma generate

# Database migration
npx prisma migrate deploy

# Seed data (İsteğe bağlı - test verileri)
npm run prisma:seed

# TypeScript build
npm run build

# Build'in başarılı olduğunu test edin
node dist/index.js
# Ctrl+C ile durdurun
```

### Adım 9: PM2 ile Backend Servisini Başlatın

```bash
# PM2'yi global olarak yükleyin
sudo npm install -g pm2

# Backend'i PM2 ile başlatın
pm2 start dist/index.js --name cookify-backend

# PM2'yi otomatik başlat
pm2 startup
pm2 save

# Logları kontrol edin
pm2 logs cookify-backend
pm2 status
```

### Adım 10: Frontend Kurulumu

```bash
# Frontend dizinine gidin
cd /var/www/cookify/frontend

# Package'ları yükleyin
npm install

# .env.local dosyasını oluşturun
nano .env.local
```

**.env.local dosyasını düzenleyin:**

```env
# Backend API URL
NEXT_PUBLIC_API_URL=https://api.cookify.tr

# Google OAuth (Opsiyonel)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Adım 11: Frontend Build ve PM2

```bash
# Production build
npm run build

# PM2 ile başlatın
pm2 start npm --name cookify-frontend -- start

# PM2'yi kaydedin
pm2 save

# Her iki servisi kontrol edin
pm2 status
```

## 🌐 Nginx Yapılandırması

### Adım 12: Nginx Site Ayarları

**Backend (api.cookify.tr) için:**

```bash
sudo nano /etc/nginx/sites-available/api.cookify.tr
```

```nginx
server {
    listen 80;
    server_name api.cookify.tr;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # File uploads
    client_max_body_size 10M;
}
```

**Frontend (cookify.tr) için:**

```bash
sudo nano /etc/nginx/sites-available/cookify.tr
```

```nginx
server {
    listen 80;
    server_name cookify.tr www.cookify.tr;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Ayarları aktifleştirin:**

```bash
# Symbolic link oluşturun
sudo ln -s /etc/nginx/sites-available/api.cookify.tr /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/cookify.tr /etc/nginx/sites-enabled/

# Default site'ı kaldırın (isteğe bağlı)
sudo rm /etc/nginx/sites-enabled/default

# Nginx'i test edin
sudo nginx -t

# Nginx'i yeniden başlatın
sudo systemctl restart nginx
```

## 🔒 SSL Sertifikası (HTTPS)

### Adım 13: Let's Encrypt ile SSL

```bash
# Certbot yükleyin
sudo apt install -y certbot python3-certbot-nginx

# SSL sertifikası alın (iki domain için)
sudo certbot --nginx -d cookify.tr -d www.cookify.tr -d api.cookify.tr

# Otomatik yenileme test edin
sudo certbot renew --dry-run
```

Certbot otomatik olarak Nginx ayarlarınızı HTTPS için güncelleyecektir.

## ✅ Test ve Doğrulama

### Adım 14: Servisleri Test Edin

```bash
# PM2 durumunu kontrol edin
pm2 status

# Backend loglarına bakın
pm2 logs cookify-backend --lines 50

# Frontend loglarına bakın
pm2 logs cookify-frontend --lines 50

# Nginx durumunu kontrol edin
sudo systemctl status nginx

# PostgreSQL durumunu kontrol edin
sudo systemctl status postgresql
```

**Tarayıcıdan Test:**

1. **Backend API:** https://api.cookify.tr/health
2. **Frontend:** https://cookify.tr

### Test API Endpoint'leri:

```bash
# Health check
curl https://api.cookify.tr/health

# API version
curl https://api.cookify.tr/api
```

## 🔄 Deploy Sonrası Güncelleme

Proje güncellemelerini deploy etmek için:

```bash
# Proje dizinine gidin
cd /var/www/cookify

# En son kodu çekin
git pull origin main

# Backend güncelleme
cd backend
npm install
npx prisma migrate deploy
npm run build
pm2 restart cookify-backend

# Frontend güncelleme
cd ../frontend
npm install
npm run build
pm2 restart cookify-frontend

# Logları kontrol edin
pm2 logs --lines 20
```

## 📊 Monitoring ve Bakım

### PM2 Komutları

```bash
pm2 status                    # Tüm servisleri görüntüle
pm2 logs                      # Tüm loglar
pm2 logs cookify-backend      # Backend logları
pm2 logs cookify-frontend     # Frontend logları
pm2 restart cookify-backend   # Backend'i restart et
pm2 stop cookify-backend      # Backend'i durdur
pm2 start cookify-backend     # Backend'i başlat
pm2 delete cookify-backend    # Backend'i PM2'den kaldır
pm2 monit                     # Gerçek zamanlı monitoring
```

### Database Backup

```bash
# Database yedekleme
pg_dump -U cookify_user cookify > backup_$(date +%Y%m%d).sql

# Database restore
psql -U cookify_user cookify < backup_20241211.sql
```

## 🚨 Sorun Giderme

### Backend çalışmıyor:

```bash
pm2 logs cookify-backend
# Database bağlantısını kontrol edin
psql -U cookify_user -d cookify -h localhost
```

### Frontend çalışmıyor:

```bash
pm2 logs cookify-frontend
# .env.local dosyasını kontrol edin
cat /var/www/cookify/frontend/.env.local
```

### Nginx hataları:

```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Port zaten kullanılıyor:

```bash
# Portu kullanan process'i bulun
sudo lsof -i :5000
sudo lsof -i :3000

# Process'i sonlandırın
sudo kill -9 <PID>
```

## 📱 Mobil App Ayarları

Mobil uygulamayı yeniden build ederken `.env.mobile` dosyasını güncelleyin:

```bash
cd mobile
nano .env.mobile
```

```env
NEXT_PUBLIC_API_URL=https://api.cookify.tr
```

Ardından yeni APK build edin.

## 📝 Önemli Notlar

1. **Güvenlik:**
   - JWT_SECRET'i mutlaka değiştirin
   - PostgreSQL şifresini güçlü yapın
   - Firewall ayarlarını gözden geçirin

2. **Performans:**
   - PM2 cluster mode kullanabilirsiniz (çoklu CPU)
   - Nginx caching ekleyebilirsiniz
   - Database indexleri optimize edin

3. **Backup:**
   - Düzenli database backup alın
   - Upload klasörünü yedekleyin
   - .env dosyalarını güvende tutun

## 🎉 Kurulum Tamamlandı!

Artık Cookify uygulamanız şu adreslerden erişilebilir:

- **Web App:** https://cookify.tr
- **API:** https://api.cookify.tr

Sorularınız için: [GitHub Issues](https://github.com/serdardogruer/cookify/issues)

---

**Hazırlayan:** Antigravity AI
**Tarih:** 11 Aralık 2024
**Proje:** Cookify v2.0
