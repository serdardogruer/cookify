import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function updatePasswords() {
  console.log('🔄 Tüm kullanıcıların şifreleri güncelleniyor...\n');

  const plainPassword = 'dgrr1213';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const users = await prisma.user.findMany({
    where: {
      password: { not: null }
    }
  });

  console.log(`📊 ${users.length} kullanıcı bulundu\n`);

  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        plainPassword: plainPassword,
      },
    });
    console.log(`✅ ${user.name} (${user.email}) - Şifre güncellendi`);
  }

  console.log('\n✅ Tüm şifreler "dgrr1213" olarak güncellendi!');
}

updatePasswords()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Hata:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
