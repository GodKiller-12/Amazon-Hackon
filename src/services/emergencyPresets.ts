import { CartItem, Product } from '@/types';
import { EmergencyCategory } from '@/types';
import productsData from '@/data/products.json';
import emergenciesData from '@/data/emergencies.json';

const products = productsData as unknown as Product[];

interface EmergencyRaw {
  id: string;
  title: string;
  icon: string;
  description: string;
  itemCount: number;
  productIds: string[];
}

const emergencies = emergenciesData as EmergencyRaw[];

// Build a product lookup map for O(1) access
const productMap = new Map<string, Product>();
for (const product of products) {
  productMap.set(product.id, product);
}

/**
 * Returns all emergency categories with metadata (without resolved products).
 */
export function getCategories(): EmergencyCategory[] {
  return emergencies.map(({ id, title, icon, description, itemCount }) => ({
    id,
    title,
    icon,
    description,
    itemCount,
  }));
}

/**
 * Returns a single EmergencyCategory by ID, or undefined if not found.
 */
export function getCategoryById(categoryId: string): EmergencyCategory | undefined {
  const raw = emergencies.find((e) => e.id === categoryId);
  if (!raw) return undefined;
  return {
    id: raw.id,
    title: raw.title,
    icon: raw.icon,
    description: raw.description,
    itemCount: raw.itemCount,
  };
}

/**
 * Returns fully resolved CartItem[] for a given emergency category.
 * Skips products that are not found in the catalog.
 */
export function getEmergencyCart(categoryId: string): CartItem[] {
  const category = emergencies.find((e) => e.id === categoryId);
  if (!category) return [];

  const items: CartItem[] = [];

  for (const productId of category.productIds) {
    const product = productMap.get(productId);
    if (!product) continue; // Skip missing products gracefully

    items.push({
      ...product,
      quantity: 1,
      reason: 'Emergency essential',
    });
  }

  return items;
}
