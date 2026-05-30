import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { WsServer } from "../ws/server.js";
import type { Router } from "../router/router.js";
import type { UserStore } from "../store/users.js";
import type { VivariumStore } from "../store/vivariums.js";
import { createSetupToken, validateSetupToken } from "../auth/tokens.js";

export interface ApiDeps {
  wsServer: WsServer;
  router: Router;
  users: UserStore;
  vivariums: VivariumStore;
  jwtSecret: string;
  authEnabled: boolean;
}

async function extractUserId(
  req: FastifyRequest,
  reply: FastifyReply,
  deps: ApiDeps
): Promise<number | null> {
  if (!deps.authEnabled) return null;

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    reply.code(401).send({ error: "Not authenticated" });
    return -1;
  }

  try {
    const { userId } = await validateSetupToken(
      authHeader.slice(7),
      deps.jwtSecret
    );
    return userId;
  } catch {
    reply.code(401).send({ error: "Invalid token" });
    return -1;
  }
}

export function apiRoutes(deps: ApiDeps) {
  return async function (app: FastifyInstance) {
    app.patch("/me", async (req, reply) => {
      const userId = await extractUserId(req, reply, deps);
      if (userId === -1) return;
      if (!userId) return reply.code(401).send({ error: "Auth required" });

      const { telegramId } = req.body as { telegramId?: number };
      if (!telegramId || typeof telegramId !== "number") {
        return reply.code(400).send({ error: "telegramId (number) is required" });
      }

      const user = await deps.users.linkTelegram(userId, telegramId);
      return { id: user.id, telegramId: user.telegram_id };
    });

    app.get("/fleet", async (req, reply) => {
      const userId = await extractUserId(req, reply, deps);
      if (userId === -1) return;

      const all = userId
        ? await deps.vivariums.listForUser(userId)
        : await deps.vivariums.listAll();
      const connected = deps.wsServer.getConnectedVivariums();
      const connMap = new Map(connected.map((c) => [c.vivariumId, c]));

      return all.map((v) => {
        const conn = connMap.get(String(v.id));
        return {
          id: v.id,
          name: v.name,
          userId: v.user_id,
          version: conn?.version ?? v.version,
          createdAt: v.created_at,
          online: !!conn,
          connectedAt: conn?.connectedAt.toISOString() ?? null,
        };
      });
    });

    app.get<{ Params: { id: string } }>("/fleet/:id", async (req, reply) => {
      const userId = await extractUserId(req, reply, deps);
      if (userId === -1) return;

      const vivarium = await deps.vivariums.getById(Number(req.params.id));
      if (!vivarium || (userId && vivarium.user_id !== userId)) {
        return reply.code(404).send({ error: "Vivarium not found" });
      }

      const vivariumId = String(vivarium.id);
      const conn = deps.wsServer
        .getConnectedVivariums()
        .find((c) => c.vivariumId === vivariumId);

      return {
        id: vivarium.id,
        name: vivarium.name,
        userId: vivarium.user_id,
        version: conn?.version ?? vivarium.version,
        createdAt: vivarium.created_at,
        online: !!conn,
        connectedAt: conn?.connectedAt.toISOString() ?? null,
      };
    });

    app.get<{ Params: { id: string } }>(
      "/fleet/:id/status",
      async (req, reply) => {
        const userId = await extractUserId(req, reply, deps);
        if (userId === -1) return;

        const vivarium = await deps.vivariums.getById(Number(req.params.id));
        if (!vivarium || (userId && vivarium.user_id !== userId)) {
          return reply.code(404).send({ error: "Vivarium not found" });
        }

        const status = await deps.router.requestStatus(String(vivarium.id));
        return status;
      }
    );

    app.post<{ Body: { name: string; runtime?: string } }>(
      "/fleet",
      async (req, reply) => {
        const userId = await extractUserId(req, reply, deps);
        if (userId === -1) return;

        const { name, runtime } = req.body as {
          name: string;
          runtime?: string;
        };

        if (!name) {
          return reply.code(400).send({ error: "name is required" });
        }

        let user;
        if (userId) {
          user = await deps.users.getById(userId);
        } else {
          user = await deps.users.create();
        }
        if (!user) {
          return reply.code(404).send({ error: "User not found" });
        }

        const token = await createSetupToken(user.id, deps.jwtSecret);

        const protocol = req.protocol === "https" ? "wss" : "ws";
        const hubUrl = `${protocol}://${req.hostname}:${req.port}/ws`;

        const flags = [`--token ${token}`, `--hub-url ${hubUrl}`];
        if (name) flags.push(`--name ${name}`);
        if (runtime === "smol") flags.push("--smolvm");
        else if (runtime === "docker") flags.push("--docker");

        return {
          token,
          name,
          userId: user.id,
          hubUrl,
          setupCommand: `./scripts/setup.sh ${flags.join(" ")}`,
        };
      }
    );

    app.post<{ Params: { id: string } }>(
      "/fleet/:id/stop",
      async (req, reply) => {
        const userId = await extractUserId(req, reply, deps);
        if (userId === -1) return;

        const vivarium = await deps.vivariums.getById(Number(req.params.id));
        if (!vivarium || (userId && vivarium.user_id !== userId)) {
          return reply.code(404).send({ error: "Vivarium not found" });
        }

        const sent = deps.wsServer.sendToVivarium(String(vivarium.id), {
          type: "shutdown",
        });

        return { ok: true, sent };
      }
    );

    app.delete<{ Params: { id: string } }>(
      "/fleet/:id",
      async (req, reply) => {
        const userId = await extractUserId(req, reply, deps);
        if (userId === -1) return;

        const vivarium = await deps.vivariums.getById(Number(req.params.id));
        if (!vivarium || (userId && vivarium.user_id !== userId)) {
          return reply.code(404).send({ error: "Vivarium not found" });
        }

        deps.wsServer.sendToVivarium(String(vivarium.id), {
          type: "shutdown",
        });
        await deps.vivariums.delete(vivarium.id);
        return { ok: true };
      }
    );

    app.get("/hub/health", async () => {
      const all = await deps.vivariums.listAll();
      const connected = deps.wsServer.getConnectedVivariums();

      return {
        ok: true,
        uptime: Math.floor(process.uptime()),
        vivariumCount: all.length,
        connectedCount: connected.length,
      };
    });
  };
}
