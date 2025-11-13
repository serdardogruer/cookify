# 🚀 Cookify Deploy Kontrol Listesi

## ✅ Hazırlık (Tamamlandı)
- [x] Kod GitHub'a push edildi
- [x] MySQL desteği eklendi (Prisma schema)
- [x] Environment variable örnekleri hazır
- [x] Railway ve Vercel config dosyaları hazır
- [x] Build script'leri güncellendi

---

## 📝 Deploy Adımları

### 1️⃣ Railway - Backend + Database (10 dakika)

#### A. Railway Hesabı
1. [railway.app](https://railway.app) → "Login with GitHub"
2. GitHub ile giriş yap

#### B. Yeni Proje
1. "New Project" butonuna tıkla
2. "Deploy from GitHub repo" seç
3. **cookify** repo'sunu seç

#### C. MySQL Database Ekle
1. Proje içinde "New" → "Database" → "Add MySQL"
2. Database otomatik oluşturulacak
3. MySQL service'e tıkla → "Variables" sekmesi
4. `DATABASE_URL` değerini kopyala (şuna benzer):
   ```
   mysql://root:password@containers-us-west-xxx.railway.app:7777/railway
   ```

#### D. Backend Environment Variables
1. Backend service'e tıkla
2. "Variables" sekmesi → "New Variable"
3. Şu değişkenleri ekle:

```env
DATABASE_URL=mysql://... (yukarıda kopyaladığın)
JWT_SECRET=cookify-super-secret-key-2024-production
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://cookify.vercel.app
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
```

#### E. Build Ayarları
1. "Settings" sekmesi
2. Root Directory: **backend**
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. "Deploy" butonuna tıkla

#### F. Deploy URL'i Kopyala
1. Deploy tamamlanınca (2-3 dakika)
2. "Deployments" sekmesi → Domain kısmından URL'i kopyala
3. Örnek: `https://cookify-backend-production.up.railway.app`

#### G. Database Migration
1. Railway'de backend service → "Variables" → "Raw Editor"
2. Tüm variables'ı kopyala
3. Lokal terminalinde:

```bash
cd backend

# .env dosyasını geçici oluştur ve variables'ı yapıştır
# Sonra:

npx prisma migrate deploy
npx prisma db seed

# .env dosyasını sil (güvenlik)
```

✅ Backend hazır!

---

### 2️⃣ Vercel - Frontend (5 dakika)

#### A. Vercel Hesabı
1. [vercel.com](https://vercel.com) → "Sign Up"
2. "Continue with GitHub"

#### B. Yeni Proje
1. "Add New" → "Project"
2. **cookify** repo'sunu seç
3. "Import" butonuna tıkla

#### C. Proje Ayarları
1. Framework Preset: **Next.js** (otomatik)
2. Root Directory: **frontend**
3. Build Command: `npm run build` (otomatik)
4. Output Directory: `.next` (otomatik)

#### D. Environment Variables
1. "Environment Variables" bölümü
2. Key: `NEXT_PUBLIC_API_URL`
3. Value: Railway backend URL'i (örnek: `https://cookify-backend-production.up.railway.app`)
4. "Add" butonuna tıkla

#### E. Deploy
1. "Deploy" butonuna tıkla
2. 2-3 dakika bekle
3. Deploy tamamlanınca URL'i kopyala
4. Örnek: `https://cookify.vercel.app`

✅ Frontend hazır!

---

### 3️⃣ Railway'i Güncelle (1 dakika)

1. Railway dashboard'a dön
2. Backend service → "Variables"
3. `FRONTEND_URL` değerini bul
4. Vercel URL'i ile güncelle:
   ```
   FRONTEND_URL=https://cookify.vercel.app
   ```
5. Backend otomatik yeniden deploy olacak (30 saniye)

✅ CORS ayarları güncellendi!

---

## 🎉 Test Et

1. Vercel URL'ini aç: `https://cookify.vercel.app`
2. Kayıt ol
3. Giriş yap
4. Dolabına malzeme ekle
5. Market listesi oluştur
6. Tarif ara
7. Mutfağa üye ekle/çıkar

**Her şey çalışıyorsa BAŞARILI! 🚀**

---

## 🔧 Sorun Giderme

### Backend 500 hatası
- Railway → Backend service → "Deployments" → Logs
- Database bağlantısı çalışıyor mu?
- Migration yapıldı mı?

### Frontend API hatası
- Vercel → Project → "Deployments" → Function Logs
- `NEXT_PUBLIC_API_URL` doğru mu?
- Browser console'da CORS hatası var mı?

### Database migration hatası
```bash
# Railway DATABASE_URL'i ile:
DATABASE_URL="mysql://..." npx prisma migrate deploy
DATABASE_URL="mysql://..." npx prisma db seed
```

---

## 📊 Sonuç

- **Backend URL**: https://cookify-backend-production.up.railway.app
- **Frontend URL**: https://cookify.vercel.app
- **Database**: Railway MySQL
- **Maliyet**: $0/ay (ücretsiz tier)

---

## 🔄 Otomatik Deploy

Artık her `git push origin main` yaptığında:
- Railway backend'i otomatik deploy eder
- Vercel frontend'i otomatik deploy eder
- 2-3 dakika içinde değişiklikler yayında!

**Tebrikler! Cookify canlıda! 🎊**
