# Klozer Wapp

Backend de um CRM para atendimento e relacionamento com clientes pelo
WhatsApp. O projeto expõe uma API HTTP em Go para autenticação, conversas,
filas, Kanban, campanhas, automações e acompanhamento de atendimentos.

Esta documentação cobre somente o backend e os arquivos da raiz. A pasta
`web/` é o cliente web e não faz parte desta varredura.

## Tecnologias utilizadas

- **Go 1.27.3**: linguagem e runtime da aplicação.
- **Chi** (`go-chi/chi/v5`): roteamento HTTP e middlewares.
- **CORS** (`go-chi/cors`): configuração de acesso cross-origin.
- **JWT** (`go-chi/jwtauth/v5`): autenticação por token e autorização por
  perfil.
- **GORM** (`gorm.io/gorm`): ORM, consultas e migração automática.
- **SQLite** (`gorm.io/driver/sqlite` e `mattn/go-sqlite3`): persistência do
  CRM e armazenamento local das sessões.
- **Viper**: leitura de `.env`, variáveis de ambiente e valores padrão.
- **Google Wire**: injeção de dependências em tempo de compilação.
- **Whatsmeow**: conexão com o WhatsApp, recebimento de eventos, QR Code,
  envio de mensagens e presença.
- **Protocol Buffers**: representação das mensagens usadas pelo Whatsmeow.
- **Server-Sent Events (SSE)**: transmissão de eventos em tempo real para
  clientes conectados.
- **`log/slog`**: logs estruturados em JSON.
- **Make**: atalhos para build e execução em desenvolvimento.

## Arquitetura e responsabilidades

O backend segue uma separação em camadas:

```text
cmd/
  main.go              Entrada da aplicação e ciclo de vida do servidor
  wire.go              Configuração da injeção de dependências
  wire_gen.go          Código gerado pelo Google Wire

internal/
  config/              Configuração da aplicação
  delivery/http/       Router, handlers, middleware e respostas HTTP
  domain/              Entidades e contratos das regras de negócio
  infra/sse/           Broker de eventos Server-Sent Events
  infra/whatsapp/      Cliente, conexão e listener do WhatsApp
  repository/          Abstrações de persistência
  repository/sqlite/   Implementações dos repositórios com GORM/SQLite
  usecase/             Casos de uso e regras de negócio
```

### Fluxo de uma requisição

1. `cmd/main.go` carrega a configuração e inicializa logs.
2. O Google Wire monta router, handlers, casos de uso, repositórios e
   integrações.
3. O Chi aplica request ID, log, recuperação de panics, timeout e CORS.
4. As rotas autenticadas validam o JWT antes de chamar os handlers.
5. Os handlers delegam a operação aos casos de uso.
6. Os casos de uso acessam os repositórios e as gateways de infraestrutura.
7. As respostas são serializadas pelo pacote de resposta HTTP.

## Funcionalidades implementadas

- Login de usuários com JWT.
- Controle de acesso por perfil, incluindo rotas exclusivas para `ADMIN`.
- Suporte interno a usuários, além de contatos, tags e respostas rápidas.
- Quadro Kanban e movimentação de cards.
- Histórico e envio de mensagens.
- Filas de atendimento.
- Fluxos de automação e processamento de mensagens recebidas.
- Campanhas e execução de campanhas.
- Registro e histórico de chamadas.
- Relatório/dashboard.
- Gerenciamento da sessão do WhatsApp, status e QR Code.
- Canal SSE para atualizações da sessão em tempo real.
- Recebimento de mensagens do WhatsApp e encaminhamento para chat e fluxos.

O envio de mídia ainda não está implementado; o MVP suporta o envio de
mensagens de texto e presença de digitação.

## API

A API usa o prefixo `/v1/api`. O endpoint `/health` é público e retorna o
status do serviço.

| Grupo | Principais operações |
|---|---|
| `/auth` | Login |
| `/kanban` | Consultar quadro e mover cards |
| `/messages` | Histórico por contato e envio de mensagem |
| `/quick-replies` | Listar e criar respostas rápidas |
| `/tags` | Listar tags |
| `/flows` | Listar, criar, consultar e excluir fluxos |
| `/queues` | CRUD de filas |
| `/reports` | Dashboard |
| `/campaigns` | Listar, criar e executar campanhas |
| `/calls` | Registrar e consultar chamadas por telefone |
| `/sessions` | Status, stream SSE e operações administrativas da sessão |

Com exceção de `/health` e do login, os grupos são protegidos por JWT. O
grupo `/sessions` também exige a role `ADMIN`.

## Persistência e inicialização

Ao iniciar, o GORM:

- abre o banco configurado em `DB_PATH`;
- habilita WAL, foreign keys e timeout de espera do SQLite;
- executa `AutoMigrate` para as entidades do domínio;
- cria colunas padrão do Kanban quando o banco está vazio.

São utilizados dois arquivos SQLite por padrão:

- `crm.db`: dados do CRM;
- `wa_sessions.db`: armazenamento da sessão do WhatsApp pelo Whatsmeow.

## Configuração

As configurações podem ser definidas em um arquivo `.env` ou por variáveis de
ambiente. Os valores padrão são:

| Variável | Padrão | Finalidade |
|---|---:|---|
| `PORT` | `3000` | Porta do servidor HTTP |
| `JWT_SECRET` | `super-secret-key-change-me` | Segredo para assinar tokens |
| `DB_PATH` | `crm.db` | Caminho do banco do CRM |
| `MAX_USERS` | `3` | Limite configurado de usuários |
| `MAX_WHATSAPP` | `1` | Limite configurado de conexões WhatsApp |

`MAX_USERS` e `MAX_WHATSAPP` já fazem parte da configuração, mas ainda não são
aplicados por uma regra de negócio no código atual. Em ambientes reais,
substitua o segredo JWT padrão e não versione credenciais.

## Pré-requisitos

- Go 1.27.3 ou compatível com o `go.mod`;
- SQLite;
- ferramenta `make` (opcional);
- ambiente compatível com a dependência nativa `go-sqlite3`.

## Como executar

Na raiz do projeto:

```bash
# Baixar dependências
go mod download

# Executar em desenvolvimento
go run ./cmd

# Ou usar o atalho do Makefile
make dev
```

Para gerar um binário:

```bash
make build
./crm-api
```

Por padrão, a API fica disponível em `http://localhost:3000` e o health check
em `http://localhost:3000/health`.

## Validação

Execute os testes do backend com:

```bash
go test ./...
```

O repositório atualmente não possui arquivos de teste automatizados nos
pacotes Go; o comando valida a compilação de todos os pacotes.

## Observações

- O projeto é single-tenant no provider SQLite atual.
- As migrações são automáticas; não há diretório de migrations versionadas.
- A conexão do WhatsApp é feita pelo Whatsmeow, com sessão persistida em
  SQLite e autenticação inicial por QR Code.
- A licença do projeto ainda não está definida.
