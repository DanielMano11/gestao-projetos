import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';

describe('JwtStrategy', () => {
  let prismaMock: {
    user: {
      findUnique: jest.Mock;
    };
  };

  beforeEach(() => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
      },
    };
  });

  it('deve falhar imediatamente no construtor se JWT_SECRET não estiver configurado (sem fallback)', () => {
    const previousSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;

    try {
      const configService = new ConfigService({});

      expect(
        () =>
          new JwtStrategy(configService, prismaMock as unknown as PrismaService),
      ).toThrow();
    } finally {
      if (previousSecret !== undefined) {
        process.env.JWT_SECRET = previousSecret;
      }
    }
  });

  it('deve inicializar com JWT_SECRET obtido estritamente via getOrThrow e validar usuário existente', async () => {
    const validSecret = 'chave-secreta-muito-forte-para-testes-jwt-1234';
    const configService = new ConfigService({ JWT_SECRET: validSecret });
    const getOrThrowSpy = jest.spyOn(configService, 'getOrThrow');

    const strategy = new JwtStrategy(
      configService,
      prismaMock as unknown as PrismaService,
    );

    expect(getOrThrowSpy).toHaveBeenCalledWith('JWT_SECRET');

    prismaMock.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'gestor@exemplo.com',
      name: 'Gestor',
    });

    const user = await strategy.validate({
      sub: 'u1',
      email: 'gestor@exemplo.com',
    });

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'u1' },
      select: { id: true, email: true, name: true },
    });
    expect(user).toEqual({
      id: 'u1',
      email: 'gestor@exemplo.com',
      name: 'Gestor',
    });
  });

  it('deve lançar UnauthorizedException se o usuário do token não existir no banco', async () => {
    const configService = new ConfigService({
      JWT_SECRET: 'chave-secreta-muito-forte-para-testes-jwt-1234',
    });
    const strategy = new JwtStrategy(
      configService,
      prismaMock as unknown as PrismaService,
    );

    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      strategy.validate({ sub: 'u-removido', email: 'naoexiste@exemplo.com' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});