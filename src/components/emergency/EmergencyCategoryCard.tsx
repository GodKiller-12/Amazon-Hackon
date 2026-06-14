'use client';

import Link from 'next/link';

interface EmergencyCategoryCardProps {
  id: string;
  title: string;
  icon: string;
  description: string;
  itemCount: number;
}

export function EmergencyCategoryCard({
  id,
  title,
  icon,
  description,
  itemCount,
}: EmergencyCategoryCardProps) {
  return (
    <Link href={`/emergency/${id}`} className="block group">
      <div className="h-full rounded-xl border border-red-100 bg-white p-5 shadow-sm hover:shadow-lg hover:border-emergency-red/40 hover:-translate-y-1 active:scale-[0.98] transition-all duration-200">
        {/* Large emoji icon */}
        <div className="text-5xl mb-3" role="img" aria-label={title}>
          {icon}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-emergency-red transition-colors mb-1">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed mb-3">
          {description}
        </p>

        {/* Item count badge */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-emergency-red">
            {itemCount} items
          </span>

          {/* CTA */}
          <span className="text-sm font-semibold text-emergency-red opacity-80 group-hover:opacity-100 transition-opacity">
            Order Now →
          </span>
        </div>
      </div>
    </Link>
  );
}
