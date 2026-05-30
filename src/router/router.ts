import { nanoid } from "nanoid";
import type { WsServer } from "../ws/server.js";
import type { VivariumMessage } from "../ws/protocol.js";
import type { ChatProvider } from "../chat/provider.js";
import type { UserStore } from "../store/users.js";
import type { VivariumStore } from "../store/vivariums.js";
import { splitMessage } from "../util/split-message.js";

interface InFlightMessage {
  chatId: number;
  userId: number;
  typingInterval: ReturnType<typeof setInterval>;
}

export interface VivariumStatus {
  online: boolean;
  appRunning?: boolean;
  uptime?: number;
  totalCostUsd?: number;
  inputTokens?: number;
}

export class Router {
  private wsServer: WsServer;
  private chatProvider: ChatProvider;
  private users: UserStore;
  private vivariums: VivariumStore;
  private inFlight = new Map<string, InFlightMessage>();
  private pendingStatus = new Map<string, (status: VivariumStatus) => void>();
  private userChatIds = new Map<number, number>();
  private lastOnlineNotify = new Map<string, number>();

  constructor(
    wsServer: WsServer,
    chatProvider: ChatProvider,
    users: UserStore,
    vivariums: VivariumStore
  ) {
    this.wsServer = wsServer;
    this.chatProvider = chatProvider;
    this.users = users;
    this.vivariums = vivariums;
  }

  trackChatId(userId: number, chatId: number): void {
    this.userChatIds.set(userId, chatId);
  }

  async routeUserMessage(telegramId: number, chatId: number, text: string): Promise<void> {
    const user = await this.users.getByTelegramId(telegramId);
    if (!user) {
      await this.chatProvider.sendMessage(chatId, "Something went wrong — I don't recognize your account.");
      return;
    }

    this.userChatIds.set(user.id, chatId);

    const vivarium = await this.vivariums.getActiveForUser(user.id);
    if (!vivarium) {
      await this.chatProvider.sendMessage(
        chatId,
        "You don't have a vivarium set up yet. Run /setup to get started!"
      );
      return;
    }

    const vivariumId = String(vivarium.id);
    if (!this.wsServer.isConnected(vivariumId)) {
      const others = await this.vivariums.listForUser(user.id);
      const onlineOthers = others.filter(
        (v) => v.id !== vivarium.id && this.wsServer.isConnected(String(v.id))
      );

      let msg = `"${vivarium.name}" is offline right now. It'll reconnect automatically when the machine comes back up.`;
      if (onlineOthers.length > 0) {
        msg += `\n\nYou have other vivariums online — use /switch <name> to switch. Try /list to see all.`;
      }
      await this.chatProvider.sendMessage(chatId, msg);
      return;
    }

    const msgId = `msg_${nanoid()}`;

    const typingInterval = setInterval(async () => {
      try {
        await this.chatProvider.sendTypingAction(chatId);
      } catch {
        // best effort
      }
    }, 4000);

    this.inFlight.set(msgId, { chatId, userId: user.id, typingInterval });

    await this.chatProvider.sendTypingAction(chatId).catch(() => {});

    const sent = this.wsServer.sendToVivarium(vivariumId, {
      type: "message",
      id: msgId,
      text,
    });

    if (!sent) {
      this.clearInFlight(msgId);
      await this.chatProvider.sendMessage(
        chatId,
        "Couldn't reach your vivarium. It may have just gone offline."
      );
    }
  }

  async requestStatus(vivariumId: string): Promise<VivariumStatus> {
    if (!this.wsServer.isConnected(vivariumId)) {
      return { online: false };
    }

    return new Promise<VivariumStatus>((resolve) => {
      const timeout = setTimeout(() => {
        this.pendingStatus.delete(vivariumId);
        resolve({ online: true });
      }, 3000);

      this.pendingStatus.set(vivariumId, (status) => {
        clearTimeout(timeout);
        resolve(status);
      });

      this.wsServer.sendToVivarium(vivariumId, { type: "health_check" });
    });
  }

  async handleVivariumEvent(vivariumId: string, msg: VivariumMessage): Promise<void> {
    if (msg.type === "status") {
      const resolve = this.pendingStatus.get(vivariumId);
      if (resolve) {
        this.pendingStatus.delete(vivariumId);
        resolve({
          online: true,
          appRunning: msg.appRunning,
          uptime: msg.uptime,
          totalCostUsd: msg.totalCostUsd,
          inputTokens: msg.inputTokens,
        });
      }
      return;
    }

    if (msg.type !== "event") return;

    const inFlight = this.inFlight.get(msg.msgId);
    if (!inFlight) {
      console.warn(`[router] Unknown msgId: ${msg.msgId}`);
      return;
    }

    const { chatId } = inFlight;

    try {
      switch (msg.event) {
        case "text": {
          const chunks = splitMessage(msg.content);
          for (const chunk of chunks) {
            await this.chatProvider.sendMessage(chatId, chunk);
          }
          break;
        }
        case "screenshot": {
          const buffer = Buffer.from(msg.image, "base64");
          await this.chatProvider.sendImage(chatId, buffer);
          break;
        }
        case "typing":
          break;
        case "done":
          this.clearInFlight(msg.msgId);
          break;
        case "error":
          this.clearInFlight(msg.msgId);
          await this.chatProvider.sendMessage(chatId, "Something went wrong on my end. Try again?");
          console.error(`[router] Vivarium error for ${msg.msgId}: ${msg.message}`);
          break;
      }
    } catch (err) {
      console.error(`[router] Error handling event for ${msg.msgId}:`, err);
    }
  }

  async handleVivariumOnline(vivariumId: string, userId: number): Promise<void> {
    const vivarium = await this.vivariums.getById(Number(vivariumId));
    if (!vivarium) return;

    console.log(`[router] Vivarium "${vivarium.name}" is online (user=${userId})`);

    const now = Date.now();
    const lastNotify = this.lastOnlineNotify.get(vivariumId) ?? 0;
    if (now - lastNotify < 60_000) return;
    this.lastOnlineNotify.set(vivariumId, now);

    const chatId = this.userChatIds.get(userId);
    if (chatId) {
      await this.chatProvider
        .sendMessage(chatId, `"${vivarium.name}" is online!`)
        .catch(() => {});
    }
  }

  async handleVivariumOffline(vivariumId: string, userId: number): Promise<void> {
    const vivarium = await this.vivariums.getById(Number(vivariumId));
    const name = vivarium?.name ?? vivariumId;

    // Clear any in-flight messages for this user
    for (const [msgId, inFlight] of this.inFlight) {
      if (inFlight.userId === userId) {
        this.clearInFlight(msgId);
        this.chatProvider
          .sendMessage(
            inFlight.chatId,
            `"${name}" went offline while working on that. It'll reconnect automatically.`
          )
          .catch(() => {});
      }
    }

    // Notify user if we know their chat ID
    const chatId = this.userChatIds.get(userId);
    if (chatId) {
      await this.chatProvider
        .sendMessage(chatId, `"${name}" went offline. It'll reconnect automatically when the machine comes back up.`)
        .catch(() => {});
    }

    console.log(`[router] Vivarium "${name}" is offline (user=${userId})`);
  }

  private clearInFlight(msgId: string): void {
    const inFlight = this.inFlight.get(msgId);
    if (inFlight) {
      clearInterval(inFlight.typingInterval);
      this.inFlight.delete(msgId);
    }
  }
}
