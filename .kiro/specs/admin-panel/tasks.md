# Admin Panel Implementation Plan

## Task Overview

Bu plan, Admin Panel özelliklerini mevcut sistemi bozmadan eklemek için tasarlanmıştır. Her task, önceki task'lere bağımlıdır ve artımlı olarak ilerlenir.

---

## Phase 1: Database Schema ve Temel Altyapı

- [x] 1. Veritabanı şemasını güncelle


  - Prisma schema'ya `SystemLog` modelini ekle
  - Prisma schema'ya `SystemSettings` modelini ekle
  - User modeline yeni ilişkileri ekle
  - Migration oluştur ve çalıştır
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 8.1_

- [x] 2. Admin middleware oluştur



  - `backend/src/middleware/admin.middleware.ts` dosyasını oluştur
  - `checkAdminAuth` fonksiyonunu implement et
  - `logAdminAction` fonksiyonunu implement et
  - Middleware'i test et
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 9.1, 9.2_

---

## Phase 2: Log Service ve Sistem Ayarları

- [x] 3. Log service oluştur


  - `backend/src/services/admin/log.service.ts` dosyasını oluştur
  - `createLog` fonksiyonunu implement et
  - `getLogs` fonksiyonunu implement et (filtreleme ile)
  - `cleanOldLogs` fonksiyonunu implement et
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 4. Settings service oluştur


  - `backend/src/services/admin/settings.service.ts` dosyasını oluştur
  - `getSettings` fonksiyonunu implement et
  - `updateSettings` fonksiyonunu implement et
  - `toggleMaintenanceMode` fonksiyonunu implement et
  - Varsayılan ayarları seed et
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 5. Log ve Settings controller'ları oluştur


  - `backend/src/controllers/admin/logs.controller.ts` dosyasını oluştur
  - `backend/src/controllers/admin/settings.controller.ts` dosyasını oluştur
  - Controller fonksiyonlarını implement et
  - Error handling ekle
  - _Requirements: 7.5, 8.1_

---

## Phase 3: Kullanıcı Yönetimi

- [x] 6. User management service oluştur



  - `backend/src/services/admin/user-management.service.ts` dosyasını oluştur
  - `getAllUsers` fonksiyonunu implement et (filtreleme ile)
  - `getUserById` fonksiyonunu implement et
  - `toggleAdminStatus` fonksiyonunu implement et (log ile)
  - `deleteUser` fonksiyonunu implement et (cascade işlemleri ile)
  - `searchUsers` fonksiyonunu implement et
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 7. User management controller oluştur


  - `backend/src/controllers/admin/users.controller.ts` dosyasını oluştur
  - Tüm endpoint'leri implement et
  - Admin middleware ekle
  - Error handling ve validation ekle
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

---

## Phase 4: Kategori Yönetimi



- [ ] 8. Category management service oluştur
  - `backend/src/services/admin/category-management.service.ts` dosyasını oluştur
  - `getAllCategories` fonksiyonunu implement et
  - `createCategory` fonksiyonunu implement et
  - `updateCategory` fonksiyonunu implement et
  - `deleteCategory` fonksiyonunu implement et (kullanım kontrolü ile)

  - `checkCategoryUsage` fonksiyonunu implement et
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 9. Category management controller oluştur


  - `backend/src/controllers/admin/categories.controller.ts` dosyasını oluştur
  - Tüm endpoint'leri implement et
  - Admin middleware ekle
  - Error handling ve validation ekle
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

---

## Phase 5: Mutfak Yönetimi

- [x] 10. Kitchen management service oluştur


  - `backend/src/services/admin/kitchen-management.service.ts` dosyasını oluştur
  - `getAllKitchens` fonksiyonunu implement et (filtreleme ile)
  - `getKitchenDetails` fonksiyonunu implement et
  - `updateKitchenStatus` fonksiyonunu implement et
  - `getKitchenStats` fonksiyonunu implement et
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 11. Kitchen management controller oluştur


  - `backend/src/controllers/admin/kitchens.controller.ts` dosyasını oluştur
  - Tüm endpoint'leri implement et
  - Admin middleware ekle
  - Error handling ekle
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

---

## Phase 6: Backend Routes Entegrasyonu

- [x] 12. Admin routes'ları güncelle


  - `backend/src/routes/admin.routes.ts` dosyasını güncelle
  - Yeni endpoint'leri ekle (mevcut route'ları BOZMADAN)
  - Admin middleware'i tüm route'lara ekle
  - Route'ları test et
  - _Requirements: 1.1, 1.2, 1.3, 9.1, 9.2, 9.3_

- [x] 13. Ana index.ts'e route'ları ekle



  - `backend/src/index.ts` dosyasını güncelle (sadece yeni route'ları ekle)
  - Mevcut route'lara DOKUNMA
  - _Requirements: Tüm backend requirements_

---

## Phase 7: Frontend - Kullanıcı Yönetimi UI

- [x] 14. User management component'leri oluştur


  - `frontend/src/components/admin/UserManagementTable.tsx` oluştur
  - Kullanıcı listesi tablosu
  - Admin toggle butonu
  - Kullanıcı silme butonu (onay ile)
  - Arama ve filtreleme
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6, 10.1, 10.2, 10.5_

- [x] 15. Users tab'ını admin sayfasına ekle



  - `frontend/src/app/dashboard/admin/page.tsx` güncelle
  - Yeni "Kullanıcılar" tab'ı ekle
  - UserManagementTable component'ini entegre et
  - API çağrılarını ekle
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 10.3_

---

## Phase 8: Frontend - Kategori Yönetimi UI


- [x] 16. Category management component'leri oluştur

  - `frontend/src/components/admin/CategoryForm.tsx` oluştur
  - Kategori ekleme/düzenleme formu
  - Kategori listesi tablosu
  - Silme butonu (kullanım kontrolü ile)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 10.1, 10.2_

- [x] 17. Categories tab'ını admin sayfasına ekle



  - `frontend/src/app/dashboard/admin/page.tsx` güncelle
  - Yeni "Kategoriler" tab'ı ekle
  - CategoryForm component'ini entegre et
  - API çağrılarını ekle
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 10.3_

---

## Phase 9: Frontend - Mutfak Yönetimi UI

- [x] 18. Kitchen management component'leri oluştur


  - `frontend/src/components/admin/KitchenDetailsModal.tsx` oluştur
  - Mutfak listesi tablosu
  - Mutfak detay modal'ı
  - Durum değiştirme butonu
  - İstatistikler görünümü
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 10.1, 10.2_

- [x] 19. Kitchens tab'ını admin sayfasına ekle

  - `frontend/src/app/dashboard/admin/page.tsx` güncelle
  - Yeni "Mutfaklar" tab'ı ekle
  - KitchenDetailsModal component'ini entegre et
  - API çağrılarını ekle
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 10.3_

---

## Phase 10: Frontend - Log Görüntüleme UI

- [x] 20. Log viewer component'leri oluştur

  - `frontend/src/components/admin/LogViewer.tsx` oluştur
  - Log listesi tablosu
  - Tarih, kullanıcı, tip filtreleme
  - Sayfalama (pagination)
  - Log detay görünümü
  - _Requirements: 7.5, 10.1, 10.2, 10.5_

- [x] 21. Logs tab'ını admin sayfasına ekle

  - `frontend/src/app/dashboard/admin/page.tsx` güncelle
  - Yeni "Loglar" tab'ı ekle
  - LogViewer component'ini entegre et
  - API çağrılarını ekle
  - _Requirements: 7.5, 10.3_

---

## Phase 11: Frontend - Sistem Ayarları UI

- [x] 22. Settings form component'leri oluştur

  - `frontend/src/components/admin/SettingsForm.tsx` oluştur
  - Ayar formu (toggle'lar, input'lar)
  - Bakım modu toggle'ı
  - Kaydetme butonu
  - Onay dialog'ları
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 10.1, 10.2_

- [x] 23. Settings tab'ını admin sayfasına ekle


  - `frontend/src/app/dashboard/admin/page.tsx` güncelle
  - Yeni "Ayarlar" tab'ı ekle
  - SettingsForm component'ini entegre et
  - API çağrılarını ekle
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 10.3_

---

## Phase 12: İstatistikler ve Dashboard Güncellemeleri

- [x] 24. Stats tab'ını güncelle


  - Mevcut stats tab'ına yeni istatistikler ekle
  - Aktif kullanıcı sayısı (son 30 gün)
  - Grafik ve chart'lar ekle (opsiyonel)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 25. Admin navigation'ı iyileştir

  - Tab navigasyonunu güncelle
  - Responsive tasarım kontrolü
  - Loading state'leri ekle
  - _Requirements: 10.1, 10.3, 10.4_

---

## Phase 13: Testing ve Optimizasyon

- [ ]* 26. Backend testleri yaz
  - Service unit testleri
  - Controller integration testleri
  - Middleware testleri
  - _Requirements: Tüm backend requirements_

- [ ]* 27. Frontend testleri yaz
  - Component testleri
  - Integration testleri
  - _Requirements: Tüm frontend requirements_

- [x] 28. Performance optimizasyonu

  - Database index'leri ekle
  - Pagination implement et
  - Loading state'leri optimize et
  - _Requirements: 10.4, 10.5_

---

## Phase 14: Güvenlik ve Son Kontroller

- [x] 29. Güvenlik kontrollerini tamamla

  - Rate limiting ekle
  - Input validation kontrol et
  - Error handling kontrol et
  - Audit logging kontrol et
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 30. Dokümantasyon ve deployment


  - API dokümantasyonu güncelle
  - README güncelle
  - Migration guide hazırla
  - Production deployment
  - _Requirements: Tüm requirements_

---

## Notlar

- **Mevcut Sistemi Koruma:** Her task'te mevcut dosyalara sadece zorunlu durumlarda dokunulacak
- **Artımlı İlerleme:** Her task bağımsız test edilebilir
- **Rollback Planı:** Her phase sonunda sistem çalışır durumda olacak
- **Opsiyonel Task'ler:** `*` ile işaretli task'ler opsiyoneldir (testler)
