export interface ChatProvider {
  start(): Promise<void>;
  stop(): Promise<void>;
  sendMessage(chatId: number | string, text: string): Promise<void>;
  sendImage(chatId: number | string, image: Buffer, caption?: string): Promise<void>;
  sendTypingAction(chatId: number | string): Promise<void>;
}
