# Cookify Core v2.0 - Gereksinimler Dokümanı

## Giriş

Cookify Core, kullanıcıların evdeki malzemelerini dijital olarak yönetmelerini, aile üyeleriyle ortak mutfak paylaşımı yapmalarını ve market alışverişlerini organize etmelerini sağlayan bir web uygulamasıdır.

## Sözlük

- **Sistem**: Cookify Core web uygulaması
- **Kullanıcı**: Uygulamaya kayıt olmuş ve giriş yapmış kişi
- **Mutfak**: Kullanıcıların dolap ve market verilerini paylaştığı dijital alan
- **Dolap**: Evdeki mevcut malzemelerin listelendiği modül
- **Market**: Alınması gereken ürünlerin listelendiği modül
- **Malzeme**: Dolap veya market listesindeki ürün
- **Kategori**: Malzemelerin gruplandırıldığı sınıflandırma (Sebzeler, Meyveler vb.)
- **Davet Kodu**: Mutfağa katılım için kullanılan benzersiz kod
- **SKT**: Son Kullanma Tarihi
- **Aktif Mutfak**: Kullanıcının şu anda kullandığı mutfak
- **Pasif Mutfak**: Kullanıcının daha önce kullandığı ancak şu anda aktif olmayan mutfak
- **Modül**: Sistemin belirli bir işlevselliğini sağlayan bağımsız bileşen (Dolap, Market, Tarifler vb.)
- **Temel Modül**: Tüm kullanıcılara varsayılan olarak sunulan modül
- **Ek Modül**: Kullanıcıların isteğe bağlı olarak aktif edebileceği modül

## Gereksinimler

### Gereksinim 1: Kullanıcı Kaydı ve Kimlik Doğrulama

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, uygulamaya kayıt olup güvenli şekilde giriş yapabilmek istiyorum, böylece kişisel verilerime erişebilirim.

#### Kabul Kriterleri

1. WHEN Kullanıcı kayıt formunu doldurduğunda, THE Sistem SHALL kullanıcı adı, e-posta ve parola alanlarını zorunlu kılacak
2. WHEN Kullanıcı geçerli bilgilerle kayıt olduğunda, THE Sistem SHALL parolayı bcrypt ile hashleyerek veritabanına kaydedecek
3. WHEN Kullanıcı başarıyla kayıt olduğunda, THE Sistem SHALL kullanıcı adıyla "{Kullanıcı Adı} Mutfağı" formatında yeni bir mutfak oluşturacak
4. WHEN Yeni mutfak oluşturulduğunda, THE Sistem SHALL mutfağa benzersiz bir davet kodu atayacak
5. WHEN Kullanıcı kayıt tamamlandığında, THE Sistem SHALL kullanıcıyı profil sayfasına yönlendirecek
6. WHEN Kullanıcı giriş yapmaya çalıştığında, THE Sistem SHALL e-posta ve parola doğrulaması yapacak
7. WHEN Giriş başarılı olduğunda, THE Sistem SHALL JWT token oluşturup kullanıcıya gönderecek
8. WHEN Kullanıcı çıkış yaptığında, THE Sistem SHALL oturum bilgilerini temizleyecek

### Gereksinim 2: Profil Yönetimi

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, profil bilgilerimi ve profil resmimi yönetebilmek istiyorum, böylece hesabımı kişiselleştirebilirim.

#### Kabul Kriterleri

1. WHEN Kullanıcı profil sayfasını açtığında, THE Sistem SHALL kullanıcının adını, e-postasını ve profil resmini gösterecek
2. WHEN Kullanıcı profil resmi yüklediğinde, THE Sistem SHALL dosya boyutunun 5MB'dan küçük olduğunu doğrulayacak
3. WHEN Kullanıcı profil resmi yüklediğinde, THE Sistem SHALL dosya formatının jpg, png veya webp olduğunu doğrulayacak
4. IF Dosya boyutu 5MB'dan büyükse, THEN THE Sistem SHALL hata mesajı gösterecek ve yüklemeyi engelleyecek
5. IF Dosya formatı desteklenmiyorsa, THEN THE Sistem SHALL hata mesajı gösterecek ve yüklemeyi engelleyecek
6. WHEN Kullanıcı yeni profil resmi yüklediğinde, THE Sistem SHALL eski profil resmini sunucudan silecek
7. WHEN Kullanıcının profil resmi yoksa, THE Sistem SHALL varsayılan avatar gösterecek
8. WHEN Kullanıcı profil bilgilerini güncellediğinde, THE Sistem SHALL değişiklikleri veritabanına kaydedecek

### Gereksinim 3: Mutfak Yönetimi

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, kendi mutfağımı yönetebilmek ve başka mutfaklara katılabilmek istiyorum, böylece aile üyeleriyle ortak kullanım yapabilirim.

#### Kabul Kriterleri

1. WHEN Kullanıcı profil sayfasını açtığında, THE Sistem SHALL aktif mutfak adını, üye sayısını ve davet kodunu gösterecek
2. WHEN Kullanıcı davet kodunu kopyala butonuna tıkladığında, THE Sistem SHALL davet kodunu panoya kopyalayacak
3. WHEN Kullanıcı WhatsApp'a gönder butonuna tıkladığında, THE Sistem SHALL davet kodunu WhatsApp paylaşım linkine ekleyecek
4. WHEN Kullanıcı mutfak değiştir butonuna tıkladığında, THE Sistem SHALL davet kodu giriş formu gösterecek
5. WHEN Kullanıcı geçerli bir davet kodu girdiğinde, THE Sistem SHALL kullanıcıyı o mutfağa ekleyecek
6. WHEN Kullanıcı yeni mutfağa katıldığında, THE Sistem SHALL eski mutfağın durumunu "passive" olarak güncelleyecek
7. WHEN Kullanıcı yeni mutfağa katıldığında, THE Sistem SHALL kitchen_members tablosuna yeni kayıt ekleyecek
8. WHEN Kullanıcı mutfaktan ayrıl butonuna tıkladığında, THE Sistem SHALL kullanıcının eski pasif mutfağını aktif hale getirecek
9. IF Kullanıcının pasif mutfağı yoksa, THEN THE Sistem SHALL yeni bir mutfak oluşturacak
10. WHEN Mutfak durumu değiştiğinde, THE Sistem SHALL değişiklikleri veritabanına kaydedecek

### Gereksinim 4: Dolap (Pantry) Yönetimi

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, evdeki malzemelerimi dijital olarak takip edebilmek istiyorum, böylece neyin bittiğini veya bitmek üzere olduğunu görebilirim.

#### Kabul Kriterleri

1. WHEN Kullanıcı dolap sayfasını açtığında, THE Sistem SHALL aktif mutfağa ait tüm malzemeleri kategoriye göre gruplanmış şekilde gösterecek
2. WHEN Kullanıcı kategori filtresine tıkladığında, THE Sistem SHALL sadece seçilen kategorideki malzemeleri gösterecek
3. WHEN Kullanıcı malzeme ekle butonuna tıkladığında, THE Sistem SHALL malzeme ekleme formunu gösterecek
4. WHEN Kullanıcı malzeme adı yazmaya başladığında, THE Sistem SHALL veritabanından eşleşen malzeme önerilerini gösterecek
5. WHEN Kullanıcı yeni malzeme eklediğinde, THE Sistem SHALL malzeme adı, adet, birim ve kategori alanlarını zorunlu kılacak
6. WHEN Kullanıcı malzeme eklediğinde, THE Sistem SHALL malzemeyi aktif mutfağa bağlı olarak veritabanına kaydedecek
7. WHEN Kullanıcı toplu ekleme seçeneğini kullandığında, THE Sistem SHALL birden fazla malzemeyi aynı anda eklemeye izin verecek
8. WHEN Kullanıcı malzeme düzenle butonuna tıkladığında, THE Sistem SHALL mevcut bilgileri dolu şekilde düzenleme formunu gösterecek
9. WHEN Kullanıcı malzeme sildiğinde, THE Sistem SHALL malzemeyi veritabanından kalıcı olarak silecek
10. WHEN Kullanıcı market butonuna tıkladığında, THE Sistem SHALL malzemeyi kategori bilgisiyle birlikte market listesine taşıyacak
11. WHILE Malzeme SKT alanı doldurulduğunda, THE Sistem SHALL tarihi geçerli formatta kabul edecek
12. THE Sistem SHALL malzemeleri ad, adet, birim, kategori, SKT, market, düzenle ve sil kolonlarıyla gösterecek

### Gereksinim 5: Market Listesi Yönetimi

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, alışveriş yapmam gereken ürünleri listeleyebilmek istiyorum, böylece markette ne alacağımı unutmam.

#### Kabul Kriterleri

1. WHEN Kullanıcı market sayfasını açtığında, THE Sistem SHALL aktif mutfağa ait tüm market ürünlerini kategoriye göre gruplanmış şekilde gösterecek
2. WHEN Kullanıcı kategori filtresine tıkladığında, THE Sistem SHALL sadece seçilen kategorideki ürünleri gösterecek
3. WHEN Kullanıcı ürün ekle butonuna tıkladığında, THE Sistem SHALL ürün ekleme formunu gösterecek
4. WHEN Kullanıcı yeni ürün eklediğinde, THE Sistem SHALL ürün adı, adet, birim ve kategori alanlarını zorunlu kılacak
5. WHEN Kullanıcı ürün eklediğinde, THE Sistem SHALL ürünü aktif mutfağa bağlı olarak veritabanına kaydedecek
6. WHEN Kullanıcı ürün düzenle butonuna tıkladığında, THE Sistem SHALL mevcut bilgileri dolu şekilde düzenleme formunu gösterecek
7. WHEN Kullanıcı ürün sildiğinde, THE Sistem SHALL ürünü veritabanından kalıcı olarak silecek
8. WHEN Kullanıcı alındı butonuna tıkladığında, THE Sistem SHALL seçilen ürünleri kategori bilgisiyle birlikte dolaba taşıyacak
9. WHEN Kullanıcı WhatsApp'a aktar butonuna tıkladığında, THE Sistem SHALL market listesini WhatsApp paylaşım formatında hazırlayacak
10. WHEN Kullanıcı yazdır butonuna tıkladığında, THE Sistem SHALL market listesini PDF formatında oluşturacak
11. THE Sistem SHALL ürünleri ad, adet, birim, kategori, düzenle ve sil kolonlarıyla gösterecek

### Gereksinim 6: Kategori ve Malzeme Veritabanı

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, malzeme eklerken önceden tanımlı kategoriler ve malzemeler arasından seçim yapabilmek istiyorum, böylece daha hızlı ekleme yapabilirim.

#### Kabul Kriterleri

1. WHEN Sistem ilk kurulduğunda, THE Sistem SHALL önceden tanımlı kategorileri veritabanına yükleyecek
2. WHEN Sistem ilk kurulduğunda, THE Sistem SHALL yaygın kullanılan malzemeleri kategori bilgileriyle birlikte veritabanına yükleyecek
3. THE Sistem SHALL en az şu kategorileri içerecek: Sebzeler, Meyveler, Et Ürünleri, Bakliyatlar, Süt Ürünleri, Tahıllar, İçecekler, Diğer
4. WHEN Kullanıcı malzeme adı yazmaya başladığında, THE Sistem SHALL ingredients tablosundan eşleşen sonuçları getirecek
5. WHEN Kullanıcı malzeme seçtiğinde, THE Sistem SHALL malzemenin varsayılan birimini otomatik olarak dolduracak
6. THE Sistem SHALL her malzeme için kategori bilgisini saklayacak

### Gereksinim 7: Ortak Mutfak Kullanımı

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, aynı mutfaktaki diğer üyelerle dolap ve market verilerini paylaşabilmek istiyorum, böylece aile içi koordinasyon sağlayabilirim.

#### Kabul Kriterleri

1. WHEN Birden fazla kullanıcı aynı mutfağa üye olduğunda, THE Sistem SHALL tüm üyelere aynı dolap verilerini gösterecek
2. WHEN Birden fazla kullanıcı aynı mutfağa üye olduğunda, THE Sistem SHALL tüm üyelere aynı market verilerini gösterecek
3. WHEN Bir kullanıcı dolaba malzeme eklediğinde, THE Sistem SHALL değişikliği aynı mutfaktaki tüm üyelere yansıtacak
4. WHEN Bir kullanıcı market listesine ürün eklediğinde, THE Sistem SHALL değişikliği aynı mutfaktaki tüm üyelere yansıtacak
5. WHEN Bir kullanıcı malzeme sildiğinde, THE Sistem SHALL değişikliği aynı mutfaktaki tüm üyelere yansıtacak
6. WHEN Bir kullanıcı malzeme düzenlediğinde, THE Sistem SHALL değişikliği aynı mutfaktaki tüm üyelere yansıtacak
7. THE Sistem SHALL tüm dolap ve market işlemlerini kitchen_id bazında filtreleyecek

### Gereksinim 8: Güvenlik ve Yetkilendirme

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, verilerimin güvende olduğundan emin olmak istiyorum, böylece başkaları benim bilgilerime erişemesin.

#### Kabul Kriterleri

1. THE Sistem SHALL tüm parolaları bcrypt algoritması ile hashleyecek
2. WHEN Kullanıcı giriş yaptığında, THE Sistem SHALL JWT token oluşturacak
3. WHEN Kullanıcı korumalı bir endpoint'e istek gönderdiğinde, THE Sistem SHALL JWT token'ı doğrulayacak
4. IF JWT token geçersizse, THEN THE Sistem SHALL 401 Unauthorized hatası döndürecek
5. WHEN Kullanıcı dolap veya market verilerine eriştiğinde, THE Sistem SHALL sadece kullanıcının aktif mutfağına ait verileri gösterecek
6. WHEN Kullanıcı pasif mutfağa erişmeye çalıştığında, THE Sistem SHALL erişimi engelleyecek
7. THE Sistem SHALL veritabanı bağlantısını UTF8 ve Turkish_CI collation ile yapacak
8. THE Sistem SHALL profil resmi yüklemelerinde dosya tipi validasyonu yapacak

### Gereksinim 9: Modül Yönetimi

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, sistemdeki modülleri görebilmek ve ileride yeni modüller ekleyebilmek istiyorum, böylece ihtiyacıma göre sistemi genişletebilirim.

#### Kabul Kriterleri

1. THE Sistem SHALL modüler bir mimari ile tasarlanacak
2. WHEN Sistem ilk kurulduğunda, THE Sistem SHALL temel modülleri (Dolap, Market) aktif olarak sunacak
3. WHEN Kullanıcı profil sayfasındaki Modül Yükseltme butonuna tıkladığında, THE Sistem SHALL mevcut ve gelecekteki modülleri listeleyecek
4. THE Sistem SHALL her modül için ad, açıklama, durum (aktif/pasif) ve ikon bilgisi saklayacak
5. WHEN Yeni bir modül eklendiğinde, THE Sistem SHALL modülü veritabanına kaydedecek
6. THE Sistem SHALL modülleri mutfak bazında yönetecek (her mutfak farklı modüllere sahip olabilir)
7. WHEN Kullanıcı bir modülü aktif ettiğinde, THE Sistem SHALL modülün menüde görünmesini sağlayacak
8. THE Sistem SHALL modül ekleme ve kaldırma işlemlerini destekleyecek şekilde tasarlanacak

### Gereksinim 10: Kullanıcı Arayüzü ve Tema

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, modern ve kullanımı kolay bir arayüz görmek istiyorum, böylece uygulamayı rahatça kullanabilirim.

#### Kabul Kriterleri

1. THE Sistem SHALL varsayılan olarak koyu (dark) tema kullanacak
2. THE Sistem SHALL TailwindCSS ile stil uygulanmış bileşenler içerecek
3. THE Sistem SHALL mobil cihazlarda responsive olarak çalışacak
4. WHEN Kullanıcı profil sayfasını açtığında, THE Sistem SHALL sidebar menüsünü gösterecek
5. THE Sistem SHALL sidebar menüsünde şu seçenekleri gösterecek: Site Ayarları, Profil Ayarları, Mutfak Değişimi, Modül Yükseltme, Çıkış
6. WHEN Kullanıcı dolap veya market sayfasını açtığında, THE Sistem SHALL sidebar'da ilgili filtreleme ve ekleme seçeneklerini gösterecek
7. THE Sistem SHALL tüm tablolarda düzenle ve sil butonlarını gösterecek
8. THE Sistem SHALL kullanıcı işlemlerinde başarı ve hata mesajları gösterecek
