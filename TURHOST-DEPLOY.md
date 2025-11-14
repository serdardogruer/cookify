# 🚀 Turhost Domain + Vercel + Railway Deploy

## 💰 Maliyet
- Domain (Turhost): ~₺100-200/yıl
- Vercel: Ücretsiz
- Railway: Ücretsiz ($5 kredi/ay)
- **Toplam: ~₺100-200/yıl**

---

## 1️⃣ Railway - Backend + MySQL

### Adım 1: Railway Hesabı
1. [railway.app](https://railway.app)
2. "Login with GitHub"

### Adım 2: Yeni Proje
1. "New Project"
2. "Deploy from GitHub repo"
3. **cookify** seç

### Adım 3: MySQL Ekle
1. "New" → "Database" → "Add MySQL"
2. `DATABASE_URL` kopyala

### Adım 4: Backend Ayarları
1. Backend service → "Variables"
2. Ekle:
```
DATABASE_URL=mysql://... (kopyaladığın)
JWT_SECRET=cookify-secret-2024
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://cookify.vercel.app
```

3. "Settings" → Root Directory: **backend**
4. Deploy

### Adım 5: Backend URL'i Kopyala
Örnek: `https://cookify-backend.up.railway.app`

---

## 2️⃣ Vercel - Frontend

### Adım 1: Vercel Hesabı
1. [vercel.com](https://vercel.com)
2. "Continue with GitHub"

### Adım 2: Yeni Proje
1. "Add New" → "Project"
2. **cookify** seç
3. "Import"

### Adım 3: Ayarlar
1. Root Directory: **frontend**
2. Environment Variables:
```
NEXT_PUBLIC_API_URL=https://cookify-backend.up.railway.app
```
3. "Deploy"

### Adım 4: Vercel URL'i Kopyala
Örnek: `https://cookify.vercel.app`

---

## 3️⃣ Turhost - Domain

### Adım 1: Domain Al
1. [turhost.com](https://turhost.com)
2. Domain ara: `cookify.tr`
3. Satın al

### Adım 2: DNS Ayarları
1. Turhost Panel → Domain Yönetimi
2. DNS Ayarları
3. Ekle:

```
Tip: CNAME
Host: @
Değer: cname.vercel-dns.com
TTL: 3600

Tip: CNAME  
Host: www
Değer: cname.vercel-dns.com
TTL: 3600
```

### Adım 3: Vercel'de Domain Ekle
1. Vercel → Project → Settings → Domains
2. `cookify.tr` ekle
3. `www.cookify.tr` ekle
4. DNS doğrulamasını bekle (5-10 dakika)

---

## ✅ Tamamlandı!

Artık:
- `cookify.tr` → Vercel Frontend
- `www.cookify.tr` → Vercel Frontend
- `cookify-backend.up.railway.app` → Railway Backend
- MySQL → Railway Database

---

## 🔄 Güncelleme

```bash
git add .
git commit -m "güncelleme"
git push origin main
```

Vercel ve Railway otomatik deploy eder!

---

## 📱 Mobil App Güncelle

`mobile/src/App.jsx`:
```javascript
const FRONTEND_URL = 'https://cookify.tr';
```

Build ve sync:
```bash
cd mobile
npm run build
npx cap sync android
```

---

## 🎉 Başarılı!

Web sitesi: `https://cookify.tr`
