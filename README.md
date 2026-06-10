# news-top-10

Pipeline automatizado que coleta as **top 10 notícias do dia** de fontes RSS brasileiras e internacionais, rankeia por relevância e envia um resumo via **WhatsApp** (Twilio).

## Como funciona

```
Cron Job (configurável)
    └── CollectorService    → busca artigos de 8 feeds RSS em paralelo
    └── RankingService      → pontua e seleciona top 10 (mín. 2 por categoria)
    └── SummaryService      → formata mensagem e persiste no banco
    └── WhatsappService     → envia via Twilio (ou exibe no console em dry-run)
```

### Algoritmo de ranking

Cada artigo recebe um score de 0 a 1 composto por:

| Peso | Dimensão                                                      |
| ---- | ------------------------------------------------------------- |
| 0.4  | Recência (decai linearmente em 24h)                           |
| 0.3  | Keywords relevantes por categoria                             |
| 0.2  | Peso da fonte (Folha > BBC > InfoMoney > G1 > Agência Brasil) |
| 0.1  | Engajamento estimado (tamanho da descrição)                   |

Garante **mínimo de 2 artigos por categoria** (economia, negócios, política) antes de preencher os slots restantes pelo score geral.

### Fontes RSS

| Fonte                   | Categoria |
| ----------------------- | --------- |
| G1 Economia             | Economia  |
| Folha Mercado           | Economia  |
| Agência Brasil Economia | Economia  |
| InfoMoney               | Negócios  |
| BBC Business            | Negócios  |
| G1 Política             | Política  |
| Folha Poder             | Política  |
| Agência Brasil Política | Política  |

## Stack

- **NestJS 11** + TypeScript
- **Prisma 7** + PostgreSQL (Supabase)
- **Twilio** — envio de WhatsApp
- **rss-parser** — leitura dos feeds
- **@nestjs/schedule** — cron job

## Pré-requisitos

- Node.js 18+
- PostgreSQL (recomendado: [Supabase](https://supabase.com) — plano gratuito)
- Conta Twilio com WhatsApp Sandbox ativado

## Instalação

```bash
npm install
```

## Configuração

Copie o `.env.example` e preencha as variáveis:

```bash
cp .env.example .env
```

```env
# Banco de dados (Supabase)
DATABASE_URL="postgresql://USER:PASSWORD@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@host:5432/postgres"

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="seu_auth_token"
TWILIO_WHATSAPP_FROM="+14155238886"
WHATSAPP_RECIPIENT="5511999999999"

# Agendamento (cron expression)
CRON_SCHEDULE="0 7 * * *"   # todo dia às 7h

# App
NODE_ENV="development"
PORT=3000
```

> **Dry-run:** se as credenciais do Twilio não estiverem configuradas, a mensagem é exibida no console em vez de ser enviada.

## Banco de dados

```bash
# Criar as tabelas (primeira vez)
npx prisma migrate dev --name init

# Regenerar o client após mudanças no schema
npx prisma generate
```

## Executando

```bash
# Desenvolvimento (hot reload)
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## Configurando o Twilio WhatsApp Sandbox

1. Crie conta em [twilio.com/console](https://console.twilio.com)
2. Acesse **Messaging → Try it out → Send a WhatsApp message**
3. Envie `join <palavra>` para `+1 415 523 8886` pelo seu WhatsApp
4. Copie `Account SID` e `Auth Token` do painel para o `.env`

## Estrutura do projeto

```
src/
├── config/                  # Configurações tipadas (app, whatsapp)
├── prisma/                  # PrismaService (global)
├── generated/prisma/        # Client gerado automaticamente (não editar)
└── modules/
    ├── collector/           # Busca artigos via RSS
    │   ├── sources/         # BaseSource, RssSource
    │   └── interfaces/      # RawNewsItem, NewsCategory
    ├── ranking/             # Scoring e seleção top 10
    │   └── interfaces/      # ScoredNewsItem
    ├── summary/             # Formata e persiste o resumo diário
    ├── notifier/            # Envio via Twilio WhatsApp
    └── scheduler/           # Orquestra o pipeline via cron

prisma/
├── schema.prisma            # Modelos: NewsArticle, DailySummary, NotificationLog
└── migrations/              # Histórico de migrações
```

## Modelos do banco

| Tabela              | Descrição                                 |
| ------------------- | ----------------------------------------- |
| `news_articles`     | Artigos coletados (upsert por URL)        |
| `daily_summaries`   | Resumo gerado por dia (único por data)    |
| `notification_logs` | Histórico de envios (status + SID Twilio) |

## Scripts úteis

```bash
npm run start:dev      # Desenvolvimento com hot reload
npm run build          # Build de produção
npm run lint           # Lint + auto-fix
npm run test           # Testes unitários
npx prisma studio      # Interface visual do banco
```
