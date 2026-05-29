import "dotenv/config";
import Fastify from "fastify";
import { loadConfig } from "./config.js";
import { createPool } from "./store/db.js";
import { UserStore } from "./store/users.js";
import { VivariumStore } from "./store/vivariums.js";
import { WsServer } from "./ws/server.js";
import { Router } from "./router/router.js";
import { TelegramChat } from "./chat/telegram.js";

async function main() {
  const config = loadConfig();
  const pool = await createPool(config.databaseUrl);
  const users = new UserStore(pool);
  const vivariumStore = new VivariumStore(pool);

  const app = Fastify();

  app.get("/health", async () => ({ ok: true }));

  await app.listen({ port: config.port, host: "0.0.0.0" });
  console.log(`[hub] HTTP server listening on :${config.port}`);

  const chatProvider = new TelegramChat(config, users, vivariumStore);

  let router: Router;

  const wsServer = new WsServer(app.server, {
    jwtSecret: config.jwtSecret,
    users,
    vivariums: vivariumStore,
    onMessage: (vivariumId, msg) => router.handleVivariumEvent(vivariumId, msg),
    onConnect: (vivariumId, userId) => router.handleVivariumOnline(vivariumId, userId),
    onDisconnect: (vivariumId, userId) => router.handleVivariumOffline(vivariumId, userId),
  });

  router = new Router(wsServer, chatProvider, users, vivariumStore);
  chatProvider.setRouter(router);
  chatProvider.setWsServer(wsServer);

  await chatProvider.start();
  console.log("[hub] Vivarium Hub is ready 🌱");
}

main().catch((err) => {
  console.error("[hub] Fatal error:", err);
  process.exit(1);
});
