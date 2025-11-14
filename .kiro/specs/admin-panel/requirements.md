# Admin Panel Requirements

## Introduction

Admin Panel, Cookify platformunun yönetim arayüzüdür. Sistem yöneticilerinin kullanıcıları, içerikleri, kategorileri ve sistem ayarlarını yönetmesini sağlar.

## Glossary

- **Admin Panel**: Sistem yöneticilerinin platforma erişim ve yönetim yetkisine sahip olduğu arayüz
- **System Admin**: `isAdmin: true` yetkisine sahip kullanıcı
- **User Management**: Kullanıcı hesaplarını görüntüleme, düzenleme ve silme işlemleri
- **Category**: Malzemelerin gruplandırıldığı kategori sistemi
- **Ingredient**: Sistem genelinde kullanılan malzeme veritabanı
- **Kitchen**: Kullanıcıların oluşturduğu mutfak grupları
- **System Log**: Sistem üzerinde gerçekleşen önemli işlemlerin kaydı
- **Audit Trail**: Kullanıcı ve admin işlemlerinin izlenebilirlik kaydı

## Requirements

### Requirement 1: Admin Erişim Kontrolü

**User Story:** Admin olarak, sadece yetkili kullanıcıların admin paneline erişebilmesini istiyorum, böylece sistem güvenliği sağlanır.

#### Acceptance Criteria

1. WHEN bir kullanıcı admin paneline erişmeye çalıştığında, THE System SHALL kullanıcının `isAdmin` yetkisini kontrol etmeli
2. IF kullanıcı admin yetkisine sahip değilse, THEN THE System SHALL kullanıcıyı dashboard sayfasına yönlendirmeli
3. WHEN admin yetkisi olmayan kullanıcı admin API endpoint'lerine istek gönderdiğinde, THE System SHALL 403 Forbidden hatası döndürmeli
4. THE System SHALL her admin işleminde kullanıcı kimliğini ve işlem zamanını loglamalı

### Requirement 2: Kullanıcı Yönetimi

**User Story:** Admin olarak, tüm kullanıcıları görüntüleyebilmek, admin yetkisi verebilmek ve gerektiğinde kullanıcıları silebilmek istiyorum.

#### Acceptance Criteria

1. THE Admin Panel SHALL tüm kullanıcıları liste halinde görüntülemeli (isim, email, kayıt tarihi, admin durumu)
2. WHEN admin bir kullanıcıya admin yetkisi verdiğinde, THE System SHALL kullanıcının `isAdmin` alanını `true` olarak güncellemeli
3. WHEN admin bir kullanıcıdan admin yetkisini aldığında, THE System SHALL kullanıcının `isAdmin` alanını `false` olarak güncellemeli
4. WHEN admin bir kullanıcıyı sildiğinde, THE System SHALL kullanıcının tüm ilişkili verilerini (mutfak, tarifler) silmeli veya yönetmeli
5. THE System SHALL admin kendini silmesini engellemeli
6. THE System SHALL kullanıcı listesinde arama ve filtreleme özelliği sunmalı

### Requirement 3: Kategori Yönetimi

**User Story:** Admin olarak, malzeme kategorilerini ekleyebilmek, düzenleyebilmek ve silebilmek istiyorum.

#### Acceptance Criteria

1. THE Admin Panel SHALL tüm kategorileri liste halinde görüntülemeli
2. WHEN admin yeni kategori eklediğinde, THE System SHALL kategori adı ve ikon bilgisini kaydetmeli
3. WHEN admin bir kategoriyi düzenlediğinde, THE System SHALL kategori bilgilerini güncellemeli
4. WHEN admin bir kategoriyi silmeye çalıştığında, THE System SHALL kategoriye bağlı malzeme olup olmadığını kontrol etmeli
5. IF kategoriye bağlı malzeme varsa, THEN THE System SHALL silme işlemini engellemeli ve uyarı mesajı göstermeli
6. THE System SHALL kategori adlarının benzersiz olmasını sağlamalı

### Requirement 4: Malzeme Yönetimi

**User Story:** Admin olarak, sistem genelinde kullanılan malzemeleri yönetebilmek istiyorum.

#### Acceptance Criteria

1. THE Admin Panel SHALL tüm malzemeleri kategori bazında görüntülemeli
2. WHEN admin yeni malzeme eklediğinde, THE System SHALL malzeme adı, kategori, varsayılan birim ve raf ömrü bilgilerini kaydetmeli
3. WHEN admin bir malzemeyi düzenlediğinde, THE System SHALL malzeme bilgilerini güncellemeli
4. WHEN admin bir malzemeyi sildiğinde, THE System SHALL malzemenin kullanıldığı yerleri kontrol etmeli
5. THE System SHALL malzeme adlarının kategori içinde benzersiz olmasını sağlamalı
6. THE System SHALL malzeme listesinde arama ve filtreleme özelliği sunmalı

### Requirement 5: Mutfak Yönetimi

**User Story:** Admin olarak, sistemdeki tüm mutfakları görüntüleyebilmek ve gerektiğinde müdahale edebilmek istiyorum.

#### Acceptance Criteria

1. THE Admin Panel SHALL tüm mutfakları liste halinde görüntülemeli (mutfak adı, sahibi, üye sayısı, durum)
2. THE System SHALL her mutfağın detay bilgilerini (üyeler, dolap, market) görüntülemeli
3. WHEN admin bir mutfağı pasif hale getirdiğinde, THE System SHALL mutfak durumunu `PASSIVE` olarak güncellemeli
4. THE System SHALL mutfak istatistiklerini (toplam ürün, aktif üye sayısı) göstermeli
5. THE System SHALL mutfak listesinde arama ve filtreleme özelliği sunmalı

### Requirement 6: Sistem İstatistikleri

**User Story:** Admin olarak, sistem genelindeki istatistikleri görebilmek istiyorum.

#### Acceptance Criteria

1. THE Admin Panel SHALL toplam kullanıcı sayısını görüntülemeli
2. THE System SHALL toplam mutfak sayısını görüntülemeli
3. THE System SHALL toplam tarif sayısını görüntülemeli
4. THE System SHALL toplam malzeme sayısını görüntülemeli
5. THE System SHALL aktif kullanıcı sayısını (son 30 gün) görüntülemeli
6. THE System SHALL günlük, haftalık ve aylık kullanım istatistiklerini sunmalı

### Requirement 7: Sistem Logları

**User Story:** Admin olarak, sistemde gerçekleşen önemli işlemleri görebilmek istiyorum.

#### Acceptance Criteria

1. THE System SHALL kullanıcı kayıt işlemlerini loglamalı
2. THE System SHALL admin yetki değişikliklerini loglamalı
3. THE System SHALL kullanıcı silme işlemlerini loglamalı
4. THE System SHALL kategori ve malzeme değişikliklerini loglamalı
5. THE Admin Panel SHALL logları tarih, kullanıcı ve işlem türüne göre filtreleyebilmeli
6. THE System SHALL logları en az 90 gün boyunca saklamalı

### Requirement 8: Sistem Ayarları

**User Story:** Admin olarak, sistem genelindeki ayarları yönetebilmek istiyorum.

#### Acceptance Criteria

1. THE Admin Panel SHALL sistem ayarlarını görüntülemeli ve düzenleyebilmeli
2. THE System SHALL yeni kullanıcı kaydına izin verme/vermeme ayarını desteklemeli
3. THE System SHALL maksimum dosya yükleme boyutunu ayarlayabilmeli
4. THE System SHALL bakım modu açma/kapama özelliği sunmalı
5. WHEN bakım modu aktifse, THEN THE System SHALL sadece admin kullanıcıların erişimine izin vermeli

### Requirement 9: Güvenlik ve Yetkilendirme

**User Story:** Admin olarak, tüm admin işlemlerinin güvenli ve yetkili şekilde gerçekleşmesini istiyorum.

#### Acceptance Criteria

1. THE System SHALL her admin API isteğinde JWT token doğrulaması yapmalı
2. THE System SHALL token içindeki `isAdmin` yetkisini kontrol etmeli
3. WHEN yetkisiz bir istek geldiğinde, THEN THE System SHALL 403 Forbidden hatası döndürmeli
4. THE System SHALL hassas işlemlerde (kullanıcı silme, yetki verme) ek onay isteyebilmeli
5. THE System SHALL tüm admin işlemlerini audit log'a kaydetmeli

### Requirement 10: Kullanıcı Arayüzü

**User Story:** Admin olarak, kullanımı kolay ve hızlı bir admin paneli istiyorum.

#### Acceptance Criteria

1. THE Admin Panel SHALL responsive tasarıma sahip olmalı (mobil, tablet, desktop)
2. THE System SHALL her işlem için başarı/hata mesajları göstermeli
3. THE Admin Panel SHALL tab bazlı navigasyon sunmalı
4. THE System SHALL yükleme durumlarında loading göstergesi göstermeli
5. THE Admin Panel SHALL her tabloda sayfalama (pagination) özelliği sunmalı
6. THE System SHALL toplu işlem (bulk action) özelliği sunmalı
