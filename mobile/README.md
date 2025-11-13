# 📱 Cookify Mobile App

Android ve iOS için Cookify mobil uygulaması.

## 🚀 Kurulum

```bash
cd mobile
npm install
```

## 🛠️ Geliştirme

```bash
# Web preview (tarayıcıda test)
npm run dev

# Build
npm run build
```

## 📱 Android

```bash
# İlk kurulum
npx cap add android

# Build ve sync
npm run build
npm run android

# Android Studio açılacak
# Build → Build APK
```

## 🍎 iOS (Mac gerekli)

```bash
# İlk kurulum
npx cap add ios

# Build ve sync
npm run build
npm run ios

# Xcode açılacak
```

## 📝 Notlar

- Uygulama web frontend'i iframe içinde gösterir
- `src/App.jsx` içinde `FRONTEND_URL` değiştir:
  - Development: `http://localhost:3000`
  - Production: `https://cookify.vercel.app`

## 🔧 Güncelleme

```bash
npm run build
npm run sync
npm run android  # veya ios
```
