import { IConversationRepository } from '../interfaces';
import { Message, CartItem } from '@/types';

interface ConversationRecord {
  conversationId: string;
  messages: Message[];
  cartSnapshot: CartItem[];
  situationLabel: string;
}

/**
 * In-memory conversation repository. Used when DynamoDB is not configured.
 * Data resets on server restart.
 */
export class InMemoryConversationRepository implements IConversationRepository {
  private conversations = new Map<string, ConversationRecord>();

  private key(userId: string, conversationId: string): string {
    return `${userId}:${conversationId}`;
  }

  async create(userId: string, conversationId: string, situationLabel?: string): Promise<void> {
    this.conversations.set(this.key(userId, conversationId), {
      conversationId,
      messages: [],
      cartSnapshot: [],
      situationLabel: situationLabel || '',
    });
  }

  async addMessage(userId: string, conversationId: string, message: Message): Promise<void> {
    const k = this.key(userId, conversationId);
    const record = this.conversations.get(k);
    if (!record) {
      // Auto-create if not found
      this.conversations.set(k, {
        conversationId,
        messages: [message],
        cartSnapshot: [],
        situationLabel: '',
      });
      return;
    }
    record.messages.push(message);
  }

  async getMessages(userId: string, conversationId: string): Promise<Message[]> {
    const record = this.conversations.get(this.key(userId, conversationId));
    return record?.messages || [];
  }

  async saveCartSnapshot(userId: string, conversationId: string, cart: CartItem[]): Promise<void> {
    const record = this.conversations.get(this.key(userId, conversationId));
    if (record) {
      record.cartSnapshot = cart;
    }
  }
}
