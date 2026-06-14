'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { CartSummary } from '@/components/cart/CartSummary';
import { BuyNowButton } from '@/components/cart/BuyNowButton';
import { Button } from '@/components/ui/button';

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const situationLabel = useCartStore((state) => state.situationLabel);

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <ShoppingCart className="h-10 w-10 text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Your cart is empty
        </h2>
        <p className="text-sm text-gray-500 mb-6 max-w-[250px]">
          Describe a situation to get started — we&apos;ll build the perfect cart for you.
        </p>
        <Button asChild className="bg-amazon-orange hover:bg-amazon-orange/90 text-white font-semibold rounded-xl px-6">
          <Link href="/">Go to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header with item count */}
      <div>
        <h1 className="text-lg font-bold text-gray-900">
          Your Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
        </h1>
        {situationLabel && (
          <p className="text-sm text-gray-600 mt-0.5">
            Situation: <span className="text-amazon-orange font-medium">&ldquo;{situationLabel}&rdquo;</span>
          </p>
        )}
      </div>

      {/* Cart items list */}
      <div className="bg-white rounded-xl border border-gray-100 px-3">
        {items.map((item) => (
          <CartItemRow key={item.id} item={item} />
        ))}
      </div>

      {/* Summary */}
      <CartSummary />

      {/* Buy Now CTA */}
      <div className="pt-2 pb-4">
        <BuyNowButton />
      </div>
    </div>
  );
}
