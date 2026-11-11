<!--
Sync Impact Report:
- Version change: 1.0.0 → 1.1.0 (MINOR: adição da seção estrita de Diretrizes de Segurança e Hardening e expansão do Princípio IV)
- Modified principles:
  - IV. Contratos de API, Segurança e Controle de Acesso (NON-NEGOTIABLE) → Atualizado para refletir fail-fast de variáveis de ambiente, APP_GUARD global com @Public(), Helmet/CORS/Throttler e sanitização de erros 500/Prisma
- Added sections:
  - Diretrizes de Segurança e Hardening (NON-NEGOTIABLE)
- Removed sections: None
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (Constitution Check compatível)
  - ✅ .specify/templates/spec-template.md (Compatível)
  - ✅ .specify/templates/tasks-template.md (Compatível)
- Follow-up TODOs: None
-->

# Sistema de Gestão de Projetos Constitution

## Core Principles

### I. Arquitetura Modular e Separação de Responsabilidades (NestJS)
- O backend em NestJS DEVE ser estruturado em módulos de domínio coesos e independentes (ex.: `AuthModule`, `UsersModule`, `ProjectsModule`, `TasksModule`), respeitando limites claros de contexto.
- Controllers DEVEM atuar estritamente como camada de transporte HTTP (roteamento, extração de parâmetros e retorno de status), delegando toda lógica de negócio para Services ou Use Cases injetáveis.
- Toda entrada de dados na API DEVE ser validada e transformada utilizando DTOs com `class-validator` e `class-transformer`, com `ValidationPipe` global ativo (`whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`).

**Justificativa**: Garante baixo acoplamento, testabilidade isolada das regras de negócio e proteção nativa contra envio de propriedades não autorizadas (mass assignment).

### II. Integridade Relacional e Acesso a Dados Seguro (Prisma & PostgreSQL)
- O banco de dados PostgreSQL DEVE ter seu esquema gerenciado exclusivamente pelo Prisma ORM (`schema.prisma`) e evoluído por migrações versionadas (`prisma migrate`); alterações manuais diretas na estrutura do banco são proibidas.
- Camadas de apresentação (Controllers/Resolvers) NÃO DEVEM invocar o `PrismaService` diretamente; todo acesso a dados DEVE ser encapsulado nos Services de domínio ou em repositórios dedicados.
- Operações que alterem múltiplas tabelas de forma interdependente (ex.: criação de projeto com alocação inicial de membros ou reordenação de tarefas em quadro Kanban) DEVEM ser executadas em transações atômicas (`prisma.$transaction`).
- Consultas de listagem DEVEM implementar paginação e seleção explícita de campos (`select` ou DTO de saída) para evitar problemas de consulta `N+1` e impedir o vazamento de colunas sensíveis (como hashes de senha).

**Justificativa**: Assegura consistência transacional, rastreabilidade completa da evolução do banco relacional e desempenho previsível sob carga.

### III. Componentização, Tipagem Estrita e Estado Previsível (Vite & React)
- A aplicação frontend em Vite + React DEVE utilizar TypeScript com verificação estrita (`strict: true`); o uso de `any` é proibido, salvo quando tecnicamente inevitável e devidamente justificado em comentário.
- A organização do frontend DEVE separar claramente componentes de UI reutilizáveis (apresentacionais), módulos de funcionalidades (`features`/`pages`), hooks customizados de lógica e camada de serviços HTTP de comunicação com a API.
- O gerenciamento de estado assíncrono vindo do servidor (cache, loading, revalidação) DEVE ser mantido separado do estado local de interface, e formulários DEVEM validar entradas no cliente antes do envio à API.

**Justificativa**: Reduz erros em tempo de execução, promove reuso de interface e garante uma experiência de usuário responsiva e consistente no acompanhamento de projetos e tarefas.

### IV. Contratos de API, Segurança e Controle de Acesso (NON-NEGOTIABLE)
- A comunicação entre frontend e backend DEVE ocorrer via contratos RESTful padronizados, documentados com OpenAPI/Swagger (`@nestjs/swagger`) e protegidos por um filtro global de exceções que retorne respostas de erro estruturadas, sem jamás expor detalhes internos de infraestrutura ou banco de dados.
- A autenticação JWT DEVE ser aplicada globalmente por padrão (`APP_GUARD`), exigindo liberação explícita via decorator `@Public()` apenas para rotas intencionalmente abertas, combinada ao isolamento estrito de recursos por usuário/carteira.
- Segredos, chaves JWT (`JWT_SECRET`) e credenciais de banco (`DATABASE_URL`) DEVEM ser validados na inicialização com falha imediata (*crash-on-boot*) caso ausentes ou fracos, sendo proibido o uso de valores *default* (*fallback*) hardcoded no código-fonte ou o versionamento de arquivos `.env` reais.

**Justificativa**: Em um sistema de gestão de projetos e fluxo de caixa, o endurecimento (*hardening*) da superfície de ataque, o isolamento de dados e a impossibilidade de subir a aplicação com segredos fracos são requisitos inegociáveis.

### V. Testes Automatizados e Observabilidade
- Regras de negócio críticas nos Services do NestJS DEVEM possuir testes unitários automatizados (com mocks para dependências externas), e fluxos essenciais da API (autenticação, gestão de projetos e transição de status de tarefas) DEVEM contar com testes de integração/E2E utilizando banco de dados de teste isolado.
- Componentes interativos críticos e fluxos principais no React DEVEM possuir testes automatizados focados no comportamento visível ao usuário.
- O backend DEVE emitir logs estruturados contendo contexto da operação (método, rota, código HTTP, duração e identificador de erro), omitindo credenciais, tokens ou dados pessoais sensíveis.

**Justificativa**: Previne regressões em regras críticas de prazos, permissões e fluxo de trabalho, além de permitir diagnóstico rápido de incidentes em desenvolvimento e produção.

## Diretrizes de Segurança e Hardening (NON-NEGOTIABLE)

1. **Validação Estrita de Variáveis de Ambiente (*Crash-on-Boot*)**:
   - Variáveis de ambiente críticas (`JWT_SECRET`, `DATABASE_URL`) DEVEM ser validadas obrigatoriamente durante a inicialização da aplicação (`ConfigModule.forRoot({ validate })`).
   - A aplicação DEVE abortar imediatamente sua inicialização (*crash-on-boot*) caso qualquer variável obrigatória esteja ausente, vazia ou abaixo dos critérios mínimos de entropia/tamanho (ex.: `JWT_SECRET` com menos de 32 caracteres).
   - É terminantemente PROIBIDO definir valores *default* (*fallback* em código, como `config.get('JWT_SECRET', 'default-secret')`) para variáveis sensíveis.
2. **Autenticação Global por Padrão (`APP_GUARD` + `@Public()`)**:
   - O `JwtAuthGuard` DEVE ser registrado globalmente no módulo raiz via provider `APP_GUARD`, garantindo que todo novo endpoint nasça protegido por padrão (*secure-by-default*).
   - Rotas públicas (como `POST /auth/login` e `POST /auth/register`) DEVEM ser marcadas explicitamente com o decorator customizado `@Public()` (via metadado `IS_PUBLIC_KEY` inspecionado pelo `Reflector` no `JwtAuthGuard`).
3. **Proteção de Perímetro HTTP (`helmet`, CORS Restrito e Rate Limiting)**:
   - O backend DEVE aplicar cabeçalhos HTTP de segurança utilizando o middleware `helmet` na inicialização (`main.ts`).
   - O CORS DEVE ser configurado de forma restrita via variável de ambiente (`CORS_ORIGIN` / `FRONTEND_URL`), sendo proibido o uso de origem curinga irrestrita (`*`) em produção.
   - A aplicação DEVE configurar limitação de taxa (*rate limiting*) com `@nestjs/throttler` (`ThrottlerModule` e `ThrottlerGuard`), aplicando limites estritos nas rotas públicas de autenticação para mitigar ataques de força bruta e enumeração.
4. **Sanitização de Exceções e Ocultação de Erros Internos (`500` e Prisma)**:
   - O filtro global de exceções (`AllExceptionsFilter`) NUNCA DEVE repassar ao cliente mensagens brutas de erros `500 Internal Server Error`, *stack traces*, códigos internos ou exceções do Prisma ORM (`PrismaClientKnownRequestError`, `PrismaClientValidationError`, nomes de tabelas/constraints ou trechos de SQL).
   - Detalhes técnicos de falhas não tratadas ou de banco de dados DEVEM ser registrados apenas nos logs internos do servidor, retornando ao cliente exclusivamente uma mensagem genérica e segura (ex.: `"Erro interno no servidor"`).

## Stack Tecnológica e Restrições Arquiteturais

- **Linguagem Padrão**: TypeScript (`strict: true`) em toda a stack (Backend e Frontend).
- **Backend**: NestJS sobre Node.js LTS, arquitetura modular, validação via `class-validator`/`class-transformer`, segurança de perímetro com `helmet` e `@nestjs/throttler`, e documentação via `@nestjs/swagger`.
- **Persistência**: PostgreSQL como banco de dados relacional principal e Prisma ORM para modelagem, tipagem e migrações.
- **Frontend**: React construído com Vite, roteamento declarativo e consumo tipado da API REST.
- **Padronização de Código**: ESLint e Prettier DEVEM estar configurados em ambos os projetos para impor formatação e regras estáticas de código de forma uniforme.
- **Simplicidade (YAGNI)**: Novas dependências externas, filas de mensageria ou camadas de cache distribuído SÓ DEVEM ser introduzidas quando houver requisito concreto documentado na especificação da funcionalidade.

## Fluxo de Desenvolvimento e Portões de Qualidade

1. **Desenvolvimento Orientado a Especificação**: Toda nova funcionalidade DEVE partir de uma especificação clara (contratos de API, modelo de dados no Prisma e critérios de aceite) antes da implementação.
2. **Migrações Seguras**: Qualquer alteração em `schema.prisma` DEVE vir acompanhada de sua respectiva migration gerada e testada localmente antes de abrir revisão.
3. **Portões de Qualidade (Quality Gates)**: Nenhuma alteração pode ser mesclada à branch principal sem:
   - Compilação TypeScript sem erros (`tsc --noEmit` / build limpo no backend e frontend);
   - Execução sem falhas do linter (`eslint`) e dos testes automatizados;
   - Revisão de conformidade com os princípios e diretrizes de Segurança e Hardening desta Constituição.

## Governance

- Esta Constituição é a referência arquitetural suprema do projeto e prevalece sobre práticas informais ou decisões isoladas de implementação.
- Qualquer proposta de emenda a este documento DEVE incluir justificativa técnica, avaliação de impacto nos templates/módulos existentes e atualização da versão segundo o Versionamento Semântico (`MAJOR.MINOR.PATCH`):
  - **MAJOR**: Remoção ou redefinição incompatível de princípios arquiteturais ou mudança na stack principal.
  - **MINOR**: Adição de novo princípio, seção arquitetural ou expansão relevante de regras obrigatórias.
  - **PATCH**: Ajustes de redação, correções gramaticais ou esclarecimentos sem alteração de regra.
- Todas as especificações (`spec.md`), planos de implementação (`plan.md`), listas de tarefas (`tasks.md`) e revisões de código (Pull Requests) DEVEM verificar explicitamente a conformidade com os princípios aqui estabelecidos.

**Version**: 1.1.0 | **Ratified**: 2026-11-11 | **Last Amended**: 2026-11-11
