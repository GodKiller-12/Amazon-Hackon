'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem } from '@/types';
import { useCartStore } from '@/stores/cartStore';

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0 animate-scale-in">
      {/* Product image placeholder */}
      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <span className="text-2xl">📦</span>
      </div>

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 truncate">
          {item.name}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">{item.brand}</p>
        {item.reason && (
          <p className="text-xs text-amazon-orange mt-0.5 truncate">
            {item.reason}
          </p>
        )}
        <p className="text-sm font-bold text-gray-900 mt-1">
          ₹{item.price.toLocaleString('en-IN')}
        </p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() =>
            item.quantity === 1
              ? removeItem(item.id)
              : updateQuantity(item.id, item.quantity - 1)
          }
          className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
          aria-label={item.quantity === 1 ? 'Remove item' : 'Decrease quantity'}
        >
          {item.quantity === 1 ? (
            <Trash2 className="h-3.5 w-3.5 text-red-500" />
          ) : (
            <Minus className="h-3.5 w-3.5 text-gray-600" />
          )}
        </button>

        <span className="w-6 text-center text-sm font-semibold text-gray-900">
          {item.quantity}
        </span>

        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
          aria-label="Increase quantity"
        >
          <Plus className="h-3.5 w-3.5 text-gray-600" />
        </button>
      </div>

      {/* Remove button */}
      <button
        onClick={() => removeItem(item.id)}
        className="p-1.5 rounded-md hover:bg-red-50 transition-colors ml-1"
        aria-label="Remove item"
      >
        <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
      </button>
    </div>
  );
}
