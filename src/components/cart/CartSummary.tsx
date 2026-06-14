'use client';

import { useCartStore } from '@/stores/cartStore';

const DELIVERY_FEE = 30;

export function CartSummary() {
  const total = useCartStore((state) => state.total);
  const deliveryEstimate = useCartStore((state) => state.deliveryEstimate);
  const items = useCartStore((state) => state.items);

  if (items.length === 0) return null;

  const grandTotal = total + DELIVERY_FEE;

  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
      <div className="flex justify-between text-sm text-gray-600">
        <span>Subtotal ({items.length} items)</span>
        <span>₹{total.toLocaleString('en-IN')}</span>
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <span>Delivery Fee</span>
        <span>₹{DELIVERY_FEE}</span>
      </div>

      <div className="border-t border-gray-200 pt-2.5 flex justify-between text-base font-bold text-gray-900">
        <span>Total</span>
        <span>₹{grandTotal.toLocaleString('en-IN')}</span>
      </div>

      {deliveryEstimate > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-1.5 mt-1">
          <span>⚡</span>
          <span>Estimated delivery in {deliveryEstimate} minutes</span>
        </div>
      )}
    </div>
  );
}
