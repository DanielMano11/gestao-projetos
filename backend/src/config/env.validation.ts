import { z } from 'zod';

/**
 * Converte a string configurada em `FRONTEND_URL` em uma lista normalizada
 * de origens permitidas para política restrita de CORS.
 */
export function parseAllowedOrigins(raw: string): string[] {
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0)
    .map((origin) => {
      try {
        return new URL(origin).origin;
      } catch {
        return origin;
      }
    });
}

function isValidHttpOrigin(raw: string): boolean {
  const entries = raw
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  if (entries.length === 0) {
    return false;
  }

  return entries.every((entry) => {
    if (entry.includes('*')) {
      return false;
    }

    try {
      const parsed = new URL(entry);
      const isHttp = parsed.protocol === 'http:' || parsed.protocol === 'https:';
      const hasOnlyOrigin =
        (parsed.pathname === '/' || parsed.pathname === '') &&
        parsed.search === '' &&
        parsed.hash === '';
      return isHttp && hasOnlyOrigin;
    } catch {
      return false;
    }
  });
}

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z
    .string()
    .trim()
    .min(1, 'DATABASE_URL é obrigatória')
    .refine(
      (value) =>
        value.startsWith('postgresql://') || value.startsWith('postgres://'),
      'DATABASE_URL deve utilizar o protocolo postgresql:// ou postgres://',
    ),
  JWT_SECRET: z
    .string()
    .trim()
    .min(32, 'JWT_SECRET deve possuir no mínimo 32 caracteres'),
  JWT_EXPIRES_IN: z.string().trim().min(1).default('7d'),
  FRONTEND_URL: z
    .string()
    .trim()
    .min(1, 'FRONTEND_URL é obrigatória')
    .refine(
      isValidHttpOrigin,
      'FRONTEND_URL deve conter uma ou mais URLs http(s) válidas separadas por vírgula e nunca wildcard (*)',
    ),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Valida variáveis críticas na inicialização (crash-on-boot).
 * Garante que nenhum valor sensível ausente ou fraco passe silenciosamente.
 */
export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join('; ');

    throw new Error(`Falha na validação de variáveis de ambiente: ${details}`);
  }

  return result.data;
}
