'use client';

import { useState, useMemo } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useOrderStore } from '@/stores/orderStore';
import { useCartStore } from '@/stores/cartStore';
import { CartItem } from '@/types';

export function ReplenishmentBanner() {
  const pastOrders = useOrderStore((state) => state.pastOrders);
  const addItem = useCartStore((state) => state.addItem);
  const [dismissed, setDismissed] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const replenishmentItems = useMemo(() => {
    if (pastOrders.length < 3) return [];

    // Count item frequency across orders
    const itemFrequency: Record<string, { item: CartItem; count: number }> = {};

    for (const order of pastOrders) {
      for (const item of order.items) {
        if (itemFrequency[item.id]) {
          itemFrequency[item.id].count++;
        } else {
          itemFrequency[item.id] = { item, count: 1 };
        }
      }
    }

    // Items that appear in 2+ orders are candidates for replenishment
    return Object.values(itemFrequency)
      .filter((entry) => entry.count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((entry) => entry.item);
  }, [pastOrders]);

  if (dismissed || replenishmentItems.length === 0) return null;

  function handleReorder(item: CartItem) {
    addItem({ ...item, quantity: 1, reason: 'Replenishment suggestion' });
    setAddedIds((prev) => new Set([...prev, item.id]));
  }

  return (
    <section className="w-full animate-fade-in-up">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">
              Time to restock?
            </h3>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-md hover:bg-blue-100 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        <p className="text-xs text-gray-600 mb-3">
          Based on your order history, you might need these again:
        </p>

        {/* Items */}
        <div className="space-y-2">
          {replenishmentItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500">₹{item.price}</p>
              </div>
              <button
                onClick={() => handleReorder(item)}
                disabled={addedIds.has(item.id)}
                className="ml-3 px-3 py-1 text-xs font-medium rounded-full bg-amazon-orange text-white hover:bg-amazon-orange/90 disabled:bg-gray-200 disabled:text-gray-500 transition-colors"
              >
                {addedIds.has(item.id) ? '✓ Added' : 'Reorder'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
