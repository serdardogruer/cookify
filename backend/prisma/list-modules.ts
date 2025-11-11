import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const modules = await prisma.module.findMany({
    orderBy: { name: 'asc' },
  });

  console.log('\n📋 All modules in database:\n');
  modules.forEach((m) => {
    console.log(`   ${m.icon} ${m.name} (${m.slug}) - ${m.isCore ? 'Core' : 'Optional'} - ${m.isActive ? 'Active' : 'Inactive'}`);
  });
  console.log(`\nTotal: ${modules.length} modules\n`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
