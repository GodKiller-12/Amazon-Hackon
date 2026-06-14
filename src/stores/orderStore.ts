import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order } from '@/types';

interface OrderStore {
  pastOrders: Order[];
  addOrder: (order: Order) => void;
  getOrders: () => Order[];
  getOrderById: (id: string) => Order | undefined;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      pastOrders: [],

      addOrder: (order) =>
        set((state) => ({
          pastOrders: [order, ...state.pastOrders],
        })),

      getOrders: () => {
        const { pastOrders } = get();
        return [...pastOrders].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      },

      getOrderById: (id) => {
        const { pastOrders } = get();
        return pastOrders.find((order) => order.id === id);
      },
    }),
    {
      name: 'urgentcart-orders',
    }
  )
);
