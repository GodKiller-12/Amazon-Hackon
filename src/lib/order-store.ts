import { Order } from '@/types';

/**
 * In-memory order store (resets on server restart).
 * In production, this would be backed by DynamoDB or similar.
 */
const orders = new Map<string, Order>();

export function addOrder(order: Order): Order {
  orders.set(order.id, order);
  return order;
}

export function getOrders(limit?: number): Order[] {
  const all = Array.from(orders.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  if (limit && limit > 0) {
    return all.slice(0, limit);
  }
  return all;
}

export function getOrderById(id: string): Order | undefined {
  return orders.get(id);
}
