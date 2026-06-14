'use client';

import { useRouter } from 'next/navigation';
import { Order } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import { getRelativeTime } from '@/lib/utils';
import { trackEvent } from '@/services/analytics';

/** Map situation labels to emojis */
function getSituationEmoji(label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes('movie')) return '🎬';
  if (lower.includes('guest')) return '🏠';
  if (lower.includes('exam') || lower.includes('study')) return '📚';
  if (lower.includes('party')) return '🎉';
  if (lower.includes('emergency')) return '🚨';
  if (lower.includes('fever') || lower.includes('cold')) return '🤒';
  if (lower.includes('baby')) return '👶';
  if (lower.includes('trip') || lower.includes('travel')) return '🧳';
  return '📦';
}

interface PastOrderCardProps {
  order: Order;
}

export function PastOrderCard({ order }: PastOrderCardProps) {
  const router = useRouter();
  const setCartFromAI = useCartStore((state) => state.setCartFromAI);

  const emoji = getSituationEmoji(order.situationLabel);
  const itemCount = order.items.length;
  const itemPreview =
    order.items
      .slice(0, 3)
      .map((item) => item.name)
      .join(', ') + (itemCount > 3 ? '...' : '');

  const formattedTotal = `₹${order.total.toLocaleString('en-IN')}`;
  const relativeDate = getRelativeTime(order.date);

  function handleReorder() {
    trackEvent('reorder_used', { orderId: order.id, itemCount: order.items.length });
    setCartFromAI(order.items, order.situationLabel);
    router.push('/cart');
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Top row: situation + date */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <h3 className="font-semibold text-gray-900 text-sm">
            {order.situationLabel}
          </h3>
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {relativeDate}
        </span>
      </div>

      {/* Item info */}
      <div className="mb-3">
        <p className="text-xs text-gray-500">
          {itemCount} item{itemCount !== 1 ? 's' : ''}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
          {itemPreview}
        </p>
      </div>

      {/* Bottom row: total + reorder button */}
      <div className="flex items-center justify-between">
        <span className="font-bold text-gray-900 text-base">
          {formattedTotal}
        </span>
        <button
          onClick={handleReorder}
          className="bg-amazon-orange hover:bg-amazon-orange/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Reorder →
        </button>
      </div>
    </div>
  );
}
