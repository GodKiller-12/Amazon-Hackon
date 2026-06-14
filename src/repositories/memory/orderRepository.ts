import { IOrderRepository } from '../interfaces';
import { Order, OrderStatus } from '@/types';

/**
 * In-memory order repository. Used when DynamoDB is not configured.
 * Data resets on server restart.
 */
export class InMemoryOrderRepository implements IOrderRepository {
  private orders = new Map<string, Order>();

  async create(_userId: string, order: Order): Promise<Order> {
    this.orders.set(order.id, order);
    return order;
  }

  async getById(_userId: string, orderId: string): Promise<Order | null> {
    return this.orders.get(orderId) || null;
  }

  async listByUser(_userId: string, limit?: number): Promise<Order[]> {
    const all = Array.from(this.orders.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    if (limit && limit > 0) {
      return all.slice(0, limit);
    }
    return all;
  }

  async updateStatus(_userId: string, orderId: string, status: OrderStatus): Promise<Order> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }
    const updated = { ...order, status };
    this.orders.set(orderId, updated);
    return updated;
  }
}
