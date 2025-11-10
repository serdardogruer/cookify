import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Birim belirleme fonksiyonu
function getDefaultUnit(name: string, category: string): string {
  const nameLower = name.toLowerCase();
  
  // Özel durumlar
  if (nameLower.includes('yağ') || nameLower.includes('zeytinyağ')) return 'litre';
  if (nameLower.includes('süt') || nameLower.includes('ayran') || nameLower.includes('kefir')) return 'litre';
  if (nameLower.includes('su') && !nameLower.includes('susam')) return 'litre';
  if (nameLower.includes('suyu')) return 'litre';
  if (nameLower.includes('sirke')) return 'şişe';
  if (nameLower.includes('sos') || nameLower.includes('salça')) return 'şişe';
  if (nameLower.includes('ketçap') || nameLower.includes('mayonez')) return 'şişe';
  if (nameLower.includes('krema') && category === 'SÜT ÜRÜNLERİ') return 'ml';
  if (nameLower.includes('yumurta')) return 'adet';
  if (nameLower.includes('ekmek')) return 'adet';
  if (nameLower.includes('soda') || nameLower.includes('kola') || nameLower.includes('maden suyu')) return 'şişe';
  if (nameLower.includes('çay') || nameLower.includes('kahve')) return 'paket';
  if (nameLower.includes('makarna') || nameLower.includes('erişte')) return 'paket';
  if (nameLower.includes('maya') || nameLower.includes('kabartma') || nameLower.includes('karbonat')) return 'paket';
  if (nameLower.includes('sosis') || nameLower.includes('salam') || nameLower.includes('jambon')) return 'paket';
  if (nameLower.includes('dondurma') || nameLower.includes('protein')) return 'paket';
  if (nameLower.includes('ton balığı') && nameLower.includes('konserve')) return 'kutu';
  
  // Kategoriye göre
  switch (category) {
    case 'SEBZELER':
      if (nameLower.includes('domates') || nameLower.includes('patates') || 
          nameLower.includes('havuç') || nameLower.includes('pancar') ||
          nameLower.includes('patlıcan') || nameLower.includes('bamya') ||
          nameLower.includes('pırasa') || nameLower.includes('ispanak') ||
          nameLower.includes('kapya') || nameLower.includes('dolmalık')) {
        return 'kg';
      }
      if (nameLower.includes('soğan') && !nameLower.includes('taze')) return 'adet';
      return 'adet';
      
    case 'YEŞİLLİKLER':
      return 'demet';
      
    case 'MEYVELER':
      if (nameLower.includes('karpuz') || nameLower.includes('kavun') ||
          nameLower.includes('ananas') || nameLower.includes('kivi') ||
          nameLower.includes('avokado') || nameLower.includes('mango')) {
        return 'adet';
      }
      return 'kg';
      
    case 'ET ÜRÜNLERİ':
      if (nameLower.includes('sosis') || nameLower.includes('salam') || nameLower.includes('jambon')) {
        return 'paket';
      }
      return 'kg';
      
    case 'DENİZ ÜRÜNLERİ':
      if (nameLower.includes('konserve') || nameLower.includes('kutu')) return 'kutu';
      return 'kg';
      
    case 'SÜT ÜRÜNLERİ':
      if (nameLower.includes('süt') || nameLower.includes('ayran') || nameLower.includes('kefir')) {
        return 'litre';
      }
      if (nameLower.includes('krema')) return 'ml';
      if (nameLower.includes('parmesan')) return 'gr';
      return 'kg';
      
    case 'BAHARATLAR':
      if (nameLower.includes('sarımsak')) return 'adet';
      if (nameLower.includes('tuz')) return 'kg';
      if (nameLower.includes('vanilin')) return 'paket';
      return 'gr';
      
    case 'KURUYEMİŞLER':
      if (nameLower.includes('chia') || nameLower.includes('susam') ||
          nameLower.includes('tozu') || nameLower.includes('rendesi') ||
          nameLower.includes('ezmesi') || nameLower.includes('tahin')) {
        return 'gr';
      }
      return 'kg';
      
    case 'TAHILLAR':
      if (nameLower.includes('nişasta') || nameLower.includes('un')) return 'kg';
      if (nameLower.includes('ekmek')) return 'adet';
      return 'kg';
      
    case 'BAKLİYATLAR':
      return 'kg';
      
    case 'HAMUR ÜRÜNLERİ':
      return 'paket';
      
    case 'SOSLAR':
      if (nameLower.includes('salça')) return 'kg';
      return 'şişe';
      
    case 'TATLANDIRICILAR':
      if (nameLower.includes('çikolata')) return 'paket';
      if (nameLower.includes('kakao')) return 'gr';
      return 'kg';
      
    case 'İÇECEKLER':
      if (nameLower.includes('çay') || nameLower.includes('kahve')) return 'paket';
      if (nameLower.includes('soda') || nameLower.includes('kola') || nameLower.includes('maden')) return 'şişe';
      return 'litre';
      
    case 'YAĞLAR':
      return 'litre';
      
    case 'TEMEL MALZEMELER':
      return 'adet';
      
    default:
      return 'adet';
  }
}

const ingredientsData = [
  // SEBZELER
  { category: 'SEBZELER', items: 'Soğan, Salatalık, Brokoli, Taze Soğan, Lahana, Biber, Havuç, Ispanak, Kabak, Patates, Domates, Karnabahar, Kırmızı Biber, Yeşil Biber, Patlıcan, Enginar, Kereviz, Turp, Pancar, Bamya, Mısır, Pırasa, Kereviz Sapı, Hindiba, Radika, Ebegümeci, Gelincik, Sirken, Kazayağı, Yabani Turp, Çiriş, Kuzukulağı, Labada, Kırmızı Lahana, Beyaz Lahana, Brüksel Lahanası, Çin Lahanası, Karalahana, Karnıbahar, Romanesco, Brokoli Çiçeği, Brokoli Sapı, Kuşkonmaz, Bamya Çiçeği, Kabak Çiçeği, Biber Çiçeği, Patlıcan Çiçeği, Kornişon, Turşuluk Biber, Turşuluk Domates, Turşuluk Lahana, Turşuluk Havuç, Turşuluk Pancar, Turşuluk Turp, Turşuluk Soğan, Turşuluk Sarımsak, Kırmızı Soğan, Beyaz Soğan, Sarı Soğan, Mor Soğan, Arpacık Soğan, Yalova Soğanı, Dolma Biberi, Dolmalık Biber, Dondurulmuş Sebze, Domates Yaprağı' },
  
  // YEŞİLLİKLER
  { category: 'YEŞİLLİKLER', items: 'Dereotu, Roka, Fesleğen, Marul, Maydanoz, Nane, Biberiye, Dere Otu, Tere, Semizotu, Pazı' },
  
  // MEYVELER
  { category: 'MEYVELER', items: 'Çilek, Portakal, Elma, Muz, Hurma, Armut, Şeftali, Kayısı, Kiraz, Vişne, Üzüm, Karpuz, Kavun, Ananas, Kivi, Avokado, Nar, Greyfurt, Mandalina, Limon, Lime, Hindistan Cevizi, Mango, Papaya, Ahududu, Yaban Mersini, Kuşburnu, Alıç, İğde, Dut, İncir, Erik, Ayva, Muşmula, Trabzon Hurması, Kızılcık, Yenidünya, Frenk Üzümü, Bektaşi Üzümü, Karadut, Akdut, Kırmızı İncir, Beyaz İncir, Siyah İncir, Yeşil İncir' },
  
  // ET ÜRÜNLERİ
  { category: 'ET ÜRÜNLERİ', items: 'Tavuk Göğsü, Sosis, Hindi Eti, Sucuk, Pastırma, Dana Kıyma, Kuzu Eti, Tavuk But, Tavuk Kanat, Tavuk Ciğeri, Dana Eti, Kuzu Kıyma, Kuzu Pirzola, Dana Bonfile, Kuzu Bonfile, Tavuk Bonfile, Hindi Bonfile, Salam, Jambon, Kavurma, Köfte, Döner, Çiğ Kebap, Adana Kebap, Urfa Kebap, Döner Eti, Domuz Eti, Kuzu Kaburga, Dana Kaburga, Tavuk Kalçası, Hindi Göğsü, Kuzu Kuşbaşı' },
  
  // DENİZ ÜRÜNLERİ
  { category: 'DENİZ ÜRÜNLERİ', items: 'Balık Fileto, Somon, Karides, Ton Balığı, Sardalya, Hamsi, Levrek, Çupra, Alabalık, Mezgit, Palamut, Uskumru, Kalamar, Ahtapot, Midye, İstiridye, Yengeç, Istakoz, Dil Balığı, Kalkan Balığı, Çinekop, Lüfer, Kefal, Tekir, Mercan, Çipura, Orkinos, Kılıç Balığı, Morina, Mürekkep Balığı, Dil Balığı Fileto, Somon Fileto, Ton Balığı Konservesi, Karides Kuyrukları' },
  
  // SÜT ÜRÜNLERİ
  { category: 'SÜT ÜRÜNLERİ', items: 'Yoğurt, Tereyağı, Peynir, Süt, Soğuk Süt, Krema, Ayran, Labne, Kefir, Çökelek, Taze Kaşar, Eski Kaşar, Mascarpone, Mozzarella, Parmesan, Kokonat Sütü, Badem Sütü, Yulaf Sütü, Soya Sütü, Pirinç Sütü' },
  
  // BAHARATLAR
  { category: 'BAHARATLAR', items: 'Zencefil, Kekik, Vanilin, Sarımsak, Kimyon, Zerdeçal, Tuz, Karabiber, Pul Biber, Tarçın, Kırmızı Toz Biber, Karanfil, Yenibahar, Sumak, Kişniş, Anason, Çörek Otu, Taze Sarımsak, Kuru Sarımsak, Sarımsak Tozu, Soğan Tozu, Kırmızı Biber Tozu, Yeşil Biber Tozu, Domates Tozu, Havuç Tozu, Pancar Tozu, Ispanak Tozu, Brokoli Tozu, Karnabahar Tozu, Kabak Tozu, Patlıcan Tozu, Kereviz Tozu, Maydanoz Tozu, Dereotu Tozu, Nane Tozu, Fesleğen Tozu, Kekik Tozu, Biberiye Tozu, Roka Tozu, Marul Tozu, Tere Tozu, Semizotu Tozu, Pazı Tozu, Köri, Paprika, Çili, Çay, Haşhaş, Çemen, Hardal Tohumu, Kenevir Tohumu, Keten Tohumu, Chia Tohumu Tozu, Vanilya Çubuğu, Vanilya Özü, Limon Kabuğu, Portakal Kabuğu, Lime Kabuğu, Bergamot, Lavanta, Safran, Kardamom, Yıldız Anason, Beyaz Biber' },
  
  // KURUYEMİŞLER
  { category: 'KURUYEMİŞLER', items: 'Badem, Ceviz, Fındık, Chia Tohumu, Kaju, Susam, Ayçiçek Çekirdeği, Kabak Çekirdeği, Antep Fıstığı, Leblebi, Kuru Üzüm, Kuru İncir, Kuru Kayısı, Kestane, Çam Fıstığı, Pekan Cevizi, Macadamia, Brezilya Cevizi, Çiğ Badem, Kavrulmuş Fındık, Kavrulmuş Ceviz, Kavrulmuş Badem, Kavrulmuş Antep Fıstığı, Kavrulmuş Susam, Kavrulmuş Ayçiçek Çekirdeği, Kavrulmuş Kabak Çekirdeği, Çiğ Fındık, Çiğ Ceviz, Çiğ Antep Fıstığı, Çiğ Susam, Çiğ Kabak Çekirdeği, Kuru Erik, Kuru Elma, Kuru Armut, Kuru Şeftali, Kuru Muz, Kuru Ananas, Kuru Mango, Kuru Papaya, Kuru Kivi, Kuru Çilek, Kuru Ahududu, Kuru Yaban Mersini, Kuru Kuşburnu, Kuru Alıç, Kuru İğde, Kuru Dut, Kuru Hurma, Hindistan Cevizi Rendesi, Badem Ezmesi, Fındık Ezmesi, Tahin, Fıstık Ezmesi' },
  
  // TAHILLAR
  { category: 'TAHILLAR', items: 'Buğday Nişastası, Mısır Nişastası, Bulgur, Kinoa, Yulaf, Un, Pirinç, Buğday, Arpa, Çavdar, Darı, Amarant, Karabuğday, Sorgum, Teff, Tam Buğday Unu, Çavdar Unu, Mısır Unu, Pirinç Unu, Yulaf Unu, Ekmek' },
  
  // BAKLİYATLAR
  { category: 'BAKLİYATLAR', items: 'Barbunya, Nohut, Bezelye, Mercimek, Fasulye, Kırmızı Mercimek, Yeşil Mercimek, Siyah Mercimek, Sarı Mercimek, Börülce, Soya Fasulyesi, Mung Fasulyesi, Adzuki Fasulyesi, Lima Fasulyesi, Pinto Fasulyesi, Kuru Fasulye' },
  
  // HAMUR ÜRÜNLERİ
  { category: 'HAMUR ÜRÜNLERİ', items: 'Erişte, Makarna, Kabartma Tozu, Maya, Kuru Maya, Yaş Maya, Karbonat, Kremor Tartar' },
  
  // SOSLAR
  { category: 'SOSLAR', items: 'Ketçap, Nar Ekşisi, Mayonez, Hardal, Soya Sosu, Sirke, Acı Sos, Barbekü Sosu, Balzamik Sirke, Domates Salçası, Domates Sosu, Elma Sirkesi, Üzüm Sirkesi, Pirinç Sirkesi, Teriyaki Sos, Worcestershire Sos, Tabasco, Çin Sosu, Oyster Sos, Hoisin Sos, Sriracha, Chipotle Sos' },
  
  // TATLANDIRICILAR
  { category: 'TATLANDIRICILAR', items: 'Şeker, Çikolata, Kakao, Toz Şeker, Pudra Şekeri, Esmer Şeker, Bal, Pekmez, Agave Şurubu, Akçaağaç Şurubu, Hindistan Cevizi Şekeri, Stevia, Eritritol, Xylitol, Monk Fruit' },
  
  // İÇECEKLER
  { category: 'İÇECEKLER', items: 'Kahve, Soda, Maden Suyu, Su, Kola, Meyve Suyu, Çay, Limon Suyu, Portakal Suyu, Nar Suyu, Yeşil Çay, Siyah Çay, Beyaz Çay, Oolong Çay, Bitki Çayı, Papatya Çayı, Nane Çayı, Adaçayı, Sıcak Su' },
  
  // YAĞLAR
  { category: 'YAĞLAR', items: 'Zeytinyağı, Ayçiçek Yağı, Mısır Yağı, Kanola Yağı, Susam Yağı, Hindistan Cevizi Yağı, Avokado Yağı, Badem Yağı, Ceviz Yağı, Fındık Yağı, Sıvı Yağ, Yağ' },
  
  // TEMEL MALZEMELER
  { category: 'TEMEL MALZEMELER', items: 'Yumurta, Tavuk Yumurtası, Bıldırcın Yumurtası, Kaz Yumurtası' },
  
  // DİĞER
  { category: 'DİĞER', items: 'Dondurma, Tatlı, Kuru Gıda, Kapya Biber, Protein' },
];

async function main() {
  console.log('🌱 Seeding all ingredients from malzeme.md...');

  // Kategorileri oluştur
  const categories = ingredientsData.map((d) => d.category);

  for (const categoryName of categories) {
    await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName },
    });
  }

  console.log(`✅ Created/Updated ${categories.length} categories`);

  // Malzemeleri oluştur
  let addedCount = 0;
  let skippedCount = 0;
  let updatedCount = 0;

  for (const data of ingredientsData) {
    const category = await prisma.category.findUnique({
      where: { name: data.category },
    });

    if (!category) continue;

    // Virgülle ayrılmış malzemeleri parse et
    const items = data.items
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    for (const itemName of items) {
      const unit = getDefaultUnit(itemName, data.category);

      try {
        // Önce kontrol et
        const existing = await prisma.ingredient.findUnique({
          where: {
            name_categoryId: {
              name: itemName,
              categoryId: category.id,
            },
          },
        });

        if (existing) {
          // Varsa güncelle (birim değişmiş olabilir)
          await prisma.ingredient.update({
            where: { id: existing.id },
            data: { defaultUnit: unit },
          });
          updatedCount++;
        } else {
          // Yoksa ekle
          await prisma.ingredient.create({
            data: {
              name: itemName,
              categoryId: category.id,
              defaultUnit: unit,
            },
          });
          addedCount++;
        }
      } catch (error: any) {
        console.log(`⚠️  Skipped: ${itemName} (${error.message})`);
        skippedCount++;
      }
    }
  }

  console.log(`✅ Added ${addedCount} new ingredients`);
  console.log(`🔄 Updated ${updatedCount} existing ingredients`);
  if (skippedCount > 0) {
    console.log(`⚠️  Skipped ${skippedCount} ingredients`);
  }
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
