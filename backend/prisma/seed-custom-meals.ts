import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCustomMeals() {
  console.log('🍳 Örnek yemekler ekleniyor...');

  // Serdar kullanıcısını bul
  const user = await prisma.user.findUnique({
    where: { id: 2 }, // Serdar
  });

  if (!user) {
    console.log('❌ Kullanıcı bulunamadı!');
    return;
  }

  console.log(`📝 ${user.name} için yemekler ekleniyor...`);

  const meals = [
    {
      name: 'Kuru Fasulye',
      ingredients: [
        { name: 'Kuru Fasulye', quantity: 200, unit: 'gram' },
        { name: 'Soğan', quantity: 1, unit: 'adet' },
        { name: 'Domates', quantity: 2, unit: 'adet' },
        { name: 'Salça', quantity: 1, unit: 'yemek kaşığı' },
        { name: 'Yağ', quantity: 50, unit: 'ml' },
      ],
    },
    {
      name: 'Mercimek Çorbası',
      ingredients: [
        { name: 'Mercimek', quantity: 150, unit: 'gram' },
        { name: 'Soğan', quantity: 1, unit: 'adet' },
        { name: 'Havuç', quantity: 1, unit: 'adet' },
        { name: 'Patates', quantity: 1, unit: 'adet' },
        { name: 'Tereyağı', quantity: 30, unit: 'gram' },
      ],
    },
    {
      name: 'Tavuk Sote',
      ingredients: [
        { name: 'Tavuk', quantity: 500, unit: 'gram' },
        { name: 'Soğan', quantity: 2, unit: 'adet' },
        { name: 'Biber', quantity: 2, unit: 'adet' },
        { name: 'Domates', quantity: 3, unit: 'adet' },
        { name: 'Yağ', quantity: 50, unit: 'ml' },
      ],
    },
    {
      name: 'Makarna',
      ingredients: [
        { name: 'Makarna', quantity: 400, unit: 'gram' },
        { name: 'Domates', quantity: 3, unit: 'adet' },
        { name: 'Soğan', quantity: 1, unit: 'adet' },
        { name: 'Salça', quantity: 1, unit: 'yemek kaşığı' },
        { name: 'Yağ', quantity: 30, unit: 'ml' },
      ],
    },
    {
      name: 'Menemen',
      ingredients: [
        { name: 'Yumurta', quantity: 4, unit: 'adet' },
        { name: 'Domates', quantity: 3, unit: 'adet' },
        { name: 'Biber', quantity: 2, unit: 'adet' },
        { name: 'Soğan', quantity: 1, unit: 'adet' },
        { name: 'Tereyağı', quantity: 30, unit: 'gram' },
      ],
    },
  ];

  for (const meal of meals) {
    await prisma.customMeal.create({
      data: {
        userId: user.id,
        name: meal.name,
        ingredients: {
          create: meal.ingredients,
        },
      },
    });
  }

  console.log('✅ 5 örnek yemek eklendi!');
}

seedCustomMeals()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
