"use client";

import { useState, useCallback } from "react";
import { SituationInput } from "@/components/home/SituationInput";
import { DemoPresets } from "@/components/home/DemoPresets";
import { EmergencyQuickActions } from "@/components/home/EmergencyQuickActions";
import { TrendingSituations } from "@/components/home/TrendingSituations";

export default function Home() {
  const [prefillValue, setPrefillValue] = useState("");

  const handleSituationTap = useCallback((title: string) => {
    setPrefillValue(title);
  }, []);

  const handlePrefillConsumed = useCallback(() => {
    setPrefillValue("");
  }, []);

  return (
    <div className="min-h-full">
      {/* Hero section with gradient */}
      <section className="bg-gradient-to-b from-amazon-dark via-amazon-dark/95 to-background px-4 pt-8 pb-10 sm:pt-12 sm:pb-14">
        <div className="max-w-3xl mx-auto text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            What do you need right now?
          </h1>
          <p className="text-sm sm:text-base text-gray-300">
            Describe your situation and get a ready-to-order cart in seconds
          </p>
        </div>

        <SituationInput
          prefillValue={prefillValue}
          onPrefillConsumed={handlePrefillConsumed}
        />

        <DemoPresets />
      </section>

      {/* Content sections */}
      <div className="px-4 py-6 sm:py-8 space-y-8 sm:space-y-10 max-w-4xl mx-auto">
        <EmergencyQuickActions />
        <TrendingSituations onSituationTap={handleSituationTap} />
      </div>
    </div>
  );
}
