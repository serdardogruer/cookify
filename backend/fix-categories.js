/**
 * Kategori İkon Düzeltme Scripti
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Doğru kategori-ikon eşleştirmeleri
const categoryIconMap = {
  'BAHARATLAR': '🌶️',
  'BAKLİYATLAR': '🫘',
  'DENİZ ÜRÜNLERİ': '🐟',
  'DİĞER': '📦',
  'ET ÜRÜNLERİ': '🥩',
  'HAMUR ÜRÜNLERİ': '🍝',
  'İÇECEKLER': '🥤',
  'KURUYEMİŞLER': '🥜',
  'MEYVELER': '🍎',
  'SEBZELER': '🥬',
  'SOSLAR': '🍯',
  'SÜT ÜRÜNLERİ': '🥛',
  'TAHILLAR': '🌾',
  'TATLANDIRICILAR': '🍯',
  'TEMEL MALZEMELER': '🥚',
  'YAĞLAR': '🫒',
  'YEŞİLLİKLER': '🌿'
};

async function fixCategories() {
  console.log('🔧 Kategori düzeltme başlıyor...\n');

  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { ingredients: true } } }
    });

    console.log(`📊 Toplam ${categories.length} kategori\n`);

    let fixedCount = 0;

    for (const category of categories) {
      const normalizedName = category.name.toUpperCase().trim();
      const correctIcon = categoryIconMap[normalizedName];

      if (!correctIcon) {
        console.log(`⚠️  "${category.name}" için ikon bulunamadı`);
        continue;
      }

      const needsUpdate = category.icon !== correctIcon || category.name !== normalizedName;

      if (needsUpdate) {
        await prisma.category.update({
          where: { id: category.id },
          data: { name: normalizedName, icon: correctIcon }
        });

        console.log(`✅ ${category.name} → ${normalizedName} ${correctIcon} (${category._count.ingredients} malzeme)`);
        fixedCount++;
      }
    }

    console.log(`\n✅ ${fixedCount} kategori düzeltildi`);

  } catch (error) {
    console.error('❌ Hata:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixCategories();
