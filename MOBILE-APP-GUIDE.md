# 📱 Cookify Mobil Uygulama Rehberi

## Seçenek 1: Capacitor (Önerilen) ⭐

Mevcut Next.js projemizi Android ve iOS uygulamasına dönüştürür.

### Avantajlar
- ✅ Tek kod tabanı (web + mobil)
- ✅ Mevcut kodu kullanır
- ✅ Native özellikler (kamera, bildirim, konum)
- ✅ Kolay güncelleme
- ✅ App Store ve Play Store'a yüklenebilir

---

## 🛠️ Kurulum Adımları

### 1. Capacitor Kurulumu

```bash
cd frontend

# Capacitor CLI kurulumu
npm install @capacitor/core @capacitor/cli

# Capacitor başlatma
npx cap init

# Uygulama bilgileri:
# App name: Cookify
# App ID: com.cookify.app (benzersiz olmalı)
# Web directory: out (Next.js static export için)
```

### 2. Next.js Static Export Ayarı

`frontend/next.config.js` dosyasını güncelle:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
```

### 3. Build ve Export

```bash
cd frontend

# Production build
npm run build

# Capacitor sync
npx cap sync
```

---

## 📱 Android Uygulaması

### Gereksinimler
- Android Studio
- Java JDK 11+

### Kurulum

```bash
cd frontend

# Android platformu ekle
npm install @capacitor/android
npx cap add android

# Android Studio'da aç
npx cap open android
```

### Android Studio'da:
1. Proje açılacak
2. "Build" → "Build Bundle(s) / APK(s)" → "Build APK(s)"
3. APK dosyası: `android/app/build/outputs/apk/debug/app-debug.apk`

### APK İmzalama (Play Store için)

```bash
# Keystore oluştur
keytool -genkey -v -keystore cookify-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias cookify

# android/app/build.gradle dosyasına ekle:
android {
    signingConfigs {
        release {
            storeFile file("../../cookify-release-key.jks")
            storePassword "your-password"
            keyAlias "cookify"
            keyPassword "your-password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}

# Release APK build
cd android
./gradlew assembleRelease
```

---

## 🍎 iOS Uygulaması

### Gereksinimler
- macOS
- Xcode
- Apple Developer hesabı ($99/yıl)

### Kurulum

```bash
cd frontend

# iOS platformu ekle
npm install @capacitor/ios
npx cap add ios

# Xcode'da aç
npx cap open ios
```

### Xcode'da:
1. Proje açılacak
2. "Signing & Capabilities" → Team seç
3. "Product" → "Archive"
4. App Store'a yükle

---

## 🔧 Native Özellikler Ekleme

### Kamera Erişimi

```bash
npm install @capacitor/camera

# capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cookify.app',
  appName: 'Cookify',
  webDir: 'out',
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    }
  }
};

export default config;
```

### Push Notifications

```bash
npm install @capacitor/push-notifications

# Kod örneği
import { PushNotifications } from '@capacitor/push-notifications';

PushNotifications.requestPermissions();
```

### Diğer Özellikler
- `@capacitor/geolocation` - Konum
- `@capacitor/share` - Paylaşım
- `@capacitor/haptics` - Titreşim
- `@capacitor/status-bar` - Durum çubuğu
- `@capacitor/splash-screen` - Açılış ekranı

---

## 🎨 Mobil Optimizasyonlar

### 1. Splash Screen

`android/app/src/main/res/drawable/splash.png` ekle
`ios/App/App/Assets.xcassets/Splash.imageset/` ekle

### 2. App Icon

`android/app/src/main/res/mipmap-*/ic_launcher.png` ekle
`ios/App/App/Assets.xcassets/AppIcon.appiconset/` ekle

### 3. Capacitor Config

```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cookify.app',
  appName: 'Cookify',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#121212',
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#121212',
    },
  },
};

export default config;
```

---

## 📦 Güncelleme Süreci

```bash
# 1. Web kodunu güncelle
cd frontend
npm run build

# 2. Capacitor sync
npx cap sync

# 3. Android
npx cap open android
# Build → Build APK

# 4. iOS
npx cap open ios
# Product → Archive
```

---

## 🚀 Alternatif: PWA (Progressive Web App)

Daha hızlı ve kolay bir seçenek:

### Avantajlar
- ✅ App Store/Play Store gerekmez
- ✅ Anında güncelleme
- ✅ Kurulum gerekmez
- ✅ Offline çalışma

### Kurulum

```bash
cd frontend

# next-pwa kurulumu
npm install next-pwa

# next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
})

module.exports = withPWA({
  // mevcut config
})

# public/manifest.json oluştur
{
  "name": "Cookify",
  "short_name": "Cookify",
  "description": "Akıllı Mutfak Yönetimi",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#121212",
  "theme_color": "#30D158",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Kullanıcılar tarayıcıdan "Ana ekrana ekle" diyerek uygulama gibi kullanabilir!

---

## 🎯 Önerilen Yol

1. **Önce PWA** - Hızlı ve kolay, test için ideal
2. **Sonra Capacitor** - Native özellikler gerekirse
3. **Play Store/App Store** - Kullanıcı tabanı büyüyünce

---

## 💰 Maliyet

- **PWA**: $0
- **Android (Play Store)**: $25 (bir kerelik)
- **iOS (App Store)**: $99/yıl

---

## 📞 Yardım

Hangi yolu seçmek istiyorsun?
1. PWA (en hızlı, ücretsiz)
2. Capacitor + Android (Play Store)
3. Capacitor + iOS (App Store)
4. Hepsi

Ben **PWA ile başlamayı** öneriyorum - 30 dakikada hazır olur!
