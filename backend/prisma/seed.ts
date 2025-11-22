import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Kategorileri oluştur
  console.log('📦 Creating categories...');
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Sebzeler' },
      update: {},
      create: { name: 'Sebzeler', icon: '🥬' },
    }),
    prisma.category.upsert({
      where: { name: 'Meyveler' },
      update: {},
      create: { name: 'Meyveler', icon: '🍎' },
    }),
    prisma.category.upsert({
      where: { name: 'Et Ürünleri' },
      update: {},
      create: { name: 'Et Ürünleri', icon: '🥩' },
    }),
    prisma.category.upsert({
      where: { name: 'Bakliyatlar' },
      update: {},
      create: { name: 'Bakliyatlar', icon: '🫘' },
    }),
    prisma.category.upsert({
      where: { name: 'Süt Ürünleri' },
      update: {},
      create: { name: 'Süt Ürünleri', icon: '🥛' },
    }),
    prisma.category.upsert({
      where: { name: 'Tahıllar' },
      update: {},
      create: { name: 'Tahıllar', icon: '🌾' },
    }),
    prisma.category.upsert({
      where: { name: 'İçecekler' },
      update: {},
      create: { name: 'İçecekler', icon: '🥤' },
    }),
    prisma.category.upsert({
      where: { name: 'Diğer' },
      update: {},
      create: { name: 'Diğer', icon: '📦' },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // 2. Yaygın malzemeleri oluştur
  console.log('🥕 Creating common ingredients...');
  
  const ingredientsData = [
    // Sebzeler
    { name: 'Domates', categoryName: 'Sebzeler', defaultUnit: 'kg' },
    { name: 'Salatalık', categoryName: 'Sebzeler', defaultUnit: 'adet' },
    { name: 'Soğan', categoryName: 'Sebzeler', defaultUnit: 'kg' },
    { name: 'Patates', categoryName: 'Sebzeler', defaultUnit: 'kg' },
    { name: 'Havuç', categoryName: 'Sebzeler', defaultUnit: 'kg' },
    { name: 'Biber', categoryName: 'Sebzeler', defaultUnit: 'kg' },
    { name: 'Patlıcan', categoryName: 'Sebzeler', defaultUnit: 'kg' },
    { name: 'Kabak', categoryName: 'Sebzeler', defaultUnit: 'kg' },
    
    // Meyveler
    { name: 'Elma', categoryName: 'Meyveler', defaultUnit: 'kg' },
    { name: 'Muz', categoryName: 'Meyveler', defaultUnit: 'kg' },
    { name: 'Portakal', categoryName: 'Meyveler', defaultUnit: 'kg' },
    { name: 'Mandalina', categoryName: 'Meyveler', defaultUnit: 'kg' },
    { name: 'Üzüm', categoryName: 'Meyveler', defaultUnit: 'kg' },
    
    // Et Ürünleri
    { name: 'Tavuk', categoryName: 'Et Ürünleri', defaultUnit: 'kg' },
    { name: 'Kıyma', categoryName: 'Et Ürünleri', defaultUnit: 'kg' },
    { name: 'Kuşbaşı Et', categoryName: 'Et Ürünleri', defaultUnit: 'kg' },
    
    // Bakliyatlar
    { name: 'Mercimek', categoryName: 'Bakliyatlar', defaultUnit: 'kg' },
    { name: 'Nohut', categoryName: 'Bakliyatlar', defaultUnit: 'kg' },
    { name: 'Fasulye', categoryName: 'Bakliyatlar', defaultUnit: 'kg' },
    
    // Süt Ürünleri
    { name: 'Süt', categoryName: 'Süt Ürünleri', defaultUnit: 'litre' },
    { name: 'Yoğurt', categoryName: 'Süt Ürünleri', defaultUnit: 'kg' },
    { name: 'Peynir', categoryName: 'Süt Ürünleri', defaultUnit: 'kg' },
    { name: 'Tereyağı', categoryName: 'Süt Ürünleri', defaultUnit: 'kg' },
    
    // Tahıllar
    { name: 'Un', categoryName: 'Tahıllar', defaultUnit: 'kg' },
    { name: 'Pirinç', categoryName: 'Tahıllar', defaultUnit: 'kg' },
    { name: 'Makarna', categoryName: 'Tahıllar', defaultUnit: 'paket' },
    { name: 'Bulgur', categoryName: 'Tahıllar', defaultUnit: 'kg' },
    
    // İçecekler
    { name: 'Su', categoryName: 'İçecekler', defaultUnit: 'litre' },
    { name: 'Çay', categoryName: 'İçecekler', defaultUnit: 'paket' },
    { name: 'Kahve', categoryName: 'İçecekler', defaultUnit: 'paket' },
    
    // Diğer
    { name: 'Tuz', categoryName: 'Diğer', defaultUnit: 'kg' },
    { name: 'Şeker', categoryName: 'Diğer', defaultUnit: 'kg' },
    { name: 'Yağ', categoryName: 'Diğer', defaultUnit: 'litre' },
    { name: 'Salça', categoryName: 'Diğer', defaultUnit: 'adet' },
  ];

  for (const ingredient of ingredientsData) {
    const category = categories.find(c => c.name === ingredient.categoryName);
    if (category) {
      await prisma.ingredient.upsert({
        where: { 
          name_categoryId: {
            name: ingredient.name,
            categoryId: category.id
          }
        },
        update: {},
        create: {
          name: ingredient.name,
          categoryId: category.id,
          defaultUnit: ingredient.defaultUnit,
        },
      });
    }
  }

  console.log(`✅ Created ${ingredientsData.length} ingredients`);

  // 3. Temel modülleri oluştur
  console.log('🧩 Creating core modules...');
  
  const modules = await Promise.all([
    // Temel Modüller (Ücretsiz)
    prisma.module.upsert({
      where: { slug: 'pantry' },
      update: {},
      create: {
        name: 'Dolabım',
        slug: 'pantry',
        description: 'Evdeki malzemelerinizi takip edin',
        icon: '🏠',
        isCore: true,
        isActive: true,
        pricingType: 'free',
      },
    }),
    prisma.module.upsert({
      where: { slug: 'market' },
      update: {},
      create: {
        name: 'Market',
        slug: 'market',
        description: 'Alışveriş listenizi yönetin',
        icon: '🛒',
        isCore: true,
        isActive: true,
        pricingType: 'free',
      },
    }),
    prisma.module.upsert({
      where: { slug: 'profile' },
      update: {},
      create: {
        name: 'Profil',
        slug: 'profile',
        description: 'Profil ve mutfak ayarlarınız',
        icon: '👤',
        isCore: true,
        isActive: true,
        pricingType: 'free',
      },
    }),
    prisma.module.upsert({
      where: { slug: 'recipes' },
      update: {},
      create: {
        name: 'Tarifler',
        slug: 'recipes',
        description: 'Lezzetli tarifleri keşfedin',
        icon: '📖',
        isCore: true,
        isActive: true,
        pricingType: 'free',
      },
    }),
    prisma.module.upsert({
      where: { slug: 'recipe-search' },
      update: {},
      create: {
        name: 'Tarif Ara',
        slug: 'recipe-search',
        description: 'Tariflerde arama yapın',
        icon: '🔍',
        isCore: true,
        isActive: true,
        pricingType: 'free',
      },
    }),
    prisma.module.upsert({
      where: { slug: 'recipe-add' },
      update: {},
      create: {
        name: 'Tarif Ekle',
        slug: 'recipe-add',
        description: 'Kendi tariflerinizi ekleyin',
        icon: '➕',
        isCore: true,
        isActive: true,
        pricingType: 'free',
      },
    }),
    
    // Premium Modüller
    prisma.module.upsert({
      where: { slug: 'ai-assistant' },
      update: {},
      create: {
        name: 'AI Asistan',
        slug: 'ai-assistant',
        description: 'Yapay zeka ile akıllı tarif önerileri, fotoğraf ve sesli malzeme ekleme',
        icon: '🤖',
        isCore: false,
        isActive: true,
        pricingType: 'trial',
        price: 49.99,
        trialDays: 30,
        badge: 'new',
      },
    }),
    prisma.module.upsert({
      where: { slug: 'meal-planner' },
      update: { name: 'Yemek Planlayıcı' },
      create: {
        name: 'Yemek Planlayıcı',
        slug: 'meal-planner',
        description: 'Haftalık yemek planı oluşturun, bütçenize göre optimize edin',
        icon: '📅',
        isCore: false,
        isActive: true,
        pricingType: 'paid',
        price: 29.99,
        badge: 'popular',
      },
    }),
    prisma.module.upsert({
      where: { slug: 'diet-tracker' },
      update: {},
      create: {
        name: 'Diyet Takibi',
        slug: 'diet-tracker',
        description: 'Kalori ve besin değeri takibi, kişiselleştirilmiş diyet önerileri',
        icon: '🥗',
        isCore: false,
        isActive: true,
        pricingType: 'trial',
        price: 39.99,
        trialDays: 14,
      },
    }),
    prisma.module.upsert({
      where: { slug: 'smart-shopping' },
      update: {},
      create: {
        name: 'Akıllı Alışveriş',
        slug: 'smart-shopping',
        description: 'Market fişi tarama, fiyat karşılaştırma, tasarruf önerileri',
        icon: '💰',
        isCore: false,
        isActive: true,
        pricingType: 'freemium',
        badge: 'new',
      },
    }),
  ]);

  console.log(`✅ Created ${modules.length} modules (6 core + 4 premium)`);

  // 4. Birim dönüşümlerini oluştur
  console.log('⚖️ Creating unit conversions...');
  
  const unitConversions = [
    // Gram - Kilogram
    { unitFrom: 'gram', unitTo: 'kg', multiplier: 0.001 },
    { unitFrom: 'kg', unitTo: 'gram', multiplier: 1000 },
    
    // Mililitre - Litre
    { unitFrom: 'ml', unitTo: 'litre', multiplier: 0.001 },
    { unitFrom: 'litre', unitTo: 'ml', multiplier: 1000 },
    
    // Adet - Paket (varsayılan: 1 paket = 10 adet)
    { unitFrom: 'adet', unitTo: 'paket', multiplier: 0.1 },
    { unitFrom: 'paket', unitTo: 'adet', multiplier: 10 },
  ];

  for (const conversion of unitConversions) {
    await prisma.unitConversion.create({
      data: conversion,
    });
  }

  console.log(`✅ Created ${unitConversions.length} unit conversions`);

  console.log('✨ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
