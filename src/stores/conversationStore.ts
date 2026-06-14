import { create } from 'zustand';
import { CartItem, Message } from '@/types';

interface ConversationStore {
  messages: Message[];
  isAITyping: boolean;
  suggestions: string[];
  addUserMessage: (content: string) => void;
  addAIResponse: (content: string, cartPreview?: CartItem[], cartMeta?: { cartName?: string; reasoning?: string; categories?: string[]; estimatedCost?: number; estimatedDelivery?: number }) => void;
  setAITyping: (typing: boolean) => void;
  setSuggestions: (suggestions: string[]) => void;
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

export const useConversationStore = create<ConversationStore>((set) => ({
  messages: [],
  isAITyping: false,
  suggestions: DEFAULT_SUGGESTIONS,

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

  clearConversation: () =>
    set({
      messages: [],
      isAITyping: false,
      suggestions: DEFAULT_SUGGESTIONS,
    }),
}));
