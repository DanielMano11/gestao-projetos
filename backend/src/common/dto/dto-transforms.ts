import { TransformFnParams } from 'class-transformer';

/** Limite máximo compatível com colunas PostgreSQL DECIMAL(12, 2). */
export const MAX_MONETARY_AMOUNT = 9_999_999_999.99;

/**
 * Remove espaços nas extremidades quando o valor de entrada é string.
 */
export function trimString({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

/**
 * Normaliza e-mails removendo espaços extras e convertendo para minúsculas.
 */
export function trimLowerCaseString({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

/**
 * Remove espaços das extremidades em listas de strings recebidas em DTOs.
 */
export function trimStringArray({ value }: TransformFnParams): unknown {
  if (!Array.isArray(value)) {
    return value;
  }
  return value.map((item) => (typeof item === 'string' ? item.trim() : item));
}