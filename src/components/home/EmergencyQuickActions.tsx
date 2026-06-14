"use client";

import Link from "next/link";
import emergencies from "@/data/emergencies.json";

export function EmergencyQuickActions() {
  // Show only the first 3 emergencies
  const topEmergencies = emergencies.slice(0, 3);

  return (
    <section className="w-full">
      <h2 className="text-lg font-bold text-foreground mb-3 px-1">
        🔥 Quick Emergencies
      </h2>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
        {topEmergencies.map((emergency) => (
          <Link
            key={emergency.id}
            href={`/emergency/${emergency.id}`}
            className="group flex-shrink-0 snap-start w-[260px] sm:w-[280px]"
          >
            <div className="h-full rounded-xl border border-red-100 bg-gradient-to-br from-white to-red-50 p-4 shadow-sm hover:shadow-md hover:border-emergency-red/30 active:scale-[0.97] transition-all">
              {/* Icon and title */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl" role="img" aria-label={emergency.title}>
                  {emergency.icon}
                </span>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-emergency-red transition-colors">
                    {emergency.title}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {emergency.itemCount} items ready
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {emergency.description}
              </p>

              {/* CTA hint */}
              <div className="mt-3 text-xs font-medium text-emergency-red opacity-0 group-hover:opacity-100 transition-opacity">
                Tap to get instant cart →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
