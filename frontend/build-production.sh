#!/bin/bash

# Cookify Frontend - Production Build Script
# cPanel Hosting için

echo "🚀 Cookify Frontend - Production Build Başlıyor..."

# 1. Temizlik
echo "📦 Eski build temizleniyor..."
rm -rf out/
rm -rf .next/

# 2. Dependencies kontrol
echo "📦 Dependencies kontrol ediliyor..."
npm install

# 3. Production build
echo "🔨 Production build oluşturuluyor..."
NODE_ENV=production npm run build

# 4. Build kontrolü
if [ -d "out" ]; then
  echo "✅ Build başarılı!"
  echo "📁 out/ klasörü oluşturuldu"
  echo ""
  echo "📤 Sonraki adım:"
  echo "   out/ klasörünü cPanel'e yükle (public_html/)"
  echo ""
  ls -lh out/
else
  echo "❌ Build başarısız!"
  exit 1
fi
