/**
 * Product category union type representing all available store categories.
 */
export type ProductCategory =
  | "grocery"
  | "snacks"
  | "beverages"
  | "household"
  | "pharmacy"
  | "personal-care"
  | "baby-care"
  | "emergency-supplies";

/**
 * Represents a product in the UrgentCart catalog.
 */
export interface Product {
  /** Unique product identifier */
  id: string;
  /** Display name of the product */
  name: string;
  /** Price in INR */
  price: number;
  /** Product category classification */
  category: ProductCategory;
  /** Searchable tags for AI matching */
  tags: string[];
  /** Whether the product is currently in stock */
  inStock: boolean;
  /** Estimated delivery time in minutes */
  deliveryMinutes: number;
  /** URL or path to product image */
  imageUrl: string;
  /** Brand name */
  brand: string;
  /** Short description of the product */
  description: string;
}
