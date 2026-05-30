import { z } from "zod";

const ConfigSchema = z.object({
  telegramBotToken: z.string().min(1, "TELEGRAM_BOT_TOKEN is required"),
  jwtSecret: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  databaseUrl: z.string().default("postgres://viv:pass@localhost:5432/vivarium"),
  port: z.number().default(8080),
  allowedUsers: z.array(z.number()).default([]),
  googleClientId: z.string().optional(),
  googleClientSecret: z.string().optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  const allowedUsersRaw = process.env.ALLOWED_USERS ?? "";
  const allowedUsers = allowedUsersRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => !isNaN(n));

  return ConfigSchema.parse({
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    jwtSecret: process.env.JWT_SECRET,
    databaseUrl: process.env.DATABASE_URL || undefined,
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
    allowedUsers,
    googleClientId: process.env.GOOGLE_CLIENT_ID || undefined,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || undefined,
  });
}
