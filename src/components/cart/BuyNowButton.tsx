'use client';

import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import { useOrderStore } from '@/stores/orderStore';
import { useUserStore } from '@/stores/userStore';
import { Order } from '@/types';
import { trackEvent } from '@/services/analytics';

export function BuyNowButton() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total);
  const situationLabel = useCartStore((state) => state.situationLabel);
  const clearCart = useCartStore((state) => state.clearCart);
  const addOrder = useOrderStore((state) => state.addOrder);
  const address = useUserStore((state) => state.address);
  const paymentMethod = useUserStore((state) => state.paymentMethod);

  const isDisabled = items.length === 0;

  const handleBuyNow = () => {
    const order: Order = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      items: [...items],
      situationLabel: situationLabel || 'Quick order',
      total: total + 30, // includes delivery fee
      date: new Date().toISOString(),
      status: 'placed',
    };

    trackEvent('order_placed', {
      orderId: order.id,
      total: order.total,
      source: 'cart',
    });

    addOrder(order);
    clearCart();
    router.push('/order-success');
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleBuyNow}
        disabled={isDisabled}
        className="w-full h-12 bg-amazon-orange hover:bg-amazon-orange/90 text-white font-bold text-base rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ShoppingCart className="h-5 w-5" />
        Buy Now
      </Button>

      {!isDisabled && (
        <div className="text-center space-y-0.5">
          <p className="text-xs text-gray-500">
            📍 {address.street}, {address.city}
          </p>
          <p className="text-xs text-gray-500">
            💳 {paymentMethod.label} • {paymentMethod.details}
          </p>
        </div>
      )}
    </div>
  );
}
