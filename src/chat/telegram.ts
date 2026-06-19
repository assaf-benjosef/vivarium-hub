import { Bot, InputFile, type Context } from "grammy";
import type { ChatProvider } from "./provider.js";
import type { Router } from "../router/router.js";
import type { Config } from "../config.js";
import type { VivariumStore } from "../store/vivariums.js";
import type { UserStore } from "../store/users.js";
import type { WsServer } from "../ws/server.js";
import { createSetupToken } from "../auth/tokens.js";
import { log } from "../util/log.js";

export class TelegramChat implements ChatProvider {
  private bot: Bot;
  private router: Router | null = null;
  private wsServer: WsServer | null = null;
  private allowedUsers: Set<number>;
  private users: UserStore;
  private vivariums: VivariumStore;
  private config: Config;

  constructor(config: Config, users: UserStore, vivariums: VivariumStore) {
    this.bot = new Bot(config.telegramBotToken);
    this.allowedUsers = new Set(config.allowedUsers);
    this.users = users;
    this.vivariums = vivariums;
    this.config = config;
    this.setupHandlers();
  }

  setRouter(router: Router): void {
    this.router = router;
  }

  setWsServer(wsServer: WsServer): void {
    this.wsServer = wsServer;
  }

  private setupHandlers(): void {
    this.bot.use(async (ctx, next) => {
      if (this.allowedUsers.size > 0 && ctx.from) {
        if (!this.allowedUsers.has(ctx.from.id)) {
          await ctx.reply("Sorry, I'm not set up to talk to you yet.");
          return;
        }
      }
      await next();
    });

    this.bot.on("message:text", async (ctx) => {
      const chatId = ctx.chat.id;
      const text = ctx.message.text.trim();
      const telegramId = ctx.from.id;

      await this.users.getOrCreate(telegramId, ctx.from.first_name);

      if (text.startsWith("/")) {
        await this.handleCommand(ctx, chatId, text, telegramId);
        return;
      }

      if (!this.router) {
        await ctx.reply("I'm still starting up, give me a moment...");
        return;
      }

      await this.router.routeUserMessage(telegramId, chatId, text);
    });

    this.bot.on("message:photo", async (ctx) => {
      await ctx.reply(
        "I can see you sent an image! For now, I work best with text descriptions. " +
          "Tell me what you'd like and I'll make it happen."
      );
    });
  }

  private async handleCommand(
    ctx: Context,
    chatId: number,
    text: string,
    telegramId: number
  ): Promise<void> {
    const command = text.split(/\s+/)[0].toLowerCase();
    const args = text.slice(command.length).trim();

    switch (command) {
      case "/help":
      case "/start":
        await ctx.reply(
          "<b>Hey! I'm Viv, your AI app developer.</b>\n\n" +
            "Tell me what you want to build, and I'll write the code, run it, and show you screenshots.\n\n" +
            "<b>Commands</b>\n" +
            "/setup — Set up a new vivarium\n" +
            "/list — Show your vivariums\n" +
            "/switch <code>name</code> — Switch active vivarium\n" +
            "/status — Current vivarium status\n" +
            "/new — Start a fresh conversation\n" +
            "/forget <code>name</code> — Remove a vivarium",
          { parse_mode: "HTML" }
        );
        return;

      case "/setup":
        await this.handleSetup(ctx, telegramId);
        return;

      case "/list":
        await this.handleList(ctx, telegramId);
        return;

      case "/switch":
        await this.handleSwitch(ctx, telegramId, args);
        return;

      case "/forget":
        await this.handleForget(ctx, telegramId, args);
        return;

      case "/status":
        await this.handleStatus(ctx, telegramId);
        return;

      case "/new":
      case "/clear":
        if (!this.router) {
          await ctx.reply("I'm still starting up, give me a moment...");
          return;
        }
        await this.router.routeUserMessage(telegramId, chatId, text);
        return;

      default:
        if (this.router) {
          await this.router.routeUserMessage(telegramId, chatId, text);
        }
        return;
    }
  }

  private async handleSetup(
    ctx: Context,
    telegramId: number
  ): Promise<void> {
    const user = await this.users.getOrCreate(telegramId);
    const token = await createSetupToken(user.id, this.config.jwtSecret);

    await ctx.reply(
      "<b>Run this on your machine</b> (Mac or Linux):\n\n" +
        `<code>curl -fsSL https://vivarium.run/install | bash -s -- --token ${token}</code>\n\n` +
        "It'll ask for your Anthropic API key and set everything up.\n" +
        "Your key stays on <b>your machine</b> — I never see it.",
      { parse_mode: "HTML", link_preview_options: { is_disabled: true } }
    );
  }

  private async handleList(
    ctx: Context,
    telegramId: number
  ): Promise<void> {
    const user = await this.users.getByTelegramId(telegramId);
    if (!user) {
      await ctx.reply("You don't have any vivariums yet. Run /setup to get started!");
      return;
    }

    const vivList = await this.vivariums.listForUser(user.id);
    if (vivList.length === 0) {
      await ctx.reply("You don't have any vivariums yet. Run /setup to get started!");
      return;
    }

    const lines = vivList.map((v) => {
      const isActive = v.id === user.active_vivarium_id;
      const isOnline = this.wsServer?.isConnected(String(v.id)) ?? false;
      const dot = isOnline ? "\u{1F7E2}" : "\u{26AA}";
      const name = isActive ? `<b>${v.name}</b>` : v.name;
      const status = isOnline ? "online" : "offline";
      return `${dot} ${name} — ${status}`;
    });

    await ctx.reply(
      "<b>Your vivariums</b>\n\n" + lines.join("\n"),
      { parse_mode: "HTML" }
    );
  }

  private async handleSwitch(
    ctx: Context,
    telegramId: number,
    name: string
  ): Promise<void> {
    if (!name) {
      await ctx.reply("Usage: /switch <name>\n\nUse /list to see your vivariums.");
      return;
    }

    const user = await this.users.getByTelegramId(telegramId);
    if (!user) {
      await ctx.reply("You don't have any vivariums yet. Run /setup to get started!");
      return;
    }

    const vivarium = await this.vivariums.getByUserAndName(user.id, name);
    if (!vivarium) {
      await ctx.reply(`No vivarium named "${name}". Use /list to see your vivariums.`);
      return;
    }

    await this.users.setActiveVivarium(user.id, vivarium.id);

    const vivariumId = String(vivarium.id);
    const isOnline = this.wsServer?.isConnected(vivariumId) ?? false;

    if (isOnline) {
      this.wsServer?.sendToVivarium(vivariumId, {
        type: "wake",
        reason: "user switched",
      });
    }

    const status = isOnline
      ? "\u{1F7E2} Online and ready."
      : "\u{26AA} Currently offline — it'll reconnect when the machine comes back up.";
    await ctx.reply(
      `Switched to <b>${name}</b>\n\n${status}`,
      { parse_mode: "HTML" }
    );
  }

  private async handleForget(
    ctx: Context,
    telegramId: number,
    name: string
  ): Promise<void> {
    if (!name) {
      await ctx.reply("Usage: /forget <name>\n\nUse /list to see your vivariums.");
      return;
    }

    const user = await this.users.getByTelegramId(telegramId);
    if (!user) {
      await ctx.reply("You don't have any vivariums yet.");
      return;
    }

    const vivarium = await this.vivariums.getByUserAndName(user.id, name);
    if (!vivarium) {
      await ctx.reply(`No vivarium named "${name}". Use /list to see your vivariums.`);
      return;
    }

    if (user.active_vivarium_id === vivarium.id) {
      await this.users.setActiveVivarium(user.id, null);
    }

    await this.vivariums.delete(vivarium.id);

    await ctx.reply(
      `Removed "${name}" from your vivariums. ` +
        "If the machine is still running, you'll need to stop it yourself."
    );
  }

  private async handleStatus(
    ctx: Context,
    telegramId: number
  ): Promise<void> {
    const user = await this.users.getByTelegramId(telegramId);
    if (!user) {
      await ctx.reply("You don't have any vivariums set up yet.");
      return;
    }

    const vivarium = await this.vivariums.getActiveForUser(user.id);
    if (!vivarium) {
      await ctx.reply("No active vivarium. Run /setup to get started, or /switch to pick one!");
      return;
    }

    const vivariumId = String(vivarium.id);

    if (!this.router) {
      await ctx.reply("I'm still starting up, give me a moment...");
      return;
    }

    const status = await this.router.requestStatus(vivariumId);
    const dot = status.online ? "\u{1F7E2}" : "\u{26AA}";
    const statusLabel = status.online ? "Online" : "Offline";

    let reply = `${dot} <b>${vivarium.name}</b> — ${statusLabel}`;

    if (status.totalCostUsd) {
      reply += `\n\u{1F4B0} Session cost: $${status.totalCostUsd.toFixed(2)}`;
    }

    if (status.inputTokens) {
      const contextPct = Math.round((status.inputTokens / 200_000) * 100);
      const bar = "\u{2588}".repeat(Math.round(contextPct / 10)) + "\u{2591}".repeat(10 - Math.round(contextPct / 10));
      reply += `\n\u{1F9E0} Context: ${bar} ${contextPct}%`;
    }

    await ctx.reply(reply, { parse_mode: "HTML" });
  }

  async start(): Promise<void> {
    await this.bot.start({
      onStart: () => {
        log.info("telegram", "Bot is running");
      },
    });
  }

  async stop(): Promise<void> {
    await this.bot.stop();
  }

  async sendMessage(chatId: number | string, text: string): Promise<void> {
    const { splitMessage } = await import("../util/split-message.js");
    const chunks = splitMessage(text);
    for (const chunk of chunks) {
      await this.bot.api.sendMessage(Number(chatId), chunk);
    }
  }

  async sendImage(chatId: number | string, image: Buffer, caption?: string): Promise<void> {
    await this.bot.api.sendPhoto(Number(chatId), new InputFile(image), { caption });
  }

  async sendTypingAction(chatId: number | string): Promise<void> {
    await this.bot.api.sendChatAction(Number(chatId), "typing");
  }
}
