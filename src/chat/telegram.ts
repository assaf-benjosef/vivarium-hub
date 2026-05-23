import { Bot, InputFile } from "grammy";
import type { ChatProvider } from "./provider.js";
import type { Router } from "../router/router.js";
import type { Config } from "../config.js";
import type { VivariumStore } from "../store/vivariums.js";
import type { UserStore } from "../store/users.js";
import type { WsServer } from "../ws/server.js";

export class TelegramChat implements ChatProvider {
  private bot: Bot;
  private router: Router | null = null;
  private allowedUsers: Set<number>;
  private users: UserStore;
  private vivariums: VivariumStore;
  private wsServer: WsServer | null = null;

  constructor(config: Config, users: UserStore, vivariums: VivariumStore) {
    this.bot = new Bot(config.telegramBotToken);
    this.allowedUsers = new Set(config.allowedUsers);
    this.users = users;
    this.vivariums = vivariums;
    this.setupHandlers();
  }

  setRouter(router: Router): void {
    this.router = router;
  }

  setWsServer(wsServer: WsServer): void {
    this.wsServer = wsServer;
  }

  private setupHandlers(): void {
    // Auth middleware
    this.bot.use(async (ctx, next) => {
      if (this.allowedUsers.size > 0 && ctx.from) {
        if (!this.allowedUsers.has(ctx.from.id)) {
          await ctx.reply("🔒 Sorry, I'm not set up to talk to you yet.");
          return;
        }
      }
      await next();
    });

    this.bot.on("message:text", async (ctx) => {
      const chatId = ctx.chat.id;
      const text = ctx.message.text.trim();
      const telegramId = ctx.from.id;

      // Ensure user exists
      this.users.getOrCreate(telegramId, ctx.from.first_name);

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
    ctx: { reply: (text: string) => Promise<unknown> },
    chatId: number,
    text: string,
    telegramId: number
  ): Promise<void> {
    if (text === "/help" || text === "/start") {
      await ctx.reply(
        "👋 Hi! I'm Viv, your AI app developer.\n\n" +
          "Tell me what you want to build, and I'll write the code, run it, and show you screenshots.\n\n" +
          "Commands:\n" +
          "• /new - Start a fresh conversation\n" +
          "• /status - Check vivarium status\n" +
          "• /help - Show this message"
      );
      return;
    }

    if (text === "/status") {
      const user = this.users.getByTelegramId(telegramId);
      if (!user) {
        await ctx.reply("You don't have any vivariums set up yet.");
        return;
      }

      const vivarium = this.vivariums.getActiveForUser(user.id);
      if (!vivarium) {
        await ctx.reply("No active vivarium. Run /setup to get started!");
        return;
      }

      const vivariumId = String(vivarium.id);
      const online = this.wsServer?.isConnected(vivariumId) ?? false;
      const status = online ? "🟢 Online" : "🔴 Offline";

      await ctx.reply(`${status}\nVivarium: ${vivarium.name}`);
      return;
    }

    // Route /new and other commands to vivarium
    if (text === "/new" || text === "/clear") {
      if (!this.router) {
        await ctx.reply("I'm still starting up, give me a moment...");
        return;
      }
      await this.router.routeUserMessage(telegramId, chatId, text);
      return;
    }

    // Unknown command — treat as regular message
    if (this.router) {
      await this.router.routeUserMessage(telegramId, chatId, text);
    }
  }

  async start(): Promise<void> {
    await this.bot.start({
      onStart: () => {
        console.log("[telegram] Bot is running");
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
