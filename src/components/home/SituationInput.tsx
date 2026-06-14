"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { generateCart } from "@/services/aiService";
import { trackEvent } from "@/services/analytics";

interface SituationInputProps {
  /** When a trending situation is tapped, this value auto-fills the input */
  prefillValue?: string;
  /** Callback to clear the prefill after it's consumed */
  onPrefillConsumed?: () => void;
}

export function SituationInput({
  prefillValue,
  onPrefillConsumed,
}: SituationInputProps) {
  const [situation, setSituation] = useState("");
  const isLoading = useCartStore((state) => state.isLoading);
  const setCartFromAI = useCartStore((state) => state.setCartFromAI);
  const setLoading = useCartStore((state) => state.setLoading);
  const router = useRouter();
  const hasSubmittedPrefill = useRef(false);

  // Handle prefill from trending situations
  useEffect(() => {
    if (prefillValue && prefillValue.trim().length >= 3) {
      setSituation(prefillValue);
      hasSubmittedPrefill.current = true;
      onPrefillConsumed?.();
    }
  }, [prefillValue, onPrefillConsumed]);

  // Auto-submit after prefill value is set
  useEffect(() => {
    if (hasSubmittedPrefill.current && situation === prefillValue) {
      hasSubmittedPrefill.current = false;
      submitSituation(situation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [situation]);

  async function submitSituation(value: string) {
    if (value.trim().length < 3 || isLoading) return;

    trackEvent('situation_submitted', { situation: value, source: 'home' });

    setLoading(true);
    try {
      const result = await generateCart(value);
      setCartFromAI(result.items, result.situationLabel);
      router.push("/cart");
    } catch {
      // Fallback — unlikely with mock service
      console.error("Failed to generate cart");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submitSituation(situation);
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6">
        {/* AI badge */}
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles className="h-4 w-4 text-amazon-orange" />
          <span className="text-xs font-medium text-muted-foreground">
            AI-powered cart builder
          </span>
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="What's your situation today?"
              className="w-full h-12 sm:h-14 px-4 text-base sm:text-lg rounded-xl border border-gray-200 bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amazon-orange/50 focus:border-amazon-orange transition-all"
              disabled={isLoading}
              aria-label="Describe your situation"
              minLength={3}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || situation.trim().length < 3}
            className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl bg-amazon-orange text-white font-semibold text-base flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed transition-all min-w-[120px]"
            aria-label="Generate cart"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Generate Cart
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Validation hint */}
        {situation.length > 0 && situation.trim().length < 3 && (
          <p className="text-xs text-muted-foreground mt-2">
            Type at least 3 characters to describe your situation
          </p>
        )}

        {/* Loading state message */}
        {isLoading && (
          <p className="text-sm text-amazon-orange font-medium mt-3 animate-pulse text-center">
            ✨ AI is building your cart...
          </p>
        )}
      </div>
    </div>
  );
}
