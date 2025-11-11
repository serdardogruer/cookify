import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const recipeModules = [
  {
    name: 'Tarifler',
    slug: 'recipes',
    description: 'Tarif ekleyin, düzenleyin ve paylaşın',
    icon: '📖',
    isCore: true,
    isActive: true,
  },
  {
    name: 'Tarif Ara',
    slug: 'recipe-search',
    description: 'Tarifler arasında arama yapın ve filtreleyin',
    icon: '🔍',
    isCore: true,
    isActive: true,
  },
  {
    name: 'Tarif Detay',
    slug: 'recipe-detail',
    description: 'Tarif detaylarını görüntüleyin',
    icon: '📋',
    isCore: true,
    isActive: true,
  },
  {
    name: 'Tarif Ekle',
    slug: 'recipe-add',
    description: 'Yeni tarifler oluşturun',
    icon: '➕',
    isCore: true,
    isActive: true,
  },
];

async function main() {
  console.log('🌱 Seeding recipe modules...\n');

  for (const module of recipeModules) {
    const existing = await prisma.module.findUnique({
      where: { slug: module.slug },
    });

    if (existing) {
      console.log(`⚠️  Module already exists: ${module.name}`);
      continue;
    }

    await prisma.module.create({
      data: module,
    });

    console.log(`✅ Created module: ${module.icon} ${module.name}`);
  }

  console.log('\n🎉 Recipe modules seeded successfully!\n');

  // Tüm modülleri listele
  const allModules = await prisma.module.findMany({
    orderBy: { name: 'asc' },
  });

  console.log('📋 All modules:\n');
  allModules.forEach((m) => {
    console.log(`   ${m.icon} ${m.name} (${m.slug}) - ${m.isCore ? 'Core' : 'Optional'}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
