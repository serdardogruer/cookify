import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function exportData() {
  console.log('📤 SQLite veriler export ediliyor...\n');

  const data: any = {};

  try {
    data.categories = await prisma.category.findMany();
    console.log(`✅ ${data.categories.length} kategori`);

    data.ingredients = await prisma.ingredient.findMany();
    console.log(`✅ ${data.ingredients.length} malzeme`);

    data.modules = await prisma.module.findMany();
    console.log(`✅ ${data.modules.length} modül`);

    data.users = await prisma.user.findMany();
    console.log(`✅ ${data.users.length} kullanıcı`);

    data.kitchens = await prisma.kitchen.findMany();
    console.log(`✅ ${data.kitchens.length} mutfak`);

    data.kitchenMembers = await prisma.kitchenMember.findMany();
    console.log(`✅ ${data.kitchenMembers.length} mutfak üyesi`);

    data.recipes = await prisma.recipe.findMany({
      include: {
        ingredients: true,
        instructions: true,
        tags: true,
      },
    });
    console.log(`✅ ${data.recipes.length} tarif`);

    data.pantryItems = await prisma.pantryItem.findMany();
    console.log(`✅ ${data.pantryItems.length} dolap malzemesi`);

    data.marketItems = await prisma.marketItem.findMany();
    console.log(`✅ ${data.marketItems.length} market ürünü`);

    data.customMeals = await prisma.customMeal.findMany({
      include: { ingredients: true },
    });
    console.log(`✅ ${data.customMeals.length} özel yemek`);

    data.unitConversions = await prisma.unitConversion.findMany();
    console.log(`✅ ${data.unitConversions.length} birim dönüşümü`);

    data.kitchenModules = await prisma.kitchenModule.findMany();
    console.log(`✅ ${data.kitchenModules.length} mutfak modülü`);

    // JSON dosyasına kaydet
    fs.writeFileSync(
      './scripts/sqlite-data.json',
      JSON.stringify(data, null, 2)
    );

    console.log('\n🎉 Veriler sqlite-data.json dosyasına kaydedildi!');
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
