# 🚀 Cookify Deployment Rehberi

Bu rehber, Cookify projesini canlıya almak için gereken tüm adımları içerir.

## 📋 İçindekiler

1. [Domain ve Hosting Seçimi](#1-domain-ve-hosting-seçimi)
2. [Önerilen Yol: Vercel + Railway](#2-önerilen-yol-vercel--railway-ücretsiz)
3. [Alternatif: VPS Deployment](#3-alternatif-vps-deployment)
4. [Hazırlık Adımları](#4-hazırlık-adımları)
5. [Güvenlik Kontrolleri](#5-güvenlik-kontrolleri)
6. [Deployment Sırası](#6-deployment-sırası)
7. [Maliyet Tahmini](#7-maliyet-tahmini)

---

## 1️⃣ Domain ve Hosting Seçimi

### Domain Sağlayıcıları

**Türkiye:**
- [Natro](https://www.natro.com)
- [Turhost](https://www.turhost.com)
- [Hostinger](https://www.hostinger.com.tr)

**Uluslararası:**
- [Namecheap](https://www.namecheap.com)
- [GoDaddy](https://www.godaddy.com)
- [Cloudflare](https://www.cloudflare.com) (Domain + CDN)

**Önerilen Domain İsimleri:**
- cookify.com
- cookify.app
- cookify.io

### Hosting Seçenekleri

#### Ücretsiz Başlangıç (Önerilen)
- **Frontend:** [Vercel](https://vercel.com) - Next.js için optimize
- **Backend:** [Railway](https://railway.app) veya [Render](https://render.com)
- **Database:** [PlanetScale](https://planetscale.com) veya [Supabase](https://supabase.com)

#### Ücretli VPS (Daha fazla kontrol)
- **DigitalOcean** - $6/ay (1GB RAM)
- **Hetzner Cloud** - €4/ay (2GB RAM)
- **Linode** - $5/ay
- **Vultr** - $5/ay

---

## 2️⃣ Önerilen Yol: Vercel + Railway (ÜCRETSİZ)

### Avantajları
✅ Ücretsiz başlangıç planı  
✅ Kolay deployment  
✅ Otomatik SSL sertifikası  
✅ Git entegrasyonu  
✅ Otomatik scaling  
✅ CDN dahil  

### A) Frontend (Next.js) - Vercel'e Deploy

#### 1. GitHub'a Projeyi Push Et

```bash
# GitHub'da yeni repo oluştur
# Sonra local'den push et
git remote add origin https://github.com/kullaniciadi/cookify.git
git branch -M main
git push -u origin main
```

#### 2. Vercel'de Deployment

1. [Vercel](https://vercel.com) hesabı aç
2. "Add New Project" tıkla
3. GitHub'dan projeyi seç
4. **Root Directory:** `frontend` seç
5. **Framework Preset:** Next.js (otomatik algılar)
6. **Environment Variables** ekle:

```env
NEXT_PUBLIC_API_URL=https://cookify-api.railway.app
```

7. "Deploy" tıkla
8. Deployment tamamlandığında URL'i al (örn: cookify.vercel.app)

#### 3. Custom Domain Bağla

1. Vercel Dashboard > Settings > Domains
2. Domain adını ekle (örn: cookify.com)
3. DNS kayıtlarını güncelle:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.21.21
```

### B) Backend (Express) - Railway'e Deploy

#### 1. Railway Hesabı Aç

1. [Railway](https://railway.app) hesabı aç
2. GitHub ile giriş yap

#### 2. PostgreSQL Database Oluştur

1. "New Project" tıkla
2. "Provision PostgreSQL" seç
3. Database oluşturuldu
4. "Variables" sekmesinden `DATABASE_URL` kopyala

#### 3. Backend Deploy Et

1. "New" > "GitHub Repo" seç
2. Cookify reposunu seç
3. **Root Directory:** `backend` seç
4. **Environment Variables** ekle:

```env
DATABASE_URL=postgresql://postgres:password@host:5432/railway
JWT_SECRET=super-guclu-secret-key-buraya-yaz-min-32-karakter
FRONTEND_URL=https://cookify.vercel.app
PORT=5000
NODE_ENV=production
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
```

5. "Deploy" tıkla

#### 4. Database Migration

Railway'de backend servisine tıkla > "Settings" > "Deploy Logs"

```bash
# Migration çalıştır
npx prisma migrate deploy

# Seed data ekle
npx prisma db seed
```

#### 5. Custom Domain (Opsiyonel)

1. Railway Dashboard > Settings > Domains
2. "Generate Domain" veya custom domain ekle
3. Backend URL'i al (örn: cookify-api.railway.app)
4. Vercel'deki `NEXT_PUBLIC_API_URL`'i güncelle

---

## 3️⃣ Alternatif: VPS Deployment

### Gereksinimler
- Ubuntu 22.04 LTS sunucu
- En az 1GB RAM
- 20GB disk alanı
- Root erişimi

### Adım 1: Sunucu Hazırlığı

```bash
# SSH ile bağlan
ssh root@sunucu-ip-adresi

# Sistem güncellemesi
apt update && apt upgrade -y

# Gerekli paketleri kur
apt install -y curl git nginx postgresql postgresql-contrib
```

### Adım 2: Node.js Kurulumu

```bash
# Node.js 18.x kur
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# PM2 kur (process manager)
npm install -g pm2

# Versiyon kontrol
node --version
npm --version
```

### Adım 3: PostgreSQL Kurulumu

```bash
# PostgreSQL başlat
systemctl start postgresql
systemctl enable postgresql

# Database oluştur
sudo -u postgres psql

# PostgreSQL içinde:
CREATE DATABASE cookify;
CREATE USER cookify_user WITH PASSWORD 'güçlü-şifre';
GRANT ALL PRIVILEGES ON DATABASE cookify TO cookify_user;
\q
```

### Adım 4: Projeyi Klonla

```bash
# Proje dizini oluştur
mkdir -p /var/www
cd /var/www

# GitHub'dan klonla
git clone https://github.com/kullaniciadi/cookify.git
cd cookify
```

### Adım 5: Backend Kurulumu

```bash
cd /var/www/cookify/backend

# Dependencies kur
npm install

# .env dosyası oluştur
nano .env
```

**.env içeriği:**
```env
DATABASE_URL="postgresql://cookify_user:güçlü-şifre@localhost:5432/cookify"
JWT_SECRET="super-guclu-secret-key-min-32-karakter"
FRONTEND_URL="https://cookify.com"
PORT=5000
NODE_ENV="production"
```

```bash
# Prisma migration
npx prisma generate
npx prisma migrate deploy
npx prisma db seed

# Build
npm run build

# PM2 ile başlat
pm2 start dist/index.js --name cookify-api
pm2 save
pm2 startup
```

### Adım 6: Frontend Kurulumu

```bash
cd /var/www/cookify/frontend

# Dependencies kur
npm install

# .env.production oluştur
nano .env.production
```

**.env.production içeriği:**
```env
NEXT_PUBLIC_API_URL=https://api.cookify.com
```

```bash
# Build
npm run build

# PM2 ile başlat
pm2 start npm --name cookify-web -- start
pm2 save
```

### Adım 7: Nginx Yapılandırması

```bash
# Nginx config oluştur
nano /etc/nginx/sites-available/cookify
```

**Nginx Config:**
```nginx
# Frontend
server {
    listen 80;
    server_name cookify.com www.cookify.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.cookify.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Config'i aktifleştir
ln -s /etc/nginx/sites-available/cookify /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Adım 8: SSL Sertifikası (Let's Encrypt)

```bash
# Certbot kur
apt install -y certbot python3-certbot-nginx

# SSL sertifikası al
certbot --nginx -d cookify.com -d www.cookify.com -d api.cookify.com

# Otomatik yenileme test
certbot renew --dry-run
```

### Adım 9: Firewall Ayarları

```bash
# UFW kur ve yapılandır
apt install -y ufw

ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

---

## 4️⃣ Hazırlık Adımları

### A) Environment Variables Hazırla

#### Frontend (.env.production)
```env
NEXT_PUBLIC_API_URL=https://api.cookify.com
```

#### Backend (.env.production)
```env
DATABASE_URL=postgresql://user:pass@host:5432/cookify
JWT_SECRET=super-guclu-secret-key-min-32-karakter-onemli
FRONTEND_URL=https://cookify.com
NODE_ENV=production
PORT=5000
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
```

### B) Production Build Test (Local)

```bash
# Frontend test
cd frontend
npm run build
npm start
# http://localhost:3000 kontrol et

# Backend test
cd backend
npm run build
node dist/index.js
# http://localhost:5000/health kontrol et
```

### C) Database Migration Hazırlığı

```bash
cd backend

# Migration dosyalarını kontrol et
npx prisma migrate status

# Production'a deploy
npx prisma migrate deploy

# Seed data
npx prisma db seed
```

---

## 5️⃣ Güvenlik Kontrolleri

### Deployment Öncesi Checklist

- [ ] **JWT_SECRET** değiştirildi (min 32 karakter, rastgele)
- [ ] **Database şifresi** güçlü (min 16 karakter)
- [ ] **CORS ayarları** sadece kendi domain'e izin veriyor
- [ ] **Rate limiting** aktif (DDoS koruması)
- [ ] **SSL sertifikası** aktif (HTTPS)
- [ ] **Environment variables** güvenli ve gizli
- [ ] **Database backup** planı yapıldı
- [ ] **.env dosyaları** .gitignore'da
- [ ] **API endpoint'leri** authentication gerektiriyor
- [ ] **File upload** limitleri ayarlandı
- [ ] **Error messages** detaylı bilgi vermiyor (production)

### Önerilen Güvenlik Paketleri

```bash
# Backend'e ekle
npm install helmet express-rate-limit cors

# Rate limiting örneği
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100 // 100 istek
});

app.use('/api/', limiter);
```

---

## 6️⃣ Deployment Sırası

### Önerilen Sıralama

1. **Database** → PostgreSQL kurulumu/oluşturma
2. **Backend** → API deploy ve test
3. **Frontend** → Web app deploy
4. **Domain** → DNS ayarları
5. **SSL** → Sertifika kurulumu
6. **Test** → Tüm özellikleri test et

### Deployment Komutları

```bash
# 1. Git'e push
git add .
git commit -m "Production ready"
git push origin main

# 2. Backend deploy (Railway otomatik)
# 3. Frontend deploy (Vercel otomatik)

# 4. Migration çalıştır
npx prisma migrate deploy

# 5. Seed data
npx prisma db seed

# 6. Health check
curl https://api.cookify.com/health
```

---

## 7️⃣ Maliyet Tahmini

### Ücretsiz Başlangıç Planı

| Servis | Plan | Maliyet |
|--------|------|---------|
| Vercel | Hobby | **Ücretsiz** |
| Railway | Starter | **$5 kredi/ay** |
| Domain | .com | **~$10/yıl** |
| **TOPLAM** | | **~$60/yıl** |

### Ölçeklendikçe (Orta Seviye)

| Servis | Plan | Maliyet |
|--------|------|---------|
| Vercel | Pro | $20/ay |
| Railway | Developer | $20/ay |
| Database | Dedicated | $15/ay |
| Domain | .com | $10/yıl |
| CDN | Cloudflare | Ücretsiz |
| **TOPLAM** | | **~$55/ay** |

### Yüksek Trafik (Büyük Ölçek)

| Servis | Plan | Maliyet |
|--------|------|---------|
| VPS | 4GB RAM | $20/ay |
| Database | Managed | $50/ay |
| CDN | Cloudflare Pro | $20/ay |
| Backup | Automated | $10/ay |
| Monitoring | Datadog | $15/ay |
| **TOPLAM** | | **~$115/ay** |

---

## 8️⃣ Deployment Sonrası

### Monitoring ve Bakım

```bash
# PM2 monitoring (VPS için)
pm2 monit

# Logları kontrol et
pm2 logs cookify-api
pm2 logs cookify-web

# Restart
pm2 restart all

# Update
cd /var/www/cookify
git pull
cd backend && npm install && npm run build
cd ../frontend && npm install && npm run build
pm2 restart all
```

### Backup Stratejisi

```bash
# Database backup (günlük)
pg_dump cookify > backup_$(date +%Y%m%d).sql

# Otomatik backup (crontab)
crontab -e

# Her gün saat 03:00'te backup
0 3 * * * pg_dump cookify > /backups/cookify_$(date +\%Y\%m\%d).sql
```

### Monitoring Araçları

- **Uptime:** [UptimeRobot](https://uptimerobot.com) (ücretsiz)
- **Analytics:** [Google Analytics](https://analytics.google.com)
- **Error Tracking:** [Sentry](https://sentry.io) (ücretsiz plan)
- **Performance:** [Vercel Analytics](https://vercel.com/analytics)

---

## 9️⃣ Sorun Giderme

### Yaygın Sorunlar

#### 1. CORS Hatası
```javascript
// backend/src/index.ts
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

#### 2. Database Connection Error
```bash
# Connection string kontrol et
echo $DATABASE_URL

# PostgreSQL çalışıyor mu?
systemctl status postgresql
```

#### 3. Build Hatası
```bash
# Cache temizle
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 4. Port Zaten Kullanımda
```bash
# Port'u kullanan process'i bul
lsof -i :5000

# Process'i durdur
kill -9 <PID>
```

---

## 🎉 Tebrikler!

Cookify artık canlıda! 🚀

### Sonraki Adımlar

1. ✅ Tüm özellikleri test et
2. ✅ Kullanıcı kayıt/giriş test et
3. ✅ Tarif ekleme/düzenleme test et
4. ✅ Dolap ve market özelliklerini test et
5. ✅ Mobil uyumluluğu kontrol et
6. ✅ Performance test yap
7. ✅ SEO optimizasyonu yap
8. ✅ Analytics kur
9. ✅ Backup planını test et
10. ✅ Kullanıcılara duyur! 🎊

---

## 📞 Destek

Sorun yaşarsan:
1. Logları kontrol et (`pm2 logs` veya Vercel/Railway dashboard)
2. Environment variables'ı kontrol et
3. Database connection'ı test et
4. GitHub Issues'a yaz

**İyi şanslar! 🍳**
