# 🚀 Cookify Mobile - Hızlı Başlangıç

## ✅ Tamamlanan Adımlar

- [x] Mobile klasörü oluşturuldu
- [x] React + Vite kuruldu
- [x] Capacitor kuruldu
- [x] Android projesi oluşturuldu
- [x] Android Studio açıldı

---

## 📱 Şimdi Ne Yapmalısın?

### 1. Android Studio'da Build

Android Studio açıldı. Şimdi:

1. **Gradle sync** tamamlanmasını bekle (alt kısımda progress bar)
2. Üst menüden: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Build tamamlanınca: **locate** linkine tıkla
4. APK yolu: `mobile/android/app/build/outputs/apk/debug/app-debug.apk`

### 2. APK'yı Telefona Yükle

#### Yöntem 1: USB ile
1. Telefonda **Ayarlar** → **Telefon Hakkında** → **Yapı Numarası**'na 7 kez tıkla
2. **Geliştirici Seçenekleri** aktif oldu
3. **USB Debugging** aç
4. USB ile bilgisayara bağla
5. Android Studio'da **Run** butonuna tıkla (yeşil play)

#### Yöntem 2: APK Dosyası ile
1. `app-debug.apk` dosyasını telefona kopyala (WhatsApp, email, vb.)
2. Telefonda dosyaya tıkla
3. "Bilinmeyen kaynaklardan yükleme" izni ver
4. Yükle

---

## 🔧 Önemli Ayarlar

### Frontend URL Değiştir

`mobile/src/App.jsx` dosyasında:

```javascript
// Development (lokal test)
const FRONTEND_URL = 'http://localhost:3000';

// Production (canlı)
const FRONTEND_URL = 'https://cookify.vercel.app';
```

Production için değiştir, sonra:
```bash
npm run build
npx cap sync
```

---

## 🎨 App Icon Değiştir

1. [Icon Kitchen](https://icon.kitchen/) → 512x512 PNG yükle
2. Android için icon'ları indir
3. `mobile/android/app/src/main/res/` klasörüne kopyala
4. Yeniden build

---

## 🔄 Kod Güncellemesi

```bash
cd mobile

# 1. Kodu değiştir (src/App.jsx)
# 2. Build
npm run build

# 3. Sync
npx cap sync

# 4. Android Studio'da Run veya Build APK
```

---

## 🐛 Sorun Giderme

### Gradle sync hatası
Android Studio'da: **File** → **Invalidate Caches** → **Invalidate and Restart**

### Build hatası
```bash
cd mobile/android
./gradlew clean
./gradlew build
```

### APK bulunamıyor
```bash
cd mobile
npm run build
npx cap sync android
npx cap open android
```

---

## 📦 Release APK (Play Store için)

Android Studio'da:
1. **Build** → **Generate Signed Bundle / APK**
2. **APK** seç
3. **Create new keystore**
4. Bilgileri doldur ve kaydet
5. **release** seç
6. Build

---

## ✅ Test Listesi

- [ ] APK build edildi
- [ ] Telefona yüklendi
- [ ] Uygulama açılıyor
- [ ] Splash screen görünüyor
- [ ] Web sayfası yükleniyor
- [ ] Login çalışıyor
- [ ] Navigasyon çalışıyor

---

## 🎉 Başarılı!

APK hazır! Artık:
- Telefonda test edebilirsin
- Arkadaşlarına gönderebilirsin
- Play Store'a yükleyebilirsin

**Tebrikler! 🚀**
