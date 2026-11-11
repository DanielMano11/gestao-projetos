import { PrismaClient, ProjectStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'gestor@exemplo.com' },
    update: {},
    create: {
      name: 'Gestor Principal',
      email: 'gestor@exemplo.com',
      passwordHash,
    },
  });

  const client = await prisma.client.create({
    data: {
      userId: user.id,
      name: 'Tech Soluções Ltda',
      whatsapp: '5511999998888',
      email: 'contato@techsolucoes.com.br',
      notes: 'Cliente recorrente de desenvolvimento web',
    },
  });

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 5);

  await prisma.project.create({
    data: {
      clientId: client.id,
      title: 'Portal Corporativo e Painel de Vendas',
      description: 'Desenvolvimento completo de portal e integração com CRM.',
      status: ProjectStatus.IN_PROGRESS,
      deadline: nextWeek,
      chargedAmount: 12000.0,
      paidAmount: 4500.0,
      tasks: {
        create: [
          { title: 'Prototipação de Telas', isCompleted: true, position: 0 },
          { title: 'API e Banco de Dados', isCompleted: true, position: 1 },
          { title: 'Integração Frontend', isCompleted: false, position: 2 },
          { title: 'Deploy e Homologação', isCompleted: false, position: 3 },
        ],
      },
      payments: {
        create: [
          { amount: 4500.0, note: 'Entrada de 37.5% na aprovação' },
        ],
      },
    },
  });

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

