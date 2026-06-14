import { CartItem, Product } from '@/types';
import { AIProvider, GenerateCartResult, ModifyCartResult } from './types';
import productsData from '@/data/products.json';

const products = productsData as unknown as Product[];

// Situation keyword mappings to product tags and categories
const SITUATION_MAP: Record<string, {
  tags: string[];
  categories: string[];
  label: string;
  reply: string;
  cartName: string;
  reasoning: string;
  categoryLabels: string[];
}> = {
  guests: {
    tags: ['guests', 'party'],
    categories: ['snacks', 'beverages', 'household', 'grocery'],
    label: 'Guests Arriving',
    reply: "I've put together a cart for hosting guests! Snacks, beverages, and essentials to make them feel welcome. 🏠✨",
    cartName: '🎉 Guest Essentials Kit',
    reasoning: 'Prepared for 6 guests arriving in 30 minutes',
    categoryLabels: ['Snacks', 'Cold Drinks', 'Disposable Items'],
  },
  arriving: {
    tags: ['guests', 'party'],
    categories: ['snacks', 'beverages', 'household', 'grocery'],
    label: 'Guests Arriving',
    reply: "Got it! Here's everything you need for your guests arriving soon — snacks, drinks, and disposables. 🎉",
    cartName: '🎉 Guest Essentials Kit',
    reasoning: 'Quick hospitality kit for unexpected visitors',
    categoryLabels: ['Snacks', 'Beverages', 'Household'],
  },
  movie: {
    tags: ['movie-night'],
    categories: ['snacks', 'beverages'],
    label: 'Movie Night',
    reply: "Movie night sorted! 🍿🎬 I've picked popcorn, chips, chocolates, and drinks for the perfect binge session.",
    cartName: '🍿 Movie Night Pack',
    reasoning: 'Perfect snack lineup for a 3-hour movie marathon',
    categoryLabels: ['Popcorn & Chips', 'Chocolates', 'Cold Drinks'],
  },
  night: {
    tags: ['movie-night'],
    categories: ['snacks', 'beverages'],
    label: 'Movie Night',
    reply: "Here's your movie night lineup — all the munchies and drinks you'll need! 🎬🍕",
    cartName: '🍿 Movie Night Pack',
    reasoning: 'Binge-watch essentials for a cozy evening in',
    categoryLabels: ['Snacks', 'Beverages', 'Sweets'],
  },
  exam: {
    tags: ['exam-prep'],
    categories: ['beverages', 'snacks', 'pharmacy'],
    label: 'Exam Prep / Study Session',
    reply: "Study fuel incoming! ☕📚 Coffee, energy drinks, brain-food snacks, and vitamins to keep you going.",
    cartName: '📚 Study Fuel Kit',
    reasoning: 'Energy and focus essentials for a long study session',
    categoryLabels: ['Caffeine', 'Brain Food', 'Supplements'],
  },
  study: {
    tags: ['exam-prep'],
    categories: ['beverages', 'snacks', 'pharmacy'],
    label: 'Study Session',
    reply: "All-nighter kit ready! 📖 Energy drinks, coffee, light snacks, and supplements to power through.",
    cartName: '📚 Study Fuel Kit',
    reasoning: 'All-nighter survival pack for peak performance',
    categoryLabels: ['Energy Drinks', 'Snacks', 'Health'],
  },
  'all-nighter': {
    tags: ['exam-prep'],
    categories: ['beverages', 'snacks'],
    label: 'All-Nighter',
    reply: "Here's your all-nighter survival pack — caffeine, energy, and brain food! 🌙⚡",
    cartName: '📚 Study Fuel Kit',
    reasoning: 'Midnight oil essentials to push through till dawn',
    categoryLabels: ['Caffeine', 'Quick Bites', 'Energy'],
  },
  weekend: {
    tags: ['weekend-trip'],
    categories: ['snacks', 'beverages', 'personal-care', 'pharmacy'],
    label: 'Weekend Trip',
    reply: "Weekend trip essentials packed! 🎒 Snacks, water, sunscreen, wipes, and first-aid basics.",
    cartName: '🎒 Weekend Trip Pack',
    reasoning: 'Travel-ready essentials for a 2-day getaway',
    categoryLabels: ['Travel Snacks', 'Hydration', 'Personal Care'],
  },
  trip: {
    tags: ['weekend-trip'],
    categories: ['snacks', 'beverages', 'personal-care', 'emergency-supplies'],
    label: 'Trip Prep',
    reply: "Travel-ready! 🧳 I've added road-trip snacks, hydration, personal care, and safety essentials.",
    cartName: '🎒 Weekend Trip Pack',
    reasoning: 'Road trip bundle for comfort and safety',
    categoryLabels: ['Snacks', 'Beverages', 'Safety'],
  },
  party: {
    tags: ['party'],
    categories: ['beverages', 'snacks', 'household'],
    label: 'House Party',
    reply: "Party mode ON! 🎊 Drinks, snacks, namkeen, and disposable plates/cups — you're all set to host.",
    cartName: '🥳 Party Starter Kit',
    reasoning: 'Everything to throw an epic house party for 10+ people',
    categoryLabels: ['Drinks', 'Party Snacks', 'Disposables'],
  },
  'house party': {
    tags: ['party'],
    categories: ['beverages', 'snacks', 'household'],
    label: 'House Party',
    reply: "House party essentials ready! 🥳 Cola, chips, cookies, cups, and plates for the crew.",
    cartName: '🥳 Party Starter Kit',
    reasoning: 'Complete party setup for a memorable night',
    categoryLabels: ['Cold Drinks', 'Munchies', 'Cleanup'],
  },
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandomDelay(): number {
  return 1000 + Math.random() * 1000; // 1-2 seconds
}

function getInStockProducts(): Product[] {
  return products.filter((p) => p.inStock);
}

function pickItemsForSituation(tags: string[], categories: string[], count: number): CartItem[] {
  const inStock = getInStockProducts();

  const scored = inStock.map((product) => {
    let score = 0;
    for (const tag of tags) {
      if (product.tags.includes(tag)) score += 3;
    }
    if (categories.includes(product.category)) score += 1;
    return { product, score };
  });

  const relevant = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || Math.random() - 0.5);

  const picked: CartItem[] = [];
  const categoryCount: Record<string, number> = {};
  const maxPerCategory = Math.ceil(count / categories.length) + 2;

  for (const { product } of relevant) {
    if (picked.length >= count) break;

    const catCount = categoryCount[product.category] || 0;
    if (catCount >= maxPerCategory) continue;

    let quantity = 1;
    if (product.price < 50) quantity = 2;
    if (product.category === 'beverages' && product.price < 60) quantity = 2;

    picked.push({
      ...product,
      quantity,
      reason: getReasonForProduct(product, tags),
    });

    categoryCount[product.category] = catCount + 1;
  }

  return picked;
}

function getReasonForProduct(product: Product, tags: string[]): string {
  const situationTag = tags[0] || 'general';
  const reasons: Record<string, Record<string, string>> = {
    guests: {
      snacks: 'Great for serving guests',
      beverages: 'Refreshing drinks for visitors',
      household: 'Essential for hosting',
      grocery: 'Helpful for preparing food',
    },
    party: {
      snacks: 'Perfect party munchies',
      beverages: 'Party drinks sorted',
      household: 'Disposables for easy cleanup',
      grocery: 'For quick party preparations',
    },
    'movie-night': {
      snacks: 'Classic movie snack',
      beverages: 'Something to sip during the film',
    },
    'exam-prep': {
      snacks: 'Brain food for long study sessions',
      beverages: 'Stay energized and focused',
      pharmacy: 'Health support for intense studying',
    },
    'weekend-trip': {
      snacks: 'Portable travel snacks',
      beverages: 'Stay hydrated on the go',
      'personal-care': 'Travel essential',
      pharmacy: 'Safety first on trips',
      'emergency-supplies': 'Better safe than sorry',
    },
  };

  return reasons[situationTag]?.[product.category] || `Recommended for your ${situationTag.replace('-', ' ')} needs`;
}

function getDefaultItems(): CartItem[] {
  const inStock = getInStockProducts();
  const popular = inStock
    .filter((p) => p.tags.length >= 2)
    .sort(() => Math.random() - 0.5)
    .slice(0, 10);

  return popular.map((product) => ({
    ...product,
    quantity: 1,
    reason: 'Popular item recommended for you',
  }));
}

export class MockProvider implements AIProvider {
  async generateCart(situation: string): Promise<GenerateCartResult> {
    await delay(getRandomDelay());

    const lowerSituation = situation.toLowerCase();

    let matchedConfig: (typeof SITUATION_MAP)[string] | null = null;

    for (const [keyword, config] of Object.entries(SITUATION_MAP)) {
      if (lowerSituation.includes(keyword)) {
        matchedConfig = config;
        break;
      }
    }

    if (matchedConfig) {
      const itemCount = matchedConfig.tags.includes('guests') || matchedConfig.tags.includes('party') ? 13 : 9;
      const items = pickItemsForSituation(matchedConfig.tags, matchedConfig.categories, itemCount);
      const estimatedCost = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const estimatedDelivery = items.length > 0 ? Math.max(...items.map((i) => i.deliveryMinutes)) : 15;

      return {
        items,
        situationLabel: matchedConfig.label,
        reply: matchedConfig.reply,
        cartName: matchedConfig.cartName,
        reasoning: matchedConfig.reasoning,
        categories: matchedConfig.categoryLabels,
        estimatedCost,
        estimatedDelivery,
      };
    }

    // Default fallback
    const items = getDefaultItems();
    const estimatedCost = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const estimatedDelivery = items.length > 0 ? Math.max(...items.map((i) => i.deliveryMinutes)) : 15;

    return {
      items,
      situationLabel: 'Quick Cart',
      reply: "I've picked some popular essentials for you! Let me know if you'd like to add or change anything. 🛒",
      cartName: '🛒 Smart Cart',
      reasoning: 'Curated popular essentials based on your needs',
      categories: ['Essentials', 'Snacks', 'Beverages'],
      estimatedCost,
      estimatedDelivery,
    };
  }

  async modifyCart(currentCart: CartItem[], message: string): Promise<ModifyCartResult> {
    await delay(getRandomDelay());

    const lowerMsg = message.toLowerCase();
    const currentIds = new Set(currentCart.map((item) => item.id));
    const inStock = getInStockProducts();

    // Add desserts / sweets
    if (lowerMsg.includes('dessert') || lowerMsg.includes('sweet') || lowerMsg.includes('mithai')) {
      const sweets = inStock.filter(
        (p) =>
          !currentIds.has(p.id) &&
          (p.name.toLowerCase().includes('chocolate') ||
            p.name.toLowerCase().includes('cookie') ||
            p.name.toLowerCase().includes('silk') ||
            p.name.toLowerCase().includes('kitkat') ||
            p.name.toLowerCase().includes('oreo') ||
            p.name.toLowerCase().includes('dark fantasy') ||
            p.name.toLowerCase().includes('5 star'))
      );
      const toAdd = sweets.slice(0, 3).map((p) => ({
        ...p,
        quantity: 1,
        reason: 'Sweet treat added to your cart',
      }));

      return {
        reply: `Added ${toAdd.length} sweet items to your cart! 🍫🍪 Perfect for satisfying that sweet tooth.`,
        cartDiff: { add: toAdd, remove: [], update: [] },
      };
    }

    // Add snacks
    if (lowerMsg.includes('add snack') || lowerMsg.includes('more snack')) {
      const snacks = inStock.filter(
        (p) => p.category === 'snacks' && !currentIds.has(p.id)
      );
      const toAdd = snacks.slice(0, 3).map((p) => ({
        ...p,
        quantity: 1,
        reason: 'Extra snack added',
      }));

      return {
        reply: `Added ${toAdd.length} more snacks! 🥨 Your munchie game is strong now.`,
        cartDiff: { add: toAdd, remove: [], update: [] },
      };
    }

    // Remove soft drinks / soda / cola
    if (lowerMsg.includes('remove soft drink') || lowerMsg.includes('remove soda') || lowerMsg.includes('remove cola') || lowerMsg.includes('no soft drink') || lowerMsg.includes('no cola')) {
      const toRemove = currentCart
        .filter(
          (item) =>
            item.category === 'beverages' &&
            (item.name.toLowerCase().includes('cola') ||
              item.name.toLowerCase().includes('sprite') ||
              item.name.toLowerCase().includes('thumbs up') ||
              item.name.toLowerCase().includes('limca') ||
              item.name.toLowerCase().includes('pepsi') ||
              item.name.toLowerCase().includes('sting'))
        )
        .map((item) => item.id);

      return {
        reply: `Removed ${toRemove.length} carbonated drink${toRemove.length !== 1 ? 's' : ''} from your cart. 🚫🥤 Healthier choice!`,
        cartDiff: { add: [], remove: toRemove, update: [] },
      };
    }

    // Vegetarian
    if (lowerMsg.includes('vegetarian') || lowerMsg.includes('veg only') || lowerMsg.includes('no non-veg')) {
      const nonVegItems = currentCart
        .filter(
          (item) =>
            item.name.toLowerCase().includes('egg') ||
            item.name.toLowerCase().includes('chicken') ||
            item.name.toLowerCase().includes('meat') ||
            item.name.toLowerCase().includes('fish')
        )
        .map((item) => item.id);

      const vegAlternatives = inStock.filter(
        (p) =>
          !currentIds.has(p.id) &&
          (p.name.toLowerCase().includes('paneer') ||
            p.name.toLowerCase().includes('curd') ||
            p.name.toLowerCase().includes('buttermilk'))
      );
      const toAdd = vegAlternatives.slice(0, 2).map((p) => ({
        ...p,
        quantity: 1,
        reason: 'Vegetarian alternative',
      }));

      return {
        reply: nonVegItems.length > 0
          ? `Made it vegetarian! 🌱 Removed ${nonVegItems.length} non-veg item${nonVegItems.length !== 1 ? 's' : ''} and added plant-based alternatives.`
          : "Your cart is already vegetarian! 🌱 I've added a couple more veg-friendly options.",
        cartDiff: { add: toAdd, remove: nonVegItems, update: [] },
      };
    }

    // Budget
    if (lowerMsg.includes('budget') || lowerMsg.includes('under ₹') || lowerMsg.includes('cheaper') || lowerMsg.includes('less expensive')) {
      const budgetMatch = lowerMsg.match(/under\s*₹?\s*(\d+)/);
      const target = budgetMatch ? parseInt(budgetMatch[1]) : 500;

      const sorted = [...currentCart].sort((a, b) => b.price * b.quantity - a.price * a.quantity);
      const toRemove: string[] = [];
      let currentTotal = currentCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

      for (const item of sorted) {
        if (currentTotal <= target) break;
        if (item.price * item.quantity > 150) {
          toRemove.push(item.id);
          currentTotal -= item.price * item.quantity;
        }
      }

      return {
        reply: `Trimmed your cart to fit the budget! 💰 Removed ${toRemove.length} expensive item${toRemove.length !== 1 ? 's' : ''}. New estimated total: ~₹${Math.round(currentTotal)}.`,
        cartDiff: { add: [], remove: toRemove, update: [] },
      };
    }

    // Add for kids
    if (lowerMsg.includes('kid') || lowerMsg.includes('child') || lowerMsg.includes('children')) {
      const kidFriendly = inStock.filter(
        (p) =>
          !currentIds.has(p.id) &&
          (p.name.toLowerCase().includes('juice') ||
            p.name.toLowerCase().includes('cookie') ||
            p.name.toLowerCase().includes('chocolate') ||
            p.name.toLowerCase().includes('biscuit') ||
            p.name.toLowerCase().includes('oreo'))
      );
      const toAdd = kidFriendly.slice(0, 3).map((p) => ({
        ...p,
        quantity: 1,
        reason: 'Kid-friendly pick',
      }));

      return {
        reply: `Added ${toAdd.length} kid-friendly items! 🧒🍪 Juice, cookies, and chocolate — they'll love it.`,
        cartDiff: { add: toAdd, remove: [], update: [] },
      };
    }

    // Remove alcohol
    if (lowerMsg.includes('remove alcohol') || lowerMsg.includes('no alcohol') || lowerMsg.includes('no beer') || lowerMsg.includes('no wine')) {
      const alcoholItems = currentCart
        .filter(
          (item) =>
            item.name.toLowerCase().includes('beer') ||
            item.name.toLowerCase().includes('wine') ||
            item.name.toLowerCase().includes('whisky') ||
            item.name.toLowerCase().includes('vodka')
        )
        .map((item) => item.id);

      return {
        reply: alcoholItems.length > 0
          ? `Removed ${alcoholItems.length} alcohol item${alcoholItems.length !== 1 ? 's' : ''}. 🚫🍺 Keeping it non-alcoholic!`
          : "No alcohol found in your cart — you're all good! 👍",
        cartDiff: { add: [], remove: alcoholItems, update: [] },
      };
    }

    // Default: try to match message keywords to product tags/names
    const words = lowerMsg.split(/\s+/).filter((w) => w.length > 3);
    const matchingProducts = inStock.filter(
      (p) =>
        !currentIds.has(p.id) &&
        words.some(
          (word) =>
            p.name.toLowerCase().includes(word) ||
            p.tags.some((tag) => tag.includes(word)) ||
            p.category.includes(word)
        )
    );

    const toAdd = matchingProducts.slice(0, 2).map((p) => ({
      ...p,
      quantity: 1,
      reason: 'Added based on your request',
    }));

    if (toAdd.length > 0) {
      return {
        reply: `Done! Added ${toAdd.length} item${toAdd.length !== 1 ? 's' : ''} based on what you mentioned. 👍`,
        cartDiff: { add: toAdd, remove: [], update: [] },
      };
    }

    return {
      reply: "I'm not sure what to change. Try saying things like 'add desserts', 'remove soft drinks', or 'make it budget-friendly'! 🤔",
      cartDiff: { add: [], remove: [], update: [] },
    };
  }
}
