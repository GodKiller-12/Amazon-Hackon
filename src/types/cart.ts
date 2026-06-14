import { Product } from "./product";

/**
 * Represents a product added to the cart, extending Product with quantity and AI reasoning.
 */
export interface CartItem extends Product {
  /** Number of units of this product in the cart */
  quantity: number;
  /** Optional reason explaining why the AI picked this item for the situation */
  reason?: string;
}

/**
 * Represents the current state of the shopping cart.
 */
export interface CartState {
  /** List of items currently in the cart */
  items: CartItem[];
  /** Label describing the situation this cart was built for */
  situationLabel: string;
  /** Total price of all items in INR */
  total: number;
  /** Estimated delivery time in minutes */
  deliveryEstimate: number;
  /** Whether the cart is currently being generated or modified */
  isLoading: boolean;
}
