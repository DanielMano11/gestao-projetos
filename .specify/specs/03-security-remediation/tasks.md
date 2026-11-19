---
description: "Checklist executável de remediação dos pontos do Diagnóstico de Segurança (03-security-remediation)"
---

# Tasks: Remediação de Vulnerabilidades e Endurecimento Avançado (Security Remediation)

**Input**: Documentos em `.specify/specs/03-security-remediation/` (`spec.md`, `plan.md`) e `.specify/memory/constitution.md` (`v1.1.0`)

**Prerequisites**: `spec.md` (`FR-001`–`FR-012`), `plan.md`

**Organization**: Tarefas organizadas em 6 fases incrementais de implementação e verificação.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Pode ser executada em paralelo (arquivos distintos sem dependência bloqueante)
- **[Story]**: Rastreabilidade com User Stories (`[US1]` a `[US4]`)

---

## Fase 1: Higiene de Dependências e Configuração de Ambiente

**Purpose**: Limpar dependências vulneráveis/não utilizadas e atualizar o schema de ambiente para expiração mais curta, proxy confiável e exigência de HTTPS em produção.

- [X] T001 [P] [US4] Remover a dependência não utilizada `zod` de `frontend/package.json` (`npm uninstall zod`) e executar `npm audit fix` (sem `--force`) em `frontend/`
- [X] T002 [P] [US4] Executar `npm audit fix` (sem `--force`) em `backend/` para corrigir pacotes vulneráveis compatíveis (`tar`, `file-type`, `qs`) e atualizar `backend/package-lock.json`
- [X] T003 [US2] [US4] Atualizar `envSchema` em `backend/src/config/env.validation.ts` para definir `JWT_EXPIRES_IN` com default `'8h'`, adicionar `TRUST_PROXY` boolean (default `false`) e validar com `.superRefine` que `FRONTEND_URL` usa `https://` quando `NODE_ENV === 'production'`
- [X] T004 [P] [US2] [US4] Atualizar `backend/.env.example` refletindo `JWT_EXPIRES_IN="8h"` e `TRUST_PROXY=false`

**Checkpoint**: Dependências higienizadas e configuração de ambiente preparada para produção restrita.

---

## Fase 2: Credenciais, Seed Seguro, Política de Senhas e Anti-Timing Attack

**Purpose**: Eliminar credenciais padrão expostas no cliente/seed e fortalecer validação e verificação de senhas.

- [X] T005 [P] [US1] Remover os valores iniciais `'gestor@exemplo.com'` e `'admin123'` de `useState` em `frontend/src/pages/LoginPage.tsx` (iniciando campos vazios `''`)
- [X] T006 [P] [US1] Atualizar `backend/prisma/seed.ts` para ler `SEED_USER_EMAIL`, `SEED_USER_NAME` e `SEED_USER_PASSWORD` de `process.env`, exigindo credencial configurada e senha forte (`>= 8` chars) quando `NODE_ENV === 'production'`
- [X] T007 [P] [US1] Endurecer `password` em `backend/src/auth/dto/register.dto.ts` (`@MinLength(8)`, `@MaxLength(72)` e `@Matches` exigindo maiúscula, minúscula e número) e ajustar `@MaxLength(72)` em `backend/src/auth/dto/login.dto.ts`
- [X] T008 [US1] Atualizar `AuthService.login` em `backend/src/auth/auth.service.ts` para executar `bcrypt.compare(dto.password, DUMMY_PASSWORD_HASH)` quando o usuário não for encontrado, mitigando *timing side-channel*
- [X] T009 [US1] Atualizar testes unitários de autenticação (`backend/src/auth/auth.service.spec.ts`) e E2E (`backend/test/auth-security.e2e-spec.ts`) para refletir a política de senha forte (`>= 8` chars com maiúscula/minúscula/número) e verificar tempo/chamada dummy em login inexistente

**Checkpoint**: Nenhuma senha hardcoded no bundle de produção do frontend e política de autenticação fortalecida.

---

## Fase 3: Blindagem de Sessão no Frontend e Limpeza de Cache Multi-usuário

**Purpose**: Garantir isolamento total entre sessões de usuários na SPA e tolerância a falhas no armazenamento local.

- [X] T010 [US2] Criar `frontend/src/services/queryClient.ts` exportando `queryClient`, `clearAuthSession()`, `getStoredUser()` (com `try/catch` para JSON inválido) e `hasValidStoredToken()` (checagem de estrutura JWT e claim `exp`), atualizando `frontend/src/App.tsx` para reutilizar `queryClient`
- [X] T011 [US2] Atualizar o interceptor `401` em `frontend/src/services/api.ts` para invocar `clearAuthSession()` e redirecionar para `/login` quando fora da tela de login
- [X] T012 [P] [US2] Atualizar `frontend/src/components/layout/Header.tsx` para ler usuário via `getStoredUser()` e encerrar sessão com `clearAuthSession()` em `handleLogout`
- [X] T013 [P] [US2] Atualizar `ProtectedRoute` em `frontend/src/routes/AppRoutes.tsx` para utilizar `hasValidStoredToken()` antes de renderizar rotas privadas

**Checkpoint**: Logout e expiração `401` zeram armazenamento local e cache React Query, impedindo vazamento entre usuários.

---

## Fase 4: Integridade Transacional Anti-TOCTOU, Datas Estritas e Limites de Domínio

**Purpose**: Eliminar condições de corrida em mutações financeiras, erro `500` em datas compactas e crescimento ilimitado de checklist.

- [X] T014 [US3] Refatorar `addPayment`, `removePayment`, `updateStatus`, `update` e `updateFinancials` em `backend/src/projects/projects.service.ts` para ler o estado atual (com lock/isolamento transacional), validar saldos (`validateFinancialAmounts`) e persistir tudo dentro do mesmo `prisma.$transaction`
- [X] T015 [US3] Adicionar `@Matches(/^\d{4}-\d{2}-\d{2}$/)` em `startDate` e `endDate` em `backend/src/dashboard/dto/dashboard-filter.dto.ts` e validar datas inválidas / intervalo `fromDate > toDate` retornando `400 BadRequestException` em `backend/src/dashboard/dashboard.service.ts`
- [X] T016 [P] [US3] Adicionar `@Max(1000)` em `position` nos DTOs `backend/src/tasks/dto/create-task.dto.ts` e `backend/src/tasks/dto/update-task.dto.ts`
- [X] T017 [P] [US3] Impor limite `MAX_TASKS_PER_PROJECT = 200` com `BadRequestException` em `TasksService.create` em `backend/src/tasks/tasks.service.ts`

**Checkpoint**: Saldos protegidos sob requisições concorrentes e entradas de filtro/tarefas estritamente delimitadas.

---

## Fase 5: Perímetro de Produção (Swagger, Trust Proxy, Logs de Segurança e CSP)

**Purpose**: Proteger a superfície exposta em produção e garantir visibilidade de tentativas suspeitas nos logs.

- [X] T018 [P] [US4] Condicionar `SwaggerModule.setup('api/docs', ...)` em `backend/src/main.ts` para executar exclusivamente quando `NODE_ENV !== 'production'`
- [X] T019 [P] [US4] Configurar `app.getHttpAdapter().getInstance().set('trust proxy', 1)` em `backend/src/app.setup.ts` quando `TRUST_PROXY` for `true`
- [X] T020 [P] [US4] Adicionar emissão de log estruturado (`warn`) para eventos `401`, `403` e `429` (método, caminho, status, IP, sem tokens/credenciais) em `backend/src/common/filters/http-exception.filter.ts`
- [X] T021 [P] [US4] Adicionar meta tags `<meta name="referrer" content="strict-origin-when-cross-origin" />` e `<meta http-equiv="Content-Security-Policy" ... />` em `frontend/index.html`

**Checkpoint**: Ambiente de produção endurecido e eventos de negação de acesso auditáveis nos logs.

---

## Fase 6: Testes Unitários, E2E e Portões de Qualidade

**Purpose**: Validar todas as remediações com testes automatizados e portões completos de compilação/lint/auditoria.

- [X] T022 [P] [US1] [US3] [US4] Expandir testes unitários em `backend/src/config/env.validation.spec.ts`, `backend/src/common/filters/http-exception.filter.spec.ts`, `backend/src/dashboard/dashboard.service.spec.ts`, `backend/src/projects/projects-financial.spec.ts` e `backend/src/tasks/tasks.service.spec.ts` cobrindo produção HTTPS, `TRUST_PROXY`, logs `401`/`429`, datas inválidas/invertidas e limites de tarefas
- [X] T023 [P] [US2] Expandir `frontend/tests/components.spec.tsx` para validar `LoginPage` com campos inicialmente vazios, limpeza de cache no `clearAuthSession()`/`Header` e rejeição de token expirado no `ProtectedRoute`
- [X] T024 Executar todos os portões de qualidade em `backend/` (`npm run typecheck`, `npm run lint`, `npm test`, `npm run test:e2e`, `npm audit --omit=dev`) e em `frontend/` (`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm audit --omit=dev`), confirmando ausência de `'admin123'` no bundle `frontend/dist/`

---

## Dependencies & Execution Order

- **Fase 1** (`T001`–`T004`): pode ser iniciada imediatamente e desbloqueia testes de ambiente e auditoria.
- **Fase 2** (`T005`–`T009`), **Fase 3** (`T010`–`T013`), **Fase 4** (`T014`–`T017`) e **Fase 5** (`T018`–`T021`): independentes entre si após `T003` (`env.validation.ts`), podendo avançar em paralelo por domínio (`auth`, `frontend session`, `projects/dashboard/tasks`, `infra`).
- **Fase 6** (`T022`–`T024`): consolida a validação integral após as implementações anteriores.

