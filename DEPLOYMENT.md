# Cookify Deployment Rehberi

Bu dokümanda Cookify uygulamasını farklı platformlara deploy etme adımları açıklanmaktadır.

## 📋 Ön Hazırlık

### 1. Environment Variables

#### Backend (.env)
```env
DATABASE_URL="mysql://kullanici:sifre@localhost:3306/cookify"
JWT_SECRET="gizli-anahtar-buraya"
PORT=5000
NODE_ENV=production
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://api.cookify.com
```

### 2. Build Komutları

#### Backend Build
```bash
cd backend
npm install
npm run prisma:generate
npm run build
```

#### Frontend Build
```bash
cd frontend
npm install
npm run build
```

## 🚀 Deploy Seçenekleri

### Seçenek 1: Vercel (Frontend) + Railway (Backend + Database)

#### Frontend - Vercel
1. GitHub'a push yapın
2. [Vercel](https://vercel.com) hesabı oluşturun
3. "New Project" → GitHub repo'nuzu seçin
4. Root Directory: `frontend`
5. Environment Variables ekleyin:
   - `NEXT_PUBLIC_API_URL`: Backend URL'iniz
6. Deploy butonuna tıklayın

#### Backend + Database - Railway
1. [Railway](https://railway.app) hesabı oluşturun
2. "New Project" → "Deploy from GitHub repo"
3. MySQL database ekleyin
4. Backend service ekleyin:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run prisma:generate && npm run build`
   - Start Command: `npm start`
5. Environment Variables:
   - `DATABASE_URL`: Railway MySQL connection string
   - `JWT_SECRET`: Güçlü bir secret key
   - `PORT`: 5000
   - `NODE_ENV`: production
6. Deploy edin

### Seçenek 2: Netlify (Frontend) + Render (Backend + Database)

#### Frontend - Netlify
1. [Netlify](https://netlify.com) hesabı oluşturun
2. "Add new site" → "Import from Git"
3. Base directory: `frontend`
4. Build command: `npm run build`
5. Publish directory: `frontend/.next`
6. Environment variables ekleyin
7. Deploy

#### Backend - Render
1. [Render](https://render.com) hesabı oluşturun
2. "New" → "Web Service"
3. GitHub repo'nuzu bağlayın
4. Root Directory: `backend`
5. Build Command: `npm install && npm run prisma:generate && npm run build`
6. Start Command: `npm start`
7. Environment variables ekleyin
8. MySQL database oluşturun (ayrı service)

### Seçenek 3: VPS (DigitalOcean, Linode, AWS EC2)

#### 1. Sunucu Hazırlığı
```bash
# Node.js kurulumu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# MySQL kurulumu
sudo apt-get install mysql-server

# PM2 kurulumu (process manager)
sudo npm install -g pm2
```

#### 2. Veritabanı Kurulumu
```bash
sudo mysql
CREATE DATABASE cookify;
CREATE USER 'cookify'@'localhost' IDENTIFIED BY 'güçlü-şifre';
GRANT ALL PRIVILEGES ON cookify.* TO 'cookify'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 3. Backend Deploy
```bash
cd /var/www/cookify/backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run build
pm2 start dist/index.js --name cookify-backend
pm2 save
pm2 startup
```

#### 4. Frontend Deploy
```bash
cd /var/www/cookify/frontend
npm install
npm run build
pm2 start npm --name cookify-frontend -- start
pm2 save
```

#### 5. Nginx Kurulumu
```bash
sudo apt-get install nginx

# /etc/nginx/sites-available/cookify
server {
    listen 80;
    server_name cookify.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

sudo ln -s /etc/nginx/sites-available/cookify /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. SSL Sertifikası (Let's Encrypt)
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d cookify.com -d www.cookify.com
```

### Seçenek 4: Docker (Herhangi bir platform)

#### 1. Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

#### 2. Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### 3. Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: cookify
      MYSQL_USER: cookify
      MYSQL_PASSWORD: cookifypassword
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: mysql://cookify:cookifypassword@mysql:3306/cookify
      JWT_SECRET: your-secret-key
      PORT: 5000
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:5000
    depends_on:
      - backend

volumes:
  mysql_data:
```

#### Deploy
```bash
docker-compose up -d
```

## 🔒 Güvenlik Kontrol Listesi

- [ ] JWT_SECRET güçlü ve benzersiz
- [ ] Database şifreleri güçlü
- [ ] CORS ayarları production için yapılandırıldı
- [ ] HTTPS aktif
- [ ] Environment variables güvenli
- [ ] Database backup stratejisi var
- [ ] Rate limiting aktif
- [ ] Input validation yapılıyor

## 📊 Monitoring

### PM2 Monitoring
```bash
pm2 monit
pm2 logs
pm2 status
```

### Database Backup
```bash
# Otomatik backup scripti
mysqldump -u cookify -p cookify > backup_$(date +%Y%m%d).sql
```

## 🔄 Güncelleme

```bash
# Backend güncelleme
cd backend
git pull
npm install
npm run prisma:migrate
npm run build
pm2 restart cookify-backend

# Frontend güncelleme
cd frontend
git pull
npm install
npm run build
pm2 restart cookify-frontend
```

## 📞 Destek

Sorun yaşarsanız:
1. Logları kontrol edin: `pm2 logs`
2. Database bağlantısını test edin
3. Environment variables'ı kontrol edin
4. Port'ların açık olduğundan emin olun

## 🎯 Önerilen: Railway + Vercel

En kolay ve hızlı deploy için:
- **Frontend**: Vercel (ücretsiz, otomatik deploy)
- **Backend + Database**: Railway (ücretsiz tier, kolay setup)

Bu kombinasyon ile 10 dakikada deploy edebilirsiniz!
