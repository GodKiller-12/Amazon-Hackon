import { CartItem } from "./cart";

/**
 * Status of an order in its lifecycle.
 */
export type OrderStatus = "placed" | "confirmed" | "delivering" | "delivered";

/**
 * Represents a completed order.
 */
export interface Order {
  /** Unique order identifier */
  id: string;
  /** Items that were ordered */
  items: CartItem[];
  /** Situation label describing what the order was for */
  situationLabel: string;
  /** Total price in INR */
  total: number;
  /** ISO 8601 date string of when the order was placed */
  date: string;
  /** Current status of the order */
  status: OrderStatus;
}
