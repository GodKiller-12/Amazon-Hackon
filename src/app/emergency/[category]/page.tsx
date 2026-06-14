'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Rocket, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmergencyCartView } from '@/components/emergency/EmergencyCartView';
import { getEmergencyCart, getCategoryById } from '@/services/emergencyPresets';
import { useCartStore } from '@/stores/cartStore';
import { useOrderStore } from '@/stores/orderStore';
import { Order } from '@/types';
import { trackEvent } from '@/services/analytics';

export default function EmergencyCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);
  const router = useRouter();

  const setCartFromAI = useCartStore((state) => state.setCartFromAI);
  const addOrder = useOrderStore((state) => state.addOrder);

  const categoryData = getCategoryById(category);
  const items = getEmergencyCart(category);

  // Handle invalid category
  if (!categoryData || items.length === 0) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <span className="text-5xl mb-4">🚫</span>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Emergency not found
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          This emergency category doesn&apos;t exist or has no items.
        </p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/emergency">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Emergencies
          </Link>
        </Button>
      </main>
    );
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleOrderNow = () => {
    const order: Order = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      items: [...items],
      situationLabel: `Emergency: ${categoryData.title}`,
      total: total + 30, // delivery fee
      date: new Date().toISOString(),
      status: 'placed',
    };

    trackEvent('emergency_ordered', {
      category: categoryData.title,
      itemCount: items.length,
      total: total + 30,
    });

    addOrder(order);
    router.push('/order-success');
  };

  const handleEditCart = () => {
    setCartFromAI(items, `Emergency: ${categoryData.title}`);
    router.push('/cart');
  };

  return (
    <main className="flex flex-col min-h-[80vh] px-4 py-6 pb-32 max-w-lg mx-auto w-full">
      {/* Back link */}
      <Link
        href="/emergency"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-emergency-red mb-4 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All Emergencies
      </Link>

      {/* Cart view */}
      <EmergencyCartView
        items={items}
        categoryTitle={categoryData.title}
        categoryIcon={categoryData.icon}
      />

      {/* Fixed bottom action area */}
      <div className="fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 py-3 z-40">
        <div className="max-w-lg mx-auto space-y-2">
          {/* ORDER NOW button - huge and prominent */}
          <Button
            onClick={handleOrderNow}
            className="w-full h-14 bg-emergency-red hover:bg-emergency-red/90 text-white font-bold text-lg rounded-xl shadow-lg shadow-red-200/50 active:scale-[0.97] transition-all"
          >
            <Rocket className="h-5 w-5 mr-2" />
            ORDER NOW (1-tap)
          </Button>

          {/* Edit cart link */}
          <Button
            onClick={handleEditCart}
            variant="ghost"
            className="w-full h-10 text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            <ShoppingBag className="h-4 w-4 mr-1" />
            Edit Cart
          </Button>
        </div>
      </div>
    </main>
  );
}
