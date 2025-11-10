import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ingredientsData = [
  // SEBZELER
  { name: 'Soğan', category: 'SEBZELER', unit: 'adet' },
  { name: 'Salatalık', category: 'SEBZELER', unit: 'adet' },
  { name: 'Brokoli', category: 'SEBZELER', unit: 'adet' },
  { name: 'Taze Soğan', category: 'SEBZELER', unit: 'demet' },
  { name: 'Lahana', category: 'SEBZELER', unit: 'adet' },
  { name: 'Biber', category: 'SEBZELER', unit: 'adet' },
  { name: 'Havuç', category: 'SEBZELER', unit: 'kg' },
  { name: 'Ispanak', category: 'SEBZELER', unit: 'kg' },
  { name: 'Kabak', category: 'SEBZELER', unit: 'adet' },
  { name: 'Patates', category: 'SEBZELER', unit: 'kg' },
  { name: 'Domates', category: 'SEBZELER', unit: 'kg' },
  { name: 'Karnabahar', category: 'SEBZELER', unit: 'adet' },
  { name: 'Kırmızı Biber', category: 'SEBZELER', unit: 'adet' },
  { name: 'Yeşil Biber', category: 'SEBZELER', unit: 'adet' },
  { name: 'Patlıcan', category: 'SEBZELER', unit: 'kg' },
  { name: 'Enginar', category: 'SEBZELER', unit: 'adet' },
  { name: 'Kereviz', category: 'SEBZELER', unit: 'adet' },
  { name: 'Turp', category: 'SEBZELER', unit: 'demet' },
  { name: 'Pancar', category: 'SEBZELER', unit: 'kg' },
  { name: 'Bamya', category: 'SEBZELER', unit: 'kg' },
  { name: 'Mısır', category: 'SEBZELER', unit: 'adet' },
  { name: 'Pırasa', category: 'SEBZELER', unit: 'kg' },
  { name: 'Kapya Biber', category: 'SEBZELER', unit: 'kg' },
  { name: 'Dolmalık Biber', category: 'SEBZELER', unit: 'kg' },

  // YEŞİLLİKLER
  { name: 'Dereotu', category: 'YEŞİLLİKLER', unit: 'demet' },
  { name: 'Roka', category: 'YEŞİLLİKLER', unit: 'demet' },
  { name: 'Fesleğen', category: 'YEŞİLLİKLER', unit: 'demet' },
  { name: 'Marul', category: 'YEŞİLLİKLER', unit: 'adet' },
  { name: 'Maydanoz', category: 'YEŞİLLİKLER', unit: 'demet' },
  { name: 'Nane', category: 'YEŞİLLİKLER', unit: 'demet' },
  { name: 'Biberiye', category: 'YEŞİLLİKLER', unit: 'demet' },
  { name: 'Tere', category: 'YEŞİLLİKLER', unit: 'demet' },
  { name: 'Semizotu', category: 'YEŞİLLİKLER', unit: 'demet' },
  { name: 'Pazı', category: 'YEŞİLLİKLER', unit: 'demet' },

  // MEYVELER
  { name: 'Çilek', category: 'MEYVELER', unit: 'kg' },
  { name: 'Portakal', category: 'MEYVELER', unit: 'kg' },
  { name: 'Elma', category: 'MEYVELER', unit: 'kg' },
  { name: 'Muz', category: 'MEYVELER', unit: 'kg' },
  { name: 'Hurma', category: 'MEYVELER', unit: 'kg' },
  { name: 'Armut', category: 'MEYVELER', unit: 'kg' },
  { name: 'Şeftali', category: 'MEYVELER', unit: 'kg' },
  { name: 'Kayısı', category: 'MEYVELER', unit: 'kg' },
  { name: 'Kiraz', category: 'MEYVELER', unit: 'kg' },
  { name: 'Vişne', category: 'MEYVELER', unit: 'kg' },
  { name: 'Üzüm', category: 'MEYVELER', unit: 'kg' },
  { name: 'Karpuz', category: 'MEYVELER', unit: 'adet' },
  { name: 'Kavun', category: 'MEYVELER', unit: 'adet' },
  { name: 'Ananas', category: 'MEYVELER', unit: 'adet' },
  { name: 'Kivi', category: 'MEYVELER', unit: 'adet' },
  { name: 'Avokado', category: 'MEYVELER', unit: 'adet' },
  { name: 'Nar', category: 'MEYVELER', unit: 'kg' },
  { name: 'Greyfurt', category: 'MEYVELER', unit: 'kg' },
  { name: 'Mandalina', category: 'MEYVELER', unit: 'kg' },
  { name: 'Limon', category: 'MEYVELER', unit: 'kg' },
  { name: 'Mango', category: 'MEYVELER', unit: 'adet' },

  // ET ÜRÜNLERİ
  { name: 'Tavuk Göğsü', category: 'ET ÜRÜNLERİ', unit: 'kg' },
  { name: 'Sosis', category: 'ET ÜRÜNLERİ', unit: 'paket' },
  { name: 'Hindi Eti', category: 'ET ÜRÜNLERİ', unit: 'kg' },
  { name: 'Sucuk', category: 'ET ÜRÜNLERİ', unit: 'kg' },
  { name: 'Pastırma', category: 'ET ÜRÜNLERİ', unit: 'kg' },
  { name: 'Dana Kıyma', category: 'ET ÜRÜNLERİ', unit: 'kg' },
  { name: 'Kuzu Eti', category: 'ET ÜRÜNLERİ', unit: 'kg' },
  { name: 'Tavuk But', category: 'ET ÜRÜNLERİ', unit: 'kg' },
  { name: 'Tavuk Kanat', category: 'ET ÜRÜNLERİ', unit: 'kg' },
  { name: 'Dana Eti', category: 'ET ÜRÜNLERİ', unit: 'kg' },
  { name: 'Kuzu Kıyma', category: 'ET ÜRÜNLERİ', unit: 'kg' },
  { name: 'Salam', category: 'ET ÜRÜNLERİ', unit: 'paket' },
  { name: 'Jambon', category: 'ET ÜRÜNLERİ', unit: 'paket' },

  // DENİZ ÜRÜNLERİ
  { name: 'Balık Fileto', category: 'DENİZ ÜRÜNLERİ', unit: 'kg' },
  { name: 'Somon', category: 'DENİZ ÜRÜNLERİ', unit: 'kg' },
  { name: 'Karides', category: 'DENİZ ÜRÜNLERİ', unit: 'kg' },
  { name: 'Ton Balığı', category: 'DENİZ ÜRÜNLERİ', unit: 'kutu' },
  { name: 'Sardalya', category: 'DENİZ ÜRÜNLERİ', unit: 'kg' },
  { name: 'Hamsi', category: 'DENİZ ÜRÜNLERİ', unit: 'kg' },
  { name: 'Levrek', category: 'DENİZ ÜRÜNLERİ', unit: 'kg' },
  { name: 'Çupra', category: 'DENİZ ÜRÜNLERİ', unit: 'kg' },
  { name: 'Alabalık', category: 'DENİZ ÜRÜNLERİ', unit: 'kg' },
  { name: 'Palamut', category: 'DENİZ ÜRÜNLERİ', unit: 'kg' },
  { name: 'Uskumru', category: 'DENİZ ÜRÜNLERİ', unit: 'kg' },
  { name: 'Midye', category: 'DENİZ ÜRÜNLERİ', unit: 'kg' },

  // SÜT ÜRÜNLERİ
  { name: 'Yoğurt', category: 'SÜT ÜRÜNLERİ', unit: 'kg' },
  { name: 'Tereyağı', category: 'SÜT ÜRÜNLERİ', unit: 'kg' },
  { name: 'Peynir', category: 'SÜT ÜRÜNLERİ', unit: 'kg' },
  { name: 'Süt', category: 'SÜT ÜRÜNLERİ', unit: 'litre' },
  { name: 'Krema', category: 'SÜT ÜRÜNLERİ', unit: 'ml' },
  { name: 'Ayran', category: 'SÜT ÜRÜNLERİ', unit: 'litre' },
  { name: 'Labne', category: 'SÜT ÜRÜNLERİ', unit: 'kg' },
  { name: 'Kefir', category: 'SÜT ÜRÜNLERİ', unit: 'litre' },
  { name: 'Çökelek', category: 'SÜT ÜRÜNLERİ', unit: 'kg' },
  { name: 'Kaşar', category: 'SÜT ÜRÜNLERİ', unit: 'kg' },
  { name: 'Mozzarella', category: 'SÜT ÜRÜNLERİ', unit: 'kg' },
  { name: 'Parmesan', category: 'SÜT ÜRÜNLERİ', unit: 'gr' },

  // BAHARATLAR
  { name: 'Zencefil', category: 'BAHARATLAR', unit: 'gr' },
  { name: 'Kekik', category: 'BAHARATLAR', unit: 'gr' },
  { name: 'Vanilin', category: 'BAHARATLAR', unit: 'paket' },
  { name: 'Sarımsak', category: 'BAHARATLAR', unit: 'adet' },
  { name: 'Kimyon', category: 'BAHARATLAR', unit: 'gr' },
  { name: 'Zerdeçal', category: 'BAHARATLAR', unit: 'gr' },
  { name: 'Tuz', category: 'BAHARATLAR', unit: 'kg' },
  { name: 'Karabiber', category: 'BAHARATLAR', unit: 'gr' },
  { name: 'Pul Biber', category: 'BAHARATLAR', unit: 'gr' },
  { name: 'Tarçın', category: 'BAHARATLAR', unit: 'gr' },
  { name: 'Kırmızı Toz Biber', category: 'BAHARATLAR', unit: 'gr' },
  { name: 'Karanfil', category: 'BAHARATLAR', unit: 'gr' },
  { name: 'Sumak', category: 'BAHARATLAR', unit: 'gr' },
  { name: 'Köri', category: 'BAHARATLAR', unit: 'gr' },
  { name: 'Paprika', category: 'BAHARATLAR', unit: 'gr' },

  // KURUYEMİŞLER
  { name: 'Badem', category: 'KURUYEMİŞLER', unit: 'kg' },
  { name: 'Ceviz', category: 'KURUYEMİŞLER', unit: 'kg' },
  { name: 'Fındık', category: 'KURUYEMİŞLER', unit: 'kg' },
  { name: 'Chia Tohumu', category: 'KURUYEMİŞLER', unit: 'gr' },
  { name: 'Kaju', category: 'KURUYEMİŞLER', unit: 'kg' },
  { name: 'Susam', category: 'KURUYEMİŞLER', unit: 'gr' },
  { name: 'Ayçiçek Çekirdeği', category: 'KURUYEMİŞLER', unit: 'kg' },
  { name: 'Kabak Çekirdeği', category: 'KURUYEMİŞLER', unit: 'kg' },
  { name: 'Antep Fıstığı', category: 'KURUYEMİŞLER', unit: 'kg' },
  { name: 'Kuru Üzüm', category: 'KURUYEMİŞLER', unit: 'kg' },
  { name: 'Kuru İncir', category: 'KURUYEMİŞLER', unit: 'kg' },
  { name: 'Kuru Kayısı', category: 'KURUYEMİŞLER', unit: 'kg' },

  // TAHILLAR
  { name: 'Buğday Nişastası', category: 'TAHILLAR', unit: 'kg' },
  { name: 'Mısır Nişastası', category: 'TAHILLAR', unit: 'kg' },
  { name: 'Bulgur', category: 'TAHILLAR', unit: 'kg' },
  { name: 'Kinoa', category: 'TAHILLAR', unit: 'kg' },
  { name: 'Yulaf', category: 'TAHILLAR', unit: 'kg' },
  { name: 'Un', category: 'TAHILLAR', unit: 'kg' },
  { name: 'Pirinç', category: 'TAHILLAR', unit: 'kg' },
  { name: 'Ekmek', category: 'TAHILLAR', unit: 'adet' },

  // BAKLİYATLAR
  { name: 'Barbunya', category: 'BAKLİYATLAR', unit: 'kg' },
  { name: 'Nohut', category: 'BAKLİYATLAR', unit: 'kg' },
  { name: 'Bezelye', category: 'BAKLİYATLAR', unit: 'kg' },
  { name: 'Mercimek', category: 'BAKLİYATLAR', unit: 'kg' },
  { name: 'Fasulye', category: 'BAKLİYATLAR', unit: 'kg' },
  { name: 'Kırmızı Mercimek', category: 'BAKLİYATLAR', unit: 'kg' },
  { name: 'Yeşil Mercimek', category: 'BAKLİYATLAR', unit: 'kg' },
  { name: 'Kuru Fasulye', category: 'BAKLİYATLAR', unit: 'kg' },

  // HAMUR ÜRÜNLERİ
  { name: 'Erişte', category: 'HAMUR ÜRÜNLERİ', unit: 'paket' },
  { name: 'Makarna', category: 'HAMUR ÜRÜNLERİ', unit: 'paket' },
  { name: 'Kabartma Tozu', category: 'HAMUR ÜRÜNLERİ', unit: 'paket' },
  { name: 'Maya', category: 'HAMUR ÜRÜNLERİ', unit: 'paket' },
  { name: 'Karbonat', category: 'HAMUR ÜRÜNLERİ', unit: 'paket' },

  // SOSLAR
  { name: 'Ketçap', category: 'SOSLAR', unit: 'şişe' },
  { name: 'Nar Ekşisi', category: 'SOSLAR', unit: 'şişe' },
  { name: 'Mayonez', category: 'SOSLAR', unit: 'şişe' },
  { name: 'Hardal', category: 'SOSLAR', unit: 'şişe' },
  { name: 'Soya Sosu', category: 'SOSLAR', unit: 'şişe' },
  { name: 'Sirke', category: 'SOSLAR', unit: 'şişe' },
  { name: 'Domates Salçası', category: 'SOSLAR', unit: 'kg' },
  { name: 'Domates Sosu', category: 'SOSLAR', unit: 'şişe' },

  // TATLANDIRICILAR
  { name: 'Şeker', category: 'TATLANDIRICILAR', unit: 'kg' },
  { name: 'Çikolata', category: 'TATLANDIRICILAR', unit: 'paket' },
  { name: 'Kakao', category: 'TATLANDIRICILAR', unit: 'gr' },
  { name: 'Toz Şeker', category: 'TATLANDIRICILAR', unit: 'kg' },
  { name: 'Bal', category: 'TATLANDIRICILAR', unit: 'kg' },
  { name: 'Pekmez', category: 'TATLANDIRICILAR', unit: 'kg' },

  // İÇECEKLER
  { name: 'Kahve', category: 'İÇECEKLER', unit: 'paket' },
  { name: 'Soda', category: 'İÇECEKLER', unit: 'şişe' },
  { name: 'Maden Suyu', category: 'İÇECEKLER', unit: 'şişe' },
  { name: 'Su', category: 'İÇECEKLER', unit: 'litre' },
  { name: 'Çay', category: 'İÇECEKLER', unit: 'paket' },
  { name: 'Meyve Suyu', category: 'İÇECEKLER', unit: 'litre' },

  // YAĞLAR
  { name: 'Zeytinyağı', category: 'YAĞLAR', unit: 'litre' },
  { name: 'Ayçiçek Yağı', category: 'YAĞLAR', unit: 'litre' },
  { name: 'Tereyağı', category: 'YAĞLAR', unit: 'kg' },
  { name: 'Sıvı Yağ', category: 'YAĞLAR', unit: 'litre' },

  // TEMEL MALZEMELER
  { name: 'Yumurta', category: 'TEMEL MALZEMELER', unit: 'adet' },

  // DİĞER
  { name: 'Dondurma', category: 'DİĞER', unit: 'paket' },
  { name: 'Protein', category: 'DİĞER', unit: 'paket' },
];

async function main() {
  console.log('🌱 Seeding ingredients...');

  // Kategorileri oluştur
  const categories = [...new Set(ingredientsData.map((i) => i.category))];

  for (const categoryName of categories) {
    await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName },
    });
  }

  console.log(`✅ Created ${categories.length} categories`);

  // Malzemeleri oluştur
  let count = 0;
  for (const item of ingredientsData) {
    const category = await prisma.category.findUnique({
      where: { name: item.category },
    });

    if (category) {
      await prisma.ingredient.upsert({
        where: {
          name_categoryId: {
            name: item.name,
            categoryId: category.id,
          },
        },
        update: { defaultUnit: item.unit },
        create: {
          name: item.name,
          categoryId: category.id,
          defaultUnit: item.unit,
        },
      });
      count++;
    }
  }

  console.log(`✅ Created ${count} ingredients`);
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
