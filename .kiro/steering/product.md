---
inclusion: always
---

# Ürün Özeti: Cookify

Cookify, mutfak yönetimi ve tarif paylaşım platformudur.

## Modül Yapısı ve Ücretlendirme

### ✅ Temel Modüller (ÜCRETSİZ - Her kullanıcı için)

Mevcut 7 modül temel modüllerdir ve tüm kullanıcılar ücretsiz kullanabilir:

1. 🏠 **Dolabım** - Evdeki malzemeleri takip
2. 🛒 **Market** - Alışveriş listesi yönetimi
3. 👤 **Profil** - Profil ve mutfak ayarları
4. 📖 **Tarifler** - Tarif yönetimi
5. 🔍 **Tarif Ara** - Tarif arama ve filtreleme
6. 📋 **Tarif Detay** - Tarif görüntüleme
7. ➕ **Tarif Ekle** - Yeni tarif oluşturma

### 💎 Premium Modüller (ÜCRETLİ)

**ÖNEMLİ:** Bundan sonra eklenecek tüm yeni modüller ücretli olacaktır.

Premium modül özellikleri:
- `isCore: false` olarak işaretlenir
- Kullanıcı satın almadan erişemez
- Modül sayfasında "Premium" badge'i gösterilir
- Satın alma sistemi entegre edilecek

## Genel Yaklaşım

- Minimal ve işlevsel kod yazımı
- Test edilebilir ve çalışır durumda kod üretimi
- Aşamalı geliştirme ve kullanıcı onayı ile ilerleme
- Gereksiz özellik eklenmemesi, sadece istenen işlevsellik

## Geliştirme Felsefesi

- "Sadece bunu yap, başka bir şey ekleme" prensibi
- Her adımda test edilebilir kod
- Syntax hatalarından kaçınma
- Kullanıcı onayı olmadan büyük değişiklik yapmama
- Yeni modüller eklerken ücretlendirme sistemini unutma

## 🔒 Mevcut Sistemi Koruma Kuralı (ÇOK ÖNEMLİ)

**KURAL:** Yeni özellik veya modül eklerken, mevcut çalışan sisteme DOKUNMA!

### Zorunlu Olmadıkça Değişiklik Yapma

- ✅ Yeni dosyalar oluştur (yeni controller, service, component)
- ✅ Yeni route'lar ekle
- ✅ Yeni endpoint'ler ekle
- ✅ Yeni veritabanı tabloları ekle
- ❌ Mevcut dosyaları değiştirme (zorunlu olmadıkça)
- ❌ Mevcut fonksiyonları değiştirme (zorunlu olmadıkça)
- ❌ Mevcut API endpoint'lerini değiştirme (zorunlu olmadıkça)

### Zorunlu Değişiklik Durumları

Sadece şu durumlarda mevcut dosyalara dokunulabilir:
1. **Bug fix** - Mevcut bir hatayı düzeltmek için
2. **Entegrasyon** - Yeni özelliğin çalışması için mutlaka gerekli
3. **Güvenlik** - Güvenlik açığını kapatmak için
4. **Kullanıcı talebi** - Kullanıcı açıkça değişiklik isterse

### Örnek: Yeni Modül Ekleme

❌ **YANLIŞ:**
```typescript
// Mevcut pantry.service.ts dosyasını değiştirme
export const pantryService = {
  // ... mevcut fonksiyonlar
  newFeature() { ... } // YAPMA!
}
```

✅ **DOĞRU:**
```typescript
// Yeni dosya: pantry-advanced.service.ts
export const pantryAdvancedService = {
  newFeature() { ... } // YENİ DOSYA
}
```

### Prensip

> "Çalışan koda dokunma, yeni kod ekle!"
