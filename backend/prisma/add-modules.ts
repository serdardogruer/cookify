import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧩 Adding premium modules...');

  const modules = [
    {
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
    {
      name: 'Haftalık Yemek Planlayıcı',
      slug: 'meal-planner',
      description: 'Haftalık yemek planı oluşturun, bütçenize göre optimize edin',
      icon: '📅',
      isCore: false,
      isActive: true,
      pricingType: 'paid',
      price: 29.99,
      trialDays: null,
      badge: 'popular',
    },
    {
      name: 'Diyet Takibi',
      slug: 'diet-tracker',
      description: 'Kalori ve besin değeri takibi, kişiselleştirilmiş diyet önerileri',
      icon: '🥗',
      isCore: false,
      isActive: true,
      pricingType: 'trial',
      price: 39.99,
      trialDays: 14,
      badge: null,
    },
    {
      name: 'Akıllı Alışveriş',
      slug: 'smart-shopping',
      description: 'Market fişi tarama, fiyat karşılaştırma, tasarruf önerileri',
      icon: '💰',
      isCore: false,
      isActive: true,
      pricingType: 'freemium',
      price: null,
      trialDays: null,
      badge: 'new',
    },
  ];

  for (const module of modules) {
    try {
      const existing = await prisma.module.findUnique({
        where: { slug: module.slug }
      });

      if (existing) {
        console.log(`⏭️  ${module.name} zaten var, atlanıyor...`);
      } else {
        await prisma.module.create({ data: module });
        console.log(`✅ ${module.name} eklendi`);
      }
    } catch (error) {
      console.error(`❌ ${module.name} eklenirken hata:`, error);
    }
  }

  console.log('✅ Tamamlandı!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
