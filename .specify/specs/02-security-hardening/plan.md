# Implementation Plan: Endurecimento de Segurança e Proteção Operacional (Security Hardening)

**Branch**: `02-security-hardening` | **Date**: 2026-11-11 | **Spec**: [spec.md](./spec.md)

**Input**: Especificação funcional em `.specify/specs/02-security-hardening/spec.md` e diretrizes arquiteturais da Constituição (`v1.1.0`) em `.specify/memory/constitution.md`.

## Summary

Implementação do endurecimento de segurança (*security hardening*) no backend NestJS do Sistema de Gestão de Projetos para atender integralmente às **Diretrizes de Segurança e Hardening (NON-NEGOTIABLE)** da Constituição `v1.1.0` e aos requisitos `FR-001` a `FR-009` da especificação `02-security-hardening`. O plano contempla: (1) validação estrita de variáveis de ambiente na partida (*crash-on-boot*) com Zod via `ConfigModule.forRoot({ validate })`, exigindo `JWT_SECRET` com mínimo de 32 caracteres e eliminando fallbacks em `AuthModule` e `JwtStrategy`; (2) aplicação de cabeçalhos defensivos com `helmet` e CORS restrito por `FRONTEND_URL` em `main.ts`; (3) proteção contra abuso e força bruta com `@nestjs/throttler` em `/auth/login` e `/auth/register`; (4) conversão de `JwtAuthGuard` em `APP_GUARD` global com opt-out explícito via `@Public()`; (5) refatoração do `AllExceptionsFilter` para mapear erros conhecidos do Prisma (`P2002` → `409 Conflict`) e mascarar erros internos `500`; e (6) cobertura de testes unitários (`AuthService`, `JwtStrategy`, validação de env e filtro de exceções) e suíte E2E real sem override do `JwtAuthGuard`.

## Technical Context

**Language/Version**: TypeScript 5.7 (`strict: true`) sobre Node.js 20+ LTS (`backend/`)

**Primary Dependencies**:
- **Existentes no Backend**: `@nestjs/core`, `@nestjs/common`, `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`, `@nestjs/swagger`, `@prisma/client` (`5.22.0`), `passport-jwt`, `bcrypt`, `class-validator`, `class-transformer`
- **Novas Dependências de Segurança (Backend)**:
  - `zod` — validação de schema do ambiente na inicialização (`ConfigModule.forRoot({ validate })`)
  - `helmet` — middleware de cabeçalhos defensivos HTTP
  - `@nestjs/throttler` — limitação de taxa (*rate limiting*) global e por endpoint

**Storage**: PostgreSQL gerenciado via Prisma ORM (`schema.prisma` sem alterações estruturais nesta feature)

**Testing**:
- **Unitário**: Jest (`backend/src/**/*.spec.ts`) para `env.validation`, `AuthService`, `JwtStrategy` e `AllExceptionsFilter`
- **Integração / E2E Real**: Jest + Supertest (`backend/test/auth-security.e2e-spec.ts`) inicializando `AppModule` real sem `.overrideGuard(JwtAuthGuard)`

**Target Platform**: API REST NestJS sobre Node.js / Express (`backend/`)

**Project Type**: Web application (`backend/` + `frontend/` — alterações focadas exclusivamente em `backend/`)

**Performance Goals**: Zero degradação perceptível nas rotas autenticadas (throttler baseline generoso para fluxos autenticados; rejeição antecipada `429` em força bruta antes de hashing `bcrypt` ou consulta ao banco)

**Constraints**:
- Proibição absoluta de valores *default* / *fallback* para `JWT_SECRET`, `DATABASE_URL` e `FRONTEND_URL`
- Nenhuma quebra no comportamento de erro funcional `4xx` consumido pelo frontend (`ValidationPipe`, `401`, `409`)
- Nenhuma mensagem de infraestrutura ou metadado Prisma exposto em respostas HTTP `500`

**Scale/Scope**: Hardening transversal sobre os módulos existentes (`AppModule`, `AuthModule`, `ClientsController`, `ProjectsController`, `TasksController`, `DashboardController`, camada `common/` e suítes de teste em `backend/`)

## Constitution Check

*GATE: Verificação de conformidade com `.specify/memory/constitution.md` (`v1.1.0`) antes e após o desenho técnico.*

- ✅ **I. Arquitetura Modular e Separação de Responsabilidades (NestJS)**: Configurações de ambiente isoladas em `src/config/env.validation.ts`; decorator `@Public()` e guard global em `src/common/`; controllers permanecem restritos ao transporte HTTP sem duplicação de `@UseGuards(JwtAuthGuard)`.
- ✅ **II. Integridade Relacional e Acesso a Dados Seguro (Prisma & PostgreSQL)**: Nenhuma alteração estrutural necessária em `schema.prisma`; erros de integridade do Prisma capturados de forma centralizada no `AllExceptionsFilter` sem expor nomes de tabelas, colunas ou constraints.
- ✅ **III. Componentização, Tipagem Estrita e Estado Previsível (Vite & React)**: Nenhuma quebra de contrato JSON com o frontend (`frontend/src/services/api.ts` continua recebendo `{ accessToken, user }` e tratando `401`; cabeçalhos CORS autorizam exatamente a origem configurada em `FRONTEND_URL`).
- ✅ **IV. Contratos de API, Segurança e Controle de Acesso (NON-NEGOTIABLE)** + **Diretrizes de Segurança e Hardening**:
  - **Regra 1 (Crash-on-Boot)**: Atendida via `ConfigModule.forRoot({ isGlobal: true, validate })` com Zod exigindo `JWT_SECRET` (mínimo 32 caracteres), `DATABASE_URL` e `FRONTEND_URL`, além do uso exclusivo de `configService.getOrThrow(...)` em `AuthModule` e `JwtStrategy`.
  - **Regra 2 (`APP_GUARD` + `@Public()`)**: Atendida via registro global de `JwtAuthGuard` em `AppModule` e uso de `@Public()` apenas em `POST /auth/login` e `POST /auth/register`.
  - **Regra 3 (`helmet`, CORS restrito, `@nestjs/throttler`)**: Atendida via `app.use(helmet())`, `app.enableCors` restrito a `FRONTEND_URL` e `@Throttle` estrito (`5 req / 60s`) em login e registro.
  - **Regra 4 (Sanitização de `500` e Prisma)**: Atendida na refatoração do `AllExceptionsFilter`.
- ✅ **V. Testes Automatizados e Observabilidade**: Adição de testes unitários para validação de env, `AuthService`, `JwtStrategy` e `AllExceptionsFilter`, além de suíte E2E real sem override de guard; `LoggingInterceptor` e `AllExceptionsFilter` mantêm logs estruturados sem expor senhas ou tokens.

## Project Structure

### Documentation (this feature)

```text
.specify/
├── memory/
│   └── constitution.md                          # Constituição v1.1.0 (base normativa)
└── specs/02-security-hardening/
    ├── spec.md                                  # Requisitos e cenários de aceite de segurança
    ├── plan.md                                  # Este plano técnico
    ├── tasks.md                                 # A ser gerado via /speckit.tasks
    └── checklists/
        └── requirements.md                      # Checklist de qualidade da especificação
```

### Source Code Affected (`backend/`)

```text
backend/
├── .env.example                                 # Atualizado com FRONTEND_URL e JWT_SECRET >= 32 chars
├── package.json                                 # Adição de helmet, @nestjs/throttler, zod
├── src/
│   ├── main.ts                                  # Chama setupApp(app) + listen(PORT)
│   ├── app.setup.ts                             # Helper reutilizável: helmet, CORS(FRONTEND_URL), prefixo, pipes, filters, interceptors
│   ├── app.module.ts                            # ConfigModule(validate), ThrottlerModule, APP_GUARD (ThrottlerGuard + JwtAuthGuard)
│   ├── config/
│   │   ├── env.validation.ts                    # Schema Zod + função validateEnv (crash-on-boot)
│   │   └── env.validation.spec.ts               # Testes unitários de validação de variáveis críticas
│   ├── common/
│   │   ├── decorators/
│   │   │   └── public.decorator.ts              # IS_PUBLIC_KEY + @Public()
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts                # Inspeção de @Public() via Reflector antes de super.canActivate()
│   │   └── filters/
│   │       ├── http-exception.filter.ts         # Tratamento de PrismaClientKnownRequestError e ocultação de erros 500
│   │       └── http-exception.filter.spec.ts    # Testes unitários de sanitização de erros e mapeamento P2002
│   ├── auth/
│   │   ├── auth.module.ts                       # JwtModule.registerAsync usando getOrThrow('JWT_SECRET') sem fallback
│   │   ├── jwt.strategy.ts                      # secretOrKey via getOrThrow('JWT_SECRET') sem fallback
│   │   ├── auth.controller.ts                   # @Public() + @Throttle estrito em register/login; remoção de @UseGuards em me()
│   │   ├── auth.service.spec.ts                 # Testes unitários de register e login
│   │   └── jwt.strategy.spec.ts                 # Testes unitários de carregamento de segredo e validate()
│   ├── clients/
│   │   └── clients.controller.ts                # Remoção de @UseGuards(JwtAuthGuard) redundante (coberto pelo APP_GUARD)
│   ├── projects/
│   │   └── projects.controller.ts               # Remoção de @UseGuards(JwtAuthGuard) redundante (coberto pelo APP_GUARD)
│   ├── tasks/
│   │   └── tasks.controller.ts                  # Remoção de @UseGuards(JwtAuthGuard) redundante (coberto pelo APP_GUARD)
│   └── dashboard/
│       └── dashboard.controller.ts              # Remoção de @UseGuards(JwtAuthGuard) redundante (coberto pelo APP_GUARD)
└── test/
    ├── auth-security.e2e-spec.ts                # Nova suíte E2E real (AppModule completo, zero guard overrides)
    ├── clients.e2e-spec.ts                      # Ajuste de harness isolado para mockar APP_GUARD após remoção de @UseGuards local
    ├── projects.e2e-spec.ts                     # Ajuste de harness isolado para mockar APP_GUARD após remoção de @UseGuards local
    └── dashboard.e2e-spec.ts                    # Ajuste de harness isolado para mockar APP_GUARD após remoção de @UseGuards local
```

**Structure Decision**: Toda a configuração de segurança de borda (`helmet`, `enableCors`, `ValidationPipe`, `AllExceptionsFilter`, `LoggingInterceptor`) será encapsulada em uma função pura compartilhada (`configureApp(app)` em `backend/src/app.setup.ts`) invocada tanto por `main.ts` quanto por `test/auth-security.e2e-spec.ts`, garantindo que os testes E2E validem exatamente o mesmo pipeline HTTP da aplicação em produção, sem divergência de configuração.

---

## Detalhamento Técnico das Mudanças

### 1. Validação de Ambiente (*Crash-on-Boot*) e Eliminação de Fallbacks (`FR-002`, `FR-003`)

#### 1.1 Schema de Validação com Zod (`backend/src/config/env.validation.ts`)
- **Decisão técnica**: Utilizar **Zod** em conjunto com o hook `validate` de `ConfigModule.forRoot({ isGlobal: true, validate: validateEnv })`.
  - *Justificativa*: A Constituição `v1.1.0` especifica explicitamente `ConfigModule.forRoot({ validate })`, e o Zod permite tipagem inferida em TypeScript além de já compor a stack padrão do projeto (em uso no `frontend/`), evitando introduzir `joi` como segunda biblioteca de schema no repositório.
- **Regras do Schema (`envSchema`)**:
  - `DATABASE_URL`: `z.string().trim().min(1)` com `.refine(...)` exigindo prefixo `postgresql://` ou `postgres://`. **Sem valor default**.
  - `JWT_SECRET`: `z.string().trim().min(32, 'JWT_SECRET deve possuir no mínimo 32 caracteres')`, rejeitando strings vazias ou compostas apenas de espaços. **Sem valor default**.
  - `FRONTEND_URL`: `z.string().trim().min(1)` validando que o valor não contém `'*'` e que cada item separado por vírgula é uma URL válida com protocolo `http:` ou `https:`. Concretiza a diretriz de configuração de origem confiável definida em `FR-002` e `FR-008` da especificação (`CORS_ORIGIN` / `FRONTEND_URL`). **Sem valor default**.
  - `JWT_EXPIRES_IN`: `z.string().trim().min(1).default('7d')` (duração operacional de token, não constitui segredo).
  - `PORT`: `z.coerce.number().int().min(1).max(65535).default(3000)`.
  - `NODE_ENV`: `z.enum(['development', 'test', 'production']).default('development')`.
- **Comportamento de falha (*Crash-on-Boot*)**: Se `envSchema.safeParse(config)` retornar `success === false`, `validateEnv` formata as chaves inválidas (sem imprimir o conteúdo de segredos parciais nos logs) e lança `new Error(...)`, abortando a inicialização do NestJS antes de abrir a porta HTTP ou conectar clientes.

#### 1.2 Remoção de Fallbacks em `AuthModule` e `JwtStrategy`
- **`backend/src/auth/auth.module.ts`**: Alterar `JwtModule.registerAsync` para usar `secret: config.getOrThrow<string>('JWT_SECRET')` e `expiresIn: config.getOrThrow<string>('JWT_EXPIRES_IN')`, removendo o literal `'chave-secreta-desenvolvimento'`.
- **`backend/src/auth/jwt.strategy.ts`**: Alterar o `super({ ... })` do `PassportStrategy` para usar `secretOrKey: configService.getOrThrow<string>('JWT_SECRET')`, removendo o fallback `'chave-secreta-desenvolvimento'`. Caso a estratégia seja instanciada fora do contexto do `AppModule` (ex.: testes unitários) sem `JWT_SECRET`, o `getOrThrow` falhará imediatamente por contrato.
- **`backend/.env.example`**: Atualizar para incluir `FRONTEND_URL="http://localhost:5173"` e exemplo explícito de `JWT_SECRET` com >= 32 caracteres.

---

### 2. Cabeçalhos Defensivos (`helmet`) e CORS Restrito com `FRONTEND_URL` (`FR-008`, `FR-009`)

#### 2.1 Instalação e Setup
- Instalar o pacote `helmet` nas dependências de produção de `backend/package.json`.
- Em `backend/src/app.setup.ts` (invocado por `backend/src/main.ts` após `NestFactory.create(AppModule)`):
  1. **Helmet**: Executar `app.use(helmet())` logo na inicialização do pipeline HTTP.
     - Garante cabeçalhos padrão defensivos em todas as respostas (sucesso, `401`, `404`, `429` e `500`), incluindo:
       - `X-Content-Type-Options: nosniff` (anti *MIME sniffing*);
       - `X-Frame-Options: SAMEORIGIN` e diretiva CSP `frame-ancestors 'self'` (anti *clickjacking*);
       - Remoção de `X-Powered-By` (ocultação de assinatura Express/servidor);
       - `Referrer-Policy` e `X-DNS-Prefetch-Control`.
     - Verificar compatibilidade do `/api/docs` (Swagger UI) com o CSP padrão do Helmet durante o bootstrap; manter configuração padrão restritiva ou ajustar apenas se estritamente necessário no endpoint de docs.
  2. **CORS Restrito**:
     - Ler `const frontendUrl = configService.getOrThrow<string>('FRONTEND_URL')`.
     - Converter para lista explícita de origens autorizadas: `const allowedOrigins = frontendUrl.split(',').map((origin) => origin.trim()).filter(Boolean)`.
     - Chamar `app.enableCors({ origin: allowedOrigins, methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'], credentials: true })`.
     - Quando uma requisição do navegador enviar um cabeçalho `Origin` não contido em `allowedOrigins`, a camada CORS omitirá `Access-Control-Allow-Origin` na resposta (inclusive em preflight `OPTIONS`), bloqueando a leitura pelo navegador sem recorrer a wildcard `'*'`.

---

### 3. Rate Limiting com `@nestjs/throttler` (`FR-001`)

#### 3.1 Instalação e Configuração Global
- Instalar `@nestjs/throttler` em `backend/package.json` (nota de compatibilidade: no `@nestjs/throttler` v5/v6 para NestJS 10, `ttl` é expresso em **milissegundos**).
- Em `backend/src/app.module.ts`, importar `ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 60 }])`.
  - Esse limite global baseline (`60` requisições por `60.000 ms` por IP) impede enumeração e abuso automatizado em toda a API sem prejudicar fluxos legítimos de navegação no dashboard, projetos ou checklists.
- Registrar `ThrottlerGuard` como `APP_GUARD` em `AppModule`.

#### 3.2 Limites Estritos em Autenticação (`backend/src/auth/auth.controller.ts`)
- Aplicar `@Throttle({ default: { limit: 5, ttl: 60_000 } })` explicitamente sobre os endpoints públicos:
  - `@Post('register')` — máximo de 5 tentativas por IP a cada 60 segundos;
  - `@Post('login')` — máximo de 5 tentativas por IP a cada 60 segundos.
- Ao ultrapassar o limite na janela configurada, o `ThrottlerGuard` interrompe o ciclo antes da execução de `AuthController`/`AuthService` e lança `ThrottlerException`, resultando em resposta HTTP `429 Too Many Requests` formatada pelo filtro global.

---

### 4. Autenticação Global por Padrão (`APP_GUARD`) e Decorator `@Public()` (`FR-004`, `FR-005`)

#### 4.1 Decorator `@Public()` (`backend/src/common/decorators/public.decorator.ts`)
- Definir a chave de metadado constante `export const IS_PUBLIC_KEY = 'isPublic';` e o decorator `export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);`.

#### 4.2 Atualização do `JwtAuthGuard` (`backend/src/common/guards/jwt-auth.guard.ts`)
- Injetar `private readonly reflector: Reflector` (`@nestjs/core`) no construtor mantendo `super()`.
- Sobrescrever `canActivate(context: ExecutionContext)`:
  - Consultar `this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])`;
  - Se `isPublic === true`, retornar `true` imediatamente (bypass de JWT apenas para rotas explicitamente marcadas);
  - Caso contrário, retornar `super.canActivate(context)` para exigir Bearer JWT válido via `JwtStrategy`.

#### 4.3 Ordem de Registro dos `APP_GUARD` em `AppModule`
- Registrar os guards globais em `AppModule.providers` na seguinte ordem explícita:
  1. `{ provide: APP_GUARD, useClass: ThrottlerGuard }`
  2. `{ provide: APP_GUARD, useClass: JwtAuthGuard }`
- *Justificativa da ordem*: Executar `ThrottlerGuard` antes de `JwtAuthGuard` assegura que rajadas abusivas contra endpoints protegidos ou públicos sejam contidas em memória (`429`) antes que o Passport decodifique tokens ou consulte o banco em `JwtStrategy.validate`.

#### 4.4 Refatoração dos Controllers e Compatibilidade com Testes Existentes
- `backend/src/auth/auth.controller.ts`:
  - Decorar `@Post('register')` e `@Post('login')` com `@Public()` e `@Throttle(...)`.
  - Remover `@UseGuards(JwtAuthGuard)` explícito de `@Get('me')`, mantendo `@ApiBearerAuth()` para o Swagger (a rota passa a ser protegida automaticamente pelo `APP_GUARD` global).
- `ClientsController`, `ProjectsController`, `TasksController`, `DashboardController`:
  - Remover `@UseGuards(JwtAuthGuard)` no nível de classe, mantendo `@ApiBearerAuth()`, consolidando a política *secure-by-default* via `APP_GUARD` (evitando risco de esquecimento em futuros controllers).
- **Impacto nos E2E legados (`clients.e2e-spec.ts`, `projects.e2e-spec.ts`, `dashboard.e2e-spec.ts`)**:
  - Como essas três suítes compilam controllers individuais isolados (sem importar `AppModule`) e usavam `.overrideGuard(JwtAuthGuard)` para injetar `req.user`, a remoção de `@UseGuards(JwtAuthGuard)` nos controllers exige ajustar esses três arquivos de teste para registrar `{ provide: APP_GUARD, useValue: mockGuard }` no módulo de teste isolado, mantendo a bateria legada funcionando em paralelo à nova suíte E2E real.

---

### 5. Refatoração do `AllExceptionsFilter` para Prisma e Mascaramento de Erros `500` (`FR-006`, `FR-007`)

#### 5.1 Correção de Vazamento Atual
- No código atual (`backend/src/common/filters/http-exception.filter.ts`, linhas 33-35), qualquer `Error` que não seja `HttpException` cai no fallback `exception instanceof Error ? exception.message`, expondo mensagens internas do Node/Prisma/PostgreSQL para o cliente. Esse caminho será completamente removido.

#### 5.2 Regras de Mapeamento e Sanitização do Filtro
O método `catch(exception: unknown, host: ArgumentsHost)` passará a avaliar a exceção em ordem determinística:

1. **`Prisma.PrismaClientKnownRequestError`**:
   - **`P2002`** (*Unique constraint failed*): Responder com `status = 409 (HttpStatus.CONFLICT)` e mensagem segura neutra: `'Conflito: já existe um registro com os dados informados.'` (sem expor `exception.meta?.target`, nome de constraint ou tabela).
   - **`P2003`** (*Foreign key constraint failed*): Responder com `status = 409 (HttpStatus.CONFLICT)` e mensagem segura: `'Operação bloqueada por vínculo com registros relacionados.'`.
   - **`P2025`** (*Record not found*): Responder com `status = 404 (HttpStatus.NOT_FOUND)` e mensagem segura: `'Registro solicitado não encontrado.'`.
   - **Demais códigos `P2xxx` não mapeados**: Responder com `status = 500 (HttpStatus.INTERNAL_SERVER_ERROR)` e mensagem `'Erro interno no servidor'`.

2. **Demais Erros do Prisma** (`Prisma.PrismaClientValidationError`, `Prisma.PrismaClientInitializationError`, `Prisma.PrismaClientRustPanicError`, `Prisma.PrismaClientUnknownRequestError`):
   - Responder sempre com `status = 500` e mensagem `'Erro interno no servidor'`.

3. **`HttpException` (erros HTTP explícitos do NestJS / `ValidationPipe` / `ThrottlerException`)**:
   - Se `exception.getStatus() >= 500`: mascarar mensagem como `'Erro interno no servidor'` (impedindo vazamento mesmo se uma camada interna lançar `InternalServerErrorException` com detalhe técnico).
   - Se `exception.getStatus() < 500` (`4xx`): preservar a mensagem funcional (`string | string[]`) extraída de `exception.getResponse()`.

4. **Qualquer outro `Error` ou `unknown`**:
   - Responder com `status = 500` e mensagem `'Erro interno no servidor'`.

5. **Observabilidade Interna Segura**:
   - Sempre que o status resultante for `>= 500` ou originado de erro inesperado do Prisma, registrar `this.logger.error(...)` com método HTTP, URL, status, código Prisma (quando aplicável) e `stack` **exclusivamente no log interno do servidor**, sem logar corpo de requisição contendo senhas/credenciais e sem retornar nenhum dado técnico no JSON entregue ao cliente (`{ statusCode, timestamp, path, message }`).

---

### 6. Estratégia de Testes Unitários e Suíte E2E Real Sem Override do Guard

#### 6.1 Testes Unitários (`backend/src/**/*.spec.ts`)
| Arquivo de Teste | Escopo e Cenários Cobertos |
| :--- | :--- |
| `src/config/env.validation.spec.ts` | Verifica *crash-on-boot* quando `DATABASE_URL` falta/é inválida, quando `JWT_SECRET` falta ou possui `< 32` caracteres, quando `FRONTEND_URL` falta ou contém `'*'`; confirma sucesso e defaults seguros (`PORT`, `JWT_EXPIRES_IN`) com ambiente válido. |
| `src/auth/auth.service.spec.ts` | Verifica `register()` (hash `bcrypt`, normalização de e-mail para minúsculas/trim, criação via Prisma sem expor `passwordHash`, `ConflictException` para e-mail duplicado e geração de `accessToken`); verifica `login()` (validação de senha, `UnauthorizedException` para usuário inexistente ou senha inválida, retorno de JWT válido). |
| `src/auth/jwt.strategy.spec.ts` | Verifica falha imediata caso `ConfigService.getOrThrow('JWT_SECRET')` não possua segredo; verifica `validate({ sub, email })` retornando `{ id, email, name }` para usuário válido e lançando `UnauthorizedException` quando usuário não existe no Prisma. |
| `src/common/filters/http-exception.filter.spec.ts` | Verifica conversão de `PrismaClientKnownRequestError` (`P2002` → `409 Conflict`, `P2003` → `409`, `P2025` → `404`, código desconhecido → `500`), mascaramento de `PrismaClientValidationError`, `Error` genérico e `HttpException(500)` para `'Erro interno no servidor'` sem vazar `meta`/SQL/stack no body, e preservação de mensagens `400`/`401`/`429`. |

#### 6.2 Suíte E2E Real (`backend/test/auth-security.e2e-spec.ts`)
- **Restrição arquitetural obrigatória**: Compilar `Test.createTestingModule({ imports: [AppModule] })` **sem `.overrideGuard(JwtAuthGuard)` e sem `.overrideGuard(ThrottlerGuard)`**, inicializando o pipeline HTTP completo via `configureApp(app)` (mesmo `helmet`, `enableCors`, `ValidationPipe` e `AllExceptionsFilter` usados em `main.ts`).
- **Pré-requisito de execução**: Banco PostgreSQL acessível conforme `DATABASE_URL` (com migrations aplicadas) e variáveis `JWT_SECRET` (>= 32 chars) e `FRONTEND_URL` definidas. Os registros criados nos testes E2E são removidos em `afterAll` para manter o banco limpo e isolado.
- **Matriz de Cenários E2E Reais**:
  1. **Autenticação Global por Padrão (`APP_GUARD`)**:
     - Requisições sem header `Authorization`, com token malformado ou assinado por segredo inválido para `GET /api/v1/auth/me`, `GET /api/v1/clients`, `GET /api/v1/projects` e `GET /api/v1/dashboard/summary` DEVEM retornar `401 Unauthorized`.
  2. **Ciclo Completo Real (`@Public()` -> JWT Real -> Rota Privada)**:
     - `POST /api/v1/auth/register` cria usuário real no PostgreSQL e retorna `201` com `accessToken`.
     - `POST /api/v1/auth/login` autentica credenciais reais e retorna `200/201` com `accessToken`.
     - `GET /api/v1/auth/me` e `GET /api/v1/clients` com `Authorization: Bearer <accessToken>` retornam `200 OK` com dados reais do usuário.
  3. **Sanitização de Erros e `P2002`**:
     - Erro inesperado simulado ou exceção interna em camada de serviço retorna `500` com `{ message: 'Erro interno no servidor' }` sem expor detalhes técnicos ou nomes de tabelas;
     - Cenário de colisão única Prisma (`P2002`) é convertido pelo filtro global em `409 Conflict` com mensagem segura.
  4. **Cabeçalhos Helmet & CORS Restrito (`FRONTEND_URL`)**:
     - Qualquer resposta inclui `x-content-type-options: nosniff`, `x-frame-options: SAMEORIGIN` e omite `x-powered-by`.
     - Requisição com `Origin` igual a `FRONTEND_URL` recebe `Access-Control-Allow-Origin` correspondente; requisição com `Origin: https://origem-maliciosa.example.com` NÃO recebe `Access-Control-Allow-Origin`.
  5. **Rate Limiting Estrito (`@nestjs/throttler`)**:
     - Disparar 5 tentativas consecutivas de `POST /api/v1/auth/login` (e verificar também `/api/v1/auth/register` com IP dedicado ou após janela/tracker isolado) e confirmar que a 6ª tentativa na janela de 60s é rejeitada com `429 Too Many Requests`.

---

## Plano de Validação (Portões de Qualidade)

Após a implementação das tarefas geradas em `tasks.md`, validar na seguinte ordem dentro de `backend/`:
1. `npm run typecheck` (`tsc --noEmit`) → 0 erros sob `strict: true`
2. `npm run lint` (`eslint`) → 0 erros ou warnings bloqueantes
3. `npm test` (Jest unitário) → 100% de aprovação incluindo as novas suítes `env.validation.spec.ts`, `auth.service.spec.ts`, `jwt.strategy.spec.ts` e `http-exception.filter.spec.ts`
4. `npm run test:e2e` (Supertest E2E com PostgreSQL de teste ativo) → aprovação das suítes `auth-security.e2e-spec.ts` e das suítes ajustadas (`clients`, `projects`, `dashboard`)
5. Verificação manual rápida de *crash-on-boot* tentando subir o servidor sem `JWT_SECRET` / com `JWT_SECRET` curto e validando a recusa imediata antes da escuta da porta HTTP.

## Complexity Tracking

> Nenhuma violação à Constituição `v1.1.0` foi identificada. As novas dependências (`zod`, `helmet`, `@nestjs/throttler`) decorrem diretamente das Diretrizes de Segurança e Hardening (NON-NEGOTIABLE) e dos requisitos `FR-001` a `FR-009` da especificação `02-security-hardening`.
