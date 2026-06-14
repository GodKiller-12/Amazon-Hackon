'use client';

import { useGenerateCart } from '@/hooks/useGenerateCart';

const PRESETS = [
  { label: 'Guests Arriving', situation: 'guests arriving at home', icon: '🏠' },
  { label: 'Movie Night', situation: 'movie night at home', icon: '🍿' },
  { label: 'Exam Prep', situation: 'exam tomorrow need study fuel', icon: '📚' },
  { label: 'Weekend Trip', situation: 'weekend trip packing', icon: '🎒' },
  { label: 'House Party', situation: 'house party tonight', icon: '🥳' },
];

export function DemoPresets() {
  const { generate, isLoading } = useGenerateCart();

  return (
    <div className="w-full max-w-2xl mx-auto mt-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
        ⚡ Quick Demo
      </p>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => generate(preset.situation, 'demo-preset')}
            disabled={isLoading}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 bg-white/80 text-sm font-medium text-gray-700 hover:border-amazon-orange hover:text-amazon-orange hover:bg-amazon-orange/5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span>{preset.icon}</span>
            <span>{preset.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
