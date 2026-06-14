import { CartItem } from "./cart";

/**
 * Represents a single message in the AI conversation.
 */
export interface Message {
  /** Unique message identifier */
  id: string;
  /** Who sent the message */
  role: "user" | "ai";
  /** Text content of the message */
  content: string;
  /** ISO 8601 timestamp of when the message was sent */
  timestamp: string;
  /** Optional cart preview attached to AI messages showing current cart state */
  cartPreview?: CartItem[];
  /** Enhanced cart metadata from AI provider */
  cartMeta?: {
    cartName?: string;
    reasoning?: string;
    categories?: string[];
    estimatedCost?: number;
    estimatedDelivery?: number;
  };
}

/**
 * Represents the state of the AI conversation.
 */
export interface ConversationState {
  /** List of messages in the conversation */
  messages: Message[];
  /** Whether the AI is currently generating a response */
  isAITyping: boolean;
  /** Suggested quick-action prompts for the user */
  suggestions: string[];
}
