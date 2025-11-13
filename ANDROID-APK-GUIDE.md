# 📱 Cookify Android APK Rehberi

## 🎯 Hedef
Next.js projemizi Android APK'ya dönüştürmek.

---

## 1️⃣ Next.js Static Export Ayarı

### frontend/next.config.js dosyasını güncelle:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // API URL'i environment variable'dan al
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://cookify-backend-production.up.railway.app',
  },
}

module.exports = nextConfig
```

---

## 2️⃣ Capacitor Kurulumu

```bash
cd frontend

# Capacitor paketlerini kur
npm install @capacitor/core @capacitor/cli @capacitor/android

# Capacitor başlat
npx cap init

# Sorular:
# App name: Cookify
# App ID: com.cookify.app
# Web directory: out
```

---

## 3️⃣ Capacitor Config Dosyası

### frontend/capacitor.config.ts oluştur:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cookify.app',
  appName: 'Cookify',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    cleartext: true,
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

## 4️⃣ Build ve Android Projesi Oluştur

```bash
cd frontend

# Next.js build (static export)
npm run build

# Android platformu ekle
npx cap add android

# Dosyaları Android projesine kopyala
npx cap sync
```

---

## 5️⃣ Android Studio'da Aç

```bash
# Android Studio'da projeyi aç
npx cap open android
```

Android Studio açılacak ve proje yüklenecek.

---

## 6️⃣ APK Build (Android Studio'da)

### Debug APK (Test için):
1. Android Studio'da: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Build tamamlanınca: **locate** linkine tıkla
3. APK yolu: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (Play Store için):
1. **Build** → **Generate Signed Bundle / APK**
2. **APK** seç → **Next**
3. **Create new...** (ilk seferinde)
4. Keystore bilgilerini doldur:
   - Key store path: `cookify-release-key.jks`
   - Password: güçlü şifre
   - Alias: cookify
   - Validity: 25 years
5. **Next** → **release** seç → **Finish**
6. APK yolu: `frontend/android/app/release/app-release.apk`

---

## 7️⃣ APK'yı Telefona Yükle

### USB ile:
1. Telefonda **Geliştirici Seçenekleri** aç
2. **USB Debugging** aktif et
3. USB ile bilgisayara bağla
4. Android Studio'da **Run** butonuna tıkla

### APK Dosyası ile:
1. APK dosyasını telefona kopyala
2. Dosya yöneticisinden APK'ya tıkla
3. "Bilinmeyen kaynaklardan yükleme" izni ver
4. Yükle

---

## 8️⃣ App Icon ve Splash Screen

### App Icon:
1. [Icon Generator](https://icon.kitchen/) kullan
2. 512x512 PNG yükle
3. Android için icon'ları indir
4. `frontend/android/app/src/main/res/` klasörüne kopyala

### Splash Screen:
1. 2732x2732 PNG oluştur (arka plan #121212)
2. `frontend/android/app/src/main/res/drawable/splash.png` olarak kaydet

---

## 9️⃣ Güncelleme Süreci

```bash
cd frontend

# 1. Kod değişikliği yap
# 2. Build
npm run build

# 3. Sync
npx cap sync

# 4. Android Studio'da Run veya Build APK
```

---

## 🔟 Play Store'a Yükleme

### Gereksinimler:
- Google Play Console hesabı ($25 bir kerelik)
- Release APK veya AAB
- App icon (512x512)
- Screenshots (en az 2 adet)
- Privacy Policy URL
- App açıklaması

### Adımlar:
1. [Google Play Console](https://play.google.com/console) → Yeni uygulama oluştur
2. App bilgilerini doldur
3. Release → Production → Create new release
4. AAB dosyasını yükle (APK yerine AAB öneriliyor)
5. İncelemeye gönder (1-3 gün)

### AAB Build (Play Store için önerilen):
Android Studio'da:
**Build** → **Generate Signed Bundle / APK** → **Android App Bundle** seç

---

## 🎨 Özelleştirmeler

### App Name:
`frontend/android/app/src/main/res/values/strings.xml`
```xml
<string name="app_name">Cookify</string>
```

### Theme Color:
`frontend/android/app/src/main/res/values/styles.xml`
```xml
<item name="colorPrimary">#30D158</item>
```

### Permissions:
`frontend/android/app/src/main/AndroidManifest.xml`
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
```

---

## 🐛 Sorun Giderme

### Build hatası:
```bash
cd frontend/android
./gradlew clean
./gradlew build
```

### Sync hatası:
```bash
cd frontend
rm -rf android
npx cap add android
npx cap sync
```

### API bağlantı hatası:
- `capacitor.config.ts` → `server.cleartext: true` ekle
- AndroidManifest.xml → `android:usesCleartextTraffic="true"` ekle

---

## ✅ Kontrol Listesi

- [ ] Next.js static export ayarlandı
- [ ] Capacitor kuruldu
- [ ] Android projesi oluşturuldu
- [ ] Debug APK build edildi
- [ ] Telefonda test edildi
- [ ] App icon eklendi
- [ ] Splash screen eklendi
- [ ] Release APK build edildi
- [ ] Play Store'a yüklendi

---

## 🚀 Hızlı Başlangıç

```bash
# Tek komutla:
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init
npm run build
npx cap add android
npx cap sync
npx cap open android
```

Android Studio'da **Build APK** → Telefona yükle → Test et! 🎉
