'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Clock } from 'lucide-react';
import { CartItem, Order } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import { useOrderStore } from '@/stores/orderStore';

interface CartPreviewProps {
  items: CartItem[];
  cartName?: string;
  reasoning?: string;
  categories?: string[];
  estimatedCost?: number;
  estimatedDelivery?: number;
}

export function CartPreview({
  items,
  cartName,
  reasoning,
  categories,
  estimatedCost,
  estimatedDelivery,
}: CartPreviewProps) {
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);
  const addOrder = useOrderStore((state) => state.addOrder);
  const cartItems = useCartStore((state) => state.items);

  const total = estimatedCost ?? items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const displayItems = items.slice(0, 5);
  const remainingCount = items.length - displayItems.length;

  function handleBuyNow() {
    const order: Order = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      items: cartItems.length > 0 ? [...cartItems] : [...items],
      situationLabel: cartName || 'Quick AI Order',
      total: total + 30,
      date: new Date().toISOString(),
      status: 'placed',
    };

    addOrder(order);
    clearCart();
    router.push('/order-success');
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md shadow-sm p-3 max-w-[300px]">
      {/* Cart Name */}
      {cartName && (
        <h3 className="text-sm font-bold text-gray-900 mb-1">{cartName}</h3>
      )}

      {/* Reasoning */}
      {reasoning && (
        <p className="text-[11px] text-gray-500 mb-2">Prepared for: {reasoning}</p>
      )}

      {/* Category Pills */}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {categories.map((cat) => (
            <span
              key={cat}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amazon-orange/10 text-amazon-orange"
            >
              {cat}
            </span>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-1.5 mb-2">
        <ShoppingCart className="h-3.5 w-3.5 text-amazon-orange" />
        <span className="text-xs font-semibold text-gray-800">
          {items.length} items
        </span>
        {estimatedDelivery && (
          <span className="flex items-center gap-0.5 text-[10px] text-gray-500 ml-auto">
            <Clock className="h-3 w-3" />
            {estimatedDelivery} min
          </span>
        )}
      </div>

      {/* Item list */}
      <div className="space-y-1.5 mb-2">
        {displayItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-xs">
            <span className="text-gray-700 truncate flex-1 mr-2">
              {item.name} <span className="text-gray-400">×{item.quantity}</span>
            </span>
            <span className="text-gray-600 font-medium flex-shrink-0">
              ₹{item.price * item.quantity}
            </span>
          </div>
        ))}
        {remainingCount > 0 && (
          <p className="text-xs text-gray-400 italic">
            ... +{remainingCount} more item{remainingCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-xs font-semibold text-gray-800">Estimated Total</span>
        <span className="text-sm font-bold text-amazon-dark">₹{total}</span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-3">
        <Link
          href="/cart"
          className="flex-1 text-center text-xs font-medium py-2 px-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
        >
          View Full Cart
        </Link>
        <button
          onClick={handleBuyNow}
          className="flex-1 text-xs font-semibold py-2 px-3 rounded-lg bg-amazon-orange text-white hover:brightness-110 active:scale-95 transition-all"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
