# 🚀 Cookify Deploy Rehberi (Vercel + Railway)

Bu rehber ile Cookify'ı 15 dakikada deploy edebilirsiniz!

## 📋 Gereksinimler

- GitHub hesabı
- Vercel hesabı (ücretsiz)
- Railway hesabı (ücretsiz)

---

## 1️⃣ GitHub'a Push

```bash
git add .
git commit -m "Production ready"
git push origin main
```

---

## 2️⃣ Railway - Backend + Database

### Adım 1: Railway'e Giriş
1. [railway.app](https://railway.app) adresine git
2. "Login with GitHub" ile giriş yap

### Adım 2: Yeni Proje Oluştur
1. "New Project" butonuna tıkla
2. "Deploy from GitHub repo" seç
3. Cookify repo'nuzu seç

### Adım 3: MySQL Database Ekle
1. Proje içinde "New" → "Database" → "Add MySQL"
2. Database otomatik oluşturulacak
3. "Variables" sekmesinden `DATABASE_URL` değerini kopyala

### Adım 4: Backend Service Ayarları
1. Backend service'e tıkla
2. "Settings" → "Environment" → "Variables"
3. Şu değişkenleri ekle:

```
DATABASE_URL=mysql://... (Railway'den kopyaladığın)
JWT_SECRET=super-gizli-anahtar-buraya-yaz-123456
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://cookify.vercel.app (sonra güncelleyeceğiz)
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
```

### Adım 5: Build Ayarları
1. "Settings" → "Build"
2. Root Directory: `backend`
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`

### Adım 6: Deploy
1. "Deploy" butonuna tıkla
2. Deploy tamamlanınca "Deployments" sekmesinden URL'i kopyala
   - Örnek: `https://cookify-backend-production.up.railway.app`

### Adım 7: Database Migration
1. Railway dashboard'da backend service'e tıkla
2. "Settings" → "Variables" → "Raw Editor"
3. Tüm environment variables'ı kopyala
4. Terminalinde:

```bash
cd backend

# Environment variables'ı .env dosyasına yapıştır (geçici)
# Sonra:

npx prisma migrate deploy
npx prisma db seed
```

✅ Backend hazır!

---

## 3️⃣ Vercel - Frontend

### Adım 1: Vercel'e Giriş
1. [vercel.com](https://vercel.com) adresine git
2. "Sign Up" → "Continue with GitHub"

### Adım 2: Yeni Proje
1. "Add New" → "Project"
2. Cookify repo'nuzu seç
3. "Import" butonuna tıkla

### Adım 3: Proje Ayarları
1. Framework Preset: **Next.js** (otomatik seçilecek)
2. Root Directory: `frontend`
3. Build Command: `npm run build` (otomatik)
4. Output Directory: `.next` (otomatik)

### Adım 4: Environment Variables
1. "Environment Variables" bölümüne:

```
NEXT_PUBLIC_API_URL=https://cookify-backend-production.up.railway.app
```

(Railway'den kopyaladığın backend URL'i yapıştır)

### Adım 5: Deploy
1. "Deploy" butonuna tıkla
2. 2-3 dakika bekle
3. Deploy tamamlanınca URL'i kopyala
   - Örnek: `https://cookify.vercel.app`

### Adım 6: Railway'i Güncelle
1. Railway dashboard'a dön
2. Backend service → "Variables"
3. `FRONTEND_URL` değerini Vercel URL'i ile güncelle:
   ```
   FRONTEND_URL=https://cookify.vercel.app
   ```
4. Backend otomatik yeniden deploy olacak

✅ Frontend hazır!

---

## 4️⃣ Test Et

1. Vercel URL'ini aç: `https://cookify.vercel.app`
2. Kayıt ol
3. Giriş yap
4. Dolabına malzeme ekle
5. Market listesi oluştur
6. Tarif ara

Her şey çalışıyorsa 🎉 **BAŞARILI!**

---

## 🔧 Sorun Giderme

### Backend çalışmıyor
1. Railway → Backend service → "Deployments" → Logs'u kontrol et
2. Environment variables doğru mu?
3. Database bağlantısı çalışıyor mu?

### Frontend çalışmıyor
1. Vercel → Project → "Deployments" → Logs'u kontrol et
2. `NEXT_PUBLIC_API_URL` doğru mu?
3. Browser console'da hata var mı?

### Database migration hatası
```bash
# Railway'den DATABASE_URL'i kopyala
# Backend klasöründe:
DATABASE_URL="mysql://..." npx prisma migrate deploy
DATABASE_URL="mysql://..." npx prisma db seed
```

---

## 🔄 Güncelleme Nasıl Yapılır?

```bash
# Kod değişikliği yap
git add .
git commit -m "Yeni özellik eklendi"
git push origin main
```

- Railway ve Vercel **otomatik** deploy edecek!
- 2-3 dakika içinde değişiklikler yayında olacak

---

## 💰 Maliyet

- **Vercel**: Ücretsiz (hobby plan)
- **Railway**: Ücretsiz ($5 kredi/ay)
- **Toplam**: $0/ay 🎉

---

## 📞 Yardım

Sorun yaşarsan:
1. Railway logs: Backend service → Deployments → View Logs
2. Vercel logs: Project → Deployments → View Function Logs
3. Browser console: F12 → Console

---

## 🎯 Sonraki Adımlar

- [ ] Custom domain ekle (Vercel'de ücretsiz)
- [ ] SSL otomatik aktif (Vercel + Railway)
- [ ] Monitoring ekle
- [ ] Database backup ayarla

**Tebrikler! Cookify artık canlıda! 🚀**
