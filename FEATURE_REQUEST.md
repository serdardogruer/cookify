# Yeni Özellik: Malzeme Tüketim Yönetimi

## Problem
Kullanıcılar sisteme girmeden yemek yapabilir ve malzeme tüketebilir. Bu durumda dolaptaki malzeme miktarları güncel kalmaz.

## Çözüm Önerileri

### 1. "Bu Tarifi Yaptım" Butonu ⭐ (Öncelikli)

**Konum:** Tarif detay sayfası

**Özellikler:**
- Tarif detay sayfasında büyük bir "✓ Bu Tarifi Yaptım" butonu
- Tıklayınca modal açılır:
  - Kaç porsiyon yaptınız? (varsayılan: tarifteki porsiyon)
  - Hangi malzemeleri kullandınız? (tümü seçili)
  - Hangi malzemeleri dolabınızdan aldınız? (otomatik eşleştirme)
- Onayladığında:
  - Seçilen malzemeler dolabınızdan düşer
  - Tarif geçmişinize eklenir
  - "Son yapılan tarifler" listesinde görünür

**Backend API:**
```
POST /api/recipes/:id/cook
Body: {
  servings: 4,
  ingredients: [
    { pantryItemId: 123, quantityUsed: 2, unit: "adet" },
    { pantryItemId: 124, quantityUsed: 500, unit: "gram" }
  ]
}
```

**Avantajlar:**
- Kullanıcı dostu
- Otomatik hesaplama
- Tarif geçmişi tutulur
- İstatistik için veri sağlar

---

### 2. Hızlı Tüketim Butonu

**Konum:** Dolabım sayfası, her malzemenin yanında

**Özellikler:**
- "-" butonu ile hızlı tüketim
- Varsayılan miktar: 1 birim (kullanıcı ayarlayabilir)
- Uzun basınca özel miktar girişi

**UI:**
```
[Domates] [2 kg] [-1] [Düzenle] [Market] [Sil]
```

---

### 3. Manuel Tüketim Kaydı

**Konum:** Dolabım sayfası, üst menüde

**Özellikler:**
- "Tüketim Kaydet" butonu
- Modal açılır:
  - Malzeme seç (dropdown)
  - Miktar gir
  - Tarih (varsayılan: bugün)
  - Not (opsiyonel)
- Geçmiş tüketimler görüntülenebilir

---

### 4. Tarif Geçmişi

**Konum:** Yeni sayfa: /dashboard/cooking-history

**Özellikler:**
- Yapılan tarifler listesi
- Tarih, porsiyon, kullanılan malzemeler
- Tekrar yap butonu
- İstatistikler:
  - En çok yapılan tarifler
  - Aylık yemek sayısı
  - Tüketim grafikleri

---

### 5. Akıllı Öneriler

**Özellikler:**
- "Bugün bu tarifi yaptınız mı?" bildirimi
- Sık yapılan tarifler için otomatik hatırlatma
- "Son 3 günde bu malzemeyi kullanmadınız" uyarısı

---

## Uygulama Planı

### Faz 1: Temel Özellikler (Hemen)
1. ✅ "Bu Tarifi Yaptım" butonu
2. ✅ Malzeme tüketim API'si
3. ✅ Basit tarif geçmişi

### Faz 2: Gelişmiş Özellikler (Sonra)
1. Hızlı tüketim butonları
2. Manuel tüketim kaydı
3. Detaylı tarif geçmişi sayfası

### Faz 3: Premium Özellikler (Gelecek)
1. İstatistikler ve grafikler
2. Akıllı öneriler
3. QR kod sistemi
4. Aile üyeleri için basitleştirilmiş arayüz

---

## Teknik Detaylar

### Database Schema Değişiklikleri

```prisma
model CookingHistory {
  id          Int      @id @default(autoincrement())
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
  recipeId    Int
  recipe      Recipe   @relation(fields: [recipeId], references: [id])
  servings    Int
  cookedAt    DateTime @default(now())
  notes       String?
  
  ingredients CookingHistoryIngredient[]
  
  @@index([userId])
  @@index([recipeId])
}

model CookingHistoryIngredient {
  id              Int            @id @default(autoincrement())
  historyId       Int
  history         CookingHistory @relation(fields: [historyId], references: [id])
  pantryItemId    Int?
  pantryItem      PantryItem?    @relation(fields: [pantryItemId], references: [id])
  ingredientName  String
  quantityUsed    Float
  unit            String
  
  @@index([historyId])
}
```

### API Endpoints

```typescript
// Tarif yaptım
POST /api/recipes/:id/cook
Body: { servings, ingredients[] }
Response: { success, message, updatedPantryItems }

// Tarif geçmişi
GET /api/cooking-history
Query: { limit, offset, recipeId }
Response: { history[], total }

// Manuel tüketim
POST /api/pantry/:id/consume
Body: { quantity, unit, notes }
Response: { success, updatedItem }
```

---

## UI/UX Mockup

### Tarif Detay Sayfası
```
┌─────────────────────────────────────┐
│ [Geri] Menemen                      │
│                                     │
│ [Tarif Fotoğrafı]                  │
│                                     │
│ 🥘 Malzemeler                       │
│ • 3 yumurta                         │
│ • 2 domates                         │
│ • 1 biber                           │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ ✓ Bu Tarifi Yaptım              ││
│ └─────────────────────────────────┘│
│                                     │
│ 📝 Yapılışı                         │
│ ...                                 │
└─────────────────────────────────────┘
```

### Modal: Tarif Yaptım
```
┌─────────────────────────────────────┐
│ ✓ Menemen Yaptınız mı?              │
│                                     │
│ Kaç porsiyon?                       │
│ [2] [3] [4] [5] [Özel]             │
│                                     │
│ Kullanılan Malzemeler:              │
│ ☑ 3 yumurta (Dolabımda var)        │
│ ☑ 2 domates (Dolabımda var)        │
│ ☐ 1 biber (Dolabımda yok)          │
│                                     │
│ Not (opsiyonel):                    │
│ [________________]                  │
│                                     │
│ [İptal] [Kaydet]                    │
└─────────────────────────────────────┘
```

---

## Kullanıcı Senaryoları

### Senaryo 1: Tarif Yapıldı
1. Kullanıcı tarif detay sayfasında
2. "Bu Tarifi Yaptım" butonuna tıklar
3. Porsiyon sayısını seçer (varsayılan: 4)
4. Hangi malzemeleri kullandığını işaretler
5. Kaydeder
6. Sistem dolaptaki malzemeleri otomatik düşer
7. Başarı mesajı: "Afiyet olsun! Malzemeler güncellendi."

### Senaryo 2: Hızlı Tüketim
1. Kullanıcı Dolabım sayfasında
2. Domates yanındaki "-" butonuna tıklar
3. 1 adet domates düşer
4. Toast mesajı: "1 adet domates tüketildi"

### Senaryo 3: Manuel Kayıt
1. Kullanıcı "Tüketim Kaydet" butonuna tıklar
2. Malzeme seçer: Süt
3. Miktar girer: 500 ml
4. Not ekler: "Kahvaltıda kullandım"
5. Kaydeder
6. Dolaptaki süt miktarı güncellenir

---

## Öncelik Sırası

1. **Yüksek:** "Bu Tarifi Yaptım" butonu
2. **Orta:** Hızlı tüketim butonları
3. **Düşük:** Manuel tüketim kaydı
4. **Gelecek:** Tarif geçmişi sayfası
5. **Premium:** İstatistikler ve grafikler

---

## Notlar

- Tüm tüketim işlemleri geri alınabilir olmalı (undo)
- Bildirimler opsiyonel olmalı
- Mobil kullanım öncelikli tasarım
- Offline çalışma desteği (gelecekte)
