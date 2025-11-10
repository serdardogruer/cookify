# 🍳 Cookify Core v2.0

Aile mutfaklarını dijitalleştiren, kullanıcıların evdeki malzemelerini ve market alışverişlerini yönetmelerini sağlayan modüler web uygulaması.

## 📋 Özellikler

- **Çoklu Mutfak Sistemi**: Aile üyeleriyle ortak mutfak paylaşımı
- **Dolabım Modülü**: Evdeki malzemeleri dijital olarak takip
- **Market Modülü**: Alışveriş listesi yönetimi ve WhatsApp/PDF export
- **Profil Yönetimi**: Kullanıcı profili ve mutfak ayarları
- **Modüler Mimari**: Gelecekte yeni modüller eklenebilir yapı

## 🛠️ Teknolojiler

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- TailwindCSS (Dark Theme)
- React Query

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcrypt

## 📁 Proje Yapısı

```
cookify/
├── frontend/          # Next.js frontend uygulaması
│   ├── src/
│   │   ├── app/      # App Router sayfaları
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── types/
│   └── package.json
├── backend/           # Express.js backend API
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── utils/
│   ├── prisma/
│   └── package.json
└── README.md
```

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL 14+
- npm veya yarn

### Backend Kurulumu

```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenle (DATABASE_URL, JWT_SECRET vb.)
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Frontend Kurulumu

```bash
cd frontend
npm install
cp .env.local.example .env.local
# .env.local dosyasını düzenle (NEXT_PUBLIC_API_URL)
npm run dev
```

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/cookify"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 🧪 Test

```bash
# Backend testleri
cd backend
npm test

# Frontend testleri
cd frontend
npm test
```

## 📚 API Dokümantasyonu

API endpoint'leri için `.kiro/specs/cookify-core/design.md` dosyasına bakın.

## 🗺️ Geliştirme Yol Haritası

- [x] Proje yapısı ve konfigürasyon
- [x] Authentication sistemi
- [x] Profil yönetimi
- [x] Mutfak yönetimi
- [x] Dolap modülü
- [x] Market modülü
- [x] Modül sistemi
- [x] Ortak mutfak senkronizasyonu
- [ ] Test yazımı
- [ ] Deployment

## 📄 Lisans

MIT

## 👥 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen pull request göndermeden önce issue açın.

## 📞 İletişim

Sorularınız için issue açabilirsiniz.
