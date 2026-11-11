<div align="center">

# Klozer Wapp

### CRM open source para atendimento, vendas e relacionamento pelo WhatsApp

Centralize conversas, organize sua operação comercial e acompanhe cada
atendimento em um único produto.

[![Go](https://img.shields.io/badge/Go-1.27+-00ADD8?style=for-the-badge&logo=go&logoColor=white)](https://go.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-local-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![Open Source](https://img.shields.io/badge/código-aberto-brightgreen?style=for-the-badge)](#-código-aberto)

</div>

---

## Sobre o produto

O **Klozer Wapp** é um CRM open source focado em operações que usam o
WhatsApp como principal canal de atendimento. Ele reúne a comunicação com
clientes e as rotinas da equipe em um só lugar, com uma API em Go e uma
interface web moderna em React.

Mais do que uma integração com WhatsApp, o Klozer foi pensado para ajudar sua
equipe a:

- 💬 atender clientes com histórico e contexto;
- 🗂️ distribuir conversas entre filas e responsáveis;
- 📌 acompanhar oportunidades e atendimentos em um quadro Kanban;
- ⚡ automatizar respostas e fluxos de atendimento;
- 📣 executar campanhas e acompanhar resultados;
- 📊 transformar a operação em indicadores para tomada de decisão.

## ✨ Funcionalidades

| Módulo | O que você pode fazer |
|---|---|
| 💬 **Conversas** | Consultar histórico, enviar mensagens e acompanhar interações. |
| 📱 **WhatsApp** | Conectar a sessão por QR Code, monitorar status e receber mensagens em tempo real. |
| 👥 **Contatos** | Organizar contatos, telefones, tags e informações do relacionamento. |
| 🗂️ **Filas** | Separar atendimentos por equipe, setor ou tipo de operação. |
| 📌 **Kanban** | Visualizar e mover cards para acompanhar o andamento dos atendimentos. |
| ⚡ **Respostas rápidas** | Criar mensagens prontas para agilizar o trabalho da equipe. |
| 🤖 **Automações** | Criar fluxos e processar mensagens recebidas conforme regras do negócio. |
| 📣 **Campanhas** | Criar e executar campanhas a partir da própria plataforma. |
| 📞 **Chamadas** | Registrar e consultar o histórico de chamadas por telefone. |
| 📊 **Relatórios** | Acompanhar métricas e a evolução da operação em um dashboard. |
| 🔐 **Acesso seguro** | Autenticação JWT e permissões por perfil de usuário. |

## 🧱 Como o Klozer é construído

```text
┌──────────────────────┐       ┌─────────────────────────────┐
│ React + Vite         │ ────▶ │ API HTTP em Go              │
│ Interface do CRM     │       │ Chi + casos de uso + JWT    │
└──────────────────────┘       └──────────────┬──────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
             SQLite / GORM              Whatsmeow                    SSE
             Dados do CRM               WhatsApp                    Tempo real
```

### Stack

- **Backend:** Go, Chi, GORM, SQLite e Google Wire.
- **Frontend:** React, TypeScript, Vite, Tailwind CSS e React Query.
- **WhatsApp:** Whatsmeow, com autenticação por QR Code e sessão persistida.
- **Tempo real:** Server-Sent Events (SSE).
- **Autenticação:** JWT, com autorização por perfil.

## 🚀 Começando

### Pré-requisitos

- Go 1.27.3 ou compatível com o `go.mod`;
- Node.js e pnpm para o frontend;
- SQLite e ambiente compatível com `go-sqlite3`;
- `make` (opcional).

### Executar a API

Na raiz do projeto:

```bash
go mod download
go run ./cmd
```

Ou use o Makefile:

```bash
make dev
```

A API ficará disponível em `http://localhost:3000`. O endpoint
`http://localhost:3000/health` pode ser usado para verificar o serviço.

### Executar o frontend

Em outro terminal:

```bash
cd web
pnpm install
pnpm dev
```

Para gerar o backend:

```bash
make build
./crm-api
```

## ⚙️ Configuração

As configurações podem ser definidas em um arquivo `.env` ou por variáveis de
ambiente:

| Variável | Padrão | Finalidade |
|---|---:|---|
| `PORT` | `3000` | Porta do servidor HTTP |
| `JWT_SECRET` | `super-secret-key-change-me` | Segredo usado para assinar tokens |
| `DB_PATH` | `crm.db` | Caminho do banco principal do CRM |


> ⚠️ Em produção, substitua o segredo JWT padrão e não versione credenciais.

O CRM usa `crm.db` para os dados da aplicação e `wa_sessions.db` para a sessão
do WhatsApp. As tabelas são criadas e atualizadas automaticamente pelo GORM.



## 🗺️ Próximos passos

O Klozer está em evolução e foi criado para crescer junto com a comunidade.
Algumas frentes naturais para as próximas versões incluem:

- envio e gerenciamento de mídias;
- evolução das automações e campanhas;
- indicadores mais completos para vendas e atendimento;
- experiência multiempresa e novas integrações;
- documentação da API e testes automatizados mais abrangentes.

## 🤝 Código aberto

Este é um projeto de código aberto: você pode estudar a implementação,
propor melhorias, abrir issues e enviar pull requests. Ideias, correções,
novos módulos e melhorias na experiência do produto são bem-vindos.

Antes de distribuir ou usar o projeto comercialmente, consulte a definição de
licença deste repositório. A licença formal ainda será adicionada.

Para validar o backend:

```bash
go test ./...
```

## 📁 Estrutura do projeto

```text
cmd/                  # Entrada da aplicação e injeção de dependências
internal/
  config/             # Configuração
  delivery/http/      # Router, handlers e middleware
  domain/             # Entidades e contratos do domínio
  infra/              # WhatsApp e eventos em tempo real
  repository/         # Persistência SQLite/GORM
  usecase/            # Regras de negócio
web/                  # Frontend React + Vite
```

---

<div align="center">

Feito para construir atendimentos melhores, com código aberto e colaboração.

</div>
