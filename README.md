# Calmai

Chatbot de **check-in diário de bem-estar** para empreendedores e colaboradores via **WhatsApp**. Envia perguntas personalizadas de segunda a sexta, analisa as respostas com IA (OpenAI) e detecta padrões críticos para acionar suporte confidencial.

## Como funciona

```
Cron 08:30 (seg–sex)
    └── CheckinService.dispatchMorningCheckin()
        └── Busca todos os usuários ativos no banco
        └── Envia mensagem do dia via Twilio WhatsApp

Usuário responde "1", "2", "3" ou "4"
    └── POST /webhook/whatsapp  (Twilio → ngrok → app)
        └── WebhookService.handleIncoming()
            └── findOrCreate(phone)          → auto-cadastro
            └── CheckinService.processResponse()
                └── parseResponse()          → identifica opção
                └── AiService.generateCheckinResponse()  → resposta empática
                └── Salva CheckIn no banco   → score + isCritical
                └── Envia resposta ao usuário
```

### Pilares de bem-estar por dia

| Dia     | Pilar    | Tema                         |
| ------- | -------- | ---------------------------- |
| Segunda | Humor    | Energia e foco para a semana |
| Terça   | Nutrição | Alimentação e hidratação     |
| Quarta  | Fitness  | Movimento e exercício        |
| Quinta  | Mental   | Carga de trabalho / burnout  |
| Sexta   | Sono     | Qualidade do descanso        |

### Escalada crítica

- Respostas com score ≤ 1 são marcadas como `isCritical = true`
- A partir de **3 dias consecutivos críticos**, a IA aciona mensagem de suporte confidencial
- Todos os dados são anonimizados no modelo `AggregatedMetric` para dashboards corporativos

## Stack

- **NestJS 11** + TypeScript
- **Prisma 7** + PostgreSQL (Supabase)
- **Twilio** — WhatsApp Business API (Sandbox)
- **OpenAI** — respostas empáticas por IA (opcional — fallback estático sem custo)
- **@nestjs/schedule** — cron jobs para disparo diário

## Pré-requisitos

- Node.js 18+
- PostgreSQL (recomendado: [Supabase](https://supabase.com) — plano gratuito)
- Conta Twilio com WhatsApp Sandbox ativado
- (Opcional) Conta OpenAI para respostas com IA

## Instalação

```bash
npm install
```

## Configuração

```bash
cp .env.example .env
```

Preencha o `.env`:

```env
# Banco de dados (Supabase)
DATABASE_URL="postgresql://USER:PASSWORD@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@host:5432/postgres"

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="seu_auth_token"
TWILIO_WHATSAPP_FROM="+14155238886"

# OpenAI (opcional — sem a key usa respostas estáticas, zero custo)
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4o-mini"

# Agendamento (cron, seg–sex)
MORNING_CRON="30 8 * * 1-5"
EVENING_CRON="30 20 * * 1-5"

# App
NODE_ENV="development"
PORT=3000
```

> **Dry-run WhatsApp:** sem credenciais Twilio, as mensagens são exibidas no console.  
> **Dry-run IA:** sem `OPENAI_API_KEY`, usa respostas estáticas por pilar/score — sem custo.

## Banco de dados

```bash
# Criar tabelas (primeira vez)
npx prisma migrate dev --name init-calmai

# Regenerar client após mudanças no schema
npx prisma generate

# Interface visual
npx prisma studio
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

1. Crie conta em [console.twilio.com](https://console.twilio.com)
2. **Messaging → Try it out → Send a WhatsApp message**
3. Envie `join <palavra-do-sandbox>` para `+1 415 523 8886` pelo seu WhatsApp
4. **Messaging → Settings → WhatsApp Sandbox Settings**
5. Campo **"When a message comes in"**: `https://SEU-DOMINIO/webhook/whatsapp` (método: POST)

### Expondo localmente com ngrok

```bash
# Terminal 1 — túnel
ngrok http --url=SEU-DOMINIO.ngrok-free.dev 3000

# Terminal 2 — app
npm run start:dev
```

## Endpoints

| Método | Rota                | Descrição                                  |
| ------ | ------------------- | ------------------------------------------ |
| GET    | `/health`           | Status da aplicação                        |
| POST   | `/health/dispatch`  | Disparo manual do check-in (testes)        |
| POST   | `/webhook/whatsapp` | Recebe respostas do Twilio (configurar lá) |

## Cadastrando usuários

**Opção 1 — Auto-cadastro:** basta mandar qualquer mensagem para o número do sandbox. O sistema registra automaticamente.

**Opção 2 — Prisma Studio:** `npx prisma studio` → tabela `users` → Add record.

## Estrutura do projeto

```
src/
├── config/
│   ├── app.config.ts        # Porta, cron schedules
│   ├── whatsapp.config.ts   # Credenciais Twilio
│   └── openai.config.ts     # API key e modelo
├── prisma/                  # PrismaService (global)
├── generated/prisma/        # Client gerado (não editar)
└── modules/
    ├── users/               # findByPhone, findOrCreate, findAllActive
    ├── whatsapp/            # sendMessage via Twilio
    ├── ai/                  # generateCheckinResponse (OpenAI + fallback estático)
    ├── checkin/
    │   ├── checkin.constants.ts   # DAILY_CHECK_INS, parseResponse
    │   ├── checkin.service.ts     # dispatchMorningCheckin, processResponse
    │   └── checkin.scheduler.ts   # Cron jobs manhã/noite
    └── webhook/
        ├── webhook.controller.ts  # POST /webhook/whatsapp
        └── webhook.service.ts     # handleIncoming

prisma/
├── schema.prisma            # Company, User, CheckIn, AggregatedMetric, MessageLog
└── migrations/
```

## Modelos do banco

| Tabela               | Descrição                                         |
| -------------------- | ------------------------------------------------- |
| `companies`          | Empresas clientes                                 |
| `users`              | Colaboradores (token anônimo para privacidade)    |
| `check_ins`          | Resposta diária por usuário (único por user+data) |
| `aggregated_metrics` | Métricas anônimas por empresa/departamento        |
| `message_logs`       | Histórico de mensagens enviadas e recebidas       |

## Scripts úteis

```bash
npm run start:dev      # Desenvolvimento com hot reload
npm run build          # Build de produção
npm run lint           # Lint + auto-fix
npm run test           # Testes unitários
npx prisma studio      # Interface visual do banco
npx prisma migrate dev # Aplicar migrações
```
