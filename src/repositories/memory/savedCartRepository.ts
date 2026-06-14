import { ISavedCartRepository } from '../interfaces';
import { CartItem } from '@/types';
import { SavedCart } from '@/types/user';

/**
 * In-memory saved cart repository. Used when DynamoDB is not configured.
 * Data resets on server restart.
 */
export class InMemorySavedCartRepository implements ISavedCartRepository {
  private carts = new Map<string, SavedCart>();

  private key(userId: string, cartId: string): string {
    return `${userId}:${cartId}`;
  }

  async save(
    userId: string,
    cartId: string,
    items: CartItem[],
    situationLabel: string,
    total: number
  ): Promise<void> {
    this.carts.set(this.key(userId, cartId), {
      cartId,
      userId,
      items,
      situationLabel,
      total,
      createdAt: new Date().toISOString(),
    });
  }

  async getById(userId: string, cartId: string): Promise<SavedCart | null> {
    return this.carts.get(this.key(userId, cartId)) || null;
  }

  async listByUser(userId: string): Promise<SavedCart[]> {
    const results: SavedCart[] = [];
    for (const cart of this.carts.values()) {
      if (cart.userId === userId) {
        results.push(cart);
      }
    }
    return results.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async delete(userId: string, cartId: string): Promise<void> {
    this.carts.delete(this.key(userId, cartId));
  }
}
