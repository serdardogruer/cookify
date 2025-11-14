# Admin Panel Design Document

## Overview

Admin Panel, Cookify platformunun kapsamlı yönetim arayüzüdür. Mevcut temel admin özelliklerini genişleterek kullanıcı yönetimi, kategori yönetimi, mutfak yönetimi, sistem logları ve ayarları içerir. **Mevcut sistemi bozmadan** yeni özellikler eklenecektir.

## Architecture

### Backend Architecture

```
backend/
├── src/
│   ├── controllers/
│   │   ├── admin.controller.ts (MEVCUT - Genişletilecek)
│   │   └── admin/
│   │       ├── users.controller.ts (YENİ)
│   │       ├── categories.controller.ts (YENİ)
│   │       ├── kitchens.controller.ts (YENİ)
│   │       ├── logs.controller.ts (YENİ)
│   │       └── settings.controller.ts (YENİ)
│   ├── services/
│   │   └── admin/
│   │       ├── user-management.service.ts (YENİ)
│   │       ├── category-management.service.ts (YENİ)
│   │       ├── kitchen-management.service.ts (YENİ)
│   │       ├── log.service.ts (YENİ)
│   │       └── settings.service.ts (YENİ)
│   ├── middleware/
│   │   └── admin.middleware.ts (YENİ)
│   └── routes/
│       └── admin.routes.ts (MEVCUT - Genişletilecek)
```

### Frontend Architecture

```
frontend/
├── src/
│   ├── app/
│   │   └── dashboard/
│   │       └── admin/
│   │           ├── page.tsx (MEVCUT - Genişletilecek)
│   │           ├── users/
│   │           │   └── page.tsx (YENİ)
│   │           ├── categories/
│   │           │   └── page.tsx (YENİ)
│   │           ├── kitchens/
│   │           │   └── page.tsx (YENİ)
│   │           ├── logs/
│   │           │   └── page.tsx (YENİ)
│   │           └── settings/
│   │               └── page.tsx (YENİ)
│   └── components/
│       └── admin/
│           ├── UserManagementTable.tsx (YENİ)
│           ├── CategoryForm.tsx (YENİ)
│           ├── KitchenDetailsModal.tsx (YENİ)
│           ├── LogViewer.tsx (YENİ)
│           └── SettingsForm.tsx (YENİ)
```

## Components and Interfaces

### 1. Admin Middleware (YENİ)

**Dosya:** `backend/src/middleware/admin.middleware.ts`

```typescript
interface AdminMiddleware {
  checkAdminAuth(req, res, next): void;
  logAdminAction(action: string, userId: number, details: any): Promise<void>;
}
```

**Sorumluluk:**
- Admin yetkisi kontrolü
- Admin işlemlerini loglama
- Yetkisiz erişimleri engelleme

### 2. User Management Service (YENİ)

**Dosya:** `backend/src/services/admin/user-management.service.ts`

```typescript
interface UserManagementService {
  getAllUsers(filters?: UserFilters): Promise<User[]>;
  getUserById(userId: number): Promise<User>;
  toggleAdminStatus(userId: number, isAdmin: boolean): Promise<User>;
  deleteUser(userId: number): Promise<void>;
  searchUsers(query: string): Promise<User[]>;
}
```

**Sorumluluk:**
- Kullanıcı listesi ve detayları
- Admin yetkisi verme/alma
- Kullanıcı silme (cascade işlemleri)
- Kullanıcı arama

### 3. Category Management Service (YENİ)

**Dosya:** `backend/src/services/admin/category-management.service.ts`

```typescript
interface CategoryManagementService {
  getAllCategories(): Promise<Category[]>;
  createCategory(data: CreateCategoryDto): Promise<Category>;
  updateCategory(id: number, data: UpdateCategoryDto): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  checkCategoryUsage(id: number): Promise<{ canDelete: boolean; usageCount: number }>;
}
```

**Sorumluluk:**
- Kategori CRUD işlemleri
- Kategori kullanım kontrolü
- Kategori validasyonu

### 4. Kitchen Management Service (YENİ)

**Dosya:** `backend/src/services/admin/kitchen-management.service.ts`

```typescript
interface KitchenManagementService {
  getAllKitchens(filters?: KitchenFilters): Promise<Kitchen[]>;
  getKitchenDetails(kitchenId: number): Promise<KitchenDetails>;
  updateKitchenStatus(kitchenId: number, status: string): Promise<Kitchen>;
  getKitchenStats(kitchenId: number): Promise<KitchenStats>;
}
```

**Sorumluluk:**
- Mutfak listesi ve detayları
- Mutfak durumu yönetimi
- Mutfak istatistikleri

### 5. Log Service (YENİ)

**Dosya:** `backend/src/services/admin/log.service.ts`

```typescript
interface LogService {
  createLog(type: LogType, userId: number, action: string, details: any): Promise<Log>;
  getLogs(filters: LogFilters): Promise<Log[]>;
  cleanOldLogs(daysToKeep: number): Promise<number>;
}
```

**Sorumluluk:**
- Log oluşturma
- Log sorgulama ve filtreleme
- Eski logları temizleme

### 6. Settings Service (YENİ)

**Dosya:** `backend/src/services/admin/settings.service.ts`

```typescript
interface SettingsService {
  getSettings(): Promise<SystemSettings>;
  updateSettings(data: UpdateSettingsDto): Promise<SystemSettings>;
  toggleMaintenanceMode(enabled: boolean): Promise<void>;
}
```

**Sorumluluk:**
- Sistem ayarlarını okuma/yazma
- Bakım modu yönetimi
- Ayar validasyonu

## Data Models

### 1. SystemLog Model (YENİ)

```prisma
model SystemLog {
  id        Int      @id @default(autoincrement())
  type      String   // USER_ACTION, ADMIN_ACTION, SYSTEM_EVENT
  userId    Int?
  user      User?    @relation(fields: [userId], references: [id])
  action    String   // LOGIN, LOGOUT, CREATE_USER, DELETE_USER, etc.
  details   String?  // JSON string
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())

  @@map("system_logs")
}
```

### 2. SystemSettings Model (YENİ)

```prisma
model SystemSettings {
  id                    Int      @id @default(autoincrement())
  allowRegistration     Boolean  @default(true)
  maintenanceMode       Boolean  @default(false)
  maxFileUploadSize     Int      @default(5242880) // 5MB in bytes
  sessionTimeout        Int      @default(86400) // 24 hours in seconds
  updatedAt             DateTime @updatedAt
  updatedBy             Int?
  updatedByUser         User?    @relation(fields: [updatedBy], references: [id])

  @@map("system_settings")
}
```

### 3. User Model (MEVCUT - İlişki Ekleme)

```prisma
// Mevcut User modeline eklenecek ilişkiler
model User {
  // ... mevcut alanlar
  systemLogs    SystemLog[]
  settingsUpdates SystemSettings[]
}
```

## API Endpoints

### User Management Endpoints (YENİ)

```
GET    /api/admin/users              - Tüm kullanıcıları listele
GET    /api/admin/users/:id          - Kullanıcı detayı
POST   /api/admin/users/:id/toggle-admin - Admin yetkisi ver/al
DELETE /api/admin/users/:id          - Kullanıcı sil
GET    /api/admin/users/search       - Kullanıcı ara
```

### Category Management Endpoints (YENİ)

```
GET    /api/admin/categories         - Tüm kategorileri listele
POST   /api/admin/categories         - Yeni kategori oluştur
PUT    /api/admin/categories/:id     - Kategori güncelle
DELETE /api/admin/categories/:id     - Kategori sil
GET    /api/admin/categories/:id/usage - Kategori kullanım bilgisi
```

### Kitchen Management Endpoints (YENİ)

```
GET    /api/admin/kitchens           - Tüm mutfakları listele
GET    /api/admin/kitchens/:id       - Mutfak detayı
PUT    /api/admin/kitchens/:id/status - Mutfak durumu güncelle
GET    /api/admin/kitchens/:id/stats - Mutfak istatistikleri
```

### Log Endpoints (YENİ)

```
GET    /api/admin/logs               - Logları listele (filtreleme ile)
POST   /api/admin/logs/clean         - Eski logları temizle
```

### Settings Endpoints (YENİ)

```
GET    /api/admin/settings           - Sistem ayarlarını getir
PUT    /api/admin/settings           - Sistem ayarlarını güncelle
POST   /api/admin/settings/maintenance - Bakım modunu aç/kapat
```

### Mevcut Endpoints (DEĞİŞMEYECEK)

```
GET    /api/admin/stats              - İstatistikler (MEVCUT)
GET    /api/admin/users              - Kullanıcılar (MEVCUT - Genişletilecek)
GET    /api/admin/ingredients        - Malzemeler (MEVCUT)
POST   /api/admin/ingredients        - Malzeme ekle (MEVCUT)
PUT    /api/admin/ingredients/:id    - Malzeme güncelle (MEVCUT)
DELETE /api/admin/ingredients/:id    - Malzeme sil (MEVCUT)
```

## Error Handling

### Error Codes

```typescript
enum AdminErrorCodes {
  UNAUTHORIZED = 4001,
  FORBIDDEN = 4003,
  USER_NOT_FOUND = 4041,
  CATEGORY_NOT_FOUND = 4042,
  KITCHEN_NOT_FOUND = 4043,
  CATEGORY_IN_USE = 4091,
  CANNOT_DELETE_SELF = 4092,
  INVALID_SETTINGS = 4093,
}
```

### Error Response Format

```typescript
{
  success: false,
  error: {
    code: number,
    message: string,
    details?: any
  }
}
```

## Testing Strategy

### Unit Tests

1. **Service Tests**
   - User management service fonksiyonları
   - Category management service fonksiyonları
   - Log service fonksiyonları
   - Settings service fonksiyonları

2. **Middleware Tests**
   - Admin yetki kontrolü
   - Log oluşturma

### Integration Tests

1. **API Endpoint Tests**
   - Her endpoint için başarılı senaryo
   - Her endpoint için hata senaryoları
   - Yetkilendirme testleri

2. **Database Tests**
   - Cascade delete işlemleri
   - Transaction işlemleri
   - Constraint testleri

### E2E Tests (Opsiyonel)

1. **Admin Panel Flow**
   - Admin girişi
   - Kullanıcı yönetimi akışı
   - Kategori yönetimi akışı
   - Log görüntüleme

## Security Considerations

### 1. Authentication & Authorization

- Her admin endpoint'inde JWT token kontrolü
- `isAdmin` yetkisi kontrolü
- Rate limiting (admin endpoint'leri için)

### 2. Input Validation

- Tüm input'lar validate edilmeli
- SQL injection koruması (Prisma otomatik sağlar)
- XSS koruması

### 3. Audit Logging

- Tüm admin işlemleri loglanmalı
- Hassas işlemler (kullanıcı silme, yetki verme) özel loglanmalı
- IP adresi ve user agent kaydedilmeli

### 4. Data Protection

- Hassas veriler (şifreler) loglanmamalı
- GDPR uyumluluğu (kullanıcı silme)
- Soft delete seçeneği

## Performance Considerations

### 1. Database Optimization

- Index'ler:
  - `SystemLog.createdAt` (log sorgulama için)
  - `SystemLog.userId` (kullanıcı bazlı sorgular için)
  - `SystemLog.type` (tip bazlı filtreleme için)

### 2. Caching

- Sistem ayarları cache'lenebilir (Redis)
- Kategori listesi cache'lenebilir
- İstatistikler cache'lenebilir (5 dakika TTL)

### 3. Pagination

- Tüm liste endpoint'lerinde pagination
- Varsayılan sayfa boyutu: 50
- Maksimum sayfa boyutu: 200

## UI/UX Design

### 1. Navigation Structure

```
Admin Panel
├── Dashboard (İstatistikler)
├── Kullanıcılar
├── Kategoriler
├── Malzemeler (MEVCUT)
├── Mutfaklar
├── Loglar
└── Ayarlar
```

### 2. Component Hierarchy

```
AdminPage (MEVCUT - Genişletilecek)
├── AdminHeader
├── AdminTabs
│   ├── StatsTab (MEVCUT)
│   ├── UsersTab (YENİ)
│   ├── CategoriesTab (YENİ)
│   ├── IngredientsTab (MEVCUT)
│   ├── KitchensTab (YENİ)
│   ├── LogsTab (YENİ)
│   └── SettingsTab (YENİ)
└── AdminFooter
```

### 3. Design Patterns

- **Consistent Colors:**
  - Primary: `#30D158` (Green)
  - Background: `#121212` (Dark)
  - Card: `#1E1E1E` (Dark Gray)
  - Text: `#FFFFFF` (White)
  - Secondary Text: `#A0A0A0` (Gray)

- **Responsive Design:**
  - Mobile: Single column, stacked cards
  - Tablet: Two columns
  - Desktop: Full table view

- **Loading States:**
  - Skeleton loaders
  - Spinner for actions
  - Progress bars for bulk operations

## Migration Strategy

### Phase 1: Database Schema
1. Prisma schema'ya yeni modeller ekle
2. Migration oluştur ve çalıştır
3. Seed data ekle (gerekirse)

### Phase 2: Backend Services
1. Yeni service dosyalarını oluştur
2. Admin middleware ekle
3. Yeni controller'ları oluştur
4. Route'ları ekle

### Phase 3: Frontend Components
1. Yeni component'leri oluştur
2. Mevcut admin sayfasını genişlet
3. Yeni tab'ları ekle

### Phase 4: Testing & Deployment
1. Unit testler
2. Integration testler
3. Manual testing
4. Production deployment

## Rollback Plan

Eğer bir sorun çıkarsa:
1. Yeni route'ları devre dışı bırak
2. Yeni component'leri gizle
3. Database migration'ı geri al (gerekirse)
4. Mevcut sistem çalışmaya devam eder (hiçbir şey bozulmaz)
