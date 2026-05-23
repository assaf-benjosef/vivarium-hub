# 🌱 Vivarium Hub

Lightweight message broker that connects Telegram to your self-hosted [Vivarium](https://github.com/assaf-benjosef/vivarium) agents via WebSocket.

The hub never sees your API key or data — it just routes messages.

## Architecture

```
YOUR VPS (~$5/mo)                         USER'S MACHINE (anywhere)
┌────────────────────────┐
│      Vivarium Hub      │                ┌──────────────────────┐
│                        │◄──── WSS ──────│  Vivarium "my-app"   │
│  Telegram Bot (grammY) │                │  API key: sk-ant-... │
│  WebSocket Server (ws) │                │  App on :3000        │
│  SQLite (users, state) │                └──────────────────────┘
│  HTTP API (Fastify)    │
│                        │
│  NO API key storage    │
│  NO heavy compute      │
│  Just routes messages. │
└────────────────────────┘
```

## Quick start

### Prerequisites

- Node.js 22+
- A [Telegram bot token](https://core.telegram.org/bots#creating-a-new-bot) (talk to [@BotFather](https://t.me/BotFather))

### Run locally

```bash
npm install
npm run build

TELEGRAM_BOT_TOKEN=123:ABC... \
JWT_SECRET=$(openssl rand -hex 32) \
node dist/index.js
```

### Run with Docker

```bash
docker build -t vivarium-hub .

docker run -d \
  -e TELEGRAM_BOT_TOKEN=123:ABC... \
  -e JWT_SECRET=$(openssl rand -hex 32) \
  -v hub-data:/app/data \
  -p 8080:8080 \
  --name vivarium-hub \
  vivarium-hub
```

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | ✅ | Telegram bot token from BotFather |
| `JWT_SECRET` | ✅ | Secret for signing setup tokens (min 32 chars) |
| `DB_PATH` | | SQLite database path (default: `./data/hub.db`) |
| `PORT` | | HTTP/WebSocket port (default: `8080`) |
| `ALLOWED_USERS` | | Comma-separated Telegram user IDs (empty = allow all) |

## Connecting a vivarium

Generate a token and start a vivarium pointed at this hub:

```bash
# On your hub machine — generate a token (or use the mock script for testing)
HUB_TOKEN=$(node -e "
  import('jose').then(async ({SignJWT}) => {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({sub: '12345'})
      .setProtectedHeader({alg: 'HS256'})
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(secret);
    console.log(token);
  });
")

# On the user's machine — start the vivarium
docker run -d \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  -e HUB_URL=wss://your-hub:8080/ws \
  -e HUB_TOKEN=$HUB_TOKEN \
  -e VIVARIUM_NAME=my-app \
  -v vivarium-data:/workspace \
  -p 3000:3000 \
  vivarium
```

## Telegram commands

| Command | Description |
|---|---|
| `/help` | Show available commands |
| `/status` | Check if your vivarium is online |
| `/new` | Clear agent memory and start fresh |

## Development

```bash
npm install
npm test          # 71 tests
npm run dev       # needs TELEGRAM_BOT_TOKEN + JWT_SECRET
```

### Testing with the mock vivarium

```bash
# Terminal 1 — start the hub
TELEGRAM_BOT_TOKEN=... JWT_SECRET=... npm run dev

# Terminal 2 — connect a mock vivarium that echoes messages
HUB_URL=ws://localhost:8080/ws HUB_TOKEN=... npx tsx scripts/mock-vivarium.ts
```

## License

MIT
