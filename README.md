# Klozer Wapp

CRM para gerenciamento de atendimentos e relacionamento com clientes pelo
WhatsApp, com back-end em Go e front-end em React Router Framework Mode.

> Projeto em fase inicial de estruturação.

## Visão geral

O sistema será desenvolvido para centralizar:

- Conversas e histórico de mensagens do WhatsApp;
- Contatos, empresas e informações dos clientes;
- Filas, equipes e responsáveis pelo atendimento;
- Tags, notas e tarefas de acompanhamento;
- Funil de vendas e indicadores de atendimento;
- Integração com a API oficial do WhatsApp Business.

## Stack planejada

### Back-end

- Go;
- API HTTP/REST;
- Banco de dados relacional;
- Webhooks para recebimento de eventos do WhatsApp;
- Autenticação e autorização por usuário e equipe.

### Front-end

- React;
- React Router Framework Mode;
- TypeScript;
- Interface responsiva para operação do CRM;
- Consumo da API do back-end.

## Estrutura esperada

```text
.
├── backend/          # API, regras de negócio e integrações em Go
├── frontend/         # Aplicação web em React Router
├── docs/              # Documentação técnica e de produto
├── .env.example      # Variáveis de ambiente de exemplo
├── .gitignore
└── README.md
```

## Pré-requisitos

- Go (versão definida no `go.mod`);
- Node.js LTS e npm, pnpm ou yarn;
- Banco de dados utilizado pelo ambiente;
- Conta e credenciais da API do WhatsApp Business para os testes de
  integração.

## Como começar

Quando os módulos forem inicializados, siga estes passos:

```bash
# Clonar o projeto
git clone <url-do-repositorio>
cd KlozerWapp

# Preparar as variáveis de ambiente
cp .env.example .env

# Iniciar o back-end
cd backend
go mod download
go run .

# Em outro terminal, iniciar o front-end
cd frontend
npm install
npm run dev
```

Os comandos podem mudar conforme a estrutura definitiva dos módulos.

## Configuração

Não versionar credenciais. Variáveis sensíveis devem ser definidas no arquivo
`.env`, criado a partir do `.env.example`.

Exemplos de configurações esperadas:

```env
APP_ENV=development
API_PORT=8080
DATABASE_URL=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
```

## Desenvolvimento

Antes de abrir um pull request:

```bash
# Back-end
go test ./...
gofmt -w .

# Front-end
npm run lint
npm run typecheck
npm run build
```

Execute apenas os comandos disponíveis nos respectivos `package.json` e
`Makefile` quando esses arquivos forem criados.

## Princípios do projeto

- Manter as regras de negócio no back-end;
- Validar e registrar eventos recebidos por webhook;
- Proteger tokens, senhas e dados pessoais;
- Usar migrations versionadas para alterações no banco;
- Cobrir fluxos críticos com testes automatizados;
- Manter a documentação atualizada junto com as mudanças.

## Licença

A licença ainda será definida.
