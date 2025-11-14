const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setAdmin() {
  try {
    const user = await prisma.user.update({
      where: { email: 'serdardogruer@gmail.com' },
      data: { isAdmin: true }
    });
    
    console.log('✅ Admin yetkisi verildi:', user.email);
  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setAdmin();
