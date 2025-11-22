import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512');
  return salt + ':' + derivedKey.toString('hex');
}

async function main() {
  const email = 'serdardogruer@gmail.com';
  const newPassword = 'dgrr1213';

  const hashedPassword = await hashPassword(newPassword);

  const user = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  });

  console.log('✅ Şifre güncellendi!');
  console.log('Email:', email);
  console.log('Şifre:', newPassword);
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
