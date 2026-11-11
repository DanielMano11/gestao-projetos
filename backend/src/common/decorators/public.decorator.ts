import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marca explicitamente uma rota ou controller como público,
 * liberando o acesso sem autenticação JWT no JwtAuthGuard global.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

