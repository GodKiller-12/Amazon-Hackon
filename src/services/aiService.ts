import { CartItem } from '@/types';
import { getAIProvider, GenerateCartResult, ModifyCartResult } from './ai';

export type { GenerateCartResult, ModifyCartResult };

/**
 * Generate a cart based on a situation description.
 */
export async function generateCart(situation: string): Promise<GenerateCartResult> {
  const provider = getAIProvider();
  return provider.generateCart(situation);
}

/**
 * Modify an existing cart based on a user message.
 */
export async function modifyCart(currentCart: CartItem[], message: string): Promise<ModifyCartResult> {
  const provider = getAIProvider();
  return provider.modifyCart(currentCart, message);
}
