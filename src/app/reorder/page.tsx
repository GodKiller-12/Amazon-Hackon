'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PackageOpen } from 'lucide-react';
import { useOrderStore } from '@/stores/orderStore';
import { seedDemoOrders } from '@/lib/seedOrders';
import { PastOrderCard } from '@/components/reorder/PastOrderCard';
import { Button } from '@/components/ui/button';
import { Order } from '@/types';

export default function ReorderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [seeded, setSeeded] = useState(false);

  const pastOrders = useOrderStore((state) => state.pastOrders);
  const getOrders = useOrderStore((state) => state.getOrders);

  // Seed demo orders on first load if store is empty
  useEffect(() => {
    if (!seeded) {
      seedDemoOrders();
      setSeeded(true);
    }
  }, [seeded]);

  // Update local orders whenever pastOrders changes
  useEffect(() => {
    setOrders(getOrders());
  }, [pastOrders, getOrders]);

  // Empty state (even after seeding attempt)
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <PackageOpen className="h-10 w-10 text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          No past orders yet
        </h2>
        <p className="text-sm text-gray-500 mb-6 max-w-[250px]">
          Start shopping to see your orders here
        </p>
        <Button
          asChild
          className="bg-amazon-orange hover:bg-amazon-orange/90 text-white font-semibold rounded-xl px-6"
        >
          <Link href="/">Go to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-lg font-bold text-gray-900">
          📦 Your Past Orders
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          One tap to reorder your favorites
        </p>
      </div>

      {/* Order cards */}
      <div className="space-y-3">
        {orders.map((order) => (
          <PastOrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
