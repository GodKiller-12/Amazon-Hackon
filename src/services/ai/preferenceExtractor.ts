/**
 * UserPreferenceExtractor
 *
 * Analyzes order history to extract implicit user preferences
 * such as frequently purchased items, preferred categories,
 * and price range tendencies.
 */

import { Order } from '@/types';
import { ExtractedPreferences, FrequentItem } from './context.types';

export class UserPreferenceExtractor {
  /**
   * Analyzes order history to extract implicit preferences.
   */
  extractFromOrders(orders: Order[]): ExtractedPreferences {
    if (orders.length === 0) {
      return {
        frequentItems: [],
        preferredCategories: [],
        avgOrderSize: 0,
        pricePreference: 'mid-range',
        avoidedCategories: [],
      };
    }

    const frequentItems = this.getFrequentItems(orders);
    const preferredCategories = this.getPreferredCategories(orders);
    const avgOrderSize = this.getAverageOrderSize(orders);
    const { preference } = this.getPricePreference(orders);
    const avoidedCategories = this.getAvoidedCategories(orders);

    return {
      frequentItems,
      preferredCategories,
      avgOrderSize,
      pricePreference: preference,
      avoidedCategories,
    };
  }

  /**
   * Identifies frequently purchased items (ordered 2+ times).
   */
  getFrequentItems(orders: Order[]): FrequentItem[] {
    const itemCounts = new Map<string, { name: string; category: string; count: number }>();

    for (const order of orders) {
      for (const item of order.items) {
        const existing = itemCounts.get(item.id);
        if (existing) {
          existing.count += 1;
        } else {
          itemCounts.set(item.id, {
            name: item.name,
            category: item.category,
            count: 1,
          });
        }
      }
    }

    return Array.from(itemCounts.values())
      .filter((item) => item.count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Determines preferred price range from order history.
   */
  getPricePreference(orders: Order[]): { average: number; max: number; preference: 'budget' | 'mid-range' | 'premium' } {
    if (orders.length === 0) {
      return { average: 0, max: 0, preference: 'mid-range' };
    }

    const totals = orders.map((o) => o.total);
    const average = totals.reduce((sum, t) => sum + t, 0) / totals.length;
    const max = Math.max(...totals);

    let preference: 'budget' | 'mid-range' | 'premium';
    if (average < 400) {
      preference = 'budget';
    } else if (average < 1000) {
      preference = 'mid-range';
    } else {
      preference = 'premium';
    }

    return { average: Math.round(average), max, preference };
  }

  /**
   * Gets top 3 preferred categories by item count across all orders.
   */
  private getPreferredCategories(orders: Order[]): string[] {
    const categoryCounts = new Map<string, number>();

    for (const order of orders) {
      for (const item of order.items) {
        const count = categoryCounts.get(item.category) || 0;
        categoryCounts.set(item.category, count + 1);
      }
    }

    return Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
  }

  /**
   * Gets average number of items per order.
   */
  private getAverageOrderSize(orders: Order[]): number {
    if (orders.length === 0) return 0;
    const totalItems = orders.reduce((sum, order) => sum + order.items.length, 0);
    return Math.round(totalItems / orders.length);
  }

  /**
   * Identifies categories that appear in the catalog but the user never orders.
   * Only meaningful with 5+ orders of history.
   */
  private getAvoidedCategories(orders: Order[]): string[] {
    if (orders.length < 5) return [];

    const allCategories = new Set<string>();
    const orderedCategories = new Set<string>();

    for (const order of orders) {
      for (const item of order.items) {
        allCategories.add(item.category);
        orderedCategories.add(item.category);
      }
    }

    // Only report avoided if there are categories not ordered across many orders
    return Array.from(allCategories).filter((cat) => !orderedCategories.has(cat));
  }
}
