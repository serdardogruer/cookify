import { PrismaClient } from '@prisma/client';

// SQLite client
const sqlite = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

// PostgreSQL client  
const postgres = new PrismaClient();

async function migrate() {
  console.log('🚀 Migration başlıyor...\n');

  try {
    // 1. Categories
    console.log('📦 Categories aktarılıyor...');
    const categories = await sqlite.category.findMany();
    for (const cat of categories) {
      await postgres.category.create({ data: cat });
    }
    console.log(`✅ ${categories.length} kategori aktarıldı\n`);

    // 2. Ingredients
    console.log('🥕 Ingredients aktarılıyor...');
    const ingredients = await sqlite.ingredient.findMany();
    for (const ing of ingredients) {
      await postgres.ingredient.create({ data: ing });
    }
    console.log(`✅ ${ingredients.length} malzeme aktarıldı\n`);

    // 3. Modules
    console.log('📱 Modules aktarılıyor...');
    const modules = await sqlite.module.findMany();
    for (const mod of modules) {
      await postgres.module.create({ data: mod });
    }
    console.log(`✅ ${modules.length} modül aktarıldı\n`);

    // 4. Users
    console.log('👤 Users aktarılıyor...');
    const users = await sqlite.user.findMany();
    for (const user of users) {
      await postgres.user.create({
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
          kitchenId: user.kitchenId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    }
    console.log(`✅ ${users.length} kullanıcı aktarıldı\n`);

    // 5. Kitchens
    console.log('🏠 Kitchens aktarılıyor...');
    const kitchens = await sqlite.kitchen.findMany();
    for (const kitchen of kitchens) {
      await postgres.kitchen.create({
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
    console.log(`✅ ${kitchens.length} mutfak aktarıldı\n`);

    // 6. Kitchen Members
    console.log('👥 Kitchen Members aktarılıyor...');
    const members = await sqlite.kitchenMember.findMany();
    for (const member of members) {
      await postgres.kitchenMember.create({ data: member });
    }
    console.log(`✅ ${members.length} üye aktarıldı\n`);

    // 7. Recipes
    console.log('📖 Recipes aktarılıyor...');
    const recipes = await sqlite.recipe.findMany({
      include: {
        ingredients: true,
        instructions: true,
        tags: true,
      },
    });
    for (const recipe of recipes) {
      await postgres.recipe.create({
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
            create: recipe.ingredients.map((ing) => ({
              name: ing.name,
              quantity: ing.quantity,
              unit: ing.unit,
              order: ing.order,
            })),
          },
          instructions: {
            create: recipe.instructions.map((inst) => ({
              stepNumber: inst.stepNumber,
              instruction: inst.instruction,
              image: inst.image,
            })),
          },
          tags: {
            create: recipe.tags.map((tag) => ({
              tag: tag.tag,
            })),
          },
        },
      });
    }
    console.log(`✅ ${recipes.length} tarif aktarıldı\n`);

    // 8. Pantry Items
    console.log('🥫 Pantry Items aktarılıyor...');
    const pantryItems = await sqlite.pantryItem.findMany();
    for (const item of pantryItems) {
      await postgres.pantryItem.create({ data: item });
    }
    console.log(`✅ ${pantryItems.length} dolap malzemesi aktarıldı\n`);

    // 9. Market Items
    console.log('🛒 Market Items aktarılıyor...');
    const marketItems = await sqlite.marketItem.findMany();
    for (const item of marketItems) {
      await postgres.marketItem.create({ data: item });
    }
    console.log(`✅ ${marketItems.length} market ürünü aktarıldı\n`);

    // 10. Custom Meals
    console.log('🍽️ Custom Meals aktarılıyor...');
    const customMeals = await sqlite.customMeal.findMany({
      include: { ingredients: true },
    });
    for (const meal of customMeals) {
      await postgres.customMeal.create({
        data: {
          id: meal.id,
          userId: meal.userId,
          name: meal.name,
          createdAt: meal.createdAt,
          updatedAt: meal.updatedAt,
          ingredients: {
            create: meal.ingredients.map((ing) => ({
              name: ing.name,
              quantity: ing.quantity,
              unit: ing.unit,
            })),
          },
        },
      });
    }
    console.log(`✅ ${customMeals.length} özel yemek aktarıldı\n`);

    console.log('🎉 Migration tamamlandı!');
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await sqlite.$disconnect();
    await postgres.$disconnect();
  }
}

migrate();
