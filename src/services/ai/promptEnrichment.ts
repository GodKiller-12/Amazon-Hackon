/**
 * PromptEnrichment Layer
 *
 * Enriches AI prompts with user context for personalized responses.
 * Generates concise context summaries (under 500 tokens) to avoid bloating prompts.
 */

import { CartItem } from '@/types';
import { UserContext, EnrichedPromptContext } from './context.types';
import { GENERATE_CART_SYSTEM_PROMPT, MODIFY_CART_SYSTEM_PROMPT } from './prompts';

export class PromptEnrichment {
  /**
   * Enriches the generate-cart prompt with user context.
   */
  enrichGeneratePrompt(situation: string, context: UserContext): EnrichedPromptContext {
    const contextSummary = this.summarizeContext(context);
    const systemPrompt = GENERATE_CART_SYSTEM_PROMPT;

    let userMessage = '';

    // Add context summary first
    if (contextSummary) {
      userMessage += `${contextSummary}\n\n`;
    }

    userMessage += `## User Situation:\n"${situation}"`;

    // Add preferences from profile if available
    if (context.profile) {
      userMessage += `\n\n## User Preferences:\n`;
      userMessage += `- Dietary restrictions: ${context.profile.dietaryRestrictions.length > 0 ? context.profile.dietaryRestrictions.join(', ') : 'None'}\n`;
      userMessage += `- Household size: ${context.profile.householdSize}`;
    }

    return {
      systemPrompt,
      userMessage,
      contextSummary,
    };
  }

  /**
   * Enriches the modify-cart prompt with conversation context.
   */
  enrichModifyPrompt(
    message: string,
    currentCart: CartItem[],
    context: UserContext
  ): EnrichedPromptContext {
    const contextSummary = this.summarizeContext(context);
    const systemPrompt = MODIFY_CART_SYSTEM_PROMPT;

    let userMessage = '';

    // Add context summary
    if (contextSummary) {
      userMessage += `${contextSummary}\n\n`;
    }

    // Add conversation history if available
    if (context.conversationContext.hasActiveConversation && context.conversationContext.recentMessages.length > 0) {
      userMessage += `## Recent Conversation:\n`;
      for (const msg of context.conversationContext.recentMessages) {
        userMessage += `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}\n`;
      }
      userMessage += '\n';
    }

    // Add current cart
    const cartSummary = currentCart
      .map((item) => `- ${item.name} (₹${item.price} × ${item.quantity}, id: ${item.id}, category: ${item.category})`)
      .join('\n');
    userMessage += `## Current Cart:\n${cartSummary}\n\n`;

    userMessage += `## User Request:\n"${message}"`;

    return {
      systemPrompt,
      userMessage,
      contextSummary,
    };
  }

  /**
   * Generates a concise context summary for prompt injection.
   * Keeps under 500 tokens to avoid bloating the prompt.
   */
  summarizeContext(context: UserContext): string {
    const lines: string[] = [];
    lines.push('## User Context:');

    // Profile info
    if (context.profile) {
      lines.push(`- Name: ${context.profile.name}, Household: ${context.profile.householdSize}`);

      if (context.profile.dietaryRestrictions.length > 0) {
        lines.push(`- Dietary: ${context.profile.dietaryRestrictions.join(', ')}`);
      }

      lines.push(`- Location: ${context.profile.city}`);
    }

    // Order history
    if (context.orderHistory.totalOrders > 0) {
      lines.push(`- Order History: ${context.orderHistory.totalOrders} past orders`);

      if (context.orderHistory.frequentItems.length > 0) {
        const topItems = context.orderHistory.frequentItems
          .slice(0, 5)
          .map((item) => item.name)
          .join(', ');
        lines.push(`- Frequently buys: ${topItems}`);
      }

      if (context.orderHistory.preferredCategories.length > 0) {
        lines.push(`- Prefers: ${context.orderHistory.preferredCategories.join(', ')}`);
      }

      if (context.orderHistory.recentOrders.length > 0) {
        const recentLabels = context.orderHistory.recentOrders
          .slice(0, 3)
          .map((order) => {
            const daysAgo = this.getDaysAgo(order.date);
            return `"${order.situationLabel}" (${daysAgo})`;
          })
          .join(', ');
        lines.push(`- Recent orders: ${recentLabels}`);
      }
    }

    // Time context
    lines.push(`- Time: ${context.timeContext.dayOfWeek} ${context.timeContext.timeOfDay}${context.timeContext.isWeekend ? ' (weekend)' : ''}`);

    // Conversation context
    if (context.conversationContext.hasActiveConversation && context.conversationContext.currentCartItems.length > 0) {
      lines.push(`- Current cart: ${context.conversationContext.currentCartItems.slice(0, 5).join(', ')}`);
    }

    return lines.join('\n');
  }

  /**
   * Formats a date as a human-readable "X days ago" string.
   */
  private getDaysAgo(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'today';
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 14) return '1 week ago';
      return `${Math.floor(diffDays / 7)} weeks ago`;
    } catch {
      return 'recently';
    }
  }
}
