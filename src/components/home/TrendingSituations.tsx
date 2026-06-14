"use client";

import trending from "@/data/trending.json";
import { useGenerateCart } from "@/hooks/useGenerateCart";

export function TrendingSituations() {
  const { generate, isLoading } = useGenerateCart();

  return (
    <section className="w-full">
      <h2 className="text-lg font-bold text-foreground mb-3 px-1">
        💡 Trending Situations
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {trending.map((situation, index) => (
          <button
            key={situation.id}
            onClick={() => generate(situation.title, 'trending')}
            disabled={isLoading}
            className="group text-left rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-amazon-orange/30 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[100px] animate-fade-in-up"
            style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
            aria-label={`Generate cart for: ${situation.title}`}
          >
            {/* Emoji */}
            <span className="text-2xl mb-2 block" role="img" aria-hidden="true">
              {situation.emoji}
            </span>

            {/* Title */}
            <h3 className="font-semibold text-sm text-foreground group-hover:text-amazon-orange transition-colors leading-tight">
              {situation.title}
            </h3>

            {/* Description */}
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
              {situation.description}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
