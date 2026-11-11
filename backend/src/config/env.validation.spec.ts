import { parseAllowedOrigins, validateEnv } from './env.validation';

describe('env.validation (Crash-on-Boot)', () => {
  const validEnv = {
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/gestao_projetos',
    JWT_SECRET: 'segredo-super-forte-com-pelo-menos-32-caracteres',
    FRONTEND_URL: 'http://localhost:5173',
  };

  it('deve validar ambiente completo e aplicar defaults seguros não sensíveis', () => {
    const parsed = validateEnv(validEnv);

    expect(parsed.DATABASE_URL).toBe(validEnv.DATABASE_URL);
    expect(parsed.JWT_SECRET).toBe(validEnv.JWT_SECRET);
    expect(parsed.FRONTEND_URL).toBe(validEnv.FRONTEND_URL);
    expect(parsed.PORT).toBe(3000);
    expect(parsed.JWT_EXPIRES_IN).toBe('7d');
    expect(parsed.NODE_ENV).toBe('development');
  });

  it('deve falhar na partida se JWT_SECRET estiver ausente, vazio ou menor que 32 caracteres', () => {
    expect(() =>
      validateEnv({
        DATABASE_URL: validEnv.DATABASE_URL,
        FRONTEND_URL: validEnv.FRONTEND_URL,
      }),
    ).toThrow(/JWT_SECRET/);

    expect(() =>
      validateEnv({
        ...validEnv,
        JWT_SECRET: '   '.repeat(12),
      }),
    ).toThrow(/JWT_SECRET/);

    expect(() =>
      validateEnv({
        ...validEnv,
        JWT_SECRET: 'x'.repeat(31),
      }),
    ).toThrow(/32 caracteres/);
  });

  it('deve aceitar JWT_SECRET exatamente com 32 caracteres', () => {
    const parsed = validateEnv({
      ...validEnv,
      JWT_SECRET: 'a'.repeat(32),
    });

    expect(parsed.JWT_SECRET).toHaveLength(32);
  });

  it('deve falhar na partida se DATABASE_URL estiver ausente ou com protocolo inválido', () => {
    expect(() =>
      validateEnv({
        JWT_SECRET: validEnv.JWT_SECRET,
        FRONTEND_URL: validEnv.FRONTEND_URL,
      }),
    ).toThrow(/DATABASE_URL/);

    expect(() =>
      validateEnv({
        ...validEnv,
        DATABASE_URL: 'mysql://localhost:3306/db',
      }),
    ).toThrow(/postgresql/);
  });

  it('deve falhar se FRONTEND_URL estiver ausente, contiver wildcard (*) ou URL inválida', () => {
    expect(() =>
      validateEnv({
        DATABASE_URL: validEnv.DATABASE_URL,
        JWT_SECRET: validEnv.JWT_SECRET,
      }),
    ).toThrow(/FRONTEND_URL/);

    expect(() =>
      validateEnv({
        ...validEnv,
        FRONTEND_URL: '*',
      }),
    ).toThrow(/FRONTEND_URL/);

    expect(() =>
      validateEnv({
        ...validEnv,
        FRONTEND_URL: 'https://*.exemplo.com',
      }),
    ).toThrow(/FRONTEND_URL/);

    expect(() =>
      validateEnv({
        ...validEnv,
        FRONTEND_URL: 'http://localhost:5173/caminho-invalido',
      }),
    ).toThrow(/FRONTEND_URL/);
  });

  it('deve normalizar múltiplas origens confiáveis separadas por vírgula', () => {
    const origins = parseAllowedOrigins(
      'http://localhost:5173/, https://app.gestao.com.br ',
    );

    expect(origins).toEqual([
      'http://localhost:5173',
      'https://app.gestao.com.br',
    ]);
  });
});

