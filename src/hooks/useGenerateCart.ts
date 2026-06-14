'use client';

import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cartStore';
import { generateCart } from '@/services/aiService';
import { trackEvent } from '@/services/analytics';

export function useGenerateCart() {
  const router = useRouter();
  const setCartFromAI = useCartStore((state) => state.setCartFromAI);
  const setLoading = useCartStore((state) => state.setLoading);
  const isLoading = useCartStore((state) => state.isLoading);

  async function generate(situation: string, source: string = 'home') {
    if (situation.trim().length < 3 || isLoading) return;

    trackEvent('situation_submitted', { situation, source });
    setLoading(true);

    try {
      const result = await generateCart(situation);
      setCartFromAI(result.items, result.situationLabel);
      trackEvent('cart_generated', {
        situationLabel: result.situationLabel,
        itemCount: result.items.length,
        total: result.estimatedCost,
      });
      router.push('/cart');
    } catch (error) {
      console.error('Failed to generate cart:', error);
    } finally {
      setLoading(false);
    }
  }

  return { generate, isLoading };
}
