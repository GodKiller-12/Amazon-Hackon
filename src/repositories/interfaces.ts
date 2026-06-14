import { Order, OrderStatus, CartItem, Message } from '@/types';
import { UserProfile, SavedCart } from '@/types/user';

/**
 * Repository for managing orders.
 */
export interface IOrderRepository {
  create(userId: string, order: Order): Promise<Order>;
  getById(userId: string, orderId: string): Promise<Order | null>;
  listByUser(userId: string, limit?: number): Promise<Order[]>;
  updateStatus(userId: string, orderId: string, status: OrderStatus): Promise<Order>;
}

/**
 * Repository for managing conversations.
 */
export interface IConversationRepository {
  create(userId: string, conversationId: string, situationLabel?: string): Promise<void>;
  addMessage(userId: string, conversationId: string, message: Message): Promise<void>;
  getMessages(userId: string, conversationId: string): Promise<Message[]>;
  saveCartSnapshot(userId: string, conversationId: string, cart: CartItem[]): Promise<void>;
}

/**
 * Repository for managing user profiles.
 */
export interface IUserRepository {
  getById(userId: string): Promise<UserProfile | null>;
  create(user: UserProfile): Promise<UserProfile>;
  update(userId: string, updates: Partial<UserProfile>): Promise<UserProfile>;
}

/**
 * Repository for managing saved carts.
 */
export interface ISavedCartRepository {
  save(userId: string, cartId: string, items: CartItem[], situationLabel: string, total: number): Promise<void>;
  getById(userId: string, cartId: string): Promise<SavedCart | null>;
  listByUser(userId: string): Promise<SavedCart[]>;
  delete(userId: string, cartId: string): Promise<void>;
}
