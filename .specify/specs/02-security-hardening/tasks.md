---

description: "Lista de tarefas executáveis para implementação do Endurecimento de Segurança e Proteção Operacional (02-security-hardening)"
---

# Tasks: Endurecimento de Segurança e Proteção Operacional (Security Hardening)

**Input**: Documentos de design em `.specify/specs/02-security-hardening/` (`spec.md`, `plan.md`) e `.specify/memory/constitution.md` (`v1.1.0`)

**Prerequisites**: `plan.md` (obrigatório), `spec.md` (requisitos `FR-001` a `FR-009` e `US1` a `US4`), `constitution.md` (`v1.1.0`)

**Tests**: Incluídos explicitamente conforme o item 6 do plano técnico e o Princípio V da Constituição (unitários de autenticação, validação de ambiente, filtro de exceções e suíte E2E real sem override de guard).

**Organization**: As tarefas estão organizadas nas 5 fases sequenciais de implementação de hardening definidas para a entrega.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Pode ser executada em paralelo (arquivos distintos, sem dependência bloqueante em aberto)
- **[Story]**: Rastreabilidade para User Stories (`[US1]` a `[US4]`) quando aplicável diretamente à funcionalidade
- Todos os itens referenciam os caminhos exatos em `backend/`

---

## Fase 1: Dependências (`helmet`, `@nestjs/throttler`, validação de env)

**Purpose**: Instalar os pacotes de segurança de perímetro e configurar a validação estrita de variáveis de ambiente (*crash-on-boot*) no módulo raiz da API.

- [X] T001 Instalar as dependências de produção `helmet`, `@nestjs/throttler` e `zod` em `backend/package.json`
- [X] T002 [US2] Implementar schema Zod de validação obrigatória de ambiente (`envSchema`, `validateEnv` e `parseAllowedOrigins`) exigindo `DATABASE_URL`, `JWT_SECRET` (>= 32 caracteres) e `FRONTEND_URL` (URLs explícitas sem wildcard `*`) em `backend/src/config/env.validation.ts`
- [X] T003 [US2] Integrar `ConfigModule.forRoot({ isGlobal: true, validate: validateEnv })` em `backend/src/app.module.ts`

**Checkpoint**: Aplicação valida variáveis obrigatórias via Zod logo na subida do `AppModule` e aborta imediatamente (*crash-on-boot*) caso haja omissão ou segredo fraco.

---

## Fase 2: Configuração de ambiente e remoção de segredos hardcoded

**Purpose**: Padronizar as variáveis obrigatórias nos arquivos de ambiente e eliminar qualquer valor *default* / *fallback* hardcoded no código de autenticação.

- [X] T004 [US2] [US4] Atualizar `backend/.env.example` com `FRONTEND_URL="http://localhost:5173"` e exemplo válido de `JWT_SECRET` (>= 32 caracteres), garantindo também que o `backend/.env` local possua `FRONTEND_URL` configurada para o ambiente de desenvolvimento
- [X] T005 [P] [US2] Remover o fallback `'chave-secreta-desenvolvimento'` de `JwtModule.registerAsync` usando `config.getOrThrow<string>('JWT_SECRET')` e `config.getOrThrow<string>('JWT_EXPIRES_IN')` em `backend/src/auth/auth.module.ts`
- [X] T006 [P] [US2] Remover o fallback `'chave-secreta-desenvolvimento'` de `JwtStrategy` usando `configService.getOrThrow<string>('JWT_SECRET')` em `backend/src/auth/jwt.strategy.ts`

**Checkpoint**: Zero segredos ou valores substitutos hardcoded no código-fonte; `AuthModule` e `JwtStrategy` dependem exclusivamente de configuração validada no ambiente.

---

## Fase 3: Camada global de proteção (`helmet`, CORS, rate limiter, filter de exceção)

**Purpose**: Endurecer a borda HTTP contra ataques entre sites, sniffing de conteúdo, força bruta e vazamento de informações internas de banco de dados/infraestrutura.

- [X] T007 [US4] Criar `configureApp(app)` em `backend/src/app.setup.ts` aplicando `helmet()`, `enableCors` restrito às origens parseadas de `FRONTEND_URL`, prefixo global `api/v1`, `ValidationPipe`, `AllExceptionsFilter` e `LoggingInterceptor`, atualizando `backend/src/main.ts` para invocá-la
- [X] T008 [US1] Configurar `ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 60 }])` e registrar `ThrottlerGuard` como `APP_GUARD` em `backend/src/app.module.ts`, aplicando `@Throttle({ default: { limit: 5, ttl: 60_000 } })` nos endpoints `register` e `login` em `backend/src/auth/auth.controller.ts`
- [X] T009 [US3] Refatorar `AllExceptionsFilter` em `backend/src/common/filters/http-exception.filter.ts` para tratar `Prisma.PrismaClientKnownRequestError` (`P2002` → `409 Conflict`, `P2003` → `409 Conflict`, `P2025` → `404 Not Found`) sem vazar metadados/tabelas e mascarar erros internos `500` e exceções Prisma genéricas com `'Erro interno no servidor'`

**Checkpoint**: Headers defensivos ativos, CORS bloqueando origens externas não listadas, rate limit bloqueando força bruta com `429` e erros internos `500`/Prisma sanitizados.

---

## Fase 4: Guards globais e DTOs reforçados

**Purpose**: Adotar proteção *secure-by-default* em toda a API com `APP_GUARD` e reforçar sanitização e limites de payload nos DTOs de entrada.

- [X] T010 [P] [US2] Criar constante `IS_PUBLIC_KEY` e decorator `@Public()` em `backend/src/common/decorators/public.decorator.ts`
- [X] T011 [US2] Atualizar `JwtAuthGuard` em `backend/src/common/guards/jwt-auth.guard.ts` para injetar `Reflector` e liberar rotas com `@Public()` antes de delegar para `super.canActivate(context)` (depende de T010)
- [X] T012 [US2] Registrar `{ provide: APP_GUARD, useClass: JwtAuthGuard }` após `ThrottlerGuard` em `backend/src/app.module.ts` (depende de T008 e T011)
- [X] T013 [US2] Adicionar `@Public()` em `register` e `login` em `backend/src/auth/auth.controller.ts` e remover `@UseGuards(JwtAuthGuard)` redundante de `auth.controller.ts`, `clients.controller.ts`, `projects.controller.ts`, `tasks.controller.ts` e `dashboard.controller.ts` (depende de T012)
- [X] T014 [P] [US1] [US2] Reforçar sanitização (`@Transform` com `.trim()`) e limites de tamanho/segurança (`@MaxLength`, `@IsNotEmpty` pós-trim, `@ArrayMaxSize`) nos DTOs em `backend/src/auth/dto/`, `backend/src/clients/dto/`, `backend/src/projects/dto/` e `backend/src/common/dto/pagination-query.dto.ts`

**Checkpoint**: Todo endpoint nasce autenticado por padrão via `APP_GUARD`, apenas `login` e `register` são públicos via `@Public()`, e DTOs rejeitam payloads desproporcionais ou strings em branco.

---

## Fase 5: Testes unitários de autenticação e E2E reais

**Purpose**: Comprovar todas as regras de hardening via testes automatizados unitários e bateria E2E real com `AppModule` completo sem override do `JwtAuthGuard`.

- [X] T015 [P] [US2] Criar testes unitários da validação de ambiente (*crash-on-boot*) em `backend/src/config/env.validation.spec.ts`
- [X] T016 [P] [US1] [US2] Criar testes unitários de `AuthService` (`register` e `login`) em `backend/src/auth/auth.service.spec.ts` e de `JwtStrategy` (exigência de `JWT_SECRET` sem fallback e `validate`) em `backend/src/auth/jwt.strategy.spec.ts`
- [X] T017 [P] [US3] Criar testes unitários do `AllExceptionsFilter` (`P2002` → `409 Conflict`, mascaramento de erros `500`/Prisma e preservação de erros `4xx`) em `backend/src/common/filters/http-exception.filter.spec.ts`
- [X] T018 [P] [US2] Atualizar os harnesses isolados em `backend/test/clients.e2e-spec.ts`, `backend/test/projects.e2e-spec.ts` e `backend/test/dashboard.e2e-spec.ts` para prover `APP_GUARD` no escopo dos testes unitários de controller após remoção de `@UseGuards(JwtAuthGuard)`
- [X] T019 [US1] [US2] [US3] [US4] Criar suíte E2E real em `backend/test/auth-security.e2e-spec.ts` bootando `AppModule` + `configureApp(app)` **sem `.overrideGuard`**, cobrindo `401` global, ciclo `register` → `login` → `me` → rotas protegidas, headers `helmet`, CORS restrito por `FRONTEND_URL`, sanitização `500`/`P2002` e bloqueio `429` em força bruta (depende de T007–T014)
- [X] T020 Executar portões de qualidade em `backend/` (`npm run typecheck`, `npm run lint`, `npm test`, `npm run test:e2e`) e validar comportamento real de *crash-on-boot* com ambiente inválido (depende de T015–T019)

---

## Dependencies & Execution Order

- **Fase 1** (`T001`–`T003`) → pré-requisito para **Fase 2** (`T004`–`T006`).
- **Fase 2** (`T004`–`T006`) → pré-requisito para **Fase 3** (`T007`–`T009`) e **Fase 4** (`T010`–`T014`).
- **Fase 3** e **Fase 4** convergem para **Fase 5** (`T015`–`T020`); os testes unitários (`T015`–`T017`) podem ser escritos em paralelo assim que os respectivos arquivos-alvo existirem, enquanto `T019` e `T020` encerram a entrega após todas as mudanças integradas.