'use client';

export function CartSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 max-w-md mx-auto">
      {/* Cart name skeleton */}
      <div className="h-5 w-48 rounded-md mb-2 animate-shimmer" />

      {/* Reasoning skeleton */}
      <div className="h-3 w-56 rounded mb-3 animate-shimmer" />

      {/* Category pills skeleton */}
      <div className="flex gap-2 mb-4">
        <div className="h-5 w-16 rounded-full animate-shimmer" />
        <div className="h-5 w-20 rounded-full animate-shimmer" />
        <div className="h-5 w-14 rounded-full animate-shimmer" />
      </div>

      {/* Item rows skeleton */}
      <div className="space-y-3 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <div className="h-4 w-4 rounded animate-shimmer" />
              <div
                className="h-4 rounded animate-shimmer"
                style={{ width: `${50 + Math.random() * 30}%` }}
              />
            </div>
            <div className="h-4 w-12 rounded ml-2 animate-shimmer" />
          </div>
        ))}
      </div>

      {/* Total skeleton */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="h-4 w-16 rounded animate-shimmer" />
        <div className="h-5 w-20 rounded animate-shimmer" />
      </div>
    </div>
  );
}
