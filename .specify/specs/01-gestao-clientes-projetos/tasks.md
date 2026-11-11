---

description: "Lista de tarefas executáveis para implementação do Sistema de Gestão de Projetos"
---

# Tasks: Sistema de Gestão de Projetos (Serviços, Prazos e Fluxo de Caixa)

**Input**: Documentos de design em `.specify/specs/01-gestao-clientes-projetos/` (`spec.md`, `plan.md`) e `.specify/memory/constitution.md`

**Prerequisites**: `plan.md` (obrigatório), `spec.md` (clarificado com `US1` a `US4`), `constitution.md`

**Tests**: Incluídos conforme o Princípio V da Constituição (`Testes Automatizados e Observabilidade`).

**Organization**: As tarefas estão agrupadas por User Story (`US1` a `US4`) para permitir implementação, teste e entrega incremental independente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode ser executada em paralelo (arquivos distintos, sem dependência bloqueante em aberto)
- **[Story]**: User Story associada (`[US1]`, `[US2]`, `[US3]`, `[US4]`)
- Todas as tarefas incluem os caminhos exatos dos arquivos conforme o `plan.md`

## Path Conventions

- **Backend (NestJS + Prisma)**: `backend/src/`, `backend/prisma/`, `backend/test/`
- **Frontend (Vite + React)**: `frontend/src/`, `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialização dos projetos backend e frontend, configuração de TypeScript estrito, padronização de código e variáveis de ambiente.

- [ ] T001 Criar estrutura de diretórios raiz `backend/` e `frontend/` conforme definido em `.specify/specs/01-gestao-clientes-projetos/plan.md`
- [ ] T002 Inicializar projeto NestJS com TypeScript (`strict: true`) e dependências principais (`@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`, `@nestjs/swagger`, `class-validator`, `class-transformer`, `bcrypt`) em `backend/package.json`
- [ ] T003 [P] Inicializar projeto Vite + React + TypeScript (`strict: true`) com `react-router-dom`, `@tanstack/react-query`, `react-hook-form`, `zod`, `axios`, `lucide-react` e `tailwindcss` em `frontend/package.json`
- [ ] T004 [P] Configurar ESLint e Prettier compartilhando regras de formatação em `backend/.eslintrc.js` e `frontend/.eslintrc.cjs`
- [ ] T005 [P] Criar arquivos de exemplo de variáveis de ambiente documentados em `backend/.env.example` (`DATABASE_URL`, `JWT_SECRET`, `PORT`) e `frontend/.env.example` (`VITE_API_URL`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestrutura central de banco de dados (Prisma/PostgreSQL), autenticação JWT com escopo de usuário, tratamento global de erros, logging e layout base que DEVEM estar prontos antes de qualquer User Story.

**⚠️ CRITICAL**: Nenhuma User Story deve ser iniciada antes da conclusão desta fase.

- [ ] T006 Definir schema completo do banco (`User`, `Client` com `userId`, `Project`, `Payment`, `Task` e enum `ProjectStatus`) com restrições `Decimal(12, 2)` e `onDelete: Restrict`/`Cascade` em `backend/prisma/schema.prisma`
- [ ] T007 Executar migração inicial do PostgreSQL (`prisma migrate dev --name init`) gerando artefatos em `backend/prisma/migrations/`
- [ ] T008 Implementar `PrismaService` e `PrismaModule` global com gerenciamento de ciclo de vida de conexão em `backend/src/prisma/prisma.service.ts` e `backend/src/prisma/prisma.module.ts`
- [ ] T009 [P] Configurar `ValidationPipe` global (`whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`), CORS e documentação OpenAPI/Swagger (`/api/docs`) em `backend/src/main.ts`
- [ ] T010 [P] Implementar filtro global de exceções padronizado em `backend/src/common/filters/http-exception.filter.ts` e interceptor de logs estruturados em `backend/src/common/interceptors/logging.interceptor.ts`
- [ ] T011 [P] Implementar DTO base de paginação (`page`, `limit`, `search`) em `backend/src/common/dto/pagination-query.dto.ts`
- [ ] T012 Implementar módulo de autenticação JWT (`AuthModule`, `AuthService`, `AuthController` com `POST /auth/register`, `POST /auth/login` e `GET /auth/me`, decorator `@CurrentUser()` e `JwtAuthGuard`) em `backend/src/auth/` e `backend/src/common/guards/jwt-auth.guard.ts`
- [ ] T013 [P] Criar script de seed inicial (usuário gestor padrão, clientes, projetos, parcelas e checklist de exemplo) em `backend/prisma/seed.ts`
- [ ] T014 [P] Configurar cliente HTTP Axios com interceptors de token JWT e tratamento de erros em `frontend/src/services/api.ts`
- [ ] T015 [P] Criar estrutura de layout principal (`AppLayout`, `Sidebar`, `Header`), tela de autenticação login/cadastro (`LoginPage`) e configuração de rotas protegidas em `frontend/src/components/layout/AppLayout.tsx`, `frontend/src/pages/LoginPage.tsx` e `frontend/src/routes/AppRoutes.tsx`
- [ ] T016 [P] Criar componentes visuais base reutilizáveis (`Modal`, `CurrencyDisplay`, `StatusBadge`) em `frontend/src/components/ui/`

**Checkpoint**: Fundação pronta — a implementação das User Stories pode começar.

---

## Phase 3: User Story 1 - Gestão de Clientes e Projetos com Controle de Status (Priority: P1) 🎯 MVP

**Goal**: Permitir o cadastro rápido de clientes isolados por usuário autenticado (`FR-001`) com atalhos de contato (WhatsApp/e-mail), consulta ao histórico de serviços do cliente, bloqueio estrito de exclusão de clientes com projetos e gerenciamento de projetos vinculados com controle dos 5 status (`Proposta`, `Em Andamento`, `Pausado`, `Concluído`, `Cancelado`).

**Independent Test**: Autenticar-se, cadastrar um cliente com WhatsApp e e-mail, criar dois projetos vinculados a ele, alternar o status entre as 5 opções permitidas, verificar que a tentativa de excluir o cliente retorna conflito (`409`) e abrir os detalhes do cliente para verificar seu histórico completo de serviços e os links rápidos de contato.

### Tests for User Story 1

- [ ] T017 [P] [US1] Criar testes unitários do `ClientsService` (isolamento por `userId`, sanitização de WhatsApp e bloqueio `409 Conflict` ao tentar excluir cliente com projetos vinculados) em `backend/src/clients/clients.service.spec.ts`
- [ ] T018 [P] [US1] Criar testes de integração/E2E das rotas de Clientes e Projetos (CRUD isolado por usuário e transições de status) em `backend/test/clients.e2e-spec.ts` e `backend/test/projects.e2e-spec.ts`

### Implementation for User Story 1

- [ ] T019 [P] [US1] Criar DTOs de Clientes (`CreateClientDto`, `UpdateClientDto`, `ClientResponseDto` com validação de `name` obrigatório `VarChar(150)`, `email` e `whatsapp`) em `backend/src/clients/dto/`
- [ ] T020 [US1] Implementar `ClientsService` filtrando por `userId` (listagem paginada, busca, sanitização de dígitos do WhatsApp, busca de cliente com histórico de `projects` e proteção `409 Conflict` ao tentar excluir cliente com projetos) em `backend/src/clients/clients.service.ts`
- [ ] T021 [US1] Implementar `ClientsController` (`GET /clients`, `POST /clients`, `GET /clients/:id`, `PATCH /clients/:id`, `DELETE /clients/:id`) documentado com Swagger em `backend/src/clients/clients.controller.ts` e registrar `backend/src/clients/clients.module.ts`
- [ ] T022 [P] [US1] Criar DTOs de Projetos (`CreateProjectDto`, `UpdateProjectDto`, `UpdateProjectStatusDto`, `ProjectFilterDto` restringindo `status` ao enum `ProjectStatus`) em `backend/src/projects/dto/`
- [ ] T023 [US1] Implementar `ProjectsService` garantindo pertença do cliente ao `userId` autenticado (CRUD de projetos, filtro por `status` e `clientId`, status padrão `PROPOSAL` e transição para `COMPLETED` marcando automaticamente todas as tarefas do checklist como concluídas em `$transaction` conforme `FR-005`) em `backend/src/projects/projects.service.ts`
- [ ] T024 [US1] Implementar `ProjectsController` (`GET /projects`, `POST /projects`, `GET /projects/:id`, `PATCH /projects/:id`, `PATCH /projects/:id/status`, `DELETE /projects/:id`) em `backend/src/projects/projects.controller.ts` e registrar `backend/src/projects/projects.module.ts`
- [ ] T025 [P] [US1] Definir interfaces TypeScript de Cliente e Projeto (`Client`, `Project`, `ProjectStatus`) em `frontend/src/types/client.types.ts` e `frontend/src/types/project.types.ts`
- [ ] T026 [P] [US1] Implementar serviços de integração com API para clientes e projetos em `frontend/src/services/clients.service.ts` e `frontend/src/services/projects.service.ts`
- [ ] T027 [P] [US1] Criar hooks React Query `useClients` e `useProjects` (com invalidação cruzada do histórico do cliente ao criar/editar projetos) em `frontend/src/hooks/useClients.ts` e `frontend/src/hooks/useProjects.ts`
- [ ] T028 [P] [US1] Implementar componente `QuickContactActions` (botões de ação direta para `https://wa.me/<digitos>` e `mailto:<email>`) em `frontend/src/components/ui/QuickContactActions.tsx`
- [ ] T029 [US1] Implementar componentes de Clientes (`ClientListTable`, `ClientFormModal`, `ClientServiceHistoryDrawer`) em `frontend/src/features/clients/` e páginas `frontend/src/pages/ClientsPage.tsx` e `frontend/src/pages/ClientDetailPage.tsx`
- [ ] T030 [US1] Implementar listagem, filtros, modal de criação e seletor rápido de status de Projetos (`ProjectListTable`, `ProjectFiltersBar`, `ProjectFormModal`, `ProjectStatusSelect`) em `frontend/src/features/projects/` e página `frontend/src/pages/ProjectsPage.tsx`

**Checkpoint**: User Story 1 (MVP de Clientes, Histórico e Projetos com Status) funcional e testável de forma independente.

---

## Phase 4: User Story 2 - Prazos, Alertas de Atraso e Checklist de Entregas (Priority: P2)

**Goal**: Monitorar prazos finais de entrega, sinalizar automaticamente projetos atrasados ou próximos do vencimento e gerenciar um checklist simples de tarefas por projeto com cálculo automático de progresso (`0%` a `100%`) e conclusão automática das tarefas quando o projeto muda para `Concluído`.

**Independent Test**: Adicionar tarefas ao checklist de um projeto, concluir metade delas verificando se o progresso muda para `50%`, alterar o status do projeto para `Concluído` verificando se todas as tarefas passam a `100%`, e configurar um projeto ativo com prazo vencido para validar o alerta visual de atraso.

### Tests for User Story 2

- [ ] T031 [P] [US2] Criar testes unitários para cálculo de `progressPercentage` (incluindo checklist vazio = `0%`), auto-conclusão das tarefas quando `status = COMPLETED` e regras de `isOverdue`/`isUrgent` em `backend/src/tasks/tasks.service.spec.ts`

### Implementation for User Story 2

- [ ] T032 [P] [US2] Criar DTOs de tarefas (`CreateTaskDto`, `UpdateTaskDto` com validação de `title` obrigatório `VarChar(200)`, `isCompleted` e `position`) em `backend/src/tasks/dto/`
- [ ] T033 [US2] Implementar `TasksService` (listagem, criação, toggle de `isCompleted`, reordenação, exclusão e cálculo proporcional de `progressPercentage`) em `backend/src/tasks/tasks.service.ts`
- [ ] T034 [US2] Implementar `TasksController` (`GET /projects/:projectId/tasks`, `POST /projects/:projectId/tasks`, `PATCH /tasks/:id`, `DELETE /tasks/:id`) em `backend/src/tasks/tasks.controller.ts` e registrar `backend/src/tasks/tasks.module.ts`
- [ ] T035 [US2] Enriquecer a serialização do `ProjectsService` com os campos calculados `progressPercentage`, `isOverdue` (`status in ['IN_PROGRESS', 'PAUSED'] && deadline < today`), `isUrgent` (`deadline <= today + 7 days`) e filtros `overdueOnly`/`urgentOnly` em `backend/src/projects/projects.service.ts`
- [ ] T036 [P] [US2] Criar tipos, serviço HTTP e hook `useTasks` em `frontend/src/types/task.types.ts`, `frontend/src/services/tasks.service.ts` e `frontend/src/hooks/useTasks.ts`
- [ ] T037 [P] [US2] Implementar componentes `DeadlineAlertBadge` (selo vermelho de atraso / amarelo de urgência) e `ProgressBar` em `frontend/src/components/ui/DeadlineAlertBadge.tsx` e `frontend/src/components/ui/ProgressBar.tsx`
- [ ] T038 [US2] Implementar painel interativo `ProjectChecklistPanel` (adição rápida, checkbox de conclusão instantânea e exclusão de tarefas) em `frontend/src/features/projects/ProjectChecklistPanel.tsx` e integrá-lo à página `frontend/src/pages/ProjectDetailPage.tsx`

**Checkpoint**: User Stories 1 e 2 funcionais — prazos, alertas de atraso e progresso por checklist operacionais.

---

## Phase 5: User Story 3 - Controle Financeiro Híbrido por Projeto (Priority: P3)

**Goal**: Registrar o `valor cobrado` e controlar o `valor pago` de cada projeto tanto por edição direta do acumulado quanto pelo lançamento/estorno de pagamentos/parcelas individuais (`Payment`), calculando automaticamente o `saldo a receber` e o status financeiro (`Pendente`, `Parcial`, `Quitado`) com validações estritas (`FR-010`, `FR-011`).

**Independent Test**: Configurar `valor cobrado = R$ 5.000,00`, registrar uma parcela de `R$ 2.000,00` verificando `valor pago = R$ 2.000,00` e `saldo a receber = R$ 3.000,00` (`Parcial`), ajustar ou lançar os `R$ 3.000,00` restantes validando `Quitado`, e tentar salvar valor negativo ou `valor pago > valor cobrado` verificando o bloqueio.

### Tests for User Story 3

- [ ] T039 [P] [US3] Criar testes unitários das regras financeiras híbridas (`receivableAmount`, `financialStatus`, soma/estorno transacional de `Payment` em `paidAmount`, bloqueio de valores negativos e de `paidAmount > chargedAmount`) em `backend/src/projects/projects-financial.spec.ts`

### Implementation for User Story 3

- [ ] T040 [P] [US3] Criar `UpdateProjectFinancialsDto` e `CreatePaymentDto` (`amount`, `paidAt?`, `note?`) com validação numérica (`@Min(0.01)` para parcelas, `@Min(0)` para acumulado, 2 casas decimais e invariante `paidAmount <= chargedAmount`) em `backend/src/projects/dto/update-project-financials.dto.ts`
- [ ] T041 [US3] Implementar no `ProjectsService` e `ProjectsController` a atualização financeira direta (`PATCH /api/v1/projects/:id/financials`), o lançamento de parcelas (`POST /api/v1/projects/:id/payments`) e o estorno de parcelas (`DELETE /api/v1/payments/:id`) em transações `prisma.$transaction`, retornando `receivableAmount`, `financialStatus` e histórico de `payments` em `backend/src/projects/`
- [ ] T042 [US3] Implementar componente `ProjectFinancialCard` (exibição de Valor Cobrado, Valor Pago, Saldo a Receber, aba/modal para edição direta ou adição de parcela `Payment` com histórico de recebimentos) em `frontend/src/features/projects/ProjectFinancialCard.tsx` e integrá-lo em `frontend/src/pages/ProjectDetailPage.tsx`

**Checkpoint**: User Stories 1, 2 e 3 funcionais — gestão operacional e financeira híbrida individual por projeto completa.

---

## Phase 6: User Story 4 - Painel Inicial (Dashboard) de Métricas Financeiras e Projetos Urgentes (Priority: P4)

**Goal**: Consolidar em uma tela inicial executiva os totais financeiros da carteira do usuário (`totalCharged`, `totalPaid`, `totalReceivable`, `proposalsTotalValue`), a distribuição de projetos por status e a lista priorizada de projetos urgentes/em atraso.

**Independent Test**: Com projetos em diferentes status (`Proposta`, `Em Andamento`, `Concluído`, `Cancelado`) e prazos, abrir o Dashboard inicial e verificar se os somatórios excluem projetos cancelados/propostas do saldo a receber ativo e se os projetos vencidos ou para os próximos 7 dias aparecem ordenados por criticidade.

### Tests for User Story 4

- [ ] T043 [P] [US4] Criar testes unitários e E2E do `DashboardService` validando as regras contábeis por `userId` (exclusão de `CANCELED` e `PROPOSAL` do `totalReceivable` e ordenação de `urgentProjects`) em `backend/src/dashboard/dashboard.service.spec.ts` e `backend/test/dashboard.e2e-spec.ts`

### Implementation for User Story 4

- [ ] T044 [P] [US4] Criar `DashboardSummaryDto` documentado com `@nestjs/swagger` em `backend/src/dashboard/dto/dashboard-summary.dto.ts`
- [ ] T045 [US4] Implementar `DashboardService` utilizando agregações transacionais (`prisma.$transaction`) filtradas por `userId` para calcular totais financeiros, contagens por status e lista de projetos urgentes em `backend/src/dashboard/dashboard.service.ts`
- [ ] T046 [US4] Implementar `DashboardController` (`GET /api/v1/dashboard/summary`) em `backend/src/dashboard/dashboard.controller.ts` e registrar `backend/src/dashboard/dashboard.module.ts` em `backend/src/app.module.ts`
- [ ] T047 [P] [US4] Criar tipos, serviço HTTP e hook `useDashboard` em `frontend/src/types/dashboard.types.ts`, `frontend/src/services/dashboard.service.ts` e `frontend/src/hooks/useDashboard.ts`
- [ ] T048 [US4] Implementar componentes do painel (`FinancialSummaryCards`, `UrgentProjectsList`, `ProjectsByStatusChart`) em `frontend/src/features/dashboard/` e montar a página inicial `frontend/src/pages/DashboardPage.tsx`

**Checkpoint**: Todas as 4 User Stories estão completas, integradas e testáveis de forma independente.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Refinamentos de usabilidade, responsividade, testes automatizados de componentes React (Princípio V da Constituição) e revisão dos portões de qualidade.

- [ ] T049 [P] Adicionar estados de carregamento (`Skeleton` / `Spinner`), estados vazios amigáveis (`EmptyState`) e notificações de feedback (`Toast`) nas ações de mutação em `frontend/src/components/ui/`
- [ ] T050 [P] Revisar responsividade mobile/desktop das tabelas e cartões e acessibilidade de formulários em `frontend/src/pages/`
- [ ] T051 [P] Criar testes automatizados de componentes e fluxos críticos no frontend (`QuickContactActions`, `ProjectChecklistPanel`, `ProjectFinancialCard` e `DashboardPage`) com Vitest e React Testing Library em `frontend/tests/`
- [ ] T052 Executar verificação completa dos Portões de Qualidade da Constituição (`tsc --noEmit`, `eslint` e suítes de testes em `backend/` e `frontend/`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — início imediato.
- **Foundational (Phase 2)**: Depende da Phase 1 — **BLOQUEIA** todas as User Stories.
- **User Story 1 (Phase 3 - P1 🎯 MVP)**: Depende da Phase 2.
- **User Story 2 (Phase 4 - P2)**: Depende da estrutura base de `Project` da US1 (ou Phase 2) para acoplar o checklist e alertas de prazo.
- **User Story 3 (Phase 5 - P3)**: Depende da entidade `Project` da US1 para manipulação dos campos financeiros e parcelas (`Payment`).
- **User Story 4 (Phase 6 - P4)**: Consolida métricas de Projetos (US1), Prazos/Progresso (US2) e Financeiro (US3).
- **Polish (Phase 7)**: Depende da conclusão das User Stories desejadas.

### Parallel Opportunities

- **Setup & Foundational**: Inicialização do `frontend/` (`T003`, `T014`–`T016`) pode ocorrer 100% em paralelo com a configuração do `backend/` (`T002`, `T006`–`T013`).
- **Dentro de cada User Story**:
  - Criação de DTOs e testes no backend (`[P]`) pode ocorrer em paralelo com a definição de tipos, serviços e componentes de UI no frontend (`[P]`).
  - Após a conclusão da US1, um desenvolvedor pode atuar na **US2 (Prazos e Checklist)** enquanto outro atua na **US3 (Controle Financeiro Híbrido)**, pois operam em módulos e componentes distintos (`TasksModule` / `ProjectChecklistPanel` vs. `Payment` / `ProjectFinancialCard`).

---

## Parallel Example: User Story 1

```bash
# Backend e Componentes Base de Frontend em paralelo:
Task T019: "Criar DTOs de Clientes em backend/src/clients/dto/"
Task T022: "Criar DTOs de Projetos em backend/src/projects/dto/"
Task T025: "Definir interfaces TypeScript em frontend/src/types/"
Task T028: "Implementar componente QuickContactActions em frontend/src/components/ui/QuickContactActions.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Concluir **Phase 1: Setup** (`T001`–`T005`).
2. Concluir **Phase 2: Foundational** (`T006`–`T016`).
3. Concluir **Phase 3: User Story 1** (`T017`–`T030`).
4. **VALIDAR MVP**: Cadastrar clientes na carteira isolada do usuário, acionar WhatsApp/e-mail em 1 clique, criar projetos, alternar status e consultar histórico de serviços por cliente.

### Incremental Delivery

1. **Incremento 1 (US1)**: Carteira de clientes isolada por usuário, histórico de serviços e gestão de status de projetos.
2. **Incremento 2 (US2)**: Monitoramento de prazos finais, alertas de atraso/urgência, progresso via checklist e conclusão automática de tarefas ao concluir o projeto.
3. **Incremento 3 (US3)**: Controle financeiro híbrido por projeto (edição direta do valor pago ou lançamento de parcelas individuais `Payment` + saldo a receber).
4. **Incremento 4 (US4)**: Painel executivo inicial com métricas consolidadas de fluxo de caixa e projetos urgentes.

