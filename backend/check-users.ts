import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    console.log('📊 Veritabanındaki kullanıcılar:');
    console.log('Toplam:', users.length);
    console.log('---');
    
    users.forEach((user: any) => {
      console.log(`ID: ${user.id}`);
      console.log(`İsim: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Oluşturulma: ${user.createdAt}`);
      console.log('---');
    });

    if (users.length === 0) {
      console.log('⚠️ Veritabanında kullanıcı yok!');
      console.log('Yeni bir kullanıcı oluşturmak için register sayfasını kullanın.');
    }
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
