# Feature Specification: Remediação de Vulnerabilidades e Endurecimento Avançado (Security Remediation)

**Feature Branch**: `003-security-remediation`

**Created**: 2026-11-13

**Status**: Draft

**Input**: User description: "Estruturar especificação, plano técnico e checklist de tarefas para corrigir todos os pontos apontados no Diagnóstico de Segurança do sistema: exposição de credenciais padrão no frontend/seed, gestão de sessão e cache no logout/401, política de senhas e anti-enumeração por tempo, condição de corrida em mutações financeiras, validação estrita de datas e limites, proteção de infraestrutura em produção (Swagger, HTTPS, Trust Proxy, CSP), auditoria de falhas de segurança e higiene de dependências."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Proteção de Credenciais, Política Forte de Senhas e Anti-Enumeração por Tempo (Priority: P1)

Como operador e proprietário da plataforma, quero que a tela de autenticação e os scripts de inicialização nunca exponham ou aceitem credenciais padrão fracas em produção, e que novas senhas atendam critérios mínimos de robustez sem vazar a existência de contas por tempo de resposta, para impedir acessos não autorizados imediatos e ataques automatizados de adivinhação.

**Why this priority**: Credenciais pré-preenchidas no frontend ou criadas com senha previsível permitem invasão direta no sistema publicado, enquanto políticas fracas de senha facilitam comprometimento de contas recém-criadas.

**Independent Test**: Pode ser testado inspecionando o formulário de login inicializado (campos vazios), executando o script de carga inicial em modo de produção sem credenciais configuradas (recusa de execução), tentando cadastrar senhas fracas (rejeição) e medindo o comportamento de resposta em tentativas de login com e-mail inexistente vs. senha incorreta.

**Acceptance Scenarios**:

1. **Given** um usuário acessando a página de login da aplicação web, **When** a página é carregada, **Then** os campos de e-mail e senha iniciam completamente vazios, sem nenhuma credencial padrão pré-preenchida ou embutida no código-fonte de produção.
2. **Given** a execução do processo de carga inicial de dados (`seed`) em ambiente de produção sem senha administrativa forte fornecida por variável de ambiente, **When** o script é iniciado, **Then** a operação falha imediatamente antes de gravar qualquer credencial fraca no banco de dados.
3. **Given** um usuário tentando criar uma nova conta, **When** informa uma senha com menos de 8 caracteres, acima de 72 caracteres ou sem combinação mínima de letra maiúscula, minúscula e número, **Then** o sistema recusa o cadastro com mensagem clara dos critérios exigidos.
4. **Given** uma tentativa de login com um e-mail não cadastrado na base, **When** o sistema processa a verificação de credenciais, **Then** realiza uma verificação criptográfica equivalente em custo temporal antes de responder `401 Credenciais inválidas`, evitando distinção temporal entre e-mails existentes e inexistentes.

---

### User Story 2 - Isolamento de Sessão no Cliente, Expiração Segura e Limpeza Completa no Logout (Priority: P1)

Como usuário que compartilha eventualmente uma estação de trabalho ou utiliza o sistema em sessões sucessivas, quero que sessões tenham validade reduzida e que tanto o logout manual quanto a rejeição por credencial expirada/inválida (`401`) eliminem integralmente todos os dados em cache da sessão anterior, para impedir que um próximo usuário visualize informações financeiras ou de clientes de outra conta.

**Why this priority**: A persistência de cache em memória na aplicação SPA após o logout ou falha `401` pode expor dados financeiros sensíveis entre usuários na mesma aba, e tokens de 7 dias ampliam a janela de risco em caso de vazamento.

**Independent Test**: Pode ser testado autenticando um usuário, carregando dados do dashboard/projetos no cache da interface, acionando o logout (ou recebendo `401`) e verificando que tanto o armazenamento local quanto o cache de consultas foram zerados e que um token vencido bloqueia a renderização de rotas protegidas.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado com dados de projetos e valores em cache na aplicação web, **When** aciona o botão de saída (**Sair**) ou recebe uma resposta `401` da API, **Then** o sistema limpa imediatamente as chaves de sessão persistidas, zera integralmente o cache em memória de consultas e redireciona o usuário para a tela de login.
2. **Given** um armazenamento local contendo metadados de usuário corrompidos ou um token de sessão já expirado, **When** a aplicação inicializa ou tenta acessar uma rota protegida, **Then** o sistema descarta a sessão inválida de maneira resiliente (sem quebra de tela) e redireciona para o login.
3. **Given** a configuração padrão de emissão de novos tokens de sessão no ambiente padrão, **When** um novo token é emitido sem sobrescrita explícita de duração, **Then** sua validade máxima padrão é reduzida de 7 dias para uma janela operacional curta (8 horas).

---

### User Story 3 - Integridade Transacional Concorrente (Anti-TOCTOU) e Validação Estrita de Filtros e Limites (Priority: P1)

Como gestor financeiro dos meus projetos, quero que lançamentos simultâneos de parcelas, estornos ou conclusões de projetos mantenham consistência matemática exata no banco de dados e que consultas com datas malformadas ou grandes volumes de tarefas sejam contidas antes de sobrecarregar o servidor, para garantir integridade financeira e disponibilidade operacional.

**Why this priority**: Condições de corrida em pagamentos podem corromper o valor recebido/a receber de um projeto, e falhas de validação em parâmetros de data geram erros internos `500` sob entradas legítimas alternativas.

**Independent Test**: Pode ser testado enviando duas requisições concorrentes de pagamento parcial que juntas superariam o valor cobrado (confirmando que apenas uma é aceita ou o saldo permanece íntegro), enviando datas fora do padrão `YYYY-MM-DD` ou com início posterior ao fim no painel (confirmando erro `400`) e tentando criar tarefas acima do limite por projeto.

**Acceptance Scenarios**:

1. **Given** um projeto com saldo a receber limitado, **When** duas ou mais requisições concorrentes tentam registrar parcelas ou concluir/estornar valores simultaneamente, **Then** a leitura e a atualização do saldo ocorrem integralmente dentro de transação isolada, impedindo que o valor pago ultrapasse o valor cobrado ou que o saldo final fique inconsistente.
2. **Given** um usuário aplicando filtros de data no painel de resumo financeiro, **When** envia uma data em formato compacto inválido (ex.: `20261111`) ou informa uma data inicial posterior à data final, **Then** a API rejeita a solicitação com status `400 Bad Request` e mensagem explicativa, sem gerar erro interno `500`.
3. **Given** um projeto já com o limite máximo permitido de tarefas no checklist (ex.: 200 itens), **When** é feita tentativa de adicionar nova tarefa ou informar posição fora de faixa razoável, **Then** o sistema rejeita a criação com erro de validação `400`.

---

### User Story 4 - Blindagem de Infraestrutura em Produção, Auditoria de Eventos de Segurança e Higiene de Dependências (Priority: P2)

Como responsável pela operação e segurança da aplicação em produção, quero que a documentação da API fique restrita fora de produção, que o tráfego atrás de proxy reverso identifique corretamente o cliente real, que produção exija HTTPS para origens confiáveis, que falhas de autenticação/abuso gerem registros de auditoria e que dependências vulneráveis sejam corrigidas, para reduzir a superfície de ataque e permitir detecção de incidentes.

**Why this priority**: Em ambiente produtivo exposto à internet, a exposição do Swagger, a falta de suporte a proxy no rate limiting e a ausência de logs de tentativas `401`/`429` dificultam a defesa perimetral e a resposta a incidentes.

**Independent Test**: Pode ser testado iniciando a aplicação em modo `production` (validando ausência de `/api/docs` e recusa de `FRONTEND_URL` com `http://`), simulando cabeçalho `X-Forwarded-For` com `TRUST_PROXY=true`, disparando falhas `401`/`429` para conferir emissão de logs estruturados de aviso e executando auditoria de dependências sem alertas corrigíveis pendentes.

**Acceptance Scenarios**:

1. **Given** a aplicação executando com `NODE_ENV=production`, **When** um cliente solicita a rota de documentação interativa (`/api/docs`), **Then** a documentação não está montada/exposta publicamente.
2. **Given** a aplicação iniciando com `NODE_ENV=production`, **When** a variável `FRONTEND_URL` contém uma origem não segura (`http://`), **Then** a validação de ambiente recusa a inicialização (*crash-on-boot*).
3. **Given** a aplicação executando atrás de um proxy reverso confiável com `TRUST_PROXY=true`, **When** múltiplos usuários acessam endpoints limitados por taxa, **Then** o controle de taxa identifica o IP do cliente encaminhado pelo proxy confiável (1 salto) sem bloquear todos os usuários atrás do mesmo proxy.
4. **Given** requisições que resultam em negação de autenticação (`401`), acesso proibido (`403`) ou bloqueio por excesso de taxa (`429`), **When** o filtro global trata a exceção, **Then** registra um evento de auditoria seguro nos logs internos do servidor contendo método, rota, status e IP de origem, omitindo tokens, senhas e cabeçalhos sensíveis.
5. **Given** os manifestos e árvores de dependências do backend e frontend, **When** é realizada a verificação de segurança de pacotes em produção, **Then** dependências não utilizadas vulneráveis foram removidas e correções compatíveis de segurança foram aplicadas, além de o frontend conter meta política básica de segurança (`CSP` e `Referrer-Policy`).

---

### Edge Cases

- **Clique duplo ou replay paralelo em pagamento**: Mesmo que duas chamadas idênticas cheguem no mesmo milissegundo em `addPayment`, apenas o total válido dentro de `chargedAmount` pode ser consolidado, e a segunda chamada que excederia o cobrado deve falhar com `400`.
- **Token JWT adulterado ou expirado salvo manualmente no navegador**: A proteção de rota no cliente não deve confiar apenas na existência de texto na chave de token; deve verificar estrutura básica e expiração (`exp`) antes de montar o layout privado, limpando o cache se inválido.
- **Metadado `gestao_projetos_user` corrompido em `localStorage`**: O componente de cabeçalho deve capturar falhas de parsing JSON silenciosamente e limpar o dado inválido sem causar tela branca na aplicação.
- **Execução local com `http://localhost:5173` em desenvolvimento**: A exigência estrita de `https://` em `FRONTEND_URL` deve aplicar-se apenas quando `NODE_ENV === 'production'`, preservando o fluxo de desenvolvimento local via HTTP.
- **Atualização de dependências sem quebra de compatibilidade**: Correções via `npm audit fix` não devem introduzir regressões ou breaking changes não validados pela suíte de testes e compilação.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001 (Remoção de Credenciais Padrão do Bundle do Cliente)**: A interface de login (`LoginPage`) NÃO DEVE pré-preencher e-mail ou senha padrão no código enviado ao navegador em produção.
- **FR-002 (Seed Seguro por Ambiente)**: O script de carga inicial (`seed.ts`) DEVE ler credenciais de usuário inicial de variáveis de ambiente configuráveis e DEVE recusar execução em produção caso a senha esteja ausente ou possua menos de 8 caracteres.
- **FR-003 (Política Reforçada de Senhas e Limite Real do `bcrypt`)**: O registro de novas contas DEVE exigir senhas entre 8 e 72 caracteres contendo ao menos uma letra maiúscula, uma letra minúscula e um dígito numérico; o login também deve limitar a entrada de senha em 72 caracteres para alinhamento estrito ao limite criptográfico do `bcrypt`.
- **FR-004 (Mitigação de Canal Lateral Temporal no Login)**: O serviço de autenticação DEVE executar uma comparação criptográfica equivalente (`bcrypt.compare` contra hash dummy) quando o e-mail informado no login não for encontrado, equalizando o tempo de resposta antes de retornar `401`.
- **FR-005 (Expiração Padrão Reduzida e Limpeza Integral de Sessão no Cliente)**: A validade padrão do token JWT DEVE ser reduzida para `8h`; toda ação de logout manual, resposta `401` ou detecção de token inválido/expirado no cliente DEVE limpar o `localStorage` e invocar a limpeza completa do cache de consultas (`queryClient.clear()`), redirecionando o usuário para `/login` com tratamento seguro contra JSON corrompido.
- **FR-006 (Transações Atômicas Anti-TOCTOU em Operações Financeiras)**: As operações de lançamento de pagamento, estorno de pagamento, alteração de status para concluído, atualização geral e ajuste financeiro direto DEVEM executar a leitura do estado atual, validação de limites e escrita integralmente dentro da mesma transação de banco de dados.
- **FR-007 (Validação Estrita de Datas e Intervalos no Dashboard)**: Os parâmetros `startDate` e `endDate` do dashboard DEVEM aceitar estritamente o formato `YYYY-MM-DD`, rejeitar datas inválidas e retornar erro `400` quando a data inicial for posterior à data final.
- **FR-008 (Limites de Crescimento no Checklist de Tarefas)**: A criação de tarefas em projetos DEVE impor um limite máximo de tarefas por projeto (200) e limitar a faixa de `position` informada via DTO.
- **FR-009 (Restrição do Swagger em Produção e HTTPS Obrigatório em `FRONTEND_URL`)**: O endpoint `/api/docs` NÃO DEVE ser montado quando `NODE_ENV === 'production'`, e `FRONTEND_URL` DEVE exigir esquema `https://` quando `NODE_ENV === 'production'`.
- **FR-010 (Suporte Configurável a Proxy Reverso)**: O backend DEVE suportar a variável booleana opcional `TRUST_PROXY` (padrão `false`) para configurar `trust proxy` com `1` salto no Express quando operado atrás de proxy reverso confiável.
- **FR-011 (Auditoria de Eventos de Segurança nos Logs)**: O filtro global de exceções DEVE emitir registros de log estruturados de aviso (`warn`) para eventos HTTP `401`, `403` e `429` contendo método, caminho, status e IP, sem registrar tokens, senhas ou payloads confidenciais.
- **FR-012 (Higiene de Dependências e Meta Políticas no Frontend)**: Remover dependências vulneráveis não utilizadas no frontend (`zod`), aplicar atualizações corretivas compatíveis nas dependências do backend/frontend e adicionar meta tags defensivas (`Referrer-Policy` e `Content-Security-Policy`) em `frontend/index.html`.

### Key Entities

- **Sessão de Cliente Higienizada (`ClientSessionState`)**: Representação da sessão ativa no navegador composta pelo token JWT validado quanto à estrutura e expiração, metadados parseados com tolerância a falhas e ciclo atrelado ao cache de dados (`queryClient`) para limpeza mútua.
- **Evento de Auditoria de Segurança (`SecurityAuditEvent`)**: Registro interno gerado para acessos negados (`401`/`403`) ou bloqueios por abuso (`429`) contendo carimbo temporal, método HTTP, rota requisitada, status e endereço IP resolvido, estritamente livre de credenciais.
- **Janela Temporal Estrita (`StrictDateWindow`)**: Intervalo de datas validado no formato canônico `YYYY-MM-DD` com invariante garantida de ordem cronológica (`fromDate <= toDate`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001 (Zero Credenciais no Frontend)**: A tela de login inicializa 100% dos campos vazios e nenhuma senha padrão de acesso existe no bundle de produção do frontend.
- **SC-002 (Isolamento Total Pós-Logout)**: 100% das ações de logout ou respostas `401` limpam o armazenamento local e o cache em memória da SPA, impedindo vazamento de dados em troca de usuário na mesma sessão.
- **SC-003 (Consistência Financeira Sob Concorrência)**: Requisições concorrentes que tentem exceder o saldo cobrado não violam a invariante `paidAmount <= chargedAmount` dentro das transações do serviço.
- **SC-004 (Rejeição Limpa de Datas e Limites Inválidos)**: 100% das entradas de data fora de `YYYY-MM-DD` ou com `startDate > endDate` retornam `400 Bad Request` (zero `500` por `Invalid Date`).
- **SC-005 (Endurecimento de Produção e Logs de Segurança)**: Com `NODE_ENV=production`, `/api/docs` retorna `404`, `FRONTEND_URL` com `http://` falha na inicialização e 100% dos eventos `401`/`403`/`429` geram entrada de log de auditoria no servidor.
- **SC-006 (Redução Mensurável de Vulnerabilidades de Dependências)**: `zod` removido do frontend e vulnerabilidades corrigíveis sem breaking change resolvidas via `npm audit fix`, mantendo 100% das suítes de testes, lint e typecheck verdes em `backend/` e `frontend/`.

## Assumptions

- **Compatibilidade Sem Refresh Token**: Opta-se inicialmente por reduzir a expiração padrão do JWT para `8h` com limpeza completa do cliente e tratamento de `401`, preservando a arquitetura stateless sem introduzir tabela de refresh tokens nesta iteração (mantendo aderência ao princípio YAGNI da Constituição).
- **Proxy Reverso de 1 Salto**: Quando `TRUST_PROXY=true`, assume-se um único proxy reverso confiável à frente da aplicação (Nginx, Cloudflare, Render ou Railway).
- **CSP em Meta Tag**: A política de segurança de conteúdo no `frontend/index.html` deve permitir conexões `connect-src` compatíveis com a API local e ambientes configurados, sendo complementada futuramente pelos cabeçalhos HTTP do servidor estático/CDN em produção.

