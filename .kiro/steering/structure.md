---
inclusion: always
---

# Proje Yapısı ve Organizasyon

## Klasör Yapısı

### Ana Klasörler

```
/
├── temp/          # Test dosyaları, geçici dosyalar, deneme scriptleri
├── tools/         # Kalıcı geliştirme araçları (backup.bat, restore.bat vb.)
├── backup/        # Backup dosyaları
└── .kiro/         # Kiro yapılandırma dosyaları
    └── steering/  # Steering kuralları
```

### Klasör Kullanım Kuralları

#### temp/ Klasörü
- Test dosyaları
- Geçici dosyalar
- Bir kerelik kullanılacak dosyalar
- Deneme scriptleri
- Bu klasördeki dosyalar sonra silinebilir
- Ana proje dosyalarını kirletmemek için kullanılır

#### tools/ Klasörü
- Kalıcı geliştirme araçları
- Backup ve restore scriptleri
- Yardımcı araçlar
- Tekrar kullanılacak scriptler

#### backup/ Klasörü
- Veritabanı backup'ları
- Dosya backup'ları
- Büyük değişiklik öncesi yedekler

## Dosya Yönetimi Prensipleri

- Ana proje klasörünü temiz tut
- Test ve geçici dosyalar için `temp/` kullan
- Kalıcı araçlar için `tools/` kullan
- Backup'lar için `backup/` kullan
- Git branch'leri ile çalış (feature/temp-*)

## Kod Organizasyonu

- Her dosya tek bir sorumluluğa sahip olmalı
- Modüler yapı tercih edilmeli
- Tekrar kullanılabilir kod yazılmalı
- Açık ve anlaşılır isimlendirme yapılmalı

## Versiyon Kontrolü

- Git kullanımı zorunlu
- Feature branch'leri: `feature/temp-*`
- Büyük değişiklikler öncesi branch oluştur
- Hem git hem dosya backup'ı yap
