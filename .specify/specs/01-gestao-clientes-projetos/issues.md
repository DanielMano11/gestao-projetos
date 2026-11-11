# GitHub Issues Plan (`speckit.taskstoissues`)

**Repository**: `https://github.com/DanielMano11/gestao-projetos`
**Feature**: `01-gestao-clientes-projetos` — Sistema de Gestão de Projetos (Serviços, Prazos e Fluxo de Caixa)
**Source**: [tasks.md](./tasks.md) (`T001`–`T052`), [spec.md](./spec.md), [plan.md](./plan.md)
**Generated**: 2026-11-11

---

## Labels Recomendadas no Repositório

| Label | Cor (`Hex`) | Descrição |
| :--- | :--- | :--- |
| `phase:setup` | `#0E8A16` | Inicialização do repositório, pacotes e ferramentas (Phase 1) |
| `phase:foundational` | `#D93F0B` | Infraestrutura bloqueante: Prisma, Auth JWT e Layout base (Phase 2) |
| `story:US1` | `#1D76DB` | Gestão de Clientes, Contatos Rápidos e Projetos com Status (P1 - MVP) |
| `story:US2` | `#5319E7` | Prazos, Alertas de Atraso e Checklist de Entregas (P2) |
| `story:US3` | `#FBCA04` | Controle Financeiro Híbrido por Projeto (P3) |
| `story:US4` | `#006B75` | Painel Inicial (Dashboard) de Métricas e Projetos Urgentes (P4) |
| `phase:polish` | `#C2E0C6` | Refinamento de UI, Testes de Componentes React e Quality Gates (Phase 7) |
| `backend` | `#B60205` | Tarefas de API NestJS, Prisma e PostgreSQL |
| `frontend` | `#0052CC` | Tarefas de interface Vite, React e TypeScript |
| `testing` | `#BFD4F2` | Testes unitários, integração/E2E e componentes |

---

## Issues Estruturadas (Epics / Fases e Tarefas)

### Issue #1 — `[Phase 1: Setup] Inicialização Full-Stack (NestJS + Vite/React + Linters)`
- **Labels**: `phase:setup`, `backend`, `frontend`
- **Dependencies**: Nenhuma (Início Imediato)
- **Body**:
  ```markdown
  ## Objetivo
  Inicializar a estrutura de diretórios `backend/` (NestJS) e `frontend/` (Vite + React) com TypeScript em modo estrito (`strict: true`), padronização ESLint/Prettier e variáveis de ambiente.

  ## Tarefas (`tasks.md`)
  - [ ] **T001**: Criar estrutura de diretórios raiz `backend/` e `frontend/` conforme definido em `.specify/specs/01-gestao-clientes-projetos/plan.md`
  - [ ] **T002**: Inicializar projeto NestJS com TypeScript (`strict: true`) e dependências principais (`@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`, `@nestjs/swagger`, `class-validator`, `class-transformer`, `bcrypt`) em `backend/package.json`
  - [ ] **T003** `[P]`: Inicializar projeto Vite + React + TypeScript (`strict: true`) com `react-router-dom`, `@tanstack/react-query`, `react-hook-form`, `zod`, `axios`, `lucide-react` e `tailwindcss` em `frontend/package.json`
  - [ ] **T004** `[P]`: Configurar ESLint e Prettier compartilhando regras de formatação em `backend/.eslintrc.js` e `frontend/.eslintrc.cjs`
  - [ ] **T005** `[P]`: Criar arquivos de exemplo de variáveis de ambiente documentados em `backend/.env.example` (`DATABASE_URL`, `JWT_SECRET`, `PORT`) e `frontend/.env.example` (`VITE_API_URL`)

  ## Critério de Aceite
  - Ambos os projetos compilam com `tsc --noEmit` sem erros e possuem scripts de lint configurados.
  ```

---

### Issue #2 — `[Phase 2: Foundational] Banco de Dados (Prisma/PostgreSQL), Autenticação JWT e Layout Base`
- **Labels**: `phase:foundational`, `backend`, `frontend`
- **Dependencies**: Depende da **Issue #1 (`Phase 1: Setup`)** — **Bloqueia todas as User Stories (`US1`–`US4`)**
- **Body**:
  ```markdown
  ## Objetivo
  Construir a fundação técnica bloqueante do sistema: modelagem Prisma com isolamento por usuário (`userId`), migração inicial no PostgreSQL, autenticação JWT (`register`, `login`, `me`), tratamento global de erros/logs e estrutura visual base no React.

  ## Tarefas (`tasks.md`)
  - [ ] **T006**: Definir schema completo do banco (`User`, `Client` com `userId`, `Project`, `Payment`, `Task` e enum `ProjectStatus`) com restrições `Decimal(12, 2)` e `onDelete: Restrict`/`Cascade` em `backend/prisma/schema.prisma`
  - [ ] **T007**: Executar migração inicial do PostgreSQL (`prisma migrate dev --name init`) gerando artefatos em `backend/prisma/migrations/`
  - [ ] **T008**: Implementar `PrismaService` e `PrismaModule` global em `backend/src/prisma/prisma.service.ts` e `backend/src/prisma/prisma.module.ts`
  - [ ] **T009** `[P]`: Configurar `ValidationPipe` global (`whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`), CORS e Swagger (`/api/docs`) em `backend/src/main.ts`
  - [ ] **T010** `[P]`: Implementar filtro global de exceções em `backend/src/common/filters/http-exception.filter.ts` e interceptor de logs estruturados em `backend/src/common/interceptors/logging.interceptor.ts`
  - [ ] **T011** `[P]`: Implementar DTO base de paginação (`page`, `limit`, `search`) em `backend/src/common/dto/pagination-query.dto.ts`
  - [ ] **T012**: Implementar módulo de autenticação JWT (`AuthModule`, `AuthService`, `AuthController` com `POST /auth/register`, `POST /auth/login` e `GET /auth/me`, decorator `@CurrentUser()` e `JwtAuthGuard`) em `backend/src/auth/` e `backend/src/common/guards/jwt-auth.guard.ts`
  - [ ] **T013** `[P]`: Criar script de seed inicial em `backend/prisma/seed.ts`
  - [ ] **T014** `[P]`: Configurar cliente HTTP Axios com interceptors de token JWT em `frontend/src/services/api.ts`
  - [ ] **T015** `[P]`: Criar estrutura de layout principal (`AppLayout`, `Sidebar`, `Header`), tela de login/cadastro (`LoginPage`) e rotas protegidas em `frontend/src/components/layout/AppLayout.tsx`, `frontend/src/pages/LoginPage.tsx` e `frontend/src/routes/AppRoutes.tsx`
  - [ ] **T016** `[P]`: Criar componentes visuais base reutilizáveis (`Modal`, `CurrencyDisplay`, `StatusBadge`) em `frontend/src/components/ui/`

  ## Critério de Aceite
  - Migração aplicada no PostgreSQL, rotas `/api/v1/auth/*` operacionais e fluxo de login protegendo rotas no frontend.
  ```

---

### Issue #3 — `[US1 - P1 🎯 MVP] Gestão de Clientes, Contatos Rápidos e Projetos com Controle de Status`
- **Labels**: `story:US1`, `backend`, `frontend`, `testing`
- **Dependencies**: Depende da **Issue #2 (`Phase 2: Foundational`)**
- **Body**:
  ```markdown
  ## Objetivo (`US1` — Prioridade P1 / MVP)
  Permitir o cadastro rápido de clientes (isolados por `userId`) com atalhos diretos de contato (WhatsApp/e-mail), consulta ao histórico completo de serviços do cliente, bloqueio estrito de exclusão de clientes com projetos vinculados (`409 Conflict`) e gestão de projetos com os 5 status (`Proposta`, `Em Andamento`, `Pausado`, `Concluído`, `Cancelado`).

  ## Requisitos Atendidos
  - `FR-001`, `FR-002`, `FR-003`, `FR-004`, `FR-005`

  ## Tarefas (`tasks.md`)
  ### Testes
  - [ ] **T017** `[P] [US1]`: Criar testes unitários do `ClientsService` (isolamento por `userId`, sanitização de WhatsApp e bloqueio `409 Conflict` ao tentar excluir cliente com projetos vinculados) em `backend/src/clients/clients.service.spec.ts`
  - [ ] **T018** `[P] [US1]`: Criar testes de integração/E2E das rotas de Clientes e Projetos em `backend/test/clients.e2e-spec.ts` e `backend/test/projects.e2e-spec.ts`

  ### Backend
  - [ ] **T019** `[P] [US1]`: Criar DTOs de Clientes (`CreateClientDto`, `UpdateClientDto`, `ClientResponseDto`) em `backend/src/clients/dto/`
  - [ ] **T020** `[US1]`: Implementar `ClientsService` filtrando por `userId` em `backend/src/clients/clients.service.ts`
  - [ ] **T021** `[US1]`: Implementar `ClientsController` (`GET /clients`, `POST /clients`, `GET /clients/:id`, `PATCH /clients/:id`, `DELETE /clients/:id`) em `backend/src/clients/clients.controller.ts`
  - [ ] **T022** `[P] [US1]`: Criar DTOs de Projetos (`CreateProjectDto`, `UpdateProjectDto`, `UpdateProjectStatusDto`, `ProjectFilterDto`) em `backend/src/projects/dto/`
  - [ ] **T023** `[US1]`: Implementar `ProjectsService` (CRUD, filtro por `status`/`clientId` e auto-conclusão das tarefas ao mudar status para `COMPLETED`) em `backend/src/projects/projects.service.ts`
  - [ ] **T024** `[US1]`: Implementar `ProjectsController` em `backend/src/projects/projects.controller.ts`

  ### Frontend
  - [ ] **T025** `[P] [US1]`: Definir interfaces TypeScript (`Client`, `Project`, `ProjectStatus`) em `frontend/src/types/client.types.ts` e `frontend/src/types/project.types.ts`
  - [ ] **T026** `[P] [US1]`: Implementar serviços HTTP em `frontend/src/services/clients.service.ts` e `frontend/src/services/projects.service.ts`
  - [ ] **T027** `[P] [US1]`: Criar hooks React Query `useClients` e `useProjects` em `frontend/src/hooks/useClients.ts` e `frontend/src/hooks/useProjects.ts`
  - [ ] **T028** `[P] [US1]`: Implementar `QuickContactActions` (`wa.me` e `mailto:`) em `frontend/src/components/ui/QuickContactActions.tsx`
  - [ ] **T029** `[US1]`: Implementar componentes e páginas de Clientes (`ClientListTable`, `ClientFormModal`, `ClientServiceHistoryDrawer`, `ClientsPage`, `ClientDetailPage`)
  - [ ] **T030** `[US1]`: Implementar componentes e página de Projetos (`ProjectListTable`, `ProjectFiltersBar`, `ProjectFormModal`, `ProjectStatusSelect`, `ProjectsPage`)
  ```

---

### Issue #4 — `[US2 - P2] Prazos, Alertas de Atraso e Checklist de Entregas`
- **Labels**: `story:US2`, `backend`, `frontend`, `testing`
- **Dependencies**: Depende da **Issue #3 (`US1`)**
- **Body**:
  ```markdown
  ## Objetivo (`US2` — Prioridade P2)
  Monitorar prazos finais de entrega, sinalizar projetos atrasados (`isOverdue`) ou urgentes (`isUrgent <= 7 dias`) e gerenciar o checklist simples de tarefas por projeto com cálculo automático de progresso (`0%` a `100%`) e conclusão automática ao concluir o projeto.

  ## Requisitos Atendidos
  - `FR-005`, `FR-006`, `FR-007`, `FR-008`, `FR-009`

  ## Tarefas (`tasks.md`)
  - [ ] **T031** `[P] [US2]`: Criar testes unitários para cálculo de `progressPercentage` (incluindo checklist vazio = `0%`), auto-conclusão quando `status = COMPLETED` e regras de `isOverdue`/`isUrgent` em `backend/src/tasks/tasks.service.spec.ts`
  - [ ] **T032** `[P] [US2]`: Criar DTOs de tarefas (`CreateTaskDto`, `UpdateTaskDto`) em `backend/src/tasks/dto/`
  - [ ] **T033** `[US2]`: Implementar `TasksService` em `backend/src/tasks/tasks.service.ts`
  - [ ] **T034** `[US2]`: Implementar `TasksController` (`GET/POST /projects/:projectId/tasks`, `PATCH/DELETE /tasks/:id`) em `backend/src/tasks/tasks.controller.ts`
  - [ ] **T035** `[US2]`: Enriquecer `ProjectsService` com `progressPercentage`, `isOverdue`, `isUrgent` e filtros `overdueOnly`/`urgentOnly` em `backend/src/projects/projects.service.ts`
  - [ ] **T036** `[P] [US2]`: Criar tipos, serviço HTTP e hook `useTasks` em `frontend/src/types/task.types.ts`, `frontend/src/services/tasks.service.ts` e `frontend/src/hooks/useTasks.ts`
  - [ ] **T037** `[P] [US2]`: Implementar `DeadlineAlertBadge` e `ProgressBar` em `frontend/src/components/ui/`
  - [ ] **T038** `[US2]`: Implementar `ProjectChecklistPanel` em `frontend/src/features/projects/ProjectChecklistPanel.tsx` e integrá-lo em `frontend/src/pages/ProjectDetailPage.tsx`
  ```

---

### Issue #5 — `[US3 - P3] Controle Financeiro Híbrido por Projeto (Acumulado e Parcelas)`
- **Labels**: `story:US3`, `backend`, `frontend`, `testing`
- **Dependencies**: Depende da **Issue #3 (`US1`)** (pode ser executada em paralelo com a **Issue #4 (`US2`)**)
- **Body**:
  ```markdown
  ## Objetivo (`US3` — Prioridade P3)
  Controlar o `valor cobrado` e o `valor pago` de cada projeto tanto por edição direta do acumulado quanto por lançamento/estorno de parcelas individuais (`Payment`), calculando automaticamente o `saldo a receber` e o status financeiro (`PENDING`, `PARTIAL`, `PAID`).

  ## Requisitos Atendidos
  - `FR-010`, `FR-011`

  ## Tarefas (`tasks.md`)
  - [ ] **T039** `[P] [US3]`: Criar testes unitários das regras financeiras híbridas (`receivableAmount`, `financialStatus`, soma/estorno transacional de `Payment`, bloqueio de negativos e de `paidAmount > chargedAmount`) em `backend/src/projects/projects-financial.spec.ts`
  - [ ] **T040** `[P] [US3]`: Criar `UpdateProjectFinancialsDto` e `CreatePaymentDto` em `backend/src/projects/dto/update-project-financials.dto.ts`
  - [ ] **T041** `[US3]`: Implementar `PATCH /projects/:id/financials`, `POST /projects/:id/payments` e `DELETE /payments/:id` em transações `prisma.$transaction` em `backend/src/projects/`
  - [ ] **T042** `[US3]`: Implementar `ProjectFinancialCard` (edição direta + histórico/adição de parcelas `Payment`) em `frontend/src/features/projects/ProjectFinancialCard.tsx` e integrá-lo em `frontend/src/pages/ProjectDetailPage.tsx`
  ```

---

### Issue #6 — `[US4 - P4] Painel Inicial (Dashboard) de Métricas Financeiras e Projetos Urgentes`
- **Labels**: `story:US4`, `backend`, `frontend`, `testing`
- **Dependencies**: Depende das **Issues #3 (`US1`), #4 (`US2`) e #5 (`US3`)**
- **Body**:
  ```markdown
  ## Objetivo (`US4` — Prioridade P4)
  Consolidar em um painel inicial executivo os totais financeiros da carteira do usuário (`totalCharged`, `totalPaid`, `totalReceivable`, `proposalsTotalValue`), a contagem de projetos por status e a lista priorizada de projetos urgentes/em atraso.

  ## Requisitos Atendidos
  - `FR-012`

  ## Tarefas (`tasks.md`)
  - [ ] **T043** `[P] [US4]`: Criar testes unitários e E2E do `DashboardService` (exclusão de `CANCELED` e `PROPOSAL` do `totalReceivable` e ordenação de `urgentProjects`) em `backend/src/dashboard/dashboard.service.spec.ts` e `backend/test/dashboard.e2e-spec.ts`
  - [ ] **T044** `[P] [US4]`: Criar `DashboardSummaryDto` em `backend/src/dashboard/dto/dashboard-summary.dto.ts`
  - [ ] **T045** `[US4]`: Implementar `DashboardService` com agregações transacionais filtradas por `userId` em `backend/src/dashboard/dashboard.service.ts`
  - [ ] **T046** `[US4]`: Implementar `DashboardController` (`GET /api/v1/dashboard/summary`) em `backend/src/dashboard/dashboard.controller.ts`
  - [ ] **T047** `[P] [US4]`: Criar tipos, serviço HTTP e hook `useDashboard` em `frontend/src/types/dashboard.types.ts`, `frontend/src/services/dashboard.service.ts` e `frontend/src/hooks/useDashboard.ts`
  - [ ] **T048** `[US4]`: Implementar `FinancialSummaryCards`, `UrgentProjectsList`, `ProjectsByStatusChart` e `DashboardPage` em `frontend/src/features/dashboard/` e `frontend/src/pages/DashboardPage.tsx`
  ```

---

### Issue #7 — `[Phase 7: Polish] UX, Testes de Componentes React e Portões de Qualidade`
- **Labels**: `phase:polish`, `frontend`, `testing`
- **Dependencies**: Depende das **Issues #3 a #6**
- **Body**:
  ```markdown
  ## Objetivo
  Refinar estados visuais (loading, empty state, toasts), responsividade mobile/desktop, cobrir componentes críticos no React com Vitest + React Testing Library e validar todos os Quality Gates da Constituição.

  ## Tarefas (`tasks.md`)
  - [ ] **T049** `[P]`: Adicionar `Skeleton`/`Spinner`, `EmptyState` e `Toast` em `frontend/src/components/ui/`
  - [ ] **T050** `[P]`: Revisar responsividade mobile/desktop e acessibilidade em `frontend/src/pages/`
  - [ ] **T051** `[P]`: Criar testes automatizados de componentes React (`QuickContactActions`, `ProjectChecklistPanel`, `ProjectFinancialCard` e `DashboardPage`) com Vitest e React Testing Library em `frontend/tests/`
  - [ ] **T052**: Executar verificação completa dos Portões de Qualidade da Constituição (`tsc --noEmit`, `eslint` e suítes de testes em `backend/` e `frontend/`)
  ```

