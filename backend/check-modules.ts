import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkModules() {
  try {
    const modules = await prisma.module.findMany({
      orderBy: { id: 'asc' },
    });

    console.log('📦 Sistemdeki Modüller:\n');
    console.log(`Toplam: ${modules.length} modül\n`);
    
    modules.forEach((module) => {
      console.log(`${module.icon} ${module.name}`);
      console.log(`   Slug: ${module.slug}`);
      console.log(`   Açıklama: ${module.description}`);
      console.log(`   Core: ${module.isCore ? 'Evet' : 'Hayır'}`);
      console.log(`   Aktif: ${module.isActive ? 'Evet' : 'Hayır'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkModules();
