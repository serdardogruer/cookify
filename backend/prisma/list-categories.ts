import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { ingredients: true },
      },
    },
  });

  console.log('\n📋 Kategoriler:\n');
  categories.forEach((cat) => {
    console.log(`ID: ${cat.id} | ${cat.icon || '📦'} ${cat.name} (${cat._count.ingredients} malzeme)`);
  });
  console.log(`\nToplam: ${categories.length} kategori\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
