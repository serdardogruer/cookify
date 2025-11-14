# 🚀 Cookify - Render.com Deployment

## 📋 Neden Render?
- ✅ Tamamen ücretsiz
- ✅ PostgreSQL dahil
- ✅ Otomatik SSL
- ✅ Kolay setup
- ✅ GitHub entegrasyonu

---

## 1️⃣ Render'a Backend Deploy

### Adım 1: Render'a Giriş
1. https://render.com adresine git
2. **"Get Started for Free"** → **"Sign up with GitHub"**

### Adım 2: Yeni Web Service Oluştur
1. Dashboard'da **"New +"** → **"Web Service"**
2. **"Connect a repository"** → **cookify** reposunu seç
3. Ayarları yap:

**Temel Ayarlar:**
- **Name:** `cookify-backend`
- **Region:** Frankfurt (veya en yakın)
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** `Node`
- **Build Command:** 
  ```bash
  npm ci && npx prisma generate && npm run build
  ```
- **Start Command:**
  ```bash
  npx prisma migrate deploy && npm start
  ```

**Plan:**
- **Instance Type:** `Free`

### Adım 3: Environment Variables Ekle
**Environment Variables** bölümüne ekle:

```env
DATABASE_URL=<PostgreSQL URL - sonra ekleyeceğiz>
JWT_SECRET=cookify-super-secret-key-2024-change-this
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://cookify-ecru-alpha.vercel.app
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
```

**ŞİMDİLİK DATABASE_URL BOŞ BIRAK!**

**"Create Web Service"** butonuna tıkla (şimdilik fail edecek, normal)

---

## 2️⃣ PostgreSQL Oluştur

### Adım 1: PostgreSQL Ekle
1. Dashboard'da **"New +"** → **"PostgreSQL"**
2. Ayarları yap:

**Temel Ayarlar:**
- **Name:** `cookify-db`
- **Database:** `cookify`
- **User:** `cookify`
- **Region:** Frankfurt (backend ile aynı)

**Plan:**
- **Instance Type:** `Free`

**"Create Database"** butonuna tıkla

### Adım 2: Database URL'i Kopyala
1. PostgreSQL servisine git
2. **"Info"** sekmesinde **"Internal Database URL"** kopyala
3. Şuna benzer: `postgresql://cookify:xxx@xxx.oregon-postgres.render.com/cookify`

### Adım 3: Backend'e Database URL Ekle
1. **cookify-backend** servisine git
2. **"Environment"** → **"Environment Variables"**
3. **DATABASE_URL** değerini yapıştır
4. **"Save Changes"**

### Adım 4: Manuel Deploy
**"Manual Deploy"** → **"Deploy latest commit"**

Deploy 2-3 dakika sürer. Logs'ları izle!

---

## 3️⃣ Backend URL'i Al

Deploy başarılı olduktan sonra:
1. **cookify-backend** servisine git
2. Üstte URL görünecek: `https://cookify-backend.onrender.com`
3. Bu URL'i kopyala

---

## 4️⃣ Vercel'de Frontend Güncelle

### Adım 1: Vercel'e Git
1. https://vercel.com → Login
2. **cookify** projesine git

### Adım 2: Environment Variable Güncelle
1. **Settings** → **Environment Variables**
2. **NEXT_PUBLIC_API_URL** değerini bul
3. Değeri güncelle:
   ```
   https://cookify-backend.onrender.com
   ```
4. **Save**

### Adım 3: Redeploy
1. **Deployments** sekmesine git
2. En son deployment'ın yanındaki **"..."** → **"Redeploy"**

---

## 5️⃣ Veritabanını Seed Et

### Adım 1: Render Shell Aç
1. **cookify-backend** servisine git
2. **"Shell"** sekmesine tıkla

### Adım 2: Seed Komutunu Çalıştır
```bash
cd backend
npx prisma db seed
```

Bu komut:
- ✅ Kategorileri ekler
- ✅ Malzemeleri ekler
- ✅ Modülleri ekler
- ✅ Admin kullanıcısı oluşturur

---

## 6️⃣ Test Et!

### Frontend
https://cookify-ecru-alpha.vercel.app

### Backend Health Check
https://cookify-backend.onrender.com/health

### Admin Girişi
- **Email:** admin@cookify.com
- **Şifre:** admin123

---

## 🎉 Tamamlandı!

Artık Cookify tamamen ücretsiz olarak production'da çalışıyor!

### Önemli Notlar:
- ⚠️ Render free tier: 15 dakika inaktivite sonrası uyur
- ⚠️ İlk istek 30-60 saniye sürebilir (cold start)
- ✅ Sonraki istekler hızlı
- ✅ Her git push otomatik deploy tetikler

---

## 🔄 Güncellemeler

```bash
git add .
git commit -m "Güncelleme"
git push origin main
```

Render ve Vercel otomatik deploy eder!
