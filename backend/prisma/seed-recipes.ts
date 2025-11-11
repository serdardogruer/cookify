import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleRecipes = [
  {
    title: 'Mercimek Çorbası',
    description: 'Geleneksel Türk mutfağının vazgeçilmez çorbası. Besleyici ve lezzetli.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
    video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    prepTime: 10,
    cookTime: 30,
    servings: 4,
    difficulty: 'EASY',
    category: 'Çorba',
    cuisine: 'Türk',
    userId: 1,
    ingredients: [
      { name: 'Kırmızı Mercimek', quantity: 1, unit: 'su bardağı', order: 0 },
      { name: 'Soğan', quantity: 1, unit: 'adet', order: 1 },
      { name: 'Havuç', quantity: 1, unit: 'adet', order: 2 },
      { name: 'Patates', quantity: 1, unit: 'adet', order: 3 },
      { name: 'Domates Salçası', quantity: 1, unit: 'yemek kaşığı', order: 4 },
      { name: 'Tereyağı', quantity: 2, unit: 'yemek kaşığı', order: 5 },
      { name: 'Tuz', quantity: 1, unit: 'çay kaşığı', order: 6 },
      { name: 'Karabiber', quantity: 0.5, unit: 'çay kaşığı', order: 7 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Mercimekleri yıkayın ve süzün.' },
      { stepNumber: 2, instruction: 'Soğan, havuç ve patatesi küp küp doğrayın.' },
      { stepNumber: 3, instruction: 'Tencerede tereyağını eritin, sebzeleri kavurun.' },
      { stepNumber: 4, instruction: 'Salçayı ekleyip kokusu çıkana kadar kavurun.' },
      { stepNumber: 5, instruction: 'Mercimek ve 5 su bardağı su ekleyin.' },
      { stepNumber: 6, instruction: 'Sebzeler yumuşayana kadar pişirin (25-30 dk).' },
      { stepNumber: 7, instruction: 'Blenderdan geçirin, tuz ve karabiber ekleyin.' },
    ],
    tags: ['çorba', 'vegan', 'sağlıklı', 'ekonomik'],
  },
  {
    title: 'Tavuk Sote',
    description: 'Pratik ve lezzetli bir ana yemek. Pilav veya makarna ile servis edilir.',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800',
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    difficulty: 'EASY',
    category: 'Ana Yemek',
    cuisine: 'Türk',
    userId: 1,
    ingredients: [
      { name: 'Tavuk Göğsü', quantity: 500, unit: 'gram', order: 0 },
      { name: 'Biber', quantity: 2, unit: 'adet', order: 1 },
      { name: 'Domates', quantity: 2, unit: 'adet', order: 2 },
      { name: 'Soğan', quantity: 1, unit: 'adet', order: 3 },
      { name: 'Sıvı Yağ', quantity: 3, unit: 'yemek kaşığı', order: 4 },
      { name: 'Tuz', quantity: 1, unit: 'çay kaşığı', order: 5 },
      { name: 'Karabiber', quantity: 0.5, unit: 'çay kaşığı', order: 6 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Tavukları küp küp doğrayın.' },
      { stepNumber: 2, instruction: 'Sebzeleri ince ince doğrayın.' },
      { stepNumber: 3, instruction: 'Tavada yağı kızdırın, tavukları ekleyin.' },
      { stepNumber: 4, instruction: 'Tavuklar pembemsi rengini kaybedince sebzeleri ekleyin.' },
      { stepNumber: 5, instruction: 'Tuz ve baharatları ekleyip karıştırın.' },
      { stepNumber: 6, instruction: 'Sebzeler yumuşayana kadar pişirin (15-20 dk).' },
    ],
    tags: ['ana yemek', 'tavuk', 'pratik', 'hafif'],
  },
  {
    title: 'Karnıyarık',
    description: 'Türk mutfağının en sevilen patlıcan yemeklerinden biri.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800',
    prepTime: 30,
    cookTime: 45,
    servings: 6,
    difficulty: 'MEDIUM',
    category: 'Ana Yemek',
    cuisine: 'Türk',
    userId: 1,
    ingredients: [
      { name: 'Patlıcan', quantity: 6, unit: 'adet', order: 0 },
      { name: 'Kıyma', quantity: 300, unit: 'gram', order: 1 },
      { name: 'Soğan', quantity: 2, unit: 'adet', order: 2 },
      { name: 'Domates', quantity: 3, unit: 'adet', order: 3 },
      { name: 'Yeşil Biber', quantity: 2, unit: 'adet', order: 4 },
      { name: 'Sarımsak', quantity: 3, unit: 'diş', order: 5 },
      { name: 'Sıvı Yağ', quantity: 1, unit: 'su bardağı', order: 6 },
      { name: 'Tuz', quantity: 1, unit: 'çay kaşığı', order: 7 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Patlıcanları soyun ve tuzlu suda bekletin.' },
      { stepNumber: 2, instruction: 'Soğanları yemeklik doğrayın, kıyma ile kavurun.' },
      { stepNumber: 3, instruction: 'Domates ve biberleri ekleyip pişirin.' },
      { stepNumber: 4, instruction: 'Patlıcanları kızartın.' },
      { stepNumber: 5, instruction: 'Patlıcanların ortasını açın, içini doldurun.' },
      { stepNumber: 6, instruction: 'Fırın tepsisine dizin, üzerine domates dilimleri koyun.' },
      { stepNumber: 7, instruction: '180 derecede 30-40 dakika pişirin.' },
    ],
    tags: ['ana yemek', 'patlıcan', 'fırın', 'geleneksel'],
  },
  {
    title: 'Makarna',
    description: 'Basit ve hızlı bir öğün. Çocukların favorisi.',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
    prepTime: 5,
    cookTime: 15,
    servings: 4,
    difficulty: 'EASY',
    category: 'Ana Yemek',
    cuisine: 'İtalyan',
    userId: 1,
    ingredients: [
      { name: 'Makarna', quantity: 500, unit: 'gram', order: 0 },
      { name: 'Domates Sosu', quantity: 2, unit: 'su bardağı', order: 1 },
      { name: 'Sarımsak', quantity: 2, unit: 'diş', order: 2 },
      { name: 'Zeytinyağı', quantity: 3, unit: 'yemek kaşığı', order: 3 },
      { name: 'Tuz', quantity: 1, unit: 'çay kaşığı', order: 4 },
      { name: 'Fesleğen', quantity: 5, unit: 'yaprak', order: 5 },
      { name: 'Parmesan', quantity: 50, unit: 'gram', order: 6 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Makarnayı tuzlu suda haşlayın.' },
      { stepNumber: 2, instruction: 'Tavada zeytinyağını kızdırın, sarımsağı kavurun.' },
      { stepNumber: 3, instruction: 'Domates sosunu ekleyin ve kaynatın.' },
      { stepNumber: 4, instruction: 'Haşlanmış makarnayı süzün.' },
      { stepNumber: 5, instruction: 'Makarnayı sosla karıştırın.' },
      { stepNumber: 6, instruction: 'Üzerine fesleğen ve parmesan serpin.' },
    ],
    tags: ['makarna', 'pratik', 'hızlı', 'çocuk dostu'],
  },
  {
    title: 'Sütlaç',
    description: 'Geleneksel Türk tatlısı. Fırında veya ocakta yapılabilir.',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800',
    prepTime: 10,
    cookTime: 40,
    servings: 6,
    difficulty: 'MEDIUM',
    category: 'Tatlı',
    cuisine: 'Türk',
    userId: 1,
    ingredients: [
      { name: 'Süt', quantity: 1, unit: 'litre', order: 0 },
      { name: 'Pirinç', quantity: 0.5, unit: 'su bardağı', order: 1 },
      { name: 'Şeker', quantity: 1, unit: 'su bardağı', order: 2 },
      { name: 'Nişasta', quantity: 1, unit: 'yemek kaşığı', order: 3 },
      { name: 'Vanilin', quantity: 1, unit: 'paket', order: 4 },
      { name: 'Tarçın', quantity: 1, unit: 'çay kaşığı', order: 5 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Pirinci haşlayın ve süzün.' },
      { stepNumber: 2, instruction: 'Sütü kaynatın, pirinci ekleyin.' },
      { stepNumber: 3, instruction: 'Şekeri ekleyip karıştırın.' },
      { stepNumber: 4, instruction: 'Nişastayı soğuk sütle karıştırıp ekleyin.' },
      { stepNumber: 5, instruction: 'Koyulaşana kadar pişirin (20-25 dk).' },
      { stepNumber: 6, instruction: 'Vanilin ekleyip kaselere paylaştırın.' },
      { stepNumber: 7, instruction: 'Üzerine tarçın serpin ve soğutun.' },
    ],
    tags: ['tatlı', 'sütlü', 'geleneksel', 'fırın'],
  },
  {
    title: 'Menemen',
    description: 'Türk kahvaltısının vazgeçilmezi. Pratik ve lezzetli.',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800',
    prepTime: 5,
    cookTime: 10,
    servings: 2,
    difficulty: 'EASY',
    category: 'Kahvaltı',
    cuisine: 'Türk',
    userId: 1,
    ingredients: [
      { name: 'Yumurta', quantity: 4, unit: 'adet', order: 0 },
      { name: 'Domates', quantity: 2, unit: 'adet', order: 1 },
      { name: 'Yeşil Biber', quantity: 2, unit: 'adet', order: 2 },
      { name: 'Soğan', quantity: 1, unit: 'adet', order: 3 },
      { name: 'Tereyağı', quantity: 2, unit: 'yemek kaşığı', order: 4 },
      { name: 'Tuz', quantity: 0.5, unit: 'çay kaşığı', order: 5 },
      { name: 'Karabiber', quantity: 0.5, unit: 'çay kaşığı', order: 6 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Sebzeleri küçük küpler halinde doğrayın.' },
      { stepNumber: 2, instruction: 'Tavada tereyağını eritin.' },
      { stepNumber: 3, instruction: 'Soğanı kavurun, biberleri ekleyin.' },
      { stepNumber: 4, instruction: 'Domatesleri ekleyip pişirin.' },
      { stepNumber: 5, instruction: 'Yumurtaları kırın ve karıştırın.' },
      { stepNumber: 6, instruction: 'Tuz ve karabiber ekleyin.' },
      { stepNumber: 7, instruction: 'Yumurtalar pişene kadar karıştırın (3-4 dk).' },
    ],
    tags: ['kahvaltı', 'yumurta', 'pratik', 'hızlı'],
  },
];

async function main() {
  console.log('🌱 Seeding sample recipes...\n');

  for (const recipeData of sampleRecipes) {
    try {
      const recipe = await prisma.recipe.create({
        data: {
          title: recipeData.title,
          description: recipeData.description,
          image: recipeData.image,
          video: recipeData.video,
          prepTime: recipeData.prepTime,
          cookTime: recipeData.cookTime,
          servings: recipeData.servings,
          difficulty: recipeData.difficulty,
          category: recipeData.category,
          cuisine: recipeData.cuisine,
          userId: recipeData.userId,
          ingredients: {
            create: recipeData.ingredients,
          },
          instructions: {
            create: recipeData.instructions,
          },
          tags: {
            create: recipeData.tags.map((tag) => ({ tag })),
          },
        },
      });

      console.log(`✅ Created: ${recipe.title}`);
    } catch (error: any) {
      console.log(`⚠️  Error creating ${recipeData.title}: ${error.message}`);
    }
  }

  console.log('\n🎉 Sample recipes seeded successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
