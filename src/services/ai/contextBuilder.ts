/**
 * ContextBuilder Service
 *
 * Builds complete user context from all available data sources:
 * - User profile (name, dietary, household size, city)
 * - Order history (recent orders, frequent items, preferred categories)
 * - Conversation context (active messages, current cart)
 * - Time context (day, time of day, weekend flag)
 *
 * Handles errors gracefully — if any repo call fails, continues with partial context.
 */

import { UserContext } from './context.types';
import { UserPreferenceExtractor } from './preferenceExtractor';
import { getOrderRepository, getConversationRepository, getUserRepository } from '@/repositories';

export class ContextBuilder {
  private preferenceExtractor: UserPreferenceExtractor;

  constructor() {
    this.preferenceExtractor = new UserPreferenceExtractor();
  }

  /**
   * Builds complete user context from all available data sources.
   * Loads user profile, recent orders, and conversation history.
   */
  async buildContext(userId: string): Promise<UserContext> {
    const [profile, orderHistory, timeContext] = await Promise.all([
      this.loadProfile(userId),
      this.loadOrderHistory(userId),
      Promise.resolve(this.buildTimeContext()),
    ]);

    return {
      userId,
      profile,
      orderHistory,
      conversationContext: {
        hasActiveConversation: false,
        recentMessages: [],
        currentCartItems: [],
      },
      timeContext,
    };
  }

  /**
   * Lightweight context for modify-cart (skip full order history scan).
   * Includes conversation context if conversationId is provided.
   */
  async buildModifyContext(userId: string, conversationId?: string): Promise<UserContext> {
    const [profile, conversationContext, timeContext] = await Promise.all([
      this.loadProfile(userId),
      this.loadConversationContext(userId, conversationId),
      Promise.resolve(this.buildTimeContext()),
    ]);

    return {
      userId,
      profile,
      orderHistory: {
        totalOrders: 0,
        recentOrders: [],
        frequentItems: [],
        preferredCategories: [],
      },
      conversationContext,
      timeContext,
    };
  }

  /**
   * Loads user profile from repository. Returns null on error.
   */
  private async loadProfile(userId: string): Promise<UserContext['profile']> {
    try {
      const userRepo = getUserRepository();
      const user = await userRepo.getById(userId);
      if (!user) return null;

      return {
        name: user.name,
        householdSize: user.preferences.householdSize,
        dietaryRestrictions: user.preferences.dietary,
        city: user.address.city,
      };
    } catch (error) {
      console.warn('[ContextBuilder] Failed to load user profile:', error instanceof Error ? error.message : error);
      return null;
    }
  }

  /**
   * Loads order history and extracts preferences. Returns empty data on error.
   */
  private async loadOrderHistory(userId: string): Promise<UserContext['orderHistory']> {
    try {
      const orderRepo = getOrderRepository();
      const orders = await orderRepo.listByUser(userId, 10);

      if (orders.length === 0) {
        return {
          totalOrders: 0,
          recentOrders: [],
          frequentItems: [],
          preferredCategories: [],
        };
      }

      const frequentItems = this.preferenceExtractor.getFrequentItems(orders);
      const preferences = this.preferenceExtractor.extractFromOrders(orders);

      const recentOrders = orders.slice(0, 5).map((order) => ({
        situationLabel: order.situationLabel,
        date: order.date,
        itemCategories: [...new Set(order.items.map((item) => item.category))],
        total: order.total,
      }));

      return {
        totalOrders: orders.length,
        recentOrders,
        frequentItems,
        preferredCategories: preferences.preferredCategories,
      };
    } catch (error) {
      console.warn('[ContextBuilder] Failed to load order history:', error instanceof Error ? error.message : error);
      return {
        totalOrders: 0,
        recentOrders: [],
        frequentItems: [],
        preferredCategories: [],
      };
    }
  }

  /**
   * Loads conversation messages if a conversationId is provided.
   */
  private async loadConversationContext(
    userId: string,
    conversationId?: string
  ): Promise<UserContext['conversationContext']> {
    if (!conversationId) {
      return {
        hasActiveConversation: false,
        recentMessages: [],
        currentCartItems: [],
      };
    }

    try {
      const conversationRepo = getConversationRepository();
      const messages = await conversationRepo.getMessages(userId, conversationId);

      // Get last 5 messages for context
      const recentMessages = messages.slice(-5).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Extract current cart items from the last AI message with a cart preview
      const lastAiWithCart = [...messages]
        .reverse()
        .find((msg) => msg.role === 'ai' && msg.cartPreview && msg.cartPreview.length > 0);

      const currentCartItems = lastAiWithCart?.cartPreview?.map((item) => item.name) || [];

      return {
        hasActiveConversation: true,
        recentMessages,
        currentCartItems,
      };
    } catch (error) {
      console.warn('[ContextBuilder] Failed to load conversation context:', error instanceof Error ? error.message : error);
      return {
        hasActiveConversation: false,
        recentMessages: [],
        currentCartItems: [],
      };
    }
  }

  /**
   * Builds time context from current date/time.
   */
  private buildTimeContext(): UserContext['timeContext'] {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    let timeOfDay: string;
    if (hour >= 5 && hour < 12) {
      timeOfDay = 'morning';
    } else if (hour >= 12 && hour < 17) {
      timeOfDay = 'afternoon';
    } else if (hour >= 17 && hour < 21) {
      timeOfDay = 'evening';
    } else {
      timeOfDay = 'night';
    }

    return {
      dayOfWeek: days[day],
      timeOfDay,
      isWeekend: day === 0 || day === 6,
    };
  }
}
