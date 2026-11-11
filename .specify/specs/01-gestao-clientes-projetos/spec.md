# Feature Specification: Sistema de Gestão de Projetos (Serviços, Prazos e Fluxo de Caixa)

**Feature Branch**: `001-gestao-projetos-mvp`

**Created**: 2026-11-11

**Status**: Clarified

**Input**: User description: "O Sistema de Gestão de Projetos é uma plataforma enxuta para gerenciar serviços, prazos e fluxo de caixa em quatro áreas: Clientes (Cadastro de contatos rápidos WhatsApp/e-mail e histórico de serviços), Projetos (Controle de status: Proposta, Em Andamento, Pausado, Concluído, Cancelado), Prazos e Entregas (Monitoramento de prazos finais, alertas de atraso e checklist simples de tarefas para medir o progresso), Financeiro e Métricas (Registro de valor cobrado vs. valor pago, saldo a receber e painel inicial com totais financeiros e projetos urgentes)."

## Clarifications

### Session 2026-11-11

- Q: O valor pago de um projeto deve ser controlado como um campo acumulado único ou por meio de lançamentos individuais de parcelas/pagamentos? (FR-010) → A: Ambos (híbrido): o sistema permite tanto lançar pagamentos parciais/parcelas individuais (que somam no `valor pago`) quanto informar/ajustar diretamente o `valor pago` acumulado no projeto.
- Q: Os clientes e projetos cadastrados são compartilhados entre os usuários autenticados da mesma equipe ou cada usuário possui sua própria carteira isolada? (FR-001) → A: Carteira isolada por usuário (Option B): cada usuário autenticado visualiza e gerencia exclusivamente os seus próprios clientes, projetos e métricas financeiras.
- Q: Como o sistema deve agir quando o usuário tentar excluir um cliente que já possui projetos vinculados no histórico? (FR-001) → A: Bloqueio estrito de exclusão (Option A): clientes com projetos vinculados não podem ser excluídos diretamente, preservando o histórico de serviços e financeiro.
- Q: O usuário pode alterar o status de um projeto para `Concluído` mesmo que ainda existam tarefas pendentes no checklist? (FR-005) → A: Marcar tarefas automaticamente (Option B): ao alterar o status do projeto para `Concluído`, todas as tarefas existentes no checklist são marcadas automaticamente como concluídas (`100%`).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gestão de Clientes e Projetos com Controle de Status (Priority: P1)

Como prestador de serviços ou gestor, quero cadastrar clientes rapidamente com seus contatos (WhatsApp e e-mail) e vincular projetos a eles controlando o ciclo de vida pelo status (`Proposta`, `Em Andamento`, `Pausado`, `Concluído`, `Cancelado`), para organizar minha carteira de serviços e consultar o histórico completo de cada cliente.

**Why this priority**: Representa o núcleo estrutural da plataforma; sem o cadastro de clientes e o registro dos projetos/serviços com seus respectivos status, não é possível gerenciar prazos, tarefas nem valores financeiros.

**Independent Test**: Pode ser testado de ponta a ponta cadastrando um novo cliente com WhatsApp e e-mail, criando dois projetos vinculados a esse cliente, alterando o status dos projetos entre as cinco etapas permitidas e consultando a ficha do cliente para verificar seu histórico de serviços.

**Acceptance Scenarios**:

1. **Given** que o usuário está na área de Clientes, **When** preenche o nome, WhatsApp e e-mail válidos e salva o cadastro, **Then** o cliente passa a aparecer na listagem com atalhos rápidos de contato (link direto para WhatsApp e e-mail).
2. **Given** um cliente previamente cadastrado, **When** o usuário cria um novo projeto informando título, cliente vinculado, prazo final e valor cobrado sem especificar o status inicial, **Then** o sistema registra o projeto com status padrão `Proposta` e o associa ao histórico do cliente.
3. **Given** um projeto existente, **When** o usuário altera seu status para `Em Andamento`, `Pausado`, `Concluído` ou `Cancelado`, **Then** o sistema atualiza imediatamente o status e reflete a mudança tanto na listagem de projetos quanto no histórico de serviços do cliente.
4. **Given** um cliente com múltiplos serviços realizados ou em aberto, **When** o usuário acessa os detalhes desse cliente, **Then** o sistema exibe todo o histórico de projetos daquele cliente com seus respectivos status, prazos e valores.

---

### User Story 2 - Prazos, Alertas de Atraso e Checklist de Entregas (Priority: P2)

Como gestor de projetos, quero definir o prazo final de cada projeto, acompanhar alertas automáticos de atraso ou proximidade de vencimento e gerenciar um checklist simples de tarefas dentro do projeto, para medir o percentual de progresso das entregas e evitar perda de prazos.

**Why this priority**: Garante a execução operacional dos serviços contratados, dando visibilidade clara do que precisa ser entregue e de quais projetos correm risco de atraso.

**Independent Test**: Pode ser testado adicionando itens ao checklist de um projeto, marcando parte deles como concluídos para validar o cálculo percentual de progresso e configurando datas de entrega no passado, nos próximos dias e no futuro para verificar os indicadores visuais de atraso e urgência.

**Acceptance Scenarios**:

1. **Given** um projeto com 4 tarefas cadastradas no checklist, **When** o usuário marca 2 tarefas como concluídas, **Then** o sistema atualiza automaticamente o progresso do projeto para `50%`.
2. **Given** um projeto com 100% das tarefas concluídas, **When** o usuário desmarca uma tarefa ou adiciona uma nova tarefa pendente, **Then** o percentual de progresso é recalculado imediatamente de forma proporcional.
3. **Given** um projeto com status `Em Andamento` ou `Pausado` cuja data de prazo final é anterior à data atual, **When** o usuário visualiza a lista ou os detalhes do projeto, **Then** o projeto é exibido com um alerta visual de **Em Atraso** e a quantidade de dias de atraso.
4. **Given** um projeto que estava em atraso, **When** seu status é alterado para `Concluído` ou `Cancelado`, **Then** o alerta de atraso deixa de ser exibido para esse projeto.

---

### User Story 3 - Controle Financeiro por Projeto (Priority: P3)

Como responsável pelo fluxo de caixa, quero registrar o valor cobrado e o valor efetivamente pago em cada projeto, visualizando automaticamente o saldo a receber, para saber exatamente quanto cada serviço já rendeu e quanto ainda falta receber de cada cliente.

**Why this priority**: Viabiliza o controle financeiro individual de cada serviço prestado, permitindo identificar inadimplências ou parcelas pendentes sem depender de planilhas externas.

**Independent Test**: Pode ser testado definindo o valor cobrado em um projeto, registrando pagamentos parciais e totais (atualizando o valor pago) e conferindo se o saldo a receber e a situação financeira do projeto são calculados corretamente.

**Acceptance Scenarios**:

1. **Given** um projeto com valor cobrado de `R$ 5.000,00` e valor pago de `R$ 2.000,00`, **When** o usuário visualiza o resumo financeiro do projeto, **Then** o sistema exibe o saldo a receber de `R$ 3.000,00` e indica pagamento parcial.
2. **Given** um projeto com saldo a receber em aberto, **When** o valor pago é atualizado para igualar o valor cobrado (`R$ 5.000,00`), **Then** o saldo a receber passa a ser `R$ 0,00` e o projeto é identificado financeiramente como quitado.
3. **Given** a edição financeira de um projeto, **When** o usuário tenta inserir um valor cobrado negativo ou um valor pago negativo, **Then** o sistema bloqueia a operação e exibe uma mensagem clara de validação.

---

### User Story 4 - Painel Inicial (Dashboard) de Métricas Financeiras e Projetos Urgentes (Priority: P4)

Como gestor, quero visualizar um painel inicial consolidado com os totais financeiros (total cobrado, total recebido e saldo total a receber) e a lista de projetos urgentes, para tomar decisões rápidas logo ao abrir o sistema.

**Why this priority**: Consolida os dados operacionais (P1/P2) e financeiros (P3) em uma visão executiva única para priorização diária do trabalho e acompanhamento da saúde do caixa.

**Independent Test**: Pode ser testado criando um conjunto conhecido de projetos em diferentes status, prazos e valores pagos, acessando o painel inicial e conferindo se os somatórios financeiros e a listagem de projetos urgentes correspondem exatamente às regras de negócio.

**Acceptance Scenarios**:

1. **Given** projetos ativos e concluídos cadastrados no sistema, **When** o usuário acessa o painel inicial, **Then** o sistema apresenta os cartões de métricas com a soma total cobrada, a soma total já paga e o saldo total a receber.
2. **Given** a existência de projetos com status `Em Andamento` ou `Pausado` que estão vencidos ou com prazo final nos próximos 7 dias corridos, **When** o usuário acessa o painel inicial, **Then** esses projetos são listados na seção **Projetos Urgentes**, ordenados do prazo mais crítico (mais atrasado/próximo) para o menos crítico.
3. **Given** um projeto listado como urgente no painel inicial, **When** o usuário altera seu status para `Concluído` ou `Cancelado`, **Then** o projeto é removido imediatamente da lista de projetos urgentes do painel.

---

### Edge Cases

- **Exclusão de cliente com projetos vinculados**: O sistema DEVE aplicar bloqueio estrito de exclusão para qualquer cliente que possua projetos registrados, exibindo mensagem clara ao usuário; apenas clientes sem projetos vinculados podem ser removidos.
- **Projeto sem itens no checklist**: Quando um projeto possuir `0` tarefas cadastradas no checklist, o progresso DEVE ser exibido como `0%` (sem erro de cálculo) com indicação de que nenhuma tarefa foi definida.
- **Valor pago superior ao valor cobrado**: O sistema DEVE impedir que o valor pago ultrapasse o valor cobrado sem que o usuário atualize primeiro o valor cobrado do projeto (evitando saldo a receber negativo).
- **Impacto de projetos `Cancelado` e `Proposta` nas métricas financeiras**:
  - Projetos com status `Cancelado` NÃO DEVEM somar seu saldo pendente no indicador de "Saldo a Receber" do painel inicial; apenas valores efetivamente já pagos antes do cancelamento (se houver) permanecem registrados no histórico.
  - Projetos ainda em status `Proposta` DEVEM ter seus valores exibidos separadamente (ou apenas após aprovação para `Em Andamento`) para não distorcer o saldo a receber de serviços já contratados.
- **Contatos de clientes em formatos variados**: O número de WhatsApp DEVE ser sanitizado (mantendo dígitos e código de país/DDD) para que o link de contato rápido funcione corretamente independentemente de o usuário digitar parênteses, espaços ou traços.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001 (Cadastro de Clientes e Isolamento por Usuário)**: O sistema DEVE permitir criar, listar, buscar, editar e remover clientes contendo nome (obrigatório), número de WhatsApp, endereço de e-mail e observações gerais, garantindo que cada usuário autenticado acesse e gerencie exclusivamente os clientes, projetos e métricas da sua própria carteira.
- **FR-002 (Contatos Rápidos)**: O sistema DEVE fornecer ações rápidas na interface do cliente para iniciar conversa via WhatsApp (`wa.me`) e enviar e-mail (`mailto:`) a partir dos contatos cadastrados.
- **FR-003 (Histórico de Serviços do Cliente)**: O sistema DEVE exibir no perfil de cada cliente a lista completa de projetos vinculados a ele, apresentando nome do projeto, status atual, prazo final, valor cobrado e saldo pendente.
- **FR-004 (Gestão de Projetos)**: O sistema DEVE permitir criar, listar, filtrar, editar e excluir projetos, exigindo título, cliente vinculado, status, prazo final estimado e valor cobrado.
- **FR-005 (Controle de Status de Projeto)**: O sistema DEVE restringir o status do projeto exclusivamente aos cinco estados definidos (`Proposta`, `Em Andamento`, `Pausado`, `Concluído` e `Cancelado`). Ao alterar o status de um projeto para `Concluído`, todas as tarefas existentes em seu checklist DEVEM ser marcadas automaticamente como concluídas (`100%`).
- **FR-006 (Monitoramento de Prazos e Atrasos)**: O sistema DEVE identificar e destacar visualmente como **Atrasado** todo projeto cujo prazo final seja anterior à data atual e cujo status seja `Em Andamento` ou `Pausado`.
- **FR-007 (Alertas de Urgência)**: O sistema DEVE classificar como **Urgente** qualquer projeto ativo (`Em Andamento` ou `Pausado`) que já esteja atrasado ou cujo prazo final vença dentro dos próximos 7 dias corridos.
- **FR-008 (Checklist de Tarefas)**: O sistema DEVE permitir adicionar, editar, marcar/desmarcar como concluída e remover tarefas simples em um checklist vinculado a cada projeto.
- **FR-009 (Cálculo de Progresso)**: O sistema DEVE calcular e exibir automaticamente o progresso percentual de cada projeto com base na proporção de tarefas concluídas sobre o total de tarefas do checklist (`tarefas concluídas / total de tarefas * 100`).
- **FR-010 (Registro Financeiro Híbrido por Projeto)**: O sistema DEVE permitir registrar o `valor cobrado` e controlar o `valor pago` de cada projeto tanto por meio de lançamentos individuais de pagamentos/parcelas (com valor, data e observação opcional, cuja soma atualiza o `valor pago`) quanto por edição direta do `valor pago` acumulado, com precisão de duas casas decimais, impedindo valores negativos ou que o `valor pago` exceda o `valor cobrado`.
- **FR-011 (Cálculo de Saldo a Receber)**: O sistema DEVE calcular automaticamente o `saldo a receber` de cada projeto (`valor cobrado - valor pago`).
- **FR-012 (Painel Inicial / Dashboard)**: O sistema DEVE disponibilizar uma visão inicial contendo:
  - Total cobrado (soma do valor cobrado de projetos contratados: `Em Andamento`, `Pausado` e `Concluído`);
  - Total recebido (soma do valor efetivamente pago);
  - Saldo total a receber (soma dos saldos pendentes de projetos contratados não cancelados);
  - Lista rápida de projetos urgentes e atrasados com link direto para o projeto;
  - Resumo quantitativo de projetos por status.

### Key Entities

- **Cliente (`Client`)**: Representa o contratante dos serviços. Atributos principais: identificador único, nome/razão social, telefone/WhatsApp, e-mail, observações, data de criação e relação `1:N` com Projetos.
- **Projeto (`Project`)**: Representa um serviço ou escopo contratado por um cliente. Atributos principais: identificador único, cliente vinculado, título, descrição, status (`Proposta`, `Em Andamento`, `Pausado`, `Concluído`, `Cancelado`), data de prazo final (`deadline`), valor cobrado (`chargedAmount`), valor pago (`paidAmount`), saldo a receber (derivado), progresso percentual (derivado), relação `1:N` com Tarefas do Checklist e relação `1:N` opcional com Lançamentos de Pagamento.
- **Pagamento / Parcela (`Payment`)**: Representa um recebimento parcial ou integral registrado em um projeto (quando o usuário opta por detalhar parcelas). Atributos principais: identificador único, projeto vinculado, valor recebido (`amount`), data do pagamento (`paidAt`) e observação/descrição opcional (`note`).
- **Tarefa do Checklist (`Task`)**: Representa uma entrega ou etapa simples dentro de um projeto. Atributos principais: identificador único, projeto vinculado, título da tarefa, indicador de conclusão (`isCompleted`), ordem/data de criação.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001 (Agilidade no Cadastro)**: O usuário consegue cadastrar um novo cliente e criar um projeto vinculado com prazo, valor cobrado e checklist inicial em menos de 2 minutos.
- **SC-002 (Visibilidade Imediata no Painel)**: Ao abrir o painel inicial, o usuário identifica em até 5 segundos o saldo total a receber e todos os projetos atrasados ou com entrega crítica na semana.
- **SC-003 (Precisão Financeira e de Progresso)**: 100% dos cálculos de saldo a receber (`valor cobrado - valor pago`) e de percentual de conclusão do checklist refletem instantaneamente qualquer alteração feita pelo usuário, sem divergências de arredondamento.
- **SC-004 (Acesso Rápido ao Cliente)**: O usuário consegue acessar o histórico completo de serviços de qualquer cliente e acionar seu contato via WhatsApp ou e-mail em no máximo 2 cliques a partir da listagem de clientes.

## Assumptions

- **Moeda Padrão**: Os valores financeiros são expressos em Reais (`BRL / R$`), com duas casas decimais.
- **Janela de Urgência Padrão**: Considera-se "projeto urgente" no painel inicial todo projeto com status `Em Andamento` ou `Pausado` que esteja com o prazo vencido ou cujo prazo final ocorra nos próximos 7 dias corridos.
- **Cálculo do Fluxo de Caixa Consolidado**: Projetos ainda em fase de `Proposta` representam oportunidades comerciais e não entram na soma de "Saldo a Receber" garantido até que mudem para `Em Andamento`; projetos `Cancelado` também não geram saldo a receber pendente.
- **Escopo de Uso Enxuto (Modelo Financeiro Híbrido e Contas Isoladas)**: O controle financeiro por projeto permite tanto a atualização direta dos campos consolidados (`valor cobrado` vs. `valor pago`) quanto o registro de parcelas individuais (`Payment`), com cálculo automático do `saldo a receber`. Novos usuários podem criar sua conta própria (`registro` e `login`) operando em carteira isolada.

