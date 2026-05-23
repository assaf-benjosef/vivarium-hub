import { z } from "zod";

const ConfigSchema = z.object({
  telegramBotToken: z.string().min(1, "TELEGRAM_BOT_TOKEN is required"),
  jwtSecret: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  dbPath: z.string().default("./data/hub.db"),
  port: z.number().default(8080),
  allowedUsers: z.array(z.number()).default([]),
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
    dbPath: process.env.DB_PATH || undefined,
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
    allowedUsers,
  });
}
