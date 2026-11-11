import { ConflictException, NotFoundException } from '@nestjs/common';
import { ClientsService, sanitizeWhatsapp } from './clients.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ClientsService (US1)', () => {
  let service: ClientsService;
  let prismaMock: {
    client: {
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(() => {
    prismaMock = {
      client: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    service = new ClientsService(prismaMock as unknown as PrismaService);
  });

  it('deve sanitizar o WhatsApp mantendo apenas dígitos para links wa.me', () => {
    expect(sanitizeWhatsapp('+55 (11) 98765-4321')).toBe('5511987654321');
    expect(sanitizeWhatsapp('---')).toBeNull();
    expect(sanitizeWhatsapp(null)).toBeNull();
  });

  it('deve isolar a listagem de clientes pelo userId autenticado', async () => {
    prismaMock.client.findMany.mockResolvedValue([
      {
        id: 'c1',
        userId: 'u1',
        name: 'Cliente A',
        whatsapp: '(11) 99999-0000',
        email: 'a@teste.com',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { projects: 2 },
      },
    ]);
    prismaMock.client.count.mockResolvedValue(1);

    const res = await service.findAll('u1', { page: 1, limit: 10 });
    expect(prismaMock.client.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'u1' }),
      }),
    );
    expect(res.data[0].whatsappClean).toBe('11999990000');
    expect(res.data[0].projectsCount).toBe(2);
  });

  it('deve bloquear exclusão de cliente que possua projetos vinculados (409 Conflict)', async () => {
    prismaMock.client.findFirst.mockResolvedValue({
      id: 'c1',
      userId: 'u1',
      name: 'Cliente Com Histórico',
      _count: { projects: 3 },
    });

    await expect(service.remove('u1', 'c1')).rejects.toThrow(ConflictException);
    expect(prismaMock.client.delete).not.toHaveBeenCalled();
  });

  it('deve permitir exclusão de cliente sem projetos vinculados', async () => {
    prismaMock.client.findFirst.mockResolvedValue({
      id: 'c2',
      userId: 'u1',
      name: 'Cliente Novo',
      _count: { projects: 0 },
    });
    prismaMock.client.delete.mockResolvedValue({ id: 'c2' });

    const res = await service.remove('u1', 'c2');
    expect(res).toEqual({ deleted: true, id: 'c2' });
    expect(prismaMock.client.delete).toHaveBeenCalledWith({ where: { id: 'c2' } });
  });

  it('deve lançar 404 ao tentar acessar cliente de outro usuário', async () => {
    prismaMock.client.findFirst.mockResolvedValue(null);
    await expect(service.findOneWithHistory('u2', 'c1')).rejects.toThrow(
      NotFoundException,
    );
  });
});

