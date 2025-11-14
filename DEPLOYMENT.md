# 🚀 Cookify Deployment Rehberi

⚠️ **DİKKAT:** Bu dosya eski Railway deployment rehberidir.

**Yeni deployment için:** `RENDER-DEPLOYMENT.md` dosyasına bakın!

---

## 📋 Gereksinimler (ESKİ - Railway)
- Railway.app hesabı (Backend + PostgreSQL için)
- Vercel hesabı (Frontend için)
- GitHub hesabı

---

## 1️⃣ Railway'de Backend + PostgreSQL Deploy (ESKİ)

### Adım 1: Railway'e Giriş
1. https://railway.app adresine git
2. **Login with GitHub** ile giriş yap

### Adım 2: PostgreSQL Oluştur
1. **New Project** → **Provision PostgreSQL**
2. PostgreSQL oluşturuldu ✅

### Adım 3: Backend Deploy
1. Aynı projede **+ New** → **GitHub Repo**
2. **cookify** reposunu seç
3. **Root Directory:** `backend` olarak ayarla

### Adım 4: Environment Variables (Railway)
Backend servisine git → **Variables** sekmesi:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://cookify-ecru-alpha.vercel.app
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

**ÖNEMLİ:** `DATABASE_URL` otomatik olarak PostgreSQL'e bağlanır.

### Adım 5: Deploy Ayarları
**Settings** → **Deploy**:
- **Build Command:** `npm ci && npx prisma generate && npm run build`
- **Start Command:** `npx prisma migrate deploy && npm start`

### Adım 6: Deploy!
**Deploy** butonuna tıkla. İlk deploy 2-3 dakika sürer.

### Adım 7: Backend URL'i Kopyala
Deploy tamamlandıktan sonra:
- **Settings** → **Networking** → **Generate Domain**
- URL'i kopyala (örn: `https://cookify-backend-production.up.railway.app`)

---

## 2️⃣ Vercel'de Frontend Deploy

### Adım 1: Vercel'e Giriş
1. https://vercel.com adresine git
2. **Login with GitHub** ile giriş yap

### Adım 2: Proje Import
1. **Add New** → **Project**
2. **cookify** reposunu seç
3. **Root Directory:** `frontend` olarak ayarla
4. **Framework Preset:** Next.js (otomatik algılanır)

### Adım 3: Environment Variables (Vercel)
**Environment Variables** bölümüne ekle:

```env
NEXT_PUBLIC_API_URL=https://cookify-backend-production.up.railway.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

**ÖNEMLİ:** `NEXT_PUBLIC_API_URL` değerini Railway'den aldığın backend URL ile değiştir!

### Adım 4: Deploy!
**Deploy** butonuna tıkla. İlk deploy 1-2 dakika sürer.

---

## 3️⃣ Veritabanı Seed (İlk Kurulum)

Railway backend'inde **Terminal** aç ve çalıştır:

```bash
npx prisma migrate deploy
npx prisma db seed
```

Bu komut:
- ✅ Tabloları oluşturur
- ✅ Kategorileri ekler
- ✅ Malzemeleri ekler
- ✅ Modülleri ekler
- ✅ Admin kullanıcısı oluşturur

---

## 4️⃣ Test Et!

1. **Frontend:** https://cookify-ecru-alpha.vercel.app
2. **Backend:** https://cookify-backend-production.up.railway.app/health

### Test Kullanıcısı (Admin)
- **Email:** admin@cookify.com
- **Şifre:** admin123

---

## 🔄 Güncellemeler

### Kod Değişikliği Sonrası
```bash
git add .
git commit -m "Güncelleme mesajı"
git push origin main
```

- Railway ve Vercel **otomatik deploy** eder
- 1-2 dakika içinde değişiklikler yayında olur

### Veritabanı Değişikliği Sonrası
```bash
# Localhost'ta
cd backend
npx prisma migrate dev --name migration_name

# Git'e push et
git push origin main

# Railway otomatik migrate eder
```

---

## 🐛 Sorun Giderme

### Backend Çalışmıyor
1. Railway → Backend servisi → **Logs** sekmesine bak
2. Environment variables doğru mu kontrol et
3. PostgreSQL bağlantısı çalışıyor mu kontrol et

### Frontend API'ye Bağlanamıyor
1. `NEXT_PUBLIC_API_URL` doğru mu kontrol et
2. Railway backend'i çalışıyor mu kontrol et
3. CORS ayarları doğru mu kontrol et

### Veritabanı Boş
Railway terminal'de:
```bash
npx prisma db seed
```

---

## 📊 Mevcut Durum

✅ **Localhost:** PostgreSQL ile çalışıyor (15 tarif, tüm veriler)  
🔄 **Production:** Deploy edilecek (Railway + Vercel)

---

## 💡 İpuçları

- Railway ücretsiz plan: 500 saat/ay (yeterli)
- Vercel ücretsiz plan: Sınırsız deploy
- Her push otomatik deploy tetikler
- Logs'ları düzenli kontrol et
- Backup almayı unutma!

---

## 🎉 Tamamlandı!

Artık Cookify production'da! 🚀
