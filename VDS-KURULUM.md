# 🚀 Cookify - VDS Kurulum Rehberi

TR-VDS4 sunucusuna Cookify backend kurulumu.

## 📋 Gereksinimler

- Ubuntu 22.04 LTS
- Root veya sudo yetkisi
- Domain: api.cookify.tr (VDS IP'ye yönlendirilmiş)

---

## 1️⃣ Sunucu Hazırlığı

```bash
# Sistem güncellemesi
sudo apt update && sudo apt upgrade -y

# Gerekli paketler
sudo apt install -y curl git build-essential
```

---

## 2️⃣ Node.js Kurulumu

```bash
# Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Kontrol
node --version  # v18.x.x
npm --version   # 9.x.x
```

---

## 3️⃣ PostgreSQL Kurulumu

```bash
# PostgreSQL 14
sudo apt install -y postgresql postgresql-contrib

# PostgreSQL başlat
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Veritabanı oluştur
sudo -u postgres psql

# PostgreSQL içinde:
CREATE DATABASE cookify;
CREATE USER cookify WITH ENCRYPTED PASSWORD 'güçlü-şifre-buraya';
GRANT ALL PRIVILEGES ON DATABASE cookify TO cookify;
\q
```

---

## 4️⃣ PM2 Kurulumu

```bash
# PM2 (Process Manager)
sudo npm install -g pm2

# PM2 otomatik başlatma
pm2 startup
# Çıkan komutu çalıştır
```

---

## 5️⃣ Nginx Kurulumu

```bash
# Nginx
sudo apt install -y nginx

# Nginx başlat
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 6️⃣ SSL Sertifikası (Let's Encrypt)

```bash
# Certbot
sudo apt install -y certbot python3-certbot-nginx

# SSL sertifikası al
sudo certbot --nginx -d api.cookify.tr

# Otomatik yenileme
sudo certbot renew --dry-run
```

---

## 7️⃣ Cookify Backend Deploy

```bash
# Proje klasörü
cd /var/www
sudo mkdir cookify-backend
sudo chown $USER:$USER cookify-backend
cd cookify-backend

# Git clone
git clone https://github.com/kullanici-adi/cookify.git .
cd backend

# Environment variables
cp .env.example .env
nano .env

# .env dosyasını düzenle:
# DATABASE_URL="postgresql://cookify:şifre@localhost:5432/cookify"
# JWT_SECRET="güçlü-random-key"
# FRONTEND_URL="https://cookify.tr"
# PORT=5000

# Dependencies
npm install

# Prisma
npx prisma generate
npx prisma migrate deploy

# Build
npm run build

# PM2 ile başlat
pm2 start dist/index.js --name cookify-backend
pm2 save
```

---

## 8️⃣ Nginx Konfigürasyonu

```bash
# Nginx config
sudo nano /etc/nginx/sites-available/cookify-backend

# İçeriği:
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

    # Upload klasörü
    location /uploads {
        alias /var/www/cookify-backend/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# Aktif et
sudo ln -s /etc/nginx/sites-available/cookify-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 9️⃣ Firewall Ayarları

```bash
# UFW
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## 🔟 Test

```bash
# Backend health check
curl https://api.cookify.tr/health

# Beklenen çıktı:
# {"status":"ok","message":"Cookify API is running"}

# PM2 durum
pm2 status

# Nginx durum
sudo systemctl status nginx

# PostgreSQL durum
sudo systemctl status postgresql
```

---

## 🔄 Güncelleme (Deploy)

```bash
cd /var/www/cookify-backend/backend
git pull
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart cookify-backend
```

---

## 📊 Monitoring

```bash
# PM2 logs
pm2 logs cookify-backend

# PM2 monitoring
pm2 monit

# Disk kullanımı
df -h

# RAM kullanımı
free -h

# CPU kullanımı
top
```

---

## 🔒 Güvenlik

```bash
# SSH key-only login
sudo nano /etc/ssh/sshd_config
# PasswordAuthentication no

# Fail2ban
sudo apt install -y fail2ban
sudo systemctl enable fail2ban

# Otomatik güncellemeler
sudo apt install -y unattended-upgrades
```

---

## 📝 Notlar

- Database backup düzenli al
- PM2 logs kontrol et
- Disk alanını izle
- SSL sertifikası 90 günde bir yenilenir (otomatik)

---

## 🆘 Sorun Giderme

### Backend çalışmıyor
```bash
pm2 logs cookify-backend
pm2 restart cookify-backend
```

### Database bağlantı hatası
```bash
sudo systemctl status postgresql
sudo -u postgres psql -c "\l"
```

### Nginx hatası
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

---

## ✅ Kurulum Tamamlandı!

Backend: https://api.cookify.tr
Health: https://api.cookify.tr/health
