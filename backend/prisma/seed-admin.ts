import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAdminSettings() {
  console.log('🌱 Seeding admin settings...');

  // Sistem ayarlarını kontrol et
  const existingSettings = await prisma.systemSettings.findFirst();

  if (!existingSettings) {
    await prisma.systemSettings.create({
      data: {
        allowRegistration: true,
        maintenanceMode: false,
        maxFileUploadSize: 5242880, // 5MB
        sessionTimeout: 86400, // 24 hours
      },
    });
    console.log('✅ Default system settings created');
  } else {
    console.log('ℹ️  System settings already exist');
  }

  // İlk sistem logu oluştur
  await prisma.systemLog.create({
    data: {
      type: 'SYSTEM_EVENT',
      action: 'SYSTEM_INITIALIZED',
      details: JSON.stringify({ message: 'Admin panel initialized' }),
    },
  });
  console.log('✅ Initial system log created');
}

seedAdminSettings()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
