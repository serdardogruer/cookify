# 🚀 Hızlı Deploy Rehberi

Frontend zaten yayında: https://cookify-ecru-alpha.vercel.app/dashboard

Şimdi backend'i deploy edelim:

## Adım 1: Railway'e Backend Deploy

### 1.1 Railway Hesabı Oluştur
1. https://railway.app adresine git
2. GitHub ile giriş yap

### 1.2 MySQL Database Oluştur
1. Railway dashboard'da "New Project" tıkla
2. "Provision MySQL" seç
3. Database bilgilerini not al (Variables sekmesinde)

### 1.3 Backend Service Ekle
1. Aynı projede "New Service" → "GitHub Repo"
2. Bu repo'yu seç
3. Settings → Environment Variables:
   ```
   DATABASE_URL=mysql://user:pass@host:port/railway
   JWT_SECRET=super-gizli-anahtar-12345
   PORT=5000
   NODE_ENV=production
   FRONTEND_URL=https://cookify-ecru-alpha.vercel.app
   ```
4. Settings → Root Directory: `backend`
5. Settings → Build Command: `npm install && npx prisma generate && npm run build`
6. Settings → Start Command: `npm start`
7. Deploy butonuna tıkla

### 1.4 Database Migration
1. Backend deploy olduktan sonra
2. Railway'de backend service'e tıkla
3. "Shell" sekmesine git
4. Şu komutu çalıştır:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

### 1.5 Backend URL'ini Al
1. Backend service → Settings → Networking
2. "Generate Domain" tıkla
3. URL'i kopyala (örn: `cookify-backend.railway.app`)

## Adım 2: Vercel'de Frontend Güncelle

### 2.1 Environment Variable Ekle
1. https://vercel.com/dashboard
2. Cookify projesine git
3. Settings → Environment Variables
4. Yeni variable ekle:
   ```
   NEXT_PUBLIC_API_URL=https://cookify-backend.railway.app
   ```
5. "Save" tıkla

### 2.2 Redeploy
1. Deployments sekmesine git
2. En son deployment'ın yanındaki "..." → "Redeploy"
3. Veya git push yap (otomatik deploy olur)

## Adım 3: Test Et

1. https://cookify-ecru-alpha.vercel.app adresine git
2. Kayıt ol / Giriş yap
3. Tüm özellikleri test et:
   - ✅ Giriş/Kayıt
   - ✅ Dolabım
   - ✅ Market
   - ✅ Tarifler
   - ✅ Tarif Ekle
   - ✅ Tarif Detay

## 🎉 Tamamlandı!

Artık uygulamanız canlıda!

## 🔧 Sorun Giderme

### Backend'e erişilemiyor
- Railway'de backend loglarını kontrol et
- DATABASE_URL doğru mu?
- Port 5000 açık mı?

### CORS hatası
- Backend'de FRONTEND_URL doğru mu?
- Vercel URL'i backend CORS ayarlarında var mı?

### Database bağlantı hatası
- Railway MySQL çalışıyor mu?
- DATABASE_URL formatı doğru mu?
- Prisma migrate çalıştırıldı mı?

## 📊 Monitoring

### Railway
- Logs: Backend service → Logs
- Metrics: Backend service → Metrics
- Database: MySQL service → Data

### Vercel
- Analytics: Project → Analytics
- Logs: Deployments → Logs

## 🔄 Güncelleme

### Backend Güncelleme
1. Git push yap
2. Railway otomatik deploy eder

### Frontend Güncelleme
1. Git push yap
2. Vercel otomatik deploy eder

## 💰 Maliyet

- **Railway**: $5/ay (Hobby plan) - 500 saat/ay
- **Vercel**: Ücretsiz (Hobby plan)
- **Toplam**: ~$5/ay

## 🎯 Alternatif: Tamamen Ücretsiz

Railway yerine Render.com kullanabilirsin (ücretsiz tier):
- Backend: Render Web Service (ücretsiz)
- Database: Render PostgreSQL (ücretsiz)
- Ama: 15 dakika inaktivite sonrası uyur

## 📞 Yardım

Sorun yaşarsan:
1. Railway logs kontrol et
2. Vercel logs kontrol et
3. Browser console kontrol et
4. Network tab'ı kontrol et
