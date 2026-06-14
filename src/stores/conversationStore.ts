import { create } from 'zustand';
import { CartItem, Message } from '@/types';

interface ConversationStore {
  messages: Message[];
  isAITyping: boolean;
  suggestions: string[];
  initialSuggestions: string[];
  addUserMessage: (content: string) => void;
  addAIResponse: (content: string, cartPreview?: CartItem[], cartMeta?: { cartName?: string; reasoning?: string; categories?: string[]; estimatedCost?: number; estimatedDelivery?: number }) => void;
  setAITyping: (typing: boolean) => void;
  setSuggestions: (suggestions: string[]) => void;
  updateSuggestionsFromCart: (cartItems: CartItem[]) => void;
  clearConversation: () => void;
}

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const DEFAULT_SUGGESTIONS = [
  'Add desserts',
  'Make it vegetarian',
  'Add for kids',
  'Remove alcohol',
  'Budget-friendly alternatives',
];

const INITIAL_SUGGESTIONS = [
  '🏠 Guests arriving in 30 minutes',
  '🎬 Movie night with friends',
  '🤒 I have a fever',
  '📚 Exam prep all-nighter',
  '🎉 House party tonight',
  '🍳 Need breakfast items',
  '👶 Baby emergency',
  '🌧️ Rainy day at home',
];

/**
 * Generate context-aware suggestions based on current cart contents.
 */
function getContextualSuggestions(cartItems: CartItem[]): string[] {
  const categories = new Set(cartItems.map((item) => item.category));
  const suggestions: string[] = [];

  // Always offer these universal modifications
  suggestions.push('Make it budget-friendly');

  // Based on what's in the cart, suggest relevant modifications
  if (categories.has('snacks')) {
    suggestions.push('Add healthier snack options');
  }
  if (categories.has('beverages')) {
    suggestions.push('Remove soft drinks, add juice');
  }
  if (!categories.has('snacks') && !categories.has('beverages')) {
    suggestions.push('Add snacks and drinks');
  }

  // Dietary options
  if (cartItems.some((item) => item.name.toLowerCase().includes('egg') || item.name.toLowerCase().includes('chicken'))) {
    suggestions.push('Make it vegetarian');
  } else {
    suggestions.push('Add more variety');
  }

  // Quantity adjustments
  suggestions.push('Add items for 2 more people');

  // Category-specific
  if (!categories.has('household')) {
    suggestions.push('Add disposable plates & cups');
  }
  if (categories.has('pharmacy')) {
    suggestions.push('Add comfort food');
  }
  if (categories.has('snacks') && categories.has('beverages')) {
    suggestions.push('Add desserts');
  }

  return suggestions.slice(0, 5);
}

export const useConversationStore = create<ConversationStore>((set) => ({
  messages: [],
  isAITyping: false,
  suggestions: DEFAULT_SUGGESTIONS,
  initialSuggestions: INITIAL_SUGGESTIONS,

  addUserMessage: (content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: generateId(),
          role: 'user',
          content,
          timestamp: new Date().toISOString(),
        },
      ],
    })),

  addAIResponse: (content, cartPreview, cartMeta) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: generateId(),
          role: 'ai',
          content,
          timestamp: new Date().toISOString(),
          cartPreview,
          cartMeta,
        },
      ],
    })),

  setAITyping: (typing) => set({ isAITyping: typing }),

  setSuggestions: (suggestions) => set({ suggestions }),

  updateSuggestionsFromCart: (cartItems) =>
    set({ suggestions: getContextualSuggestions(cartItems) }),

  clearConversation: () =>
    set({
      messages: [],
      isAITyping: false,
      suggestions: DEFAULT_SUGGESTIONS,
    }),
}));
