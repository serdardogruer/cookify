# ⚡ 10 Dakikada Deploy

## 🎯 Hedef
Frontend: https://cookify-ecru-alpha.vercel.app ✅ (Zaten yayında)
Backend: Railway'e deploy edeceğiz

## 📝 Yapılacaklar

### 1️⃣ Railway'e Git (2 dk)
```
1. https://railway.app → GitHub ile giriş yap
2. "New Project" → "Provision MySQL" 
3. MySQL oluştu ✅
```

### 2️⃣ Backend Ekle (3 dk)
```
1. Aynı projede "+ New" → "GitHub Repo" → Bu repo'yu seç
2. Settings:
   - Root Directory: backend
   - Build Command: npm install && npx prisma generate && npm run build
   - Start Command: npm start
```

### 3️⃣ Environment Variables (2 dk)
```
Railway backend service → Variables → Raw Editor:

DATABASE_URL=${{MySQL.DATABASE_URL}}
JWT_SECRET=cookify-super-secret-key-2024
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://cookify-ecru-alpha.vercel.app
```

### 4️⃣ Deploy & Migrate (2 dk)
```
1. Deploy butonuna tıkla
2. Deploy bitince → Settings → Networking → "Generate Domain"
3. URL'i kopyala (örn: cookify-production.up.railway.app)
4. Shell sekmesi → Şunu çalıştır:
   npx prisma migrate deploy && npx prisma db seed
```

### 5️⃣ Vercel'i Güncelle (1 dk)
```
1. https://vercel.com → Cookify projesi
2. Settings → Environment Variables → Add:
   NEXT_PUBLIC_API_URL=https://RAILWAY-URL-BURAYA
3. Deployments → Redeploy
```

## ✅ Bitti!

Test et: https://cookify-ecru-alpha.vercel.app

## 🐛 Hata Alırsan

**CORS hatası**: Backend'de FRONTEND_URL doğru mu?
**Database hatası**: Prisma migrate çalıştırdın mı?
**404 hatası**: Backend URL'i Vercel'de doğru mu?

## 💡 İpucu

Railway'de backend URL'ini kopyalarken "https://" ile başladığından emin ol!
