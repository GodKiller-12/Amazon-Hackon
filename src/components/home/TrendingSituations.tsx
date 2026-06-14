"use client";

import trending from "@/data/trending.json";

interface TrendingSituationsProps {
  /** Called when a trending situation card is tapped, passing the situation title */
  onSituationTap: (title: string) => void;
}

export function TrendingSituations({ onSituationTap }: TrendingSituationsProps) {
  return (
    <section className="w-full">
      <h2 className="text-lg font-bold text-foreground mb-3 px-1">
        💡 Trending Situations
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {trending.map((situation) => (
          <button
            key={situation.id}
            onClick={() => onSituationTap(situation.title)}
            className="group text-left rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-amazon-orange/30 active:scale-[0.97] transition-all min-h-[100px]"
            aria-label={`Auto-fill: ${situation.title}`}
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
