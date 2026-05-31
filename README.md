# Vivarium Hub

Message broker and web console for [Vivarium](https://github.com/assaf-benjosef/vivarium) agents. Routes chat messages to your self-hosted vivariums via WebSocket, and provides a fleet management UI.

## Architecture

```
┌─────────────────────────────────────────┐
│              Vivarium Hub               │
│                                         │
│  Chat (Telegram via grammY)             │
│  WebSocket server (ws)                  │
│  HTTP API (Fastify)                     │
│  Web console (React 19 + Vite)          │
│  SQLite (users, vivariums, state)       │
│  Google OAuth                           │
│                                         │
│  Routes messages. Never sees API keys.  │
└─────────────────────────────────────────┘
        ▲                    ▲
        │ WSS                │ WSS
┌───────┴───────┐    ┌──────┴────────┐
│  Vivarium A   │    │  Vivarium B   │
│  "fern"       │    │  "moss"       │
│  recipe-box   │    │  standup-bot  │
└───────────────┘    └───────────────┘
```

## Components

### Backend (`src/`)

- **WebSocket server** (`src/ws/`) — accepts vivarium connections, routes messages bidirectionally
- **Chat integration** (`src/chat/`) — Telegram bot via grammY
- **HTTP API** (`src/api/`) — REST endpoints for the web console
- **Router** (`src/router/`) — routes incoming chat messages to the correct vivarium
- **Store** (`src/store/`) — SQLite persistence (users, vivariums, message history)
- **Auth** (`src/auth/`) — Google OAuth + JWT for the web console

### Web Console (`web/`)

React 19 + Vite + TypeScript SPA served by the Fastify backend.

- **Fleet** — live dashboard of all connected vivariums (status, current task, cost)
- **Detail** — per-vivarium view with activity timeline
- **Onboarding** — step-by-step setup for new vivariums
- **Analytics / Health** — stubs for cost tracking and uptime monitoring

### Landing Page (`landing/`)

Static marketing site deployed to [vivarium.run](https://vivarium.run). Vite + React 19 + TypeScript, independent build. Features animated specimen jars, how-it-works flow, chat demo, and a Buttondown waitlist form.

## Quick start

```bash
npm install
npm run build

TELEGRAM_BOT_TOKEN=123:ABC... \
JWT_SECRET=$(openssl rand -hex 32) \
node dist/index.js
```

### Docker

```bash
docker build -t vivarium-hub .

docker run -d \
  -e TELEGRAM_BOT_TOKEN=123:ABC... \
  -e JWT_SECRET=$(openssl rand -hex 32) \
  -v hub-data:/app/data \
  -p 8080:8080 \
  vivarium-hub
```

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | ✅ | Telegram bot token from BotFather |
| `JWT_SECRET` | ✅ | Secret for signing tokens (min 32 chars) |
| `DB_PATH` | | SQLite path (default: `./data/hub.db`) |
| `PORT` | | HTTP/WebSocket port (default: `8080`) |
| `ALLOWED_USERS` | | Comma-separated Telegram user IDs |
| `GOOGLE_CLIENT_ID` | | For web console OAuth |
| `GOOGLE_CLIENT_SECRET` | | For web console OAuth |

## Development

```bash
npm install
npm test

# Backend
npm run dev   # needs TELEGRAM_BOT_TOKEN + JWT_SECRET

# Web console
cd web && npm run dev

# Landing page
cd landing && npm run dev
```

## Deployments

| What | Where | Domain |
|---|---|---|
| Hub (backend + console) | VPS / Docker | — |
| Landing page | Vercel | [vivarium.run](https://vivarium.run) |

## Related

- [vivarium](https://github.com/assaf-benjosef/vivarium) — the agent runtime
- [vivarium.run](https://vivarium.run) — landing page & waitlist

## License

MIT
