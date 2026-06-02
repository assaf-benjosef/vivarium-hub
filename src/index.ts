import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { loadConfig } from "./config.js";
import { createPool } from "./store/db.js";
import { UserStore } from "./store/users.js";
import { VivariumStore } from "./store/vivariums.js";
import { WsServer } from "./ws/server.js";
import { ConsoleWsServer } from "./ws/console.js";
import { Router } from "./router/router.js";
import { TelegramChat } from "./chat/telegram.js";
import { apiRoutes, type ApiDeps } from "./api/routes.js";
import { authRoutes } from "./auth/routes.js";
import { log } from "./util/log.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const config = loadConfig();
  const pool = await createPool(config.databaseUrl);
  const users = new UserStore(pool);
  const vivariumStore = new VivariumStore(pool);

  const app = Fastify();

  // Mutable deps — wsServer and router are set after creation below.
  // Routes access them lazily (only on incoming requests), so this is safe.
  const authEnabled = !!(config.googleClientId && config.googleClientSecret);

  const apiDeps: ApiDeps = {
    wsServer: null!,
    router: null!,
    users,
    vivariums: vivariumStore,
    jwtSecret: config.jwtSecret,
    baseUrl: config.baseUrl,
    authEnabled,
  };

  app.get("/health", async () => ({ ok: true }));

  if (authEnabled) {
    await app.register(
      authRoutes({
        users,
        jwtSecret: config.jwtSecret,
        baseUrl: config.baseUrl,
        googleClientId: config.googleClientId!,
        googleClientSecret: config.googleClientSecret!,
      }),
      { prefix: "/auth" }
    );
    log.info("hub", "Google OAuth enabled");
  } else {
    log.info("hub", "No Google OAuth credentials — auth disabled");
  }

  await app.register(apiRoutes(apiDeps), { prefix: "/api" });

  // Serve frontend SPA (production build)
  const webDistPath = path.join(__dirname, "../web/dist");
  const { existsSync } = await import("node:fs");
  if (existsSync(webDistPath)) {
    await app.register(fastifyStatic, {
      root: webDistPath,
      prefix: "/",
      wildcard: false,
      decorateReply: true,
    });
  } else {
    log.info("hub", "No web/dist found — skipping static file serving");
  }

  app.setNotFoundHandler(async (request, reply) => {
    if (
      request.url.startsWith("/api") ||
      request.url.startsWith("/auth") ||
      request.url.startsWith("/ws") ||
      request.url.startsWith("/health")
    ) {
      return reply.code(404).send({ error: "Not found" });
    }
    try {
      return reply.sendFile("index.html");
    } catch {
      return reply.code(404).send({ error: "Not found" });
    }
  });

  await app.listen({ port: config.port, host: "0.0.0.0" });
  log.info("hub", `HTTP server listening on :${config.port}`);

  const chatProvider = new TelegramChat(config, users, vivariumStore);
  const consoleWs = new ConsoleWsServer();

  let router: Router;

  const wsServer = new WsServer({
    jwtSecret: config.jwtSecret,
    users,
    vivariums: vivariumStore,
    onMessage: (vivariumId, msg) => router.handleVivariumEvent(vivariumId, msg),
    onConnect: async (vivariumId, userId) => {
      router.handleVivariumOnline(vivariumId, userId);
      const vivarium = await vivariumStore.getById(Number(vivariumId));
      consoleWs.broadcast({
        type: "vivarium_online",
        vivariumId,
        name: vivarium?.name ?? vivariumId,
      });
    },
    onDisconnect: async (vivariumId, userId) => {
      router.handleVivariumOffline(vivariumId, userId);
      const vivarium = await vivariumStore.getById(Number(vivariumId));
      consoleWs.broadcast({
        type: "vivarium_offline",
        vivariumId,
        name: vivarium?.name ?? vivariumId,
      });
    },
  });

  router = new Router(wsServer, chatProvider, users, vivariumStore);

  // Populate API deps now that wsServer and router are ready
  apiDeps.wsServer = wsServer;
  apiDeps.router = router;

  chatProvider.setRouter(router);
  chatProvider.setWsServer(wsServer);

  // Route WebSocket upgrades by path (ws library requires noServer + manual routing)
  app.server.on("upgrade", (request, socket, head) => {
    const { pathname } = new URL(request.url ?? "/", "http://localhost");

    if (pathname === "/ws") {
      wsServer.handleUpgrade(request, socket, head);
    } else if (pathname === "/ws/console") {
      consoleWs.handleUpgrade(request, socket, head);
    } else {
      socket.destroy();
    }
  });

  await chatProvider.start();
  log.info("hub", "Vivarium Hub is ready");
}

main().catch((err) => {
  log.error("hub", "Fatal error:", err);
  process.exit(1);
});
