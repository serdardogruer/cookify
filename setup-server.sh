#!/bin/bash
# Cookify Hızlı Kurulum Script'i
# Bu script'i sunucunuzda çalıştırarak otomatik kurulum yapabilirsiniz

set -e  # Hata durumunda dur

echo "🍳 Cookify Sunucu Kurulumu Başlatılıyor..."
echo "================================================"

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Adım sayacı
STEP=1

print_step() {
    echo -e "\n${GREEN}[Adım $STEP]${NC} $1"
    ((STEP++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Root kontrolü
if [ "$EUID" -ne 0 ]; then 
    print_error "Bu script'i sudo ile çalıştırın: sudo bash setup-server.sh"
    exit 1
fi

# Sistem güncellemesi
print_step "Sistem güncelleniyor..."
apt update && apt upgrade -y
print_success "Sistem güncellendi"

# Gerekli araçları yükle
print_step "Gerekli araçlar yükleniyor..."
apt install -y curl wget git build-essential ufw
print_success "Araçlar yüklendi"

# Node.js kurulumu
print_step "Node.js yükleniyor..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    print_success "Node.js yüklendi: $(node --version)"
else
    print_warning "Node.js zaten yüklü: $(node --version)"
fi

# PostgreSQL kurulumu
print_step "PostgreSQL yükleniyor..."
if ! command -v psql &> /dev/null; then
    apt install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
    print_success "PostgreSQL yüklendi: $(psql --version)"
else
    print_warning "PostgreSQL zaten yüklü: $(psql --version)"
fi

# Nginx kurulumu
print_step "Nginx yükleniyor..."
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
    print_success "Nginx yüklendi"
else
    print_warning "Nginx zaten yüklü"
fi

# Firewall ayarları
print_step "Firewall yapılandırılıyor..."
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw --force enable
print_success "Firewall yapılandırıldı"

# PostgreSQL database oluştur
print_step "PostgreSQL database ayarlanıyor..."
sudo -u postgres psql -c "CREATE USER cookify_user WITH PASSWORD 'dgrr1213';" 2>/dev/null || print_warning "Kullanıcı zaten var"
sudo -u postgres psql -c "CREATE DATABASE cookify OWNER cookify_user;" 2>/dev/null || print_warning "Database zaten var"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE cookify TO cookify_user;" 2>/dev/null
print_success "Database ayarlandı"

# PM2 kurulumu
print_step "PM2 yükleniyor..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    print_success "PM2 yüklendi"
else
    print_warning "PM2 zaten yüklü"
fi

# Proje dizini oluştur
print_step "Proje dizini hazırlanıyor..."
mkdir -p /var/www
cd /var/www

# Git kontrolü
if [ ! -d "cookify" ]; then
    print_warning "Proje dosyalarını manuel olarak /var/www/cookify dizinine yüklemeniz gerekiyor"
    print_warning "FTP/SFTP kullanarak veya git clone ile yükleyebilirsiniz"
else
    print_success "Proje zaten mevcut: /var/www/cookify"
fi

# Nginx yapılandırması
print_step "Nginx yapılandırılıyor..."

# Backend (api.cookify.tr)
cat > /etc/nginx/sites-available/api.cookify.tr << 'EOF'
server {
    listen 80;
    server_name api.cookify.tr;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 10M;
}
EOF

# Frontend (cookify.tr)
cat > /etc/nginx/sites-available/cookify.tr << 'EOF'
server {
    listen 80;
    server_name cookify.tr www.cookify.tr;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Nginx site'ları aktifleştir
ln -sf /etc/nginx/sites-available/api.cookify.tr /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/cookify.tr /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Nginx test ve restart
nginx -t && systemctl restart nginx
print_success "Nginx yapılandırıldı"

# Certbot kurulumu
print_step "Certbot (SSL) yükleniyor..."
if ! command -v certbot &> /dev/null; then
    apt install -y certbot python3-certbot-nginx
    print_success "Certbot yüklendi"
    print_warning "SSL sertifikası almak için: sudo certbot --nginx -d cookify.tr -d www.cookify.tr -d api.cookify.tr"
else
    print_warning "Certbot zaten yüklü"
fi

echo ""
echo "================================================"
print_success "Sunucu kurulumu tamamlandı! 🎉"
echo "================================================"
echo ""
echo "📋 Sonraki Adımlar:"
echo ""
echo "1. Proje dosyalarını yükleyin (henüz yapmadıysanız):"
echo "   git clone https://github.com/serdardogruer/cookify.git /var/www/cookify"
echo ""
echo "2. Backend'i kurun:"
echo "   cd /var/www/cookify/backend"
echo "   npm install"
echo "   cp .env.production .env"
echo "   nano .env  # JWT_SECRET değiştirin!"
echo "   npx prisma migrate deploy"
echo "   npm run build"
echo "   pm2 start dist/index.js --name cookify-backend"
echo ""
echo "3. Frontend'i kurun:"
echo "   cd /var/www/cookify/frontend"
echo "   npm install"
echo "   cp .env.production .env.local"
echo "   npm run build"
echo "   pm2 start npm --name cookify-frontend -- start"
echo ""
echo "4. PM2'yi kaydedin:"
echo "   pm2 startup"
echo "   pm2 save"
echo ""
echo "5. SSL sertifikası alın:"
echo "   sudo certbot --nginx -d cookify.tr -d www.cookify.tr -d api.cookify.tr"
echo ""
echo "📖 Detaylı kurulum rehberi: SERVER-SETUP-GUIDE.md"
echo ""
