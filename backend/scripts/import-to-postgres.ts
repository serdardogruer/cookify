import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:12@localhost:5432/cookify',
    },
  },
});

async function importData() {
  console.log('📥 PostgreSQL import starting...\n');

  try {
    const data = JSON.parse(
      fs.readFileSync('./scripts/sqlite-data.json', 'utf-8')
    );

    // Clear existing data (except seed data)
    console.log('🗑️ Clearing existing data...');
    await prisma.customMealIngredient.deleteMany();
    await prisma.customMeal.deleteMany();
    await prisma.marketItem.deleteMany();
    await prisma.pantryItem.deleteMany();
    await prisma.recipeTag.deleteMany();
    await prisma.recipeInstruction.deleteMany();
    await prisma.recipeIngredient.deleteMany();
    await prisma.recipe.deleteMany();
    await prisma.kitchenMember.deleteMany();
    await prisma.kitchen.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Cleared\n');

    // 1. Categories (skip if exists)
    console.log('📦 Categories...');
    for (const cat of data.categories) {
      await prisma.category.upsert({
        where: { id: cat.id },
        update: {},
        create: cat,
      });
    }
    console.log(`✅ ${data.categories.length} kategori`);

    // 2. Ingredients
    console.log('🥕 Ingredients...');
    for (const ing of data.ingredients) {
      await prisma.ingredient.upsert({
        where: { id: ing.id },
        update: {},
        create: ing,
      });
    }
    console.log(`✅ ${data.ingredients.length} malzeme`);

    // 3. Modules
    console.log('📱 Modules...');
    for (const mod of data.modules) {
      await prisma.module.upsert({
        where: { id: mod.id },
        update: {},
        create: mod,
      });
    }
    console.log(`✅ ${data.modules.length} modül`);

    // 4. Unit Conversions
    console.log('⚖️ Unit Conversions...');
    for (const unit of data.unitConversions) {
      await prisma.unitConversion.upsert({
        where: { id: unit.id },
        update: {},
        create: unit,
      });
    }
    console.log(`✅ ${data.unitConversions.length} birim dönüşümü`);

    // 5. Users (without kitchenId first)
    console.log('👤 Users...');
    for (const user of data.users) {
      await prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          password: user.password,
          plainPassword: user.plainPassword,
          googleId: user.googleId,
          profileImage: user.profileImage,
          phone: user.phone,
          phoneVerified: user.phoneVerified,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    }
    console.log(`✅ ${data.users.length} kullanıcı`);

    // 6. Kitchens
    console.log('🏠 Kitchens...');
    for (const kitchen of data.kitchens) {
      await prisma.kitchen.create({
        data: {
          id: kitchen.id,
          name: kitchen.name,
          inviteCode: kitchen.inviteCode,
          status: kitchen.status,
          ownerId: kitchen.ownerId,
          createdAt: kitchen.createdAt,
          updatedAt: kitchen.updatedAt,
        },
      });
    }
    console.log(`✅ ${data.kitchens.length} mutfak`);

    // Update users with kitchenId
    console.log('🔗 Updating user kitchens...');
    for (const user of data.users) {
      if (user.kitchenId) {
        await prisma.user.update({
          where: { id: user.id },
          data: { kitchenId: user.kitchenId },
        });
      }
    }
    console.log('✅ Kitchen IDs updated');

    // 7. Kitchen Members
    console.log('👥 Kitchen Members...');
    for (const member of data.kitchenMembers) {
      await prisma.kitchenMember.create({ data: member });
    }
    console.log(`✅ ${data.kitchenMembers.length} mutfak üyesi`);

    // 8. Recipes
    console.log('📖 Recipes...');
    for (const recipe of data.recipes) {
      await prisma.recipe.create({
        data: {
          id: recipe.id,
          title: recipe.title,
          description: recipe.description,
          image: recipe.image,
          video: recipe.video,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          servings: recipe.servings,
          difficulty: recipe.difficulty,
          category: recipe.category,
          cuisine: recipe.cuisine,
          userId: recipe.userId,
          createdAt: recipe.createdAt,
          updatedAt: recipe.updatedAt,
          ingredients: {
            create: recipe.ingredients.map((ing: any) => ({
              name: ing.name,
              quantity: ing.quantity,
              unit: ing.unit,
              order: ing.order,
            })),
          },
          instructions: {
            create: recipe.instructions.map((inst: any) => ({
              stepNumber: inst.stepNumber,
              instruction: inst.instruction,
              image: inst.image,
            })),
          },
          tags: {
            create: recipe.tags.map((tag: any) => ({
              tag: tag.tag,
            })),
          },
        },
      });
    }
    console.log(`✅ ${data.recipes.length} tarif`);

    // 9. Pantry Items
    console.log('🥫 Pantry Items...');
    for (const item of data.pantryItems) {
      await prisma.pantryItem.create({ data: item });
    }
    console.log(`✅ ${data.pantryItems.length} dolap malzemesi`);

    // 10. Market Items
    console.log('🛒 Market Items...');
    for (const item of data.marketItems) {
      await prisma.marketItem.create({ data: item });
    }
    console.log(`✅ ${data.marketItems.length} market ürünü`);

    // 11. Custom Meals
    console.log('🍽️ Custom Meals...');
    for (const meal of data.customMeals) {
      await prisma.customMeal.create({
        data: {
          id: meal.id,
          userId: meal.userId,
          name: meal.name,
          createdAt: meal.createdAt,
          updatedAt: meal.updatedAt,
          ingredients: {
            create: meal.ingredients.map((ing: any) => ({
              name: ing.name,
              quantity: ing.quantity,
              unit: ing.unit,
            })),
          },
        },
      });
    }
    console.log(`✅ ${data.customMeals.length} özel yemek`);

    console.log('\n🎉 All data imported to PostgreSQL!');
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
