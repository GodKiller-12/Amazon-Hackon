'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrderStore } from '@/stores/orderStore';
import { Order } from '@/types';

const CONFETTI_COLORS = ['#FF9900', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96E6A1', '#DDA0DD', '#F0E68C'];

function ConfettiPiece({ index }: { index: number }) {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const left = Math.random() * 100;
  const delay = Math.random() * 2;
  const size = 6 + Math.random() * 8;

  return (
    <div
      className="fixed top-0 animate-confetti pointer-events-none z-[200]"
      style={{
        left: `${left}%`,
        animationDelay: `${delay}s`,
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      }}
    />
  );
}

export default function OrderSuccessPage() {
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const pastOrders = useOrderStore((state) => state.pastOrders);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    if (pastOrders.length > 0) {
      setLatestOrder(pastOrders[0]);
    }
  }, [pastOrders]);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      {/* Confetti */}
      {showConfetti && (
        <>
          {Array.from({ length: 20 }).map((_, i) => (
            <ConfettiPiece key={i} index={i} />
          ))}
        </>
      )}

      {/* Success animation/icon */}
      <div className="relative mb-6 animate-scale-in">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center animate-bounce-once">
          <CheckCircle2 className="h-14 w-14 text-green-500" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-amazon-orange flex items-center justify-center">
          <Package className="h-4 w-4 text-white" />
        </div>
      </div>

      {/* Success heading */}
      <h1 className="text-2xl font-bold text-gray-900 mb-1 animate-fade-in-up">
        Order Placed Successfully!
      </h1>
      <p className="text-sm text-gray-500 mb-6 animate-fade-in-up">
        Your items are being prepared for delivery
      </p>

      {/* Order summary card */}
      {latestOrder && (
        <div className="w-full max-w-sm bg-gray-50 rounded-xl p-4 mb-8 space-y-2 animate-fade-in-up">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Items</span>
            <span className="font-medium text-gray-900">
              {latestOrder.items.length} {latestOrder.items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total</span>
            <span className="font-bold text-gray-900">
              ₹{latestOrder.total.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Est. Delivery</span>
            <span className="font-medium text-green-700">15-20 min</span>
          </div>
          {latestOrder.situationLabel && (
            <div className="border-t border-gray-200 pt-2 mt-2">
              <p className="text-xs text-gray-500">
                For: <span className="text-amazon-orange">{latestOrder.situationLabel}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="w-full max-w-sm space-y-3 animate-fade-in-up">
        <Button
          asChild
          className="w-full h-11 bg-amazon-orange hover:bg-amazon-orange/90 text-white font-semibold rounded-xl"
        >
          <Link href="/">
            Continue Shopping
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="w-full h-11 rounded-xl font-medium"
        >
          <Link href="/reorder">
            <Package className="h-4 w-4 mr-1" />
            View Past Orders
          </Link>
        </Button>
      </div>
    </div>
  );
}
