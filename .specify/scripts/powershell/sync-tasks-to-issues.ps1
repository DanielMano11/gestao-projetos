<#
.SYNOPSIS
    Sincroniza as tarefas de .specify/specs/01-gestao-clientes-projetos/tasks.md como Issues no GitHub (DanielMano11/gestao-projetos).
.DESCRIPTION
    Suporta publicação via GitHub CLI (`gh`) ou via API REST do GitHub (`$env:GITHUB_TOKEN`).
    Use -DryRun para apenas visualizar as issues que serão criadas.
#>
param(
    [string]$Repo = "DanielMano11/gestao-projetos",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$issues = @(
    @{
        Title  = "[Phase 1: Setup] Inicialização Full-Stack (NestJS + Vite/React + Linters)"
        Labels = @("enhancement")
        Body   = @'
## Objetivo
Inicializar a estrutura de diretórios `backend/` (NestJS) e `frontend/` (Vite + React) com TypeScript em modo estrito (`strict: true`), padronização ESLint/Prettier e variáveis de ambiente.

## Tarefas (`tasks.md`)
- [ ] **T001**: Criar estrutura de diretórios raiz `backend/` e `frontend/` conforme definido em `.specify/specs/01-gestao-clientes-projetos/plan.md`
- [ ] **T002**: Inicializar projeto NestJS com TypeScript (`strict: true`) e dependências principais em `backend/package.json`
- [ ] **T003** `[P]`: Inicializar projeto Vite + React + TypeScript (`strict: true`) em `frontend/package.json`
- [ ] **T004** `[P]`: Configurar ESLint e Prettier em `backend/.eslintrc.js` e `frontend/.eslintrc.cjs`
- [ ] **T005** `[P]`: Criar `.env.example` em `backend/.env.example` e `frontend/.env.example`
'@
    },
    @{
        Title  = "[Phase 2: Foundational] Banco de Dados (Prisma/PostgreSQL), Autenticação JWT e Layout Base"
        Labels = @("enhancement")
        Body   = @'
## Objetivo
Construir a fundação técnica bloqueante do sistema: modelagem Prisma com isolamento por usuário (`userId`), migração inicial no PostgreSQL, autenticação JWT (`register`, `login`, `me`), tratamento global de erros/logs e estrutura visual base no React.

## Tarefas (`tasks.md`)
- [ ] **T006**: Definir schema completo do banco (`User`, `Client` com `userId`, `Project`, `Payment`, `Task` e enum `ProjectStatus`) em `backend/prisma/schema.prisma`
- [ ] **T007**: Executar migração inicial do PostgreSQL (`prisma migrate dev --name init`)
- [ ] **T008**: Implementar `PrismaService` e `PrismaModule` global em `backend/src/prisma/`
- [ ] **T009** `[P]`: Configurar `ValidationPipe` global, CORS e Swagger (`/api/docs`) em `backend/src/main.ts`
- [ ] **T010** `[P]`: Implementar filtro global de exceções e interceptor de logs em `backend/src/common/`
- [ ] **T011** `[P]`: Implementar DTO base de paginação em `backend/src/common/dto/pagination-query.dto.ts`
- [ ] **T012**: Implementar módulo de autenticação JWT (`POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `JwtAuthGuard`) em `backend/src/auth/`
- [ ] **T013** `[P]`: Criar script de seed inicial em `backend/prisma/seed.ts`
- [ ] **T014** `[P]`: Configurar cliente HTTP Axios em `frontend/src/services/api.ts`
- [ ] **T015** `[P]`: Criar `AppLayout`, `LoginPage` e rotas protegidas em `frontend/src/`
- [ ] **T016** `[P]`: Criar componentes base (`Modal`, `CurrencyDisplay`, `StatusBadge`) em `frontend/src/components/ui/`
'@
    },
    @{
        Title  = "[US1 - P1 MVP] Gestão de Clientes, Contatos Rápidos e Projetos com Controle de Status"
        Labels = @("enhancement")
        Body   = @'
## Objetivo (`US1` — Prioridade P1 / MVP)
Permitir o cadastro rápido de clientes (isolados por `userId`) com atalhos diretos de contato (WhatsApp/e-mail), consulta ao histórico completo de serviços do cliente, bloqueio estrito de exclusão de clientes com projetos vinculados (`409 Conflict`) e gestão de projetos com os 5 status (`Proposta`, `Em Andamento`, `Pausado`, `Concluído`, `Cancelado`).

## Tarefas (`tasks.md`)
- [ ] **T017** `[P] [US1]`: Testes unitários do `ClientsService` em `backend/src/clients/clients.service.spec.ts`
- [ ] **T018** `[P] [US1]`: Testes E2E de Clientes e Projetos em `backend/test/clients.e2e-spec.ts` e `backend/test/projects.e2e-spec.ts`
- [ ] **T019** `[P] [US1]`: Criar DTOs de Clientes em `backend/src/clients/dto/`
- [ ] **T020** `[US1]`: Implementar `ClientsService` filtrando por `userId` em `backend/src/clients/clients.service.ts`
- [ ] **T021** `[US1]`: Implementar `ClientsController` em `backend/src/clients/clients.controller.ts`
- [ ] **T022** `[P] [US1]`: Criar DTOs de Projetos em `backend/src/projects/dto/`
- [ ] **T023** `[US1]`: Implementar `ProjectsService` (incluindo auto-conclusão de tarefas ao mudar para `COMPLETED`) em `backend/src/projects/projects.service.ts`
- [ ] **T024** `[US1]`: Implementar `ProjectsController` em `backend/src/projects/projects.controller.ts`
- [ ] **T025** `[P] [US1]`: Definir tipos `Client` e `Project` em `frontend/src/types/`
- [ ] **T026** `[P] [US1]`: Implementar serviços HTTP em `frontend/src/services/clients.service.ts` e `projects.service.ts`
- [ ] **T027** `[P] [US1]`: Criar hooks `useClients` e `useProjects` em `frontend/src/hooks/`
- [ ] **T028** `[P] [US1]`: Implementar `QuickContactActions` em `frontend/src/components/ui/QuickContactActions.tsx`
- [ ] **T029** `[US1]`: Implementar componentes e páginas de Clientes (`ClientsPage`, `ClientDetailPage`)
- [ ] **T030** `[US1]`: Implementar componentes e página de Projetos (`ProjectsPage`)
'@
    },
    @{
        Title  = "[US2 - P2] Prazos, Alertas de Atraso e Checklist de Entregas"
        Labels = @("enhancement")
        Body   = @'
## Objetivo (`US2` — Prioridade P2)
Monitorar prazos finais de entrega, sinalizar projetos atrasados (`isOverdue`) ou urgentes (`isUrgent <= 7 dias`) e gerenciar o checklist simples de tarefas por projeto com cálculo automático de progresso (`0%` a `100%`).

## Tarefas (`tasks.md`)
- [ ] **T031** `[P] [US2]`: Testes unitários de `progressPercentage`, auto-conclusão e `isOverdue`/`isUrgent` em `backend/src/tasks/tasks.service.spec.ts`
- [ ] **T032** `[P] [US2]`: Criar DTOs de tarefas em `backend/src/tasks/dto/`
- [ ] **T033** `[US2]`: Implementar `TasksService` em `backend/src/tasks/tasks.service.ts`
- [ ] **T034** `[US2]`: Implementar `TasksController` em `backend/src/tasks/tasks.controller.ts`
- [ ] **T035** `[US2]`: Enriquecer `ProjectsService` com `progressPercentage`, `isOverdue` e `isUrgent`
- [ ] **T036** `[P] [US2]`: Criar tipos, serviço HTTP e hook `useTasks` em `frontend/src/`
- [ ] **T037** `[P] [US2]`: Implementar `DeadlineAlertBadge` e `ProgressBar` em `frontend/src/components/ui/`
- [ ] **T038** `[US2]`: Implementar `ProjectChecklistPanel` e integrar em `frontend/src/pages/ProjectDetailPage.tsx`
'@
    },
    @{
        Title  = "[US3 - P3] Controle Financeiro Híbrido por Projeto (Acumulado e Parcelas)"
        Labels = @("enhancement")
        Body   = @'
## Objetivo (`US3` — Prioridade P3)
Controlar o `valor cobrado` e o `valor pago` de cada projeto tanto por edição direta do acumulado quanto por lançamento/estorno de parcelas individuais (`Payment`), calculando automaticamente o `saldo a receber` e o status financeiro.

## Tarefas (`tasks.md`)
- [ ] **T039** `[P] [US3]`: Testes unitários das regras financeiras híbridas em `backend/src/projects/projects-financial.spec.ts`
- [ ] **T040** `[P] [US3]`: Criar `UpdateProjectFinancialsDto` e `CreatePaymentDto` em `backend/src/projects/dto/`
- [ ] **T041** `[US3]`: Implementar `PATCH /projects/:id/financials`, `POST /projects/:id/payments` e `DELETE /payments/:id` em `backend/src/projects/`
- [ ] **T042** `[US3]`: Implementar `ProjectFinancialCard` e integrar em `frontend/src/pages/ProjectDetailPage.tsx`
'@
    },
    @{
        Title  = "[US4 - P4] Painel Inicial (Dashboard) de Métricas Financeiras e Projetos Urgentes"
        Labels = @("enhancement")
        Body   = @'
## Objetivo (`US4` — Prioridade P4)
Consolidar em um painel inicial executivo os totais financeiros da carteira do usuário (`totalCharged`, `totalPaid`, `totalReceivable`, `proposalsTotalValue`), a contagem de projetos por status e a lista priorizada de projetos urgentes/em atraso.

## Tarefas (`tasks.md`)
- [ ] **T043** `[P] [US4]`: Testes unitários e E2E do `DashboardService` em `backend/src/dashboard/dashboard.service.spec.ts` e `backend/test/dashboard.e2e-spec.ts`
- [ ] **T044** `[P] [US4]`: Criar `DashboardSummaryDto` em `backend/src/dashboard/dto/dashboard-summary.dto.ts`
- [ ] **T045** `[US4]`: Implementar `DashboardService` filtrado por `userId` em `backend/src/dashboard/dashboard.service.ts`
- [ ] **T046** `[US4]`: Implementar `DashboardController` (`GET /api/v1/dashboard/summary`) em `backend/src/dashboard/dashboard.controller.ts`
- [ ] **T047** `[P] [US4]`: Criar tipos, serviço HTTP e hook `useDashboard` em `frontend/src/`
- [ ] **T048** `[US4]`: Implementar `FinancialSummaryCards`, `UrgentProjectsList`, `ProjectsByStatusChart` e `DashboardPage`
'@
    },
    @{
        Title  = "[Phase 7: Polish] UX, Testes de Componentes React e Portões de Qualidade"
        Labels = @("enhancement")
        Body   = @'
## Objetivo
Refinar estados visuais, responsividade, cobrir componentes críticos no React com Vitest + React Testing Library e validar todos os Quality Gates da Constituição.

## Tarefas (`tasks.md`)
- [ ] **T049** `[P]`: Adicionar `Skeleton`/`Spinner`, `EmptyState` e `Toast` em `frontend/src/components/ui/`
- [ ] **T050** `[P]`: Revisar responsividade mobile/desktop e acessibilidade em `frontend/src/pages/`
- [ ] **T051** `[P]`: Criar testes automatizados de componentes React em `frontend/tests/`
- [ ] **T052**: Executar verificação completa dos Portões de Qualidade da Constituição (`tsc --noEmit`, `eslint` e testes)
'@
    }
)

if ($DryRun) {
    Write-Host "=== DRY RUN: $($issues.Count) Issues preparadas para $Repo ===" -ForegroundColor Cyan
    foreach ($issue in $issues) {
        Write-Host "- $($issue.Title)" -ForegroundColor Green
    }
    exit 0
}

$ghCmd = Get-Command gh -ErrorAction SilentlyContinue
if ($ghCmd) {
    foreach ($issue in $issues) {
        Write-Host "Criando issue via GitHub CLI: $($issue.Title)..." -ForegroundColor Cyan
        gh issue create --repo $Repo --title $issue.Title --body $issue.Body
    }
} elseif ($env:GITHUB_TOKEN) {
    $headers = @{
        Authorization          = "Bearer $($env:GITHUB_TOKEN)"
        Accept                 = "application/vnd.github+json"
        "X-GitHub-Api-Version" = "2022-11-28"
    }
    foreach ($issue in $issues) {
        Write-Host "Criando issue via GitHub REST API: $($issue.Title)..." -ForegroundColor Cyan
        $payload = @{
            title  = $issue.Title
            body   = $issue.Body
            labels = $issue.Labels
        } | ConvertTo-Json -Depth 4
        $res = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/issues" -Method Post -Headers $headers -Body ([System.Text.Encoding]::UTF8.GetBytes($payload)) -ContentType "application/json; charset=utf-8"
        Write-Host "  -> Criada: $($res.html_url)" -ForegroundColor Green
    }
} else {
    Write-Warning "GitHub CLI ('gh') não encontrado no PATH e variável `$env:GITHUB_TOKEN não definida."
    Write-Host "Para publicar automaticamente no GitHub ($Repo), escolha uma das opções:" -ForegroundColor Yellow
    Write-Host "  1. Defina seu token: `$env:GITHUB_TOKEN = 'ghp_...' e execute novamente este script"
    Write-Host "  2. Ou instale o GitHub CLI: winget install --id GitHub.cli && gh auth login"
}
