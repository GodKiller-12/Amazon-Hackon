/**
 * Context-Aware AI Types
 *
 * Defines the user context structure that enriches AI prompts
 * for personalized cart generation and modification.
 */

export interface UserContext {
  userId: string;
  profile: {
    name: string;
    householdSize: number;
    dietaryRestrictions: string[];
    city: string;
  } | null;
  orderHistory: {
    totalOrders: number;
    recentOrders: {
      situationLabel: string;
      date: string;
      itemCategories: string[];
      total: number;
    }[];
    frequentItems: { name: string; category: string; count: number }[];
    preferredCategories: string[];
  };
  conversationContext: {
    hasActiveConversation: boolean;
    recentMessages: { role: string; content: string }[];
    currentCartItems: string[];
  };
  timeContext: {
    dayOfWeek: string;
    timeOfDay: string; // morning, afternoon, evening, night
    isWeekend: boolean;
  };
}

export interface EnrichedPromptContext {
  systemPrompt: string;
  userMessage: string;
  contextSummary: string;
}

export interface ExtractedPreferences {
  frequentItems: { name: string; category: string; count: number }[];
  preferredCategories: string[];
  avgOrderSize: number;
  pricePreference: 'budget' | 'mid-range' | 'premium';
  avoidedCategories: string[];
}

export interface FrequentItem {
  name: string;
  category: string;
  count: number;
}
