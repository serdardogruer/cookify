#!/bin/bash

# Cookify Backend - VDS Deployment Script
# TR-VDS4 için

echo "🚀 Cookify Backend - VDS Deployment Başlıyor..."

# 1. Dependencies
echo "📦 Dependencies yükleniyor..."
npm ci --production

# 2. Prisma Generate
echo "🔧 Prisma client oluşturuluyor..."
npx prisma generate

# 3. TypeScript Build
echo "🔨 TypeScript build..."
npm run build

# 4. Database Migration
echo "🗄️ Database migration..."
npx prisma migrate deploy

# 5. PM2 Restart
echo "🔄 PM2 restart..."
pm2 restart cookify-backend || pm2 start dist/index.js --name cookify-backend

echo "✅ Deployment tamamlandı!"
echo ""
echo "📊 Durum kontrol:"
pm2 status
