import { CartItem } from '@/types';
import { getAIProvider, GenerateCartResult, ModifyCartResult, UserContext, ContextBuilder } from './ai';

export type { GenerateCartResult, ModifyCartResult };

/**
 * Generate a cart based on a situation description.
 * If userId is provided, loads user context for personalized results.
 */
export async function generateCart(situation: string, userId?: string): Promise<GenerateCartResult> {
  const provider = getAIProvider();

  let context: UserContext | undefined;
  if (userId) {
    try {
      const contextBuilder = new ContextBuilder();
      context = await contextBuilder.buildContext(userId);
    } catch (error) {
      console.warn('[aiService] Failed to build context, proceeding without:', error instanceof Error ? error.message : error);
    }
  }

  return provider.generateCart(
    situation,
    context?.profile
      ? {
          dietary: context.profile.dietaryRestrictions,
          householdSize: context.profile.householdSize,
        }
      : undefined,
    context
  );
}

/**
 * Modify an existing cart based on a user message.
 * If userId is provided, loads user context for personalized modifications.
 */
export async function modifyCart(
  currentCart: CartItem[],
  message: string,
  userId?: string,
  conversationId?: string
): Promise<ModifyCartResult> {
  const provider = getAIProvider();

  let context: UserContext | undefined;
  if (userId) {
    try {
      const contextBuilder = new ContextBuilder();
      context = await contextBuilder.buildModifyContext(userId, conversationId);
    } catch (error) {
      console.warn('[aiService] Failed to build modify context, proceeding without:', error instanceof Error ? error.message : error);
    }
  }

  return provider.modifyCart(currentCart, message, context);
}
