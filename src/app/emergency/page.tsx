'use client';

import { Zap } from 'lucide-react';
import { getCategories } from '@/services/emergencyPresets';
import { EmergencyCategoryCard } from '@/components/emergency/EmergencyCategoryCard';

const categories = getCategories();

export default function EmergencyPage() {
  return (
    <main className="flex flex-col min-h-[80vh] px-4 py-6 pb-24 max-w-2xl mx-auto w-full">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-6 w-6 text-emergency-red" />
          <h1 className="text-2xl font-bold text-gray-900">Emergency Mode</h1>
        </div>
        <p className="text-sm text-gray-500">
          Pre-configured carts for instant ordering
        </p>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((category) => (
          <EmergencyCategoryCard
            key={category.id}
            id={category.id}
            title={category.title}
            icon={category.icon}
            description={category.description}
            itemCount={category.itemCount}
          />
        ))}
      </div>
    </main>
  );
}
