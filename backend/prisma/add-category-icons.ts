import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categoryIcons: Record<string, string> = {
  'SEBZELER': '🥬',
  'YEŞİLLİKLER': '🌿',
  'MEYVELER': '🍎',
  'ET ÜRÜNLERİ': '🥩',
  'DENİZ ÜRÜNLERİ': '🐟',
  'SÜT ÜRÜNLERİ': '🥛',
  'BAHARATLAR': '🌶️',
  'KURUYEMİŞLER': '🥜',
  'TAHILLAR': '🌾',
  'BAKLİYATLAR': '🫘',
  'HAMUR ÜRÜNLERİ': '🍝',
  'SOSLAR': '🍯',
  'TATLANDIRICILAR': '🍯',
  'İÇECEKLER': '🥤',
  'YAĞLAR': '🫒',
  'TEMEL MALZEMELER': '🥚',
  'DİĞER': '📦',
};

async function main() {
  console.log('🎨 Adding icons to categories...\n');

  for (const [name, icon] of Object.entries(categoryIcons)) {
    try {
      await prisma.category.update({
        where: { name },
        data: { icon },
      });
      console.log(`✅ ${icon} ${name}`);
    } catch (error: any) {
      console.log(`⚠️  ${name}: ${error.message}`);
    }
  }

  console.log('\n🎉 Icons added successfully!\n');

  // Sonuç
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  console.log('📋 Final categories:\n');
  categories.forEach((cat) => {
    console.log(`   ${cat.icon || '📦'} ${cat.name}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
