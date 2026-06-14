import { create } from 'zustand';
import { CartItem } from '@/types';
import { Order } from '@/types';

interface CartStore {
  items: CartItem[];
  situationLabel: string;
  total: number;
  deliveryEstimate: number;
  isLoading: boolean;
  setCartFromAI: (items: CartItem[], label: string) => void;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  loadFromOrder: (order: Order) => void;
  setLoading: (loading: boolean) => void;
}

function computeTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function computeDeliveryEstimate(items: CartItem[]): number {
  if (items.length === 0) return 0;
  return Math.max(...items.map((item) => item.deliveryMinutes));
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  situationLabel: '',
  total: 0,
  deliveryEstimate: 0,
  isLoading: false,

  setCartFromAI: (items, label) =>
    set({
      items,
      situationLabel: label,
      total: computeTotal(items),
      deliveryEstimate: computeDeliveryEstimate(items),
    }),

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      let newItems: CartItem[];
      if (existing) {
        newItems = state.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      } else {
        newItems = [...state.items, item];
      }
      return {
        items: newItems,
        total: computeTotal(newItems),
        deliveryEstimate: computeDeliveryEstimate(newItems),
      };
    }),

  removeItem: (itemId) =>
    set((state) => {
      const newItems = state.items.filter((i) => i.id !== itemId);
      return {
        items: newItems,
        total: computeTotal(newItems),
        deliveryEstimate: computeDeliveryEstimate(newItems),
      };
    }),

  updateQuantity: (itemId, quantity) =>
    set((state) => {
      let newItems: CartItem[];
      if (quantity <= 0) {
        newItems = state.items.filter((i) => i.id !== itemId);
      } else {
        newItems = state.items.map((i) =>
          i.id === itemId ? { ...i, quantity } : i
        );
      }
      return {
        items: newItems,
        total: computeTotal(newItems),
        deliveryEstimate: computeDeliveryEstimate(newItems),
      };
    }),

  clearCart: () =>
    set({
      items: [],
      situationLabel: '',
      total: 0,
      deliveryEstimate: 0,
      isLoading: false,
    }),

  loadFromOrder: (order) =>
    set({
      items: order.items,
      situationLabel: order.situationLabel,
      total: computeTotal(order.items),
      deliveryEstimate: computeDeliveryEstimate(order.items),
    }),

  setLoading: (loading) => set({ isLoading: loading }),
}));
