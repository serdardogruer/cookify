# 🌐 Cookify DNS Yapılandırma Rehberi

## 📋 Durum

- **Domain:** cookify.tr (Turhost'ta)
- **VDS Sunucu:** 80.253.246.134 (Hosting Dünyam'da)
- **Hedef:** Domain'i VDS sunucuya yönlendir

## 🎯 DNS Ayarları

Turhost panelinde aşağıdaki DNS kayıtlarını oluşturmanız gerekiyor:

### A Kayıtları

| Tip | Host | Değer | TTL |
|-----|------|-------|-----|
| A | @ | 80.253.246.134 | 3600 |
| A | www | 80.253.246.134 | 3600 |
| A | api | 80.253.246.134 | 3600 |

### Açıklama

- **@** → cookify.tr → Frontend (Ana site)
- **www** → www.cookify.tr → Ana siteye yönlendirme
- **api** → api.cookify.tr → Backend API

## 📝 Adım Adım Kurulum

### 1. Turhost Paneline Giriş

1. https://panel.turhost.com/domain adresine gidin
2. Giriş yapın
3. **cookify.tr** domain'ini bulun
4. **Yönetim** veya **DNS Yönetimi** butonuna tıklayın

### 2. DNS Zone File Düzenleme

Turhost'ta genellikle iki seçenek vardır:

#### Seçenek A: Name Server Değiştirme (Önerilmez)
- Eğer name server'ları değiştirirseniz, DNS yönetimi Hosting Dünyam'a geçer
- Bu seçeneği kullanmayın

#### Seçenek B: DNS Zone File (A Record) Düzenleme (✅ ÖNERİLEN)
- Mevcut DNS kayıtlarını düzenleyin
- Aşağıdaki kayıtları ekleyin veya güncelleyin

### 3. A Record Ekle/Güncelle

**Yeni A Record Eklemek için:**

1. "Yeni Kayıt Ekle" veya "Add DNS Record" butonunu bulun
2. Her bir kayıt için:

**Kayıt 1 - Ana Domain:**
```
Tip: A
Host/Name: @ (veya boş)
IP/Value: 80.253.246.134
TTL: 3600 (veya default)
```

**Kayıt 2 - WWW:**
```
Tip: A
Host/Name: www
IP/Value: 80.253.246.134
TTL: 3600
```

**Kayıt 3 - API Subdomain:**
```
Tip: A
Host/Name: api
IP/Value: 80.253.246.134
TTL: 3600
```

3. Her kaydı ekledikten sonra "Kaydet" deyin

### 4. Mevcut Kayıtları Kontrol Et

Eğer cookify.tr için zaten A record varsa:
- **SİL** veya **GÜNCELLE**
- Yeni IP adresini girin: 80.253.246.134

### 5. Kaydet ve Bekle

- Değişiklikleri kaydedin
- DNS yayılması için **1-24 saat** bekleyin
  - Genellikle 1-2 saat içinde aktif olur
  - Bazı durumlarda 24 saat sürebilir

## ✅ DNS Kontrolü

### Terminal/CMD'de Test:

```bash
# Windows'ta (PowerShell veya CMD)
nslookup cookify.tr
nslookup www.cookify.tr
nslookup api.cookify.tr

# Hepsinde 80.253.246.134 görmelisiniz
```

### Online Test:

Şu sitelerde test edebilirsiniz:
- https://www.whatsmydns.net/
- https://dnschecker.org/

## 🔍 Sorun Giderme

### DNS yayılmadıysa:

1. **Turhost DNS ayarlarını tekrar kontrol edin**
   - A record'lar doğru mu?
   - IP adresi 80.253.246.134 mi?

2. **DNS Cache'i temizleyin:**

**Windows'ta:**
```powershell
ipconfig /flushdns
```

**Mac/Linux'ta:**
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

3. **Browser cache'i temizleyin:**
   - Ctrl+Shift+Del
   - Önbellek temizle

### Hala çalışmıyorsa:

- DNS yayılmasını bekleyin (24 saat)
- Turhost destek ekibiyle iletişime geçin
- DNS kayıtlarının screenshot'unu alın

## 📱 Sunucu Tarafı Kontrol

DNS yayıldıktan sonra sunucuda kontrol edin:

```bash
# Sunucuya SSH ile bağlanın
ssh root@80.253.246.134

# Nginx ayarlarını test edin
sudo nginx -t

# Nginx'i restart edin
sudo systemctl restart nginx

# SSL sertifikası alın (DNS yayıldıktan sonra)
sudo certbot --nginx -d cookify.tr -d www.cookify.tr -d api.cookify.tr
```

## 🎯 Sonuç

DNS ayarları tamamlandıktan ve yayıldıktan sonra:

✅ **cookify.tr** → Frontend
✅ **www.cookify.tr** → Frontend
✅ **api.cookify.tr** → Backend API

Tüm adresler 80.253.246.134 sunucunuza yönlendirilecek ve Nginx yapılandırması sayesinde doğru servislere iletilecektir.

---

**Hazırlayan:** Antigravity AI  
**Tarih:** 11 Aralık 2024
