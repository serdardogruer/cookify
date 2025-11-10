# Cookify Core v2.0 - Tasarım Dokümanı

## Genel Bakış

Cookify Core, modüler bir mimari ile tasarlanmış, kullanıcıların evdeki malzemelerini ve market alışverişlerini dijital olarak yönetmelerini sağlayan bir web uygulamasıdır. Sistem, Next.js 14, Express.js ve PostgreSQL teknolojileri kullanılarak geliştirilecektir.

## Mimari

### Genel Mimari

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Pages      │  │  Components  │  │    Hooks     │  │
│  │  (App Router)│  │  (React)     │  │  (State Mgmt)│  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                    REST API (HTTP/JSON)
                           │
┌─────────────────────────────────────────────────────────┐
│                Backend (Node.js + Express)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Routes     │  │ Controllers  │  │  Middleware  │  │
│  │  (API)       │  │  (Logic)     │  │  (Auth/Val)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │   Services   │  │  Validators  │                    │
│  │  (Business)  │  │  (Rules)     │                    │
│  └──────────────┘  └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
                           │
                    Prisma ORM
                           │
┌─────────────────────────────────────────────────────────┐
│              PostgreSQL Database (UTF8)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    Users     │  │   Kitchens   │  │   Modules    │  │
│  │  Pantry      │  │    Market    │  │  Categories  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Modüler Mimari

Sistem, modüler bir yapıda tasarlanmıştır. Her modül bağımsız olarak çalışabilir ve yeni modüller kolayca eklenebilir.

```
┌─────────────────────────────────────────────────────────┐
│                     Module System                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Core Modules │  │Future Modules│  │Custom Modules│  │
│  │              │  │              │  │              │  │
│  │ - Pantry     │  │ - Recipes    │  │ - Community  │  │
│  │ - Market     │  │ - AI Suggest │  │ - Third Party│  │
│  │ - Profile    │  │ - Chat       │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Bileşenler ve Arayüzler

### Frontend Bileşen Yapısı

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── profile/
│   │   ├── pantry/
│   │   ├── market/
│   │   └── modules/
│   └── layout.tsx
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Table.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── pantry/
│   │   ├── PantryList.tsx
│   │   ├── PantryForm.tsx
│   │   └── PantryFilters.tsx
│   ├── market/
│   │   ├── MarketList.tsx
│   │   ├── MarketForm.tsx
│   │   └── MarketExport.tsx
│   └── profile/
│       ├── ProfileInfo.tsx
│       ├── ProfileImage.tsx
│       └── KitchenInfo.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── usePantry.ts
│   ├── useMarket.ts
│   └── useKitchen.ts
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   └── utils.ts
└── types/
    ├── user.ts
    ├── kitchen.ts
    ├── pantry.ts
    └── market.ts
```

### Backend Yapısı

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   └── env.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   └── errorHandler.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── profile.routes.ts
│   │   ├── kitchen.routes.ts
│   │   ├── pantry.routes.ts
│   │   ├── market.routes.ts
│   │   └── module.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── profile.controller.ts
│   │   ├── kitchen.controller.ts
│   │   ├── pantry.controller.ts
│   │   ├── market.controller.ts
│   │   └── module.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── kitchen.service.ts
│   │   ├── pantry.service.ts
│   │   ├── market.service.ts
│   │   └── module.service.ts
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── pantry.validator.ts
│   │   └── market.validator.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── bcrypt.ts
│   │   └── fileUpload.ts
│   └── index.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── package.json
```

## Veri Modelleri

### Prisma Schema

```prisma
// User Model
model User {
  id            Int       @id @default(autoincrement())
  name          String
  email         String    @unique
  password      String
  profileImage  String?
  kitchenId     Int?
  kitchen       Kitchen?  @relation("ActiveKitchen", fields: [kitchenId], references: [id])
  ownedKitchens Kitchen[] @relation("KitchenOwner")
  memberships   KitchenMember[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// Kitchen Model
model Kitchen {
  id           Int       @id @default(autoincrement())
  name         String
  inviteCode   String    @unique
  status       KitchenStatus @default(ACTIVE)
  ownerId      Int
  owner        User      @relation("KitchenOwner", fields: [ownerId], references: [id])
  activeUsers  User[]    @relation("ActiveKitchen")
  members      KitchenMember[]
  pantryItems  PantryItem[]
  marketItems  MarketItem[]
  modules      KitchenModule[]
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

enum KitchenStatus {
  ACTIVE
  PASSIVE
}

// Kitchen Member Model
model KitchenMember {
  id        Int      @id @default(autoincrement())
  kitchenId Int
  kitchen   Kitchen  @relation(fields: [kitchenId], references: [id])
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  role      MemberRole @default(MEMBER)
  joinedAt  DateTime @default(now())
}

enum MemberRole {
  OWNER
  MEMBER
}

// Category Model
model Category {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  icon        String?
  ingredients Ingredient[]
  createdAt   DateTime @default(now())
}

// Ingredient Model
model Ingredient {
  id          Int      @id @default(autoincrement())
  name        String
  categoryId  Int
  category    Category @relation(fields: [categoryId], references: [id])
  defaultUnit String
  createdAt   DateTime @default(now())
}

// Pantry Item Model
model PantryItem {
  id         Int      @id @default(autoincrement())
  kitchenId  Int
  kitchen    Kitchen  @relation(fields: [kitchenId], references: [id])
  name       String
  category   String
  quantity   Float
  unit       String
  expiryDate DateTime?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

// Market Item Model
model MarketItem {
  id        Int      @id @default(autoincrement())
  kitchenId Int
  kitchen   Kitchen  @relation(fields: [kitchenId], references: [id])
  name      String
  category  String
  quantity  Float
  unit      String
  status    MarketStatus @default(PENDING)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum MarketStatus {
  PENDING
  DONE
}

// Module Model
model Module {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  slug        String   @unique
  description String
  icon        String
  isCore      Boolean  @default(false)
  isActive    Boolean  @default(true)
  kitchens    KitchenModule[]
  createdAt   DateTime @default(now())
}

// Kitchen Module Model
model KitchenModule {
  id        Int      @id @default(autoincrement())
  kitchenId Int
  kitchen   Kitchen  @relation(fields: [kitchenId], references: [id])
  moduleId  Int
  module    Module   @relation(fields: [moduleId], references: [id])
  isEnabled Boolean  @default(true)
  enabledAt DateTime @default(now())
}

// Unit Conversion Model
model UnitConversion {
  id         Int    @id @default(autoincrement())
  unitFrom   String
  unitTo     String
  multiplier Float
}
```

## API Tasarımı

### Authentication Endpoints

```typescript
// POST /api/auth/register
Request: {
  name: string;
  email: string;
  password: string;
}
Response: {
  user: User;
  token: string;
  kitchen: Kitchen;
}

// POST /api/auth/login
Request: {
  email: string;
  password: string;
}
Response: {
  user: User;
  token: string;
}
```

### Profile Endpoints

```typescript
// GET /api/profile
Response: {
  user: User;
  kitchen: Kitchen;
  members: KitchenMember[];
}

// PUT /api/profile/update
Request: {
  name?: string;
  email?: string;
}
Response: {
  user: User;
}

// POST /api/profile/upload-image
Request: FormData (multipart/form-data)
Response: {
  profileImage: string;
}
```

### Kitchen Endpoints

```typescript
// POST /api/kitchen/join
Request: {
  inviteCode: string;
}
Response: {
  kitchen: Kitchen;
  membership: KitchenMember;
}

// POST /api/kitchen/leave
Response: {
  newKitchen: Kitchen;
}
```

### Pantry Endpoints

```typescript
// GET /api/pantry
Query: {
  category?: string;
}
Response: {
  items: PantryItem[];
}

// POST /api/pantry/add
Request: {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
}
Response: {
  item: PantryItem;
}
```

### Module Endpoints

```typescript
// GET /api/modules
Response: {
  modules: Module[];
  kitchenModules: KitchenModule[];
}

// POST /api/modules/:id/toggle
Response: {
  kitchenModule: KitchenModule;
}
```

## Hata Yönetimi

### Hata Kodları

```typescript
enum ErrorCode {
  // Authentication Errors (1000-1999)
  INVALID_CREDENTIALS = 1001,
  TOKEN_EXPIRED = 1002,
  TOKEN_INVALID = 1003,
  UNAUTHORIZED = 1004,
  
  // Validation Errors (2000-2999)
  VALIDATION_ERROR = 2001,
  INVALID_EMAIL = 2002,
  INVALID_PASSWORD = 2003,
  FILE_TOO_LARGE = 2004,
  INVALID_FILE_TYPE = 2005,
  
  // Resource Errors (3000-3999)
  USER_NOT_FOUND = 3001,
  KITCHEN_NOT_FOUND = 3002,
  ITEM_NOT_FOUND = 3003,
  MODULE_NOT_FOUND = 3004,
  
  // Business Logic Errors (4000-4999)
  KITCHEN_ALREADY_ACTIVE = 4001,
  INVALID_INVITE_CODE = 4002,
  CANNOT_LEAVE_OWN_KITCHEN = 4003,
  MODULE_ALREADY_ENABLED = 4004,
  
  // Server Errors (5000-5999)
  INTERNAL_SERVER_ERROR = 5000,
  DATABASE_ERROR = 5001,
}
```

### Hata Yanıt Formatı

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: any;
  };
}
```

## Test Stratejisi

### Unit Tests

- **Services:** Her servis fonksiyonu için birim testleri
- **Validators:** Tüm validasyon kuralları için testler
- **Utils:** Yardımcı fonksiyonlar için testler

### Integration Tests

- **API Endpoints:** Her endpoint için entegrasyon testleri
- **Database:** Prisma sorguları için testler
- **Authentication:** JWT ve bcrypt işlemleri için testler

### E2E Tests

- **User Flows:** Kayıt, giriş, profil güncelleme akışları
- **Kitchen Management:** Mutfak oluşturma, katılma, ayrılma
- **Pantry & Market:** Malzeme ekleme, düzenleme, silme, taşıma

### Test Araçları

- **Jest:** Unit ve integration testler için
- **Supertest:** API endpoint testleri için
- **Playwright:** E2E testler için
- **Prisma Test Environment:** Database testleri için

## Güvenlik Önlemleri

### Authentication & Authorization

- JWT token ile oturum yönetimi
- bcrypt ile parola hashleme (salt rounds: 10)
- Token expiration: 7 gün
- Refresh token mekanizması (opsiyonel)

### Input Validation

- Zod veya Joi ile request validasyonu
- SQL injection koruması (Prisma ORM)
- XSS koruması (input sanitization)
- CSRF token (Next.js built-in)

### File Upload Security

- Dosya boyutu limiti: 5MB
- İzin verilen formatlar: jpg, png, webp
- Dosya tipi kontrolü (magic number)
- Güvenli dosya adı oluşturma (UUID)

### Database Security

- Prepared statements (Prisma)
- Row-level security (kitchen_id bazlı)
- Encrypted connections
- Regular backups

## Performans Optimizasyonları

### Frontend

- Next.js App Router ile server-side rendering
- Image optimization (next/image)
- Code splitting ve lazy loading
- React Query ile cache yönetimi

### Backend

- Database indexing (email, invite_code, kitchen_id)
- Connection pooling (Prisma)
- Response caching (Redis - opsiyonel)
- Pagination (limit/offset)

### Database

- Composite indexes (kitchen_id + category)
- Query optimization
- Regular VACUUM ve ANALYZE

## Deployment Stratejisi

### Development

- Local PostgreSQL (Docker)
- Hot reload (Next.js + Nodemon)
- Prisma Studio (database GUI)

### Staging

- Vercel (Frontend)
- Railway/Render (Backend)
- Supabase/Neon (PostgreSQL)

### Production

- Vercel (Frontend)
- Railway/Render (Backend)
- Supabase/Neon (PostgreSQL)
- Cloudinary (Image storage)
- Sentry (Error tracking)

## Modül Genişletme Rehberi

### Yeni Modül Ekleme Adımları

1. **Database:** `modules` tablosuna yeni modül ekle
2. **Backend:** Yeni route, controller ve service oluştur
3. **Frontend:** Yeni sayfa ve bileşenler oluştur
4. **Navigation:** Sidebar'a modül linkini ekle
5. **Permissions:** Modül erişim kontrolü ekle

### Modül Şablonu

```typescript
// Backend Service
class ModuleService {
  async getModuleData(kitchenId: number) {
    // Modül verilerini getir
  }
  
  async createModuleItem(kitchenId: number, data: any) {
    // Yeni veri oluştur
  }
}

// Frontend Component
export default function ModulePage() {
  const { data } = useModule();
  
  return (
    <div>
      <ModuleSidebar />
      <ModuleContent data={data} />
    </div>
  );
}
```

## Sonuç

Bu tasarım dokümanı, Cookify Core v2.0'ın modüler, ölçeklenebilir ve güvenli bir şekilde geliştirilmesi için gerekli tüm mimari kararları ve teknik detayları içermektedir. Sistem, gelecekte yeni modüllerin kolayca eklenmesine olanak tanıyacak şekilde tasarlanmıştır.
