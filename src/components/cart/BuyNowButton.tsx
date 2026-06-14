'use client';

import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import { useUserStore } from '@/stores/userStore';

export function BuyNowButton() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const address = useUserStore((state) => state.address);
  const paymentMethod = useUserStore((state) => state.paymentMethod);

  const isDisabled = items.length === 0;

  const handleBuyNow = () => {
    router.push('/checkout');
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleBuyNow}
        disabled={isDisabled}
        className="w-full h-12 bg-amazon-orange hover:bg-amazon-orange/90 text-white font-bold text-base rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ShoppingCart className="h-5 w-5" />
        Proceed to Checkout
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
