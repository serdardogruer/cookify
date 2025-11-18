# 🚀 VDS Deployment Rehberi

## 📋 Ön Hazırlık (Tamamlandı ✅)

- ✅ VDS temizlendi
- ✅ Production .env dosyaları oluşturuldu
- ✅ Next.js config VDS için optimize edildi
- ✅ Port yapılandırması hazır

---

## 🎯 Deployment Planı

### Mimari:
```
Domain (cookify.tr) → Nginx (VDS)
                      ├─ / → Frontend (Next.js:3000)
                      └─ /api → Backend (Express:5000)
```

### Port Yapısı:
- **Nginx:** 80 (HTTP), 443 (HTTPS)
- **Backend:** 5000 (internal)
- **Frontend:** 3000 (internal)
- **PostgreSQL:** 5432 (localhost only)

---

## 1️⃣ VDS'de PostgreSQL Kurulumu

```bash
# PostgreSQL kur
sudo apt update
sudo apt install postgresql postgresql-contrib -y

# PostgreSQL başlat
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Veritabanı ve kullanıcı oluştur
sudo -u postgres psql

# PostgreSQL içinde:
CREATE DATABASE cookify;
CREATE USER cookify_user WITH ENCRYPTED PASSWORD 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE cookify TO cookify_user;
\q
```

---

## 2️⃣ Backend Deployment

```bash
# Backend klasörü oluştur
sudo mkdir -p /var/www/cookify-backend
cd /var/www/cookify-backend

# Git clone (veya dosyaları yükle)
# Backend dosyalarını buraya kopyala

# Node modules kur
npm install

# .env.production dosyasını .env olarak kopyala
cp .env.production .env

# .env dosyasını düzenle (şifreleri güncelle)
nano .env

# Prisma migration
npx prisma migrate deploy
npx prisma generate

# Build
npm run build

# PM2 ile başlat
pm2 start dist/index.js --name cookify-backend
pm2 save
pm2 startup
```

---

## 3️⃣ Frontend Deployment

```bash
# Frontend klasörü oluştur
sudo mkdir -p /var/www/cookify-frontend
cd /var/www/cookify-frontend

# Git clone (veya dosyaları yükle)
# Frontend dosyalarını buraya kopyala

# Node modules kur
npm install

# .env.production dosyasını kullan
cp .env.production .env.local

# Build
npm run build

# PM2 ile başlat
pm2 start npm --name cookify-frontend -- start
pm2 save
```

---

## 4️⃣ Nginx Yapılandırması

```bash
# Nginx config oluştur
sudo nano /etc/nginx/sites-available/cookify
```

**Config içeriği:**

```nginx
# Backend API
server {
    listen 80;
    server_name api.cookify.tr;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads klasörü
    location /uploads {
        alias /var/www/cookify-backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# Frontend
server {
    listen 80;
    server_name cookify.tr www.cookify.tr;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Nginx'i aktifleştir:**

```bash
# Symlink oluştur
sudo ln -s /etc/nginx/sites-available/cookify /etc/nginx/sites-enabled/

# Test et
sudo nginx -t

# Yeniden başlat
sudo systemctl restart nginx
```

---

## 5️⃣ SSL Sertifikası (Let's Encrypt)

```bash
# Certbot kur
sudo apt install certbot python3-certbot-nginx -y

# SSL sertifikası al
sudo certbot --nginx -d cookify.tr -d www.cookify.tr -d api.cookify.tr

# Otomatik yenileme test et
sudo certbot renew --dry-run
```

---

## 6️⃣ DNS Ayarları (cPanel)

cPanel DNS yönetiminde:

```
A Record:
cookify.tr → 80.253.246.134

A Record:
www.cookify.tr → 80.253.246.134

A Record:
api.cookify.tr → 80.253.246.134
```

---

## 7️⃣ Firewall Ayarları

```bash
# UFW kur ve ayarla
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 8️⃣ Son Kontroller

```bash
# PM2 durumu
pm2 list

# Nginx durumu
sudo systemctl status nginx

# PostgreSQL durumu
sudo systemctl status postgresql

# Port kontrol
netstat -tulpn | grep -E ':(80|443|3000|5000|5432)'

# Log kontrol
pm2 logs cookify-backend
pm2 logs cookify-frontend
```

---

## 🔧 Güncelleme Scripti

```bash
#!/bin/bash
# update-cookify.sh

echo "🔄 Cookify güncelleniyor..."

# Backend güncelle
cd /var/www/cookify-backend
git pull
npm install
npm run build
pm2 restart cookify-backend

# Frontend güncelle
cd /var/www/cookify-frontend
git pull
npm install
npm run build
pm2 restart cookify-frontend

echo "✅ Güncelleme tamamlandı!"
pm2 list
```

---

## 📝 Önemli Notlar

1. **Şifreleri değiştirin:** `.env` dosyalarındaki tüm şifreleri güçlü şifrelerle değiştirin
2. **Google OAuth:** Production credentials alın
3. **Backup:** Düzenli veritabanı backup'ı alın
4. **Monitoring:** PM2 monitoring kurun
5. **Logs:** Log rotation ayarlayın

---

## 🆘 Sorun Giderme

### Backend çalışmıyor:
```bash
pm2 logs cookify-backend
pm2 restart cookify-backend
```

### Frontend CSS yüklenmiyor:
```bash
# Next.js cache temizle
cd /var/www/cookify-frontend
rm -rf .next
npm run build
pm2 restart cookify-frontend
```

### Nginx hatası:
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### PostgreSQL bağlantı hatası:
```bash
sudo systemctl status postgresql
sudo -u postgres psql -c "\l"
```
