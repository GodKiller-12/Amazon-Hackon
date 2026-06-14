'use client';

import { Check, Clock } from 'lucide-react';
import { CartItem } from '@/types';

interface EmergencyCartViewProps {
  items: CartItem[];
  categoryTitle: string;
  categoryIcon: string;
}

export function EmergencyCartView({
  items,
  categoryTitle,
  categoryIcon,
}: EmergencyCartViewProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="w-full">
      {/* Category header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl" role="img" aria-label={categoryTitle}>
          {categoryIcon}
        </span>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{categoryTitle}</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Clock className="h-3.5 w-3.5 text-success-green" />
            <span className="text-sm font-medium text-success-green">
              ~15 min delivery
            </span>
          </div>
        </div>
      </div>

      {/* Emergency cart header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-800">
          ⚡ EMERGENCY CART ({items.length} items)
        </h2>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
          <Clock className="h-3 w-3 mr-1" />
          ~15 min
        </span>
      </div>

      {/* Item list */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 px-4 py-3"
          >
            <Check className="h-4 w-4 text-success-green flex-shrink-0" />
            <span className="flex-1 text-sm text-gray-800 font-medium truncate">
              {item.name}
            </span>
            <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
              ₹{item.price}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between mt-4 px-4 py-3 bg-gray-50 rounded-xl">
        <span className="text-base font-bold text-gray-900">Total</span>
        <span className="text-lg font-bold text-gray-900">
          ₹{total.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
}
