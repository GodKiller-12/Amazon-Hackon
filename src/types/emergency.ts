import { CartItem } from "./cart";

/**
 * Represents an emergency category with metadata for display.
 */
export interface EmergencyCategory {
  /** Unique category identifier */
  id: string;
  /** Display title of the emergency category */
  title: string;
  /** Emoji icon representing the category */
  icon: string;
  /** Short description of the emergency scenario */
  description: string;
  /** Number of items in this emergency preset */
  itemCount: number;
}

/**
 * Represents a pre-configured emergency cart preset.
 */
export interface EmergencyPreset {
  /** ID of the associated emergency category */
  categoryId: string;
  /** Pre-selected items for this emergency */
  items: CartItem[];
  /** Estimated delivery time in minutes */
  estimatedDelivery: number;
}
