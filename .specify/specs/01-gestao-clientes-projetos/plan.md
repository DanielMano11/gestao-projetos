# Implementation Plan: Sistema de Gestão de Projetos (Serviços, Prazos e Fluxo de Caixa)

**Branch**: `001-gestao-projetos-mvp` | **Date**: 2026-11-11 | **Spec**: [spec.md](./spec.md)

**Input**: Especificação funcional em `.specify/specs/01-gestao-clientes-projetos/spec.md` e diretrizes arquiteturais em `.specify/memory/constitution.md`.

## Summary

Implementação de uma plataforma web full-stack enxuta para gestão de clientes, projetos/serviços, prazos com checklist de entregas e controle de fluxo de caixa (valor cobrado vs. valor pago, saldo a receber e painel de métricas). A solução utiliza **NestJS** no backend (arquitetura modular com validação estrita via DTOs e documentação OpenAPI/Swagger), **Prisma ORM + PostgreSQL** na camada de persistência relacional e **React + Vite + TypeScript** no frontend componentizado.

## Technical Context

**Language/Version**: TypeScript 5.x (`strict: true`) sobre Node.js 20+ LTS (Backend e Frontend)

**Primary Dependencies**:
- **Backend**: `@nestjs/core`, `@nestjs/common`, `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`, `@nestjs/swagger`, `@prisma/client`, `class-validator`, `class-transformer`, `bcrypt`
- **Frontend**: `react` (18+), `react-dom`, `react-router-dom`, `@tanstack/react-query`, `react-hook-form`, `zod`, `axios`, `lucide-react`, `tailwindcss`

**Storage**: PostgreSQL 16+ gerenciado via Prisma ORM (`prisma migrate`)

**Testing**:
- **Backend**: Jest (testes unitários de Services) + Supertest (testes de integração/E2E da API com banco de teste isolado)
- **Frontend**: Vitest + React Testing Library (testes de componentes e fluxos críticos)

**Target Platform**: Aplicação Web moderna (Desktop e Mobile Web responsivo) e servidor Node.js/Docker

**Project Type**: Web application (`backend/` + `frontend/`)

**Performance Goals**: Tempo de resposta da API `< 200ms` (p95) nas listagens e no painel inicial (`Dashboard`); carregamento inicial da SPA `< 1.5s`

**Constraints**: Precisão monetária de 2 casas decimais (`Decimal(12, 2)`) sem erros de ponto flutuante; bloqueio de exclusão de clientes com histórico de projetos; proibição de `valor pago > valor cobrado` ou valores negativos

**Scale/Scope**: MVP enxuto com 4 módulos de negócio principais (`Clients`, `Projects`, `Tasks`, `Dashboard`) + `Auth`, cerca de 15 endpoints REST e 4 telas principais no frontend

## Constitution Check

*GATE: Verificação de conformidade com `.specify/memory/constitution.md` antes e após o desenho técnico.*

- ✅ **I. Arquitetura Modular e Separação de Responsabilidades (NestJS)**: Backend dividido em `AuthModule`, `ClientsModule`, `ProjectsModule`, `TasksModule`, `DashboardModule` e `PrismaModule`. Controllers restritos ao transporte HTTP e validação via `ValidationPipe` global (`whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`).
- ✅ **II. Integridade Relacional e Acesso a Dados Seguro (Prisma & PostgreSQL)**: Esquema único em `prisma/schema.prisma`, migrações versionadas, uso de `Decimal` para valores monetários, `onDelete: Restrict` entre `Client` e `Project`, transações `prisma.$transaction` e paginação/seleção explícita de campos.
- ✅ **III. Componentização, Tipagem Estrita e Estado Previsível (Vite & React)**: Separação em `components/ui`, `features/`, `pages/`, `hooks/` e `services/`. Estado assíncrono gerenciado com `@tanstack/react-query` separado do estado local de UI/formulários.
- ✅ **IV. Contratos de API, Segurança e Controle de Acesso (NON-NEGOTIABLE)**: API REST documentada via `@nestjs/swagger`, filtro global de exceções (`AllExceptionsFilter`), proteção via `JwtAuthGuard` e configuração validada com `@nestjs/config`.
- ✅ **V. Testes Automatizados e Observabilidade**: Estrutura de testes unitários para cálculos financeiros/progresso, testes E2E para rotas críticas e interceptor de logging estruturado (`LoggingInterceptor`).

## Project Structure

### Documentation (this feature)

```text
.specify/
├── memory/
│   └── constitution.md                          # Regras arquiteturais e governança do projeto
└── specs/01-gestao-clientes-projetos/
    ├── spec.md                                  # Especificação funcional clarificada
    ├── plan.md                                  # Este plano técnico (Estrutura, Banco, Endpoints, Componentes)
    ├── tasks.md                                 # Lista de tarefas executáveis
    └── checklists/
        └── requirements.md                      # Checklist de validação da especificação
```

### Source Code (repository root)

```text
backend/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── logging.interceptor.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   └── dto/
│   │       └── pagination-query.dto.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── dto/
│   ├── clients/
│   │   ├── clients.module.ts
│   │   ├── clients.controller.ts
│   │   ├── clients.service.ts
│   │   └── dto/
│   │       ├── create-client.dto.ts
│   │       ├── update-client.dto.ts
│   │       └── client-response.dto.ts
│   ├── projects/
│   │   ├── projects.module.ts
│   │   ├── projects.controller.ts
│   │   ├── projects.service.ts
│   │   └── dto/
│   │       ├── create-project.dto.ts
│   │       ├── update-project.dto.ts
│   │       ├── update-project-status.dto.ts
│   │       ├── update-project-financials.dto.ts
│   │       └── project-filter.dto.ts
│   ├── tasks/
│   │   ├── tasks.module.ts
│   │   ├── tasks.controller.ts
│   │   ├── tasks.service.ts
│   │   └── dto/
│   │       ├── create-task.dto.ts
│   │       └── update-task.dto.ts
│   └── dashboard/
│       ├── dashboard.module.ts
│       ├── dashboard.controller.ts
│       ├── dashboard.service.ts
│       └── dto/
│           └── dashboard-summary.dto.ts
└── test/
    ├── clients.e2e-spec.ts
    ├── projects.e2e-spec.ts
    └── dashboard.e2e-spec.ts

frontend/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes/
│   │   └── AppRoutes.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── clients.service.ts
│   │   ├── projects.service.ts
│   │   ├── tasks.service.ts
│   │   └── dashboard.service.ts
│   ├── types/
│   │   ├── client.types.ts
│   │   ├── project.types.ts
│   │   ├── task.types.ts
│   │   └── dashboard.types.ts
│   ├── hooks/
│   │   ├── useClients.ts
│   │   ├── useProjects.ts
│   │   ├── useTasks.ts
│   │   └── useDashboard.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   └── ui/
│   │       ├── StatusBadge.tsx
│   │       ├── DeadlineAlertBadge.tsx
│   │       ├── ProgressBar.tsx
│   │       ├── CurrencyDisplay.tsx
│   │       ├── QuickContactActions.tsx
│   │       └── Modal.tsx
│   ├── features/
│   │   ├── dashboard/
│   │   │   ├── FinancialSummaryCards.tsx
│   │   │   ├── UrgentProjectsList.tsx
│   │   │   └── ProjectsByStatusChart.tsx
│   │   ├── clients/
│   │   │   ├── ClientListTable.tsx
│   │   │   ├── ClientFormModal.tsx
│   │   │   └── ClientServiceHistoryDrawer.tsx
│   │   └── projects/
│   │       ├── ProjectListTable.tsx
│   │       ├── ProjectFiltersBar.tsx
│   │       ├── ProjectFormModal.tsx
│   │       ├── ProjectStatusSelect.tsx
│   │       ├── ProjectFinancialCard.tsx
│   │       └── ProjectChecklistPanel.tsx
│   └── pages/
│       ├── DashboardPage.tsx
│       ├── ClientsPage.tsx
│       ├── ClientDetailPage.tsx
│       ├── ProjectsPage.tsx
│       ├── ProjectDetailPage.tsx
│       └── LoginPage.tsx
└── tests/
```

**Structure Decision**: Adotada a estrutura Web Application (`backend/` para a API NestJS + Prisma e `frontend/` para a SPA Vite + React), garantindo isolamento claro de dependências, builds independentes e conformidade com os princípios I, II e III da Constituição.

---

## 1. Schema do Banco de Dados (Prisma & PostgreSQL)

Arquivo alvo: `backend/prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum ProjectStatus {
  PROPOSAL    // Proposta
  IN_PROGRESS // Em Andamento
  PAUSED      // Pausado
  COMPLETED   // Concluído
  CANCELED    // Cancelado
}

model User {
  id           String   @id @default(uuid()) @db.Uuid
  name         String   @db.VarChar(120)
  email        String   @unique @db.VarChar(160)
  passwordHash String   @map("password_hash")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  clients      Client[]

  @@map("users")
}

model Client {
  id        String    @id @default(uuid()) @db.Uuid
  userId    String    @map("user_id") @db.Uuid
  name      String    @db.VarChar(150)
  whatsapp  String?   @db.VarChar(30)
  email     String?   @db.VarChar(160)
  notes     String?   @db.Text
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  projects  Project[]

  @@index([userId, name])
  @@index([email])
  @@map("clients")
}

model Project {
  id            String        @id @default(uuid()) @db.Uuid
  clientId      String        @map("client_id") @db.Uuid
  title         String        @db.VarChar(180)
  description   String?       @db.Text
  status        ProjectStatus @default(PROPOSAL)
  deadline      DateTime      @db.Date
  chargedAmount Decimal       @default(0.00) @map("charged_amount") @db.Decimal(12, 2)
  paidAmount    Decimal       @default(0.00) @map("paid_amount") @db.Decimal(12, 2)
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")

  // onDelete: Restrict impede exclusão acidental de cliente com histórico de serviços (Edge Case da Spec)
  client        Client        @relation(fields: [clientId], references: [id], onDelete: Restrict)
  tasks         Task[]
  payments      Payment[]

  @@index([clientId])
  @@index([status, deadline])
  @@map("projects")
}

model Payment {
  id        String   @id @default(uuid()) @db.Uuid
  projectId String   @map("project_id") @db.Uuid
  amount    Decimal  @db.Decimal(12, 2)
  paidAt    DateTime @default(now()) @map("paid_at") @db.Date
  note      String?  @db.VarChar(200)
  createdAt DateTime @default(now()) @map("created_at")

  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId, paidAt])
  @@map("payments")
}

model Task {
  id          String   @id @default(uuid()) @db.Uuid
  projectId   String   @map("project_id") @db.Uuid
  title       String   @db.VarChar(200)
  isCompleted Boolean  @default(false) @map("is_completed")
  position    Int      @default(0)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId, position])
  @@map("tasks")
}
```

### Regras de Domínio e Campos Calculados no Backend
Os seguintes campos derivados são calculados de forma determinística pelo `ProjectsService` / `DashboardService` e expostos nos DTOs de saída:
- `receivableAmount`: `max(0, chargedAmount - paidAmount)` (ou `0` quando `status === 'CANCELED'`).
- `financialStatus`:
  - `PAID` (`Quitado`) se `paidAmount == chargedAmount` e `chargedAmount > 0`;
  - `PARTIAL` (`Parcial`) se `0 < paidAmount < chargedAmount`;
  - `PENDING` (`Pendente`) se `paidAmount == 0`.
- `progressPercentage`: `totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)`.
- `isOverdue` (**Em Atraso**): `status in ['IN_PROGRESS', 'PAUSED'] && deadline < today`.
- `isUrgent` (**Urgente**): `status in ['IN_PROGRESS', 'PAUSED'] && deadline <= today + 7 days`.

---

## 2. Plano Técnico de Endpoints (NestJS REST API)

Prefixo global da API: `/api/v1` (Documentação interativa em `/api/docs` via Swagger).

### 2.1 Autenticação (`AuthModule`)
| Método | Rota | Descrição | Payload / Query | Resposta |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Cria nova conta de usuário (carteira isolada) | `{ name, email, password }` | `{ accessToken, user: { id, name, email } }` |
| `POST` | `/api/v1/auth/login` | Autentica gestor e retorna token JWT | `{ email, password }` | `{ accessToken, user: { id, name, email } }` |
| `GET` | `/api/v1/auth/me` | Retorna dados do usuário autenticado | Header `Bearer <token>` | `{ id, name, email }` |

### 2.2 Clientes (`ClientsModule` — Atende `FR-001`, `FR-002`, `FR-003`)
| Método | Rota | Descrição | Payload / Query | Regra de Negócio / Resposta |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/clients` | Lista clientes paginados com busca e contagem de projetos | `?search=&page=1&limit=20` | Retorna clientes + `whatsappClean` (apenas dígitos para link `wa.me`) e resumo de projetos |
| `POST` | `/api/v1/clients` | Cadastra novo cliente | `CreateClientDto`: `{ name, whatsapp?, email?, notes? }` | Sanitiza `whatsapp` mantendo dígitos; valida formato de `email` |
| `GET` | `/api/v1/clients/:id` | Detalha cliente + **Histórico de Serviços** (`FR-003`) | Param `:id` (UUID) | Retorna dados do cliente + lista de `projects` (com status, prazo, valor cobrado, valor pago e saldo) + totais do cliente |
| `PATCH` | `/api/v1/clients/:id` | Atualiza dados de contato ou notas do cliente | `UpdateClientDto` | Retorna cliente atualizado |
| `DELETE` | `/api/v1/clients/:id` | Remove cliente sem projetos vinculados | Param `:id` (UUID) | Se possuir projetos, retorna `409 Conflict` informando que o histórico de serviços impede a exclusão |

### 2.3 Projetos (`ProjectsModule` — Atende `FR-004` a `FR-007`, `FR-010`, `FR-011`)
| Método | Rota | Descrição | Payload / Query | Regra de Negócio / Resposta |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/projects` | Lista projetos com filtros combinados | `?status=&clientId=&urgentOnly=&overdueOnly=&search=&page=1&limit=20` | Inclui `client` resumido, `progressPercentage`, `receivableAmount`, `isOverdue`, `isUrgent` |
| `POST` | `/api/v1/projects` | Cria projeto vinculado a um cliente | `CreateProjectDto`: `{ clientId, title, description?, status?, deadline, chargedAmount, paidAmount?, initialTasks?[] }` | Default `status = PROPOSAL`, `paidAmount = 0`. Valida `0 <= paidAmount <= chargedAmount`. Se `initialTasks` enviado, cria em `$transaction` |
| `GET` | `/api/v1/projects/:id` | Detalha projeto com cliente, financeiro e checklist | Param `:id` (UUID) | Retorna projeto completo + `tasks` ordenadas por `position` + métricas derivadas |
| `PATCH` | `/api/v1/projects/:id` | Atualiza dados gerais, prazo, status ou valores | `UpdateProjectDto` | Valida invariante `paidAmount <= chargedAmount` (`400 Bad Request` caso viole) |
| `PATCH` | `/api/v1/projects/:id/status` | Atualização rápida de status (`FR-005`) | `{ status: ProjectStatus }` | Se `status === 'COMPLETED'`, marca todas as tarefas do checklist como `isCompleted = true` (`100%`) e quita `100%` do pagamento (`paidAmount = chargedAmount`, registrando parcela residual se houver saldo) em `$transaction`; recalcula `isOverdue` e `isUrgent` |
| `PATCH` | `/api/v1/projects/:id/financials` | Atualização direta de valores (`FR-010`, `FR-011`) | `{ chargedAmount, paidAmount }` | Impede valores negativos ou `paidAmount > chargedAmount`; retorna novo `receivableAmount` e `financialStatus` |
| `POST` | `/api/v1/projects/:id/payments` | Registra parcela/pagamento individual (`FR-010`) | `{ amount, paidAt?, note? }` | Soma `amount` ao `paidAmount` do projeto em `$transaction` (validando `paidAmount + amount <= chargedAmount`) |
| `DELETE` | `/api/v1/payments/:id` | Remove lançamento de pagamento e estorna `paidAmount` | Param `:id` (UUID) | Subtrai `amount` do `paidAmount` do projeto em `$transaction` |
| `DELETE` | `/api/v1/projects/:id` | Exclui projeto e suas tarefas | Param `:id` (UUID) | Remove em cascata os itens de checklist vinculados |

### 2.4 Prazos, Entregas e Checklist (`TasksModule` — Atende `FR-008`, `FR-009`)
| Método | Rota | Descrição | Payload / Query | Regra de Negócio / Resposta |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/projects/:projectId/tasks` | Lista checklist do projeto e progresso atual | Param `:projectId` | Retorna `{ items: Task[], completedCount, totalCount, progressPercentage }` |
| `POST` | `/api/v1/projects/:projectId/tasks` | Adiciona tarefa ao checklist do projeto | `CreateTaskDto`: `{ title, position? }` | Cria tarefa e retorna item criado + novo `progressPercentage` do projeto |
| `PATCH` | `/api/v1/tasks/:id` | Edita título, ordem ou alterna `isCompleted` | `UpdateTaskDto`: `{ title?, isCompleted?, position? }` | Atualiza tarefa e retorna o novo `progressPercentage` recalculado |
| `DELETE` | `/api/v1/tasks/:id` | Remove tarefa do checklist | Param `:id` (UUID) | Exclui item e recalcula `progressPercentage` (`0%` se restarem 0 tarefas) |

### 2.5 Painel Inicial e Métricas (`DashboardModule` — Atende `FR-012`)
| Método | Rota | Descrição | Payload / Query | Regra de Negócio / Resposta |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/dashboard/summary` | Retorna visão consolidada financeira e operacional | `?urgentDays=7` (default `7`) | Executa agregações otimizadas em paralelo (`prisma.$transaction`) retornando `DashboardSummaryDto` |

**Contrato de saída de `GET /api/v1/dashboard/summary` (`DashboardSummaryDto`)**:
```json
{
  "financials": {
    "totalCharged": 45000.00,
    "totalPaid": 28500.00,
    "totalReceivable": 16500.00,
    "proposalsTotalValue": 12000.00
  },
  "countsByStatus": {
    "PROPOSAL": 3,
    "IN_PROGRESS": 5,
    "PAUSED": 1,
    "COMPLETED": 8,
    "CANCELED": 1
  },
  "urgentProjects": [
    {
      "id": "uuid",
      "title": "Redesign E-commerce",
      "clientName": "Loja Exemplo",
      "status": "IN_PROGRESS",
      "deadline": "2026-11-09",
      "daysRemaining": -2,
      "isOverdue": true,
      "progressPercentage": 75,
      "receivableAmount": 2500.00
    }
  ]
}
```
> **Regra contábil do Dashboard (conforme `spec.md`)**:
> - `totalCharged`: Soma de `chargedAmount` dos projetos contratados (`IN_PROGRESS`, `PAUSED`, `COMPLETED`). Projetos em `PROPOSAL` são reportados separadamente em `proposalsTotalValue`.
> - `totalPaid`: Soma de `paidAmount` efetivamente recebidos.
> - `totalReceivable`: Soma de `(chargedAmount - paidAmount)` apenas dos projetos ativos/concluídos (`IN_PROGRESS`, `PAUSED`, `COMPLETED`), garantindo que projetos `CANCELED` ou `PROPOSAL` não inflem o saldo a receber.
> - `urgentProjects`: Projetos com status `IN_PROGRESS` ou `PAUSED` cujo `deadline <= hoje + 7 dias`, ordenados por `deadline ASC` (mais atrasados primeiro).

---

## 3. Arquitetura de Componentes e Estado (Frontend Vite/React)

### 3.1 Páginas e Roteamento (`src/pages/` & `src/routes/AppRoutes.tsx`)
- **`DashboardPage` (`/`)**: Tela inicial executiva. Renderiza os cartões financeiros (`FinancialSummaryCards`), a lista priorizada de entregas críticas (`UrgentProjectsList`) e o resumo de projetos por status (`ProjectsByStatusChart`).
- **`ClientsPage` (`/clients`)**: Listagem com busca instantânea por nome/e-mail/WhatsApp, botão para abrir `ClientFormModal` e botões de ação rápida para WhatsApp/e-mail.
- **`ClientDetailPage` (`/clients/:id`)**: Ficha completa do cliente com seus contatos rápidos e a tabela de **Histórico de Serviços** (`ClientServiceHistoryDrawer` / visão dedicada) exibindo todos os projetos vinculados, status, prazos e valores.
- **`ProjectsPage` (`/projects`)**: Listagem geral de projetos com barra de filtros (`ProjectFiltersBar`: por status, cliente, apenas atrasados, apenas urgentes) e criação rápida via `ProjectFormModal`.
- **`ProjectDetailPage` (`/projects/:id`)**: Visão 360° do projeto dividida em três painéis:
  1. Cabeçalho com seletor imediato de status (`ProjectStatusSelect`) e alerta de prazo (`DeadlineAlertBadge`);
  2. Painel de **Checklist de Entregas** (`ProjectChecklistPanel`) com barra de progresso (`ProgressBar`) em tempo real;
  3. Cartão de **Controle Financeiro** (`ProjectFinancialCard`) exibindo Valor Cobrado, Valor Pago, Saldo a Receber e edição rápida.

### 3.2 Componentes Reutilizáveis de UI (`src/components/ui/`)
- **`QuickContactActions`**: Recebe `whatsapp` e `email` do cliente; gera link `https://wa.me/<digitos>` (abrindo em nova aba) e `mailto:<email>`, desabilitando graciosamente quando o contato não estiver preenchido.
- **`StatusBadge`**: Renderiza cores semânticas padronizadas para os 5 status (`Proposta` = Azul, `Em Andamento` = Índigo/ciano, `Pausado` = Âmbar, `Concluído` = Verde, `Cancelado` = Cinza/Vermelho).
- **`DeadlineAlertBadge`**: Compara `deadline` com a data atual e o `status`; exibe selo vermelho **"Atrasado há X dias"** se vencido, amarelo **"Vence em X dias"** se `<= 7 dias`, ou data formatada padrão se dentro do prazo/concluído.
- **`ProgressBar`**: Barra visual de `0%` a `100%` com contador `X de Y tarefas concluídas`.
- **`CurrencyDisplay`**: Formata valores monetários no padrão brasileiro (`Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`).

### 3.3 Gerenciamento de Estado e Integração com API (`src/hooks/`)
- **`useDashboard()`**: Consulta `GET /api/v1/dashboard/summary` via `@tanstack/react-query` (queryKey: `['dashboard-summary']`).
- **`useClients()` / `useClientDetail(id)`**: Gerencia listagem, criação, edição e exclusão de clientes; invalida `['clients']` após mutações.
- **`useProjects()` / `useProjectDetail(id)`**: Gerencia listagem filtrada e mutações de status (`useUpdateProjectStatus`) e financeiro (`useUpdateProjectFinancials`); ao alterar status, prazo ou valores, invalida automaticamente `['projects']`, `['clients', clientId]` e `['dashboard-summary']`.
- **`useTasks(projectId)`**: Gerencia adição, toggle de conclusão (`isCompleted`) e exclusão de tarefas no checklist, atualizando imediatamente o percentual de progresso do projeto e invalidando `['projects', projectId]` e `['dashboard-summary']`.

## Complexity Tracking

> Nenhuma violação à Constituição foi identificada. A arquitetura mantém apenas os módulos essenciais ao domínio, sem introduzir camadas de mensageria, cache externo ou abstrações desnecessárias (conformidade com o princípio YAGNI).

