# Vivarium Hub — Agent Context

## What this is

The central message broker and web console for the Vivarium system. A Node.js/TypeScript server (Fastify) that:
1. Receives chat messages from Telegram (via grammY)
2. Routes them to the correct vivarium agent via WebSocket
3. Serves a React web console for fleet management
4. Hosts a static landing page at vivarium.run

## Architecture

```
src/
  index.ts              — Entry point: Fastify server, WebSocket server, Telegram bot
  config.ts             — Env var loading
  ws/
    server.ts           — WebSocket server accepting vivarium connections
    connection.ts       — Per-vivarium connection state
    console.ts          — WebSocket endpoint for web console live updates
    protocol.ts         — Shared message types
  chat/                 — Telegram bot (grammY) message handling
  router/
    router.ts           — Routes incoming messages to the correct vivarium
  api/
    routes.ts           — REST API for the web console (fleet, vivariums, messages)
  auth/                 — Google OAuth + JWT session management
  store/
    db.ts               — PostgreSQL pool + migration runner (node-pg-migrate)
    users.ts            — User CRUD
    vivariums.ts        — Vivarium registry and state
  util/                 — Shared helpers

migrations/             — Versioned SQL migration files (node-pg-migrate)

web/                    — React 19 + Vite + TypeScript console app
  src/
    components/         — UI components (Logo, NavRail, PulseDot, Icon, etc.)
    pages/              — Fleet, Detail, Onboarding, Login, Settings
    lib/                — API client, auth helpers, hooks
  public/
    favicon.svg         — Node-sprout mark (the Vivarium logo)

landing/                — Static marketing site (vivarium.run)
  src/
    components/         — Nav, Hero, Jar, HowItWorks, TelegramDemo, Features, etc.
    hooks/              — useInView (scroll reveal)
    tokens.css          — Design tokens and responsive breakpoints
  public/
    favicon.svg         — Same mark as console
```

## Key patterns

- **Inline styles everywhere** — no Tailwind, no CSS modules. Both web/ and landing/ use React `style={{}}` props
- **Design system**: dark bg (#0a0c0b), green accent oklch(0.80 0.155 150), fonts: Bricolage Grotesque / Hanken Grotesk / JetBrains Mono
- **Logo**: `VivariumMark` component — node-sprout in a rounded-square frame. Two variants: `flat` (UI) and `glow` (landing nav)
- Config via environment variables
- PostgreSQL for persistence (no ORM, raw queries via `pg`; migrations via `node-pg-migrate`)
- WebSocket protocol is JSON messages defined in `ws/protocol.ts` (shared types with the vivarium repo)
- Telegram bot uses grammY with webhook or polling
- Auth: Google OAuth for the web console, JWT sessions

## Build & Run

```bash
# Backend
npm install && npm run build && node dist/index.js

# Web console (dev)
cd web && npm install && npm run dev

# Landing page (dev)
cd landing && npm install && npm run dev
```

## Testing

```bash
npm test          # Backend tests (Vitest)
cd web && npx tsc --noEmit    # Console type-check
cd landing && npx tsc --noEmit  # Landing type-check
```

## Deployments

- **Hub (backend + console)**: Docker on a VPS, port 8080
- **Landing page**: Vercel, root directory `landing/`, deployed to vivarium.run
- **Waitlist**: Buttondown (username: assaf-benjosef), form POSTs from the landing page

## Related repo

- [vivarium](https://github.com/assaf-benjosef/vivarium) — the agent runtime that connects to this hub
