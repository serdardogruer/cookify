import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSerdar() {
  try {
    // Serdar kullanıcısını bul
    const user = await prisma.user.findUnique({
      where: { email: 'serdardogruer@gmail.com' },
    });

    if (!user) {
      console.log('❌ Kullanıcı bulunamadı!');
      return;
    }

    console.log('👤 Kullanıcı Bilgileri:');
    console.log('ID:', user.id);
    console.log('İsim:', user.name);
    console.log('Email:', user.email);
    console.log('Kitchen ID:', user.kitchenId);
    console.log('---');

    if (user.kitchenId) {
      const kitchen = await prisma.kitchen.findUnique({
        where: { id: user.kitchenId },
      });

      if (kitchen) {
        console.log('🏠 Aktif Mutfak:');
        console.log('ID:', kitchen.id);
        console.log('İsim:', kitchen.name);
        console.log('Davet Kodu:', kitchen.inviteCode);
        console.log('---');
      }

      // Dolaptaki malzemeleri kontrol et
      const pantryItems = await prisma.pantryItem.findMany({
        where: { kitchenId: user.kitchenId },
      });

      console.log('🗄️ Dolaptaki Malzemeler:', pantryItems.length);
      pantryItems.forEach((item: any) => {
        console.log(`  - ${item.name} (${item.quantity} ${item.unit})`);
      });
    } else {
      console.log('⚠️ Aktif mutfak yok!');
    }

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSerdar();
