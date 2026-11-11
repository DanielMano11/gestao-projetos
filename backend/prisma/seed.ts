import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'gestor@exemplo.com' },
    update: {},
    create: {
      name: 'Gestor Principal',
      email: 'gestor@exemplo.com',
      passwordHash,
    },
  });

  console.log('Seed de usuário concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
