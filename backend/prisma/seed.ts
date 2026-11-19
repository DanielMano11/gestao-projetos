import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const isProduction = process.env.NODE_ENV === 'production';
  const email = (process.env.SEED_USER_EMAIL ?? 'gestor@exemplo.com')
    .trim()
    .toLowerCase();
  const name = (process.env.SEED_USER_NAME ?? 'Gestor Principal').trim();
  const rawPassword = process.env.SEED_USER_PASSWORD?.trim();

  if (isProduction) {
    if (!process.env.SEED_USER_EMAIL?.trim() || !rawPassword) {
      throw new Error(
        'SEED_USER_EMAIL e SEED_USER_PASSWORD são obrigatórios em produção.',
      );
    }
    if (rawPassword.length < 8) {
      throw new Error(
        'SEED_USER_PASSWORD deve possuir no mínimo 8 caracteres em produção.',
      );
    }
  }

  const password = rawPassword && rawPassword.length >= 8 ? rawPassword : 'SeedDev123!';
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name,
      email,
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
