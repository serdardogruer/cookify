---
inclusion: always
---

# Teknoloji Stack

## Tercih Edilen Teknolojiler

### Backend
- **Node.js + TypeScript** (PHP yerine tercih edilir - hata oranı düşük)
- **Express.js** framework
- **Prisma ORM** (veritabanı işlemleri için)
- **JWT** authentication

### Veritabanı
- **MySQL** (XAMPP ile çalışır)
- Mevcut veritabanı yapısı korunmalı

### Kod Standartları
- Modern JavaScript (ES6+)
- async/await kullanımı
- Minimal ve verbose olmayan kod
- TypeScript tip güvenliği

## Yaygın Komutlar

### Geliştirme
```bash
# Henüz proje yapısı oluşturulmadı
# Komutlar proje kurulumu sonrası eklenecek
```

### Test
- Test dosyaları `temp/` klasöründe oluşturulmalı
- Her kod bloğu çalışır durumda test edilmeli
- Gerçek verilerle test yapılmalı
- Edge case'ler düşünülmeli

### Backup ve Restore
```bash
# Büyük değişiklik öncesi
tools/backup.bat

# Sorun durumunda geri dönüş
tools/restore.bat
```

## Migration Kuralları

- Her migration adımı test edilmeli
- Geri dönüş planı hazırlanmalı
- Veritabanı backup'ı alınmalı
- Aşamalı geçiş yapılmalı (paralel çalıştırma)
- Her adımda kullanıcı onayı alınmalı
- Downtime minimize edilmeli

## Güvenlik

- Büyük değişiklikler öncesi backup
- Git branch'leri kullanımı (feature/temp-*)
- Test ortamında önce deneme
- Production'a dokunmama
