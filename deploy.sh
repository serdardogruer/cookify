#!/bin/bash
# Cookify Deploy Script
# Bu script ile güncellemeleri sunucuya hızlıca deploy edebilirsiniz

set -e

echo "🚀 Cookify Deploy İşlemi Başlatılıyor..."

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Proje dizinine git
COOKIFY_DIR="/var/www/cookify"

if [ ! -d "$COOKIFY_DIR" ]; then
    print_error "Proje dizini bulunamadı: $COOKIFY_DIR"
    exit 1
fi

cd $COOKIFY_DIR

# Git pull
print_info "En son kodlar çekiliyor..."
git pull origin main
print_success "Kod güncellendi"

# Backend Deploy
print_info "Backend deploy ediliyor..."
cd $COOKIFY_DIR/backend

print_info "Backend bağımlılıkları yükleniyor..."
npm install

print_info "Database migration çalıştırılıyor..."
npx prisma migrate deploy

print_info "Prisma Client oluşturuluyor..."
npx prisma generate

print_info "Backend build ediliyor..."
npm run build

print_info "Backend servisi restart ediliyor..."
pm2 restart cookify-backend

print_success "Backend deploy tamamlandı"

# Frontend Deploy
print_info "Frontend deploy ediliyor..."
cd $COOKIFY_DIR/frontend

print_info "Frontend bağımlılıkları yükleniyor..."
npm install

print_info "Frontend build ediliyor..."
npm run build

print_info "Frontend servisi restart ediliyor..."
pm2 restart cookify-frontend

print_success "Frontend deploy tamamlandı"

# PM2 durumunu göster
echo ""
print_info "PM2 Servis Durumu:"
pm2 status

# Son logları göster
echo ""
print_info "Son Loglar:"
pm2 logs --lines 10 --nostream

echo ""
print_success "Deploy işlemi başarıyla tamamlandı! 🎉"
echo ""
echo "📊 Monitoring için:"
echo "   pm2 logs"
echo "   pm2 monit"
echo ""
