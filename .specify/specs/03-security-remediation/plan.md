# Implementation Plan: Remediação de Vulnerabilidades e Endurecimento Avançado (Security Remediation)

**Branch**: `03-security-remediation` | **Date**: 2026-11-13 | **Spec**: [spec.md](./spec.md)

**Input**: Especificação em `.specify/specs/03-security-remediation/spec.md` e Constituição (`v1.1.0`) em `.specify/memory/constitution.md`.

## Summary

Plano técnico completo para remediar os 11 pontos identificados no Diagnóstico de Segurança do sistema, abrangendo backend (`backend/`) e frontend (`frontend/`):
1. Eliminação de credenciais padrão pré-preenchidas no login do frontend (`LoginPage.tsx`), endurecimento do script `prisma/seed.ts`, reforço de política de senhas e limite real de 72 bytes do `bcrypt` (`RegisterDto`, `LoginDto`), além de comparação dummy contra *timing attack* no `AuthService.login`.
2. Redução da validade padrão do JWT para `8h`, criação do ciclo centralizado `clearAuthSession()` (limpando `localStorage` + `queryClient.clear()`), proteção contra JSON corrompido em `Header.tsx`, redirecionamento automático em `401` em `api.ts` e validação estrutural/temporal do token em `ProtectedRoute`.
3. Eliminação de condições de corrida (*TOCTOU*) em `ProjectsService` (`addPayment`, `removePayment`, `updateStatus`, `update`, `updateFinancials`) movendo leituras e validações para dentro das transações `$transaction`, validação estrita `YYYY-MM-DD` e `startDate <= endDate` no `DashboardModule`, e teto de tarefas/posição em `TasksModule`.
4. Restrição do Swagger UI (`/api/docs`) fora de `production`, exigência de `https://` em `FRONTEND_URL` quando `NODE_ENV === 'production'`, suporte configurável a `TRUST_PROXY`, trilha de logs de auditoria para `401`/`403`/`429` no `AllExceptionsFilter`, meta tags de CSP/`Referrer-Policy` em `frontend/index.html` e higiene de dependências (`npm audit fix` + remoção de `zod` não utilizado no frontend).

## Technical Context

**Language/Version**: TypeScript 5.7 (`strict: true`) em `backend/` (Node.js LTS) e `frontend/` (React 18 + Vite 6)

**Primary Dependencies**:
- **Backend**: NestJS 10 (`@nestjs/core`, `@nestjs/common`, `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`, `@nestjs/throttler`, `@nestjs/swagger`), Prisma `5.22.0`, `bcrypt`, `helmet`, `zod`
- **Frontend**: `react`, `react-router-dom`, `@tanstack/react-query`, `axios`, `lucide-react` (removendo `zod` não utilizado em `frontend/package.json`)

**Storage**: PostgreSQL via Prisma ORM (sem necessidade de nova migration estrutural nesta entrega; controle transacional via `prisma.$transaction`)

**Testing**:
- **Backend Unitário**: Jest (`env.validation.spec.ts`, `auth.service.spec.ts`, `http-exception.filter.spec.ts`, `projects-financial.spec.ts`, `dashboard.service.spec.ts`, `tasks.service.spec.ts`)
- **Backend E2E**: Jest + Supertest (`auth-security.e2e-spec.ts` + E2Es de domínio)
- **Frontend**: Vitest + Testing Library (`frontend/tests/components.spec.tsx`)

**Constraints**:
- Zero breaking change na UX legítima ou nos contratos JSON públicos esperados pelo frontend
- Manter compatibilidade com desenvolvimento local (`http://localhost:5173`) enquanto endurece `NODE_ENV=production`
- Aderência estrita ao princípio YAGNI e às Diretrizes de Segurança e Hardening da Constituição `v1.1.0`

## Constitution Check

- ✅ **I. Arquitetura Modular e Separação de Responsabilidades**: Regras de segurança concentradas em DTOs, `env.validation.ts`, `app.setup.ts`, `AllExceptionsFilter`, `ProjectsService` e `services/queryClient.ts`.
- ✅ **II. Integridade Relacional e Acesso a Dados Seguro**: Leituras, validações financeiras e escritas encapsuladas dentro de `prisma.$transaction` em `ProjectsService`, prevenindo inconsistências sob concorrência.
- ✅ **III. Componentização, Tipagem Estrita e Estado Previsível**: Separação clara do singleton `queryClient` e `clearAuthSession()` com tipagem estrita sem uso de `any`.
- ✅ **IV. Contratos de API, Segurança e Controle de Acesso (NON-NEGOTIABLE)**: Eliminação de credenciais expostas no bundle frontend, fortalecimento de senha e tempo constante no login, validade de token reduzida, restrição de Swagger e HTTPS em produção.
- ✅ **V. Testes Automatizados e Observabilidade**: Adição de logs estruturados para eventos `401`/`403`/`429` sem credenciais, somada à cobertura unitária e E2E de todos os novos controles.

## Project Structure

### Documentation (this feature)

```text
.specify/
├── feature.json                                     # Atualizado para .specify/specs/03-security-remediation
└── specs/03-security-remediation/
    ├── spec.md                                      # Requisitos FR-001 a FR-012 e cenários US1-US4
    ├── plan.md                                      # Este plano técnico
    ├── tasks.md                                     # Checklist executável (Fases 1-6)
    └── checklists/
        └── requirements.md                          # Checklist de qualidade da especificação
```

### Source Code Affected

```text
backend/
├── .env.example                                     # JWT_EXPIRES_IN="8h" e TRUST_PROXY=false
├── package.json                                     # Dependências atualizadas via npm audit fix
├── prisma/
│   └── seed.ts                                      # Leitura de credenciais via env e bloqueio de senha fraca em produção
└── src/
    ├── main.ts                                      # Swagger condicional fora de NODE_ENV=production
    ├── app.setup.ts                                 # Configuração opcional de trust proxy (1 salto)
    ├── config/
    │   ├── env.validation.ts                        # Default JWT_EXPIRES_IN='8h', TRUST_PROXY boolean, HTTPS obrigatório em prod
    │   └── env.validation.spec.ts                   # Testes de produção HTTPS, TRUST_PROXY e default 8h
    ├── common/
    │   └── filters/
    │       ├── http-exception.filter.ts             # Log de auditoria (warn) para 401/403/429
    │       └── http-exception.filter.spec.ts        # Testes unitários do log de auditoria 401/403/429
    ├── auth/
    │   ├── dto/
    │   │   ├── register.dto.ts                      # Senha 8..72 chars + complexidade (maiúscula, minúscula, número)
    │   │   └── login.dto.ts                         # @MaxLength(72) alinhado ao bcrypt
    │   ├── auth.service.ts                          # Comparação dummy com bcrypt.compare quando usuário não existe
    │   └── auth.service.spec.ts                     # Teste garantindo chamada a bcrypt.compare em usuário inexistente
    ├── projects/
    │   ├── projects.service.ts                      # Leitura e validação financeira movidas para dentro de $transaction
    │   └── projects-financial.spec.ts               # Testes cobrindo validação transacional atômica
    ├── dashboard/
    │   ├── dto/dashboard-filter.dto.ts              # @Matches(/^\d{4}-\d{2}-\d{2}$/) em startDate e endDate
    │   ├── dashboard.service.ts                     # Validação de data inválida e startDate <= endDate (400)
    │   └── dashboard.service.spec.ts                # Testes de datas inválidas e intervalo invertido
    └── tasks/
        ├── dto/create-task.dto.ts                   # @Max(1000) em position
        ├── dto/update-task.dto.ts                   # @Max(1000) em position
        ├── tasks.service.ts                         # Limite MAX_TASKS_PER_PROJECT = 200
        └── tasks.service.spec.ts                    # Teste de limite máximo de tarefas por projeto

frontend/
├── index.html                                       # Meta Referrer-Policy e Content-Security-Policy
├── package.json                                     # Remoção de zod não utilizado + npm audit fix
├── src/
│   ├── App.tsx                                      # Importa queryClient singleton
│   ├── services/
│   │   ├── queryClient.ts                           # Instância QueryClient + clearAuthSession() + getStoredUser()
│   │   └── api.ts                                   # Interceptor 401 chamando clearAuthSession() e redirecionando
│   ├── components/layout/Header.tsx                 # Uso de getStoredUser() seguro e clearAuthSession() no logout
│   ├── routes/AppRoutes.tsx                         # ProtectedRoute validando formato/expiração do JWT
│   └── pages/LoginPage.tsx                          # Remoção de credenciais padrão pré-preenchidas
└── tests/
    └── components.spec.tsx                          # Testes de login sem credenciais hardcoded, logout seguro e ProtectedRoute
```

---

## Detalhamento Técnico das Mudanças

### 1. Credenciais, Seed Seguro, Política de Senha e Anti-Timing Attack (`FR-001`–`FR-004`)

1. **`frontend/src/pages/LoginPage.tsx`**:
   - Substituir `useState('gestor@exemplo.com')` e `useState('admin123')` por `useState('')`.
   - Limpar o token/sessão somente quando autenticado com sucesso ou redirecionado; não embutir nenhuma senha de exemplo em valores iniciais de estado.
2. **`backend/prisma/seed.ts`**:
   - Ler `SEED_USER_EMAIL` (default `'gestor@exemplo.com'` apenas fora de produção), `SEED_USER_NAME` (default `'Gestor Principal'`) e `SEED_USER_PASSWORD`.
   - Se `process.env.NODE_ENV === 'production'`, exigir `SEED_USER_EMAIL` e `SEED_USER_PASSWORD` (mínimo 8 caracteres), abortando com `throw new Error(...)` caso ausentes ou fracas. Em desenvolvimento local, fallback controlado apenas quando `NODE_ENV !== 'production'`.
3. **`backend/src/auth/dto/register.dto.ts` e `login.dto.ts`**:
   - Em `RegisterDto.password`: `@MinLength(8)`, `@MaxLength(72)` (alinhado ao limite de 72 bytes do `bcrypt`) e `@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, { message: 'A senha deve conter ao menos uma letra maiúscula, uma letra minúscula e um número.' })`.
   - Em `LoginDto.password`: atualizar `@MaxLength(128)` para `@MaxLength(72)`.
4. **`backend/src/auth/auth.service.ts`**:
   - Declarar constante `DUMMY_PASSWORD_HASH` com formato válido de hash `bcrypt` custo 10 (`$2b$10$...`).
   - Em `login(dto)`: se `!user`, executar `await bcrypt.compare(dto.password, DUMMY_PASSWORD_HASH)` antes de lançar `UnauthorizedException('Credenciais inválidas')`.

### 2. Sessão no Cliente, Expiração JWT e Isolamento de Cache (`FR-005`)

1. **`backend/src/config/env.validation.ts` e `backend/.env.example`**:
   - Alterar default de `JWT_EXPIRES_IN` de `'7d'` para `'8h'`.
2. **`frontend/src/services/queryClient.ts`** *(novo arquivo)* e **`frontend/src/App.tsx`**:
   - Centralizar `export const queryClient = new QueryClient(...)`, `TOKEN_STORAGE_KEY = 'gestao_projetos_token'` e `USER_STORAGE_KEY = 'gestao_projetos_user'`.
   - Exportar `clearAuthSession()`: remove ambas as chaves do `localStorage` e chama `queryClient.clear()`.
   - Exportar `getStoredUser()`: encapsula `JSON.parse` em `try/catch`; em caso de JSON inválido, remove a chave corrompida e retorna `null`.
   - Exportar `hasValidStoredToken()`: decodifica o payload Base64Url do JWT (3 partes separadas por `.`) com `try/catch`, verifica se `exp` (quando numérico) é maior que `Date.now() / 1000`; caso expirado ou malformado, executa `clearAuthSession()` e retorna `false`.
3. **`frontend/src/services/api.ts`**, **`Header.tsx`** e **`AppRoutes.tsx`**:
   - `api.ts`: no interceptor de resposta `401`, chamar `clearAuthSession()` e redirecionar para `/login` quando `window.location.pathname !== '/login'`.
   - `Header.tsx`: usar `getStoredUser()` para exibir o nome e `clearAuthSession()` em `handleLogout`.
   - `AppRoutes.tsx`: usar `hasValidStoredToken()` dentro de `ProtectedRoute`.

### 3. Transações Anti-TOCTOU, Validação Estrita de Datas e Limites (`FR-006`–`FR-008`)

1. **`backend/src/projects/projects.service.ts`**:
   - Refatorar `addPayment`, `removePayment`, `updateStatus`, `update` e `updateFinancials` para executar a consulta ao registro (`tx.project.findFirst` / `tx.payment.findFirst` com filtro de `userId`), o cálculo do próximo saldo e `validateFinancialAmounts(...)` **integralmente dentro do bloco `this.prisma.$transaction(async (tx) => { ... })`**.
   - Em `addPayment`, `removePayment` e `updateStatus`, usar `tx.$queryRaw` ou atualização condicional/leitura transacional isolada (`Prisma.TransactionIsolationLevel.Serializable` ou row lock `SELECT id FROM projects WHERE id = $1::uuid FOR UPDATE` dentro de `$transaction`) para garantir serialização estrita entre requisições concorrentes sobre o mesmo projeto.
2. **`backend/src/dashboard/dto/dashboard-filter.dto.ts` e `dashboard.service.ts`**:
   - Adicionar `@Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'A data deve estar no formato YYYY-MM-DD' })` em `startDate` e `endDate`.
   - Em `DashboardService.getSummary`, validar `!Number.isNaN(fromDate.getTime())` e `!Number.isNaN(toDate.getTime())` (lançando `BadRequestException` caso inválido) e rejeitar com `BadRequestException('A data inicial não pode ser posterior à data final.')` quando `fromDate && toDate && fromDate > toDate`.
3. **`backend/src/tasks/dto/*.ts` e `tasks.service.ts`**:
   - Adicionar `@Max(1000)` em `position` nos arquivos `create-task.dto.ts` e `update-task.dto.ts`.
   - Em `TasksService.create`, verificar `existingCount >= 200` (`MAX_TASKS_PER_PROJECT`) e lançar `BadRequestException` se excedido.

### 4. Infraestrutura em Produção, Logs de Auditoria e Higiene de Pacotes (`FR-009`–`FR-012`)

1. **`backend/src/main.ts`**:
   - Ler `nodeEnv = configService.get<string>('NODE_ENV')` antes de configurar o Swagger; somente chamar `SwaggerModule.setup('api/docs', app, document)` quando `nodeEnv !== 'production'`.
2. **`backend/src/config/env.validation.ts` e `backend/src/app.setup.ts`**:
   - Adicionar `TRUST_PROXY` em `envSchema` convertendo `'true'`/`true` em `boolean` (default `false`).
   - Adicionar `.superRefine` em `envSchema`: quando `data.NODE_ENV === 'production'`, verificar se toda URL em `parseAllowedOrigins(data.FRONTEND_URL)` inicia com `https://`.
   - Em `configureApp(app)`, caso `configService.get<boolean>('TRUST_PROXY') === true`, invocar `(app.getHttpAdapter().getInstance() as { set: (k: string, v: unknown) => void }).set('trust proxy', 1)`.
3. **`backend/src/common/filters/http-exception.filter.ts`**:
   - Além do bloco `status >= 500`, adicionar bloco específico para `status === HttpStatus.UNAUTHORIZED || status === HttpStatus.FORBIDDEN || status === HttpStatus.TOO_MANY_REQUESTS` emitindo `this.logger.warn(JSON.stringify({ event: 'SECURITY_DENIAL', method: request.method, path: request.url, statusCode: status, ip: request.ip }))` sem jamais registrar headers (`authorization`), cookies ou `request.body`.
4. **`frontend/index.html`**:
   - Adicionar `<meta name="referrer" content="strict-origin-when-cross-origin" />` e `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' http://localhost:3000 https:; base-uri 'self'; form-action 'self'; object-src 'none';" />`.
5. **Dependências (`backend/` e `frontend/`)**:
   - Remover `zod` de `frontend/package.json` via `npm uninstall zod` (não utilizado em `frontend/src`).
   - Executar `npm audit fix` (sem `--force`) em `backend/` e `frontend/`, validando as suítes após a atualização.

---

## Plano de Validação (Portões de Qualidade)

1. `backend/`: `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:e2e` e `npm audit --omit=dev`.
2. `frontend/`: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` e `npm audit --omit=dev`.
3. Conferir que o bundle gerado em `frontend/dist/` não contém a string da senha padrão `'admin123'`.

