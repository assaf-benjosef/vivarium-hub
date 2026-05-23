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

export class Router {
  private wsServer: WsServer;
  private chatProvider: ChatProvider;
  private users: UserStore;
  private vivariums: VivariumStore;
  private inFlight = new Map<string, InFlightMessage>();

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

  async routeUserMessage(telegramId: number, chatId: number, text: string): Promise<void> {
    const user = this.users.getByTelegramId(telegramId);
    if (!user) {
      await this.chatProvider.sendMessage(chatId, "Something went wrong — I don't recognize your account.");
      return;
    }

    const vivarium = this.vivariums.getActiveForUser(user.id);
    if (!vivarium) {
      await this.chatProvider.sendMessage(
        chatId,
        "You don't have a vivarium set up yet. Run /setup to get started!"
      );
      return;
    }

    const vivariumId = String(vivarium.id);
    if (!this.wsServer.isConnected(vivariumId)) {
      await this.chatProvider.sendMessage(
        chatId,
        "Your vivarium is offline right now. It'll reconnect automatically when the machine comes back up."
      );
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

  async handleVivariumEvent(vivariumId: string, msg: VivariumMessage): Promise<void> {
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
          // Typing interval already running — this just confirms vivarium is alive
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

  handleVivariumOnline(vivariumId: string, userId: number): void {
    const user = this.users.getByTelegramId(userId);
    if (!user) return;

    const vivarium = this.vivariums.getById(Number(vivariumId));
    if (!vivarium) return;

    console.log(`[router] Vivarium "${vivarium.name}" is online (user=${userId})`);
  }

  handleVivariumOffline(vivariumId: string, userId: number): void {
    // Clear any in-flight messages for this vivarium
    for (const [msgId, inFlight] of this.inFlight) {
      if (inFlight.userId === userId) {
        this.clearInFlight(msgId);
        this.chatProvider
          .sendMessage(
            inFlight.chatId,
            "Your vivarium went offline while working on that. It'll reconnect automatically."
          )
          .catch(() => {});
      }
    }
  }

  private clearInFlight(msgId: string): void {
    const inFlight = this.inFlight.get(msgId);
    if (inFlight) {
      clearInterval(inFlight.typingInterval);
      this.inFlight.delete(msgId);
    }
  }
}
