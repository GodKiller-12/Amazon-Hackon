import { useOrderStore } from '@/stores/orderStore';
import { Order, CartItem, Product } from '@/types';
import productsData from '@/data/products.json';

const products = productsData as unknown as Product[];

/**
 * Find products by their IDs from the catalog.
 */
function getProductsByIds(ids: string[]): Product[] {
  return ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => p !== undefined);
}

/**
 * Convert products to CartItems with specified quantities and optional reason.
 */
function toCartItems(
  productList: Product[],
  quantities?: number[],
  reason?: string
): CartItem[] {
  return productList.map((product, index) => ({
    ...product,
    quantity: quantities?.[index] ?? 1,
    reason,
  }));
}

/**
 * Checks if the order store has any orders.
 * If empty, seeds 3 demo orders using real products from the catalog.
 * Returns true if seeded, false if orders already existed.
 */
export function seedDemoOrders(): boolean {
  const { pastOrders, addOrder } = useOrderStore.getState();

  if (pastOrders.length > 0) {
    return false;
  }

  const now = Date.now();

  // Order 1: Movie Night — 3 days ago
  const movieNightProducts = getProductsByIds([
    'prod_032', // Butter Popcorn
    'prod_026', // Classic Salted Chips
    'prod_051', // Coca-Cola
    'prod_035', // Dairy Milk Silk
    'prod_048', // Doritos Nacho
    'prod_040', // Dark Fantasy Cookies
    'prod_054', // Mango Juice
    'prod_041', // Kurkure Masala Munch
  ]);
  const movieNightItems = toCartItems(
    movieNightProducts,
    [2, 2, 2, 1, 2, 1, 2, 2],
    'Perfect for a movie night'
  );
  const movieNightTotal = movieNightItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const order1: Order = {
    id: 'ORD-DEMO-001',
    items: movieNightItems,
    situationLabel: 'Movie Night',
    total: movieNightTotal,
    date: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'delivered',
  };

  // Order 2: Guests Arriving — 1 week ago
  const guestsProducts = getProductsByIds([
    'prod_026', // Classic Salted Chips
    'prod_027', // Magic Masala Chips
    'prod_052', // Coca-Cola (6-Pack)
    'prod_055', // Mixed Fruit Juice
    'prod_049', // Mineral Water Bottle
    'prod_044', // Oreo Cookies
    'prod_030', // Aloo Bhujia
    'prod_081', // Disposable Cups
    'prod_080', // Disposable Plates
    'prod_088', // Napkins
    'prod_034', // Salted Cashews
    'prod_077', // Room Freshener
  ]);
  const guestsItems = toCartItems(
    guestsProducts,
    [2, 2, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1],
    'Great for hosting guests'
  );
  const guestsTotal = guestsItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const order2: Order = {
    id: 'ORD-DEMO-002',
    items: guestsItems,
    situationLabel: 'Guests Arriving',
    total: guestsTotal,
    date: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'delivered',
  };

  // Order 3: Exam Prep All-Nighter — 2 weeks ago
  const examProducts = getProductsByIds([
    'prod_060', // Instant Coffee
    'prod_057', // Energy Drink
    'prod_029', // Marie Gold Biscuits
    'prod_036', // KitKat
    'prod_042', // Mixed Dry Fruits
    'prod_012', // Tea Leaves
    'prod_056', // Orange Juice
  ]);
  const examItems = toCartItems(
    examProducts,
    [1, 2, 2, 2, 1, 1, 1],
    'Fuel for the all-night study session'
  );
  const examTotal = examItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const order3: Order = {
    id: 'ORD-DEMO-003',
    items: examItems,
    situationLabel: 'Exam Prep All-Nighter',
    total: examTotal,
    date: new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'delivered',
  };

  // Add orders oldest-first so they appear sorted correctly (store prepends)
  addOrder(order3);
  addOrder(order2);
  addOrder(order1);

  return true;
}
