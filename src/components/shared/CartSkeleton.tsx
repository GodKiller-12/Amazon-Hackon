'use client';

export function CartSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 max-w-md mx-auto animate-pulse">
      {/* Cart name skeleton */}
      <div className="h-5 w-48 bg-gray-200 rounded-md mb-2" />

      {/* Reasoning skeleton */}
      <div className="h-3 w-56 bg-gray-100 rounded mb-3" />

      {/* Category pills skeleton */}
      <div className="flex gap-2 mb-4">
        <div className="h-5 w-16 bg-gray-100 rounded-full" />
        <div className="h-5 w-20 bg-gray-100 rounded-full" />
        <div className="h-5 w-14 bg-gray-100 rounded-full" />
      </div>

      {/* Item rows skeleton */}
      <div className="space-y-3 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <div className="h-4 w-4 bg-gray-200 rounded" />
              <div
                className="h-4 bg-gray-200 rounded"
                style={{ width: `${50 + Math.random() * 30}%` }}
              />
            </div>
            <div className="h-4 w-12 bg-gray-200 rounded ml-2" />
          </div>
        ))}
      </div>

      {/* Total skeleton */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="h-4 w-16 bg-gray-200 rounded" />
        <div className="h-5 w-20 bg-gray-300 rounded" />
      </div>
    </div>
  );
}
