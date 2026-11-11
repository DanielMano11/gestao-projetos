import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prismaMock: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };
  let jwtServiceMock: {
    signAsync: jest.Mock;
  };

  beforeEach(() => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };
    jwtServiceMock = {
      signAsync: jest.fn().mockResolvedValue('jwt.token.assinado'),
    };
    service = new AuthService(
      prismaMock as unknown as PrismaService,
      jwtServiceMock as unknown as JwtService,
    );
  });

  describe('register', () => {
    it('deve registrar usuário com senha hasheada, e-mail normalizado e retornar JWT sem passwordHash', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'u1',
        name: 'Daniel Mano',
        email: 'daniel@exemplo.com',
      });

      const result = await service.register({
        name: '  Daniel Mano  ',
        email: '  DANIEL@Exemplo.COM ',
        password: 'senhaForte123',
      });

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'daniel@exemplo.com' },
      });
      const createCall = prismaMock.user.create.mock.calls[0][0];
      expect(createCall.data.name).toBe('Daniel Mano');
      expect(createCall.data.email).toBe('daniel@exemplo.com');
      expect(createCall.data.passwordHash).not.toBe('senhaForte123');
      expect(
        await bcrypt.compare('senhaForte123', createCall.data.passwordHash),
      ).toBe(true);
      expect(createCall.select).toEqual({ id: true, name: true, email: true });
      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
        sub: 'u1',
        email: 'daniel@exemplo.com',
      });
      expect(result).toEqual({
        accessToken: 'jwt.token.assinado',
        user: { id: 'u1', name: 'Daniel Mano', email: 'daniel@exemplo.com' },
      });
    });

    it('deve lançar ConflictException quando o e-mail já estiver cadastrado', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'u-existente',
        email: 'daniel@exemplo.com',
      });

      await expect(
        service.register({
          name: 'Outro Usuário',
          email: 'daniel@exemplo.com',
          password: 'senhaForte123',
        }),
      ).rejects.toThrow(ConflictException);
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('deve autenticar credenciais válidas e retornar token JWT e usuário sem hash', async () => {
      const passwordHash = await bcrypt.hash('admin123', 10);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'u1',
        name: 'Gestor',
        email: 'gestor@exemplo.com',
        passwordHash,
      });

      const result = await service.login({
        email: '  GESTOR@exemplo.com  ',
        password: 'admin123',
      });

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'gestor@exemplo.com' },
      });
      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
        sub: 'u1',
        email: 'gestor@exemplo.com',
      });
      expect(result).toEqual({
        accessToken: 'jwt.token.assinado',
        user: { id: 'u1', name: 'Gestor', email: 'gestor@exemplo.com' },
      });
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('deve lançar UnauthorizedException quando o usuário não existe', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'inexistente@exemplo.com',
          password: 'qualquer-senha',
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
    });

    it('deve lançar UnauthorizedException quando a senha está incorreta', async () => {
      const passwordHash = await bcrypt.hash('senhaCorreta', 10);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'u1',
        name: 'Gestor',
        email: 'gestor@exemplo.com',
        passwordHash,
      });

      await expect(
        service.login({
          email: 'gestor@exemplo.com',
          password: 'senhaErrada',
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
    });
  });
});

