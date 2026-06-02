import type { FastifyInstance, FastifyRequest } from "fastify";
import type { UserStore } from "../store/users.js";
import { getGoogleAuthUrl, exchangeGoogleCode } from "./google.js";
import { createSetupToken, validateSetupToken } from "./tokens.js";
import { log } from "../util/log.js";

export interface AuthDeps {
  users: UserStore;
  jwtSecret: string;
  googleClientId: string;
  googleClientSecret: string;
}

export function authRoutes(deps: AuthDeps) {
  return async function (app: FastifyInstance) {
    const redirectUri = (req: FastifyRequest) => {
      const proto = req.headers["x-forwarded-proto"] ?? "http";
      const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost";
      return `${proto}://${host}/auth/google/callback`;
    };

    const frontendOrigin = (req: FastifyRequest) => {
      const referer = req.headers.referer;
      if (referer) {
        try {
          const url = new URL(referer);
          return `${url.protocol}//${url.host}`;
        } catch {}
      }
      return "";
    };

    app.get("/google", async (req, reply) => {
      const origin = frontendOrigin(req);
      const state = origin ? Buffer.from(origin).toString("base64url") : "";
      const url = getGoogleAuthUrl(deps.googleClientId, redirectUri(req), state);
      return reply.redirect(url);
    });

    app.get<{ Querystring: { code?: string; error?: string; state?: string } }>(
      "/google/callback",
      async (req, reply) => {
        const origin = req.query.state
          ? Buffer.from(req.query.state, "base64url").toString()
          : "";

        if (req.query.error || !req.query.code) {
          return reply.redirect(`${origin}/?auth_error=denied`);
        }

        try {
          const { email, name } = await exchangeGoogleCode(
            req.query.code,
            deps.googleClientId,
            deps.googleClientSecret,
            redirectUri(req)
          );

          const user = await deps.users.getOrCreateByEmail(email, name);
          const token = await createSetupToken(user.id, deps.jwtSecret);

          log.info("auth", `Google login: ${email} → user ${user.id}`);
          return reply.redirect(`${origin}/?token=${token}`);
        } catch (err) {
          log.error("auth", "Google OAuth failed:", err);
          return reply.redirect(`${origin}/?auth_error=failed`);
        }
      }
    );

    app.get("/me", async (req, reply) => {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return reply.code(401).send({ error: "Not authenticated" });
      }

      try {
        const { userId } = await validateSetupToken(
          authHeader.slice(7),
          deps.jwtSecret
        );
        const user = await deps.users.getById(userId);
        if (!user) {
          return reply.code(401).send({ error: "User not found" });
        }
        return {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          telegramId: user.telegram_id,
        };
      } catch {
        return reply.code(401).send({ error: "Invalid token" });
      }
    });
  };
}
