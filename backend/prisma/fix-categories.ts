import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Eski -> Yeni kategori eşleştirmesi
const categoryMapping: Record<string, string> = {
  'Bakliyatlar': 'BAKLİYATLAR',
  'Diğer': 'DİĞER',
  'Et Ürünleri': 'ET ÜRÜNLERİ',
  'Meyveler': 'MEYVELER',
  'Sebzeler': 'SEBZELER',
  'Süt Ürünleri': 'SÜT ÜRÜNLERİ',
  'Tahıllar': 'TAHILLAR',
  'İçecekler': 'İÇECEKLER',
};

async function main() {
  console.log('🔧 Fixing duplicate categories...\n');

  for (const [oldName, newName] of Object.entries(categoryMapping)) {
    const oldCategory = await prisma.category.findUnique({
      where: { name: oldName },
      include: { ingredients: true },
    });

    const newCategory = await prisma.category.findUnique({
      where: { name: newName },
    });

    if (!oldCategory) {
      console.log(`⚠️  Old category not found: ${oldName}`);
      continue;
    }

    if (!newCategory) {
      console.log(`⚠️  New category not found: ${newName}`);
      continue;
    }

    console.log(`📦 Processing: ${oldName} (${oldCategory.ingredients.length} ingredients) -> ${newName}`);

    // Malzemeleri yeni kategoriye taşı
    for (const ingredient of oldCategory.ingredients) {
      try {
        // Yeni kategoride aynı isimde malzeme var mı kontrol et
        const existingInNew = await prisma.ingredient.findUnique({
          where: {
            name_categoryId: {
              name: ingredient.name,
              categoryId: newCategory.id,
            },
          },
        });

        if (existingInNew) {
          // Varsa eski malzemeyi sil
          await prisma.ingredient.delete({
            where: { id: ingredient.id },
          });
          console.log(`   ✓ Deleted duplicate: ${ingredient.name}`);
        } else {
          // Yoksa kategorisini güncelle
          await prisma.ingredient.update({
            where: { id: ingredient.id },
            data: { categoryId: newCategory.id },
          });
          console.log(`   ✓ Moved: ${ingredient.name}`);
        }
      } catch (error: any) {
        console.log(`   ⚠️  Error with ${ingredient.name}: ${error.message}`);
      }
    }

    // Eski kategoriyi sil
    try {
      await prisma.category.delete({
        where: { id: oldCategory.id },
      });
      console.log(`   ✅ Deleted old category: ${oldName}\n`);
    } catch (error: any) {
      console.log(`   ⚠️  Could not delete ${oldName}: ${error.message}\n`);
    }
  }

  // Sonuç
  const finalCategories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { ingredients: true },
      },
    },
  });

  console.log('\n✅ Final categories:\n');
  finalCategories.forEach((cat) => {
    console.log(`   ${cat.name} (${cat._count.ingredients} malzeme)`);
  });
  console.log(`\nToplam: ${finalCategories.length} kategori\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
