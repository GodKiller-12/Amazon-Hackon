import { CartItem, Product } from '@/types';
import { AIProvider, GenerateCartResult, ModifyCartResult } from './types';
import { UserContext } from './context.types';
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
  // Health & Medical situations
  fever: {
    tags: ['fever-cold'],
    categories: ['pharmacy', 'beverages', 'grocery'],
    label: 'Fever & Cold Care',
    reply: "Take care! 🤒 I've added medicines, ORS, soup ingredients, and hydration essentials. Rest well!",
    cartName: '🤒 Fever Recovery Kit',
    reasoning: 'Medicines, hydration, and comfort items for quick recovery',
    categoryLabels: ['Medicines', 'Hydration', 'Comfort Food'],
  },
  cold: {
    tags: ['fever-cold'],
    categories: ['pharmacy', 'beverages', 'grocery'],
    label: 'Cold & Flu Care',
    reply: "Feel better soon! 🤧 Got you covered with cold medicine, honey lemon tea, tissues, and soup essentials.",
    cartName: '🤧 Cold & Flu Kit',
    reasoning: 'Everything to fight a cold and stay comfortable',
    categoryLabels: ['Cold Medicine', 'Hot Beverages', 'Tissues'],
  },
  headache: {
    tags: ['fever-cold'],
    categories: ['pharmacy', 'beverages'],
    label: 'Headache Relief',
    reply: "Here's relief on the way! 💊 Pain killers, water, and calming tea to help you feel better.",
    cartName: '💊 Headache Relief Pack',
    reasoning: 'Quick pain relief with hydration',
    categoryLabels: ['Pain Relief', 'Hydration', 'Wellness'],
  },
  sick: {
    tags: ['fever-cold'],
    categories: ['pharmacy', 'beverages', 'grocery'],
    label: 'Feeling Unwell',
    reply: "Get well soon! 🏥 I've put together medicines, fluids, and light food to help you recover.",
    cartName: '🏥 Get Well Kit',
    reasoning: 'Recovery essentials — medicines, fluids, and easy-to-digest food',
    categoryLabels: ['Medicines', 'Fluids', 'Light Food'],
  },
  // Baby & Kids
  baby: {
    tags: ['baby-care', 'baby-emergency'],
    categories: ['baby-care', 'pharmacy'],
    label: 'Baby Care Emergency',
    reply: "Baby essentials coming right up! 👶 Diapers, wipes, formula, and care items for your little one.",
    cartName: '👶 Baby Care Kit',
    reasoning: 'Essential baby supplies for urgent needs',
    categoryLabels: ['Diapers & Wipes', 'Feeding', 'Baby Health'],
  },
  diaper: {
    tags: ['baby-care', 'baby-emergency'],
    categories: ['baby-care'],
    label: 'Diaper Emergency',
    reply: "Diaper emergency sorted! 👶 Diapers, wipes, rash cream, and extra supplies on the way.",
    cartName: '👶 Diaper Emergency Kit',
    reasoning: 'Urgent diaper supplies with skincare essentials',
    categoryLabels: ['Diapers', 'Wipes', 'Baby Skin Care'],
  },
  // Power & Home emergencies
  'power cut': {
    tags: ['power-cut'],
    categories: ['emergency-supplies', 'household'],
    label: 'Power Cut Preparedness',
    reply: "Lights out? No worries! 🔦 Candles, flashlight, batteries, and some instant food to get through.",
    cartName: '🔦 Power Cut Survival Kit',
    reasoning: 'Light, power backup, and no-cook food for blackouts',
    categoryLabels: ['Lighting', 'Batteries', 'Instant Food'],
  },
  blackout: {
    tags: ['power-cut'],
    categories: ['emergency-supplies', 'household'],
    label: 'Blackout Emergency',
    reply: "Blackout kit ready! 🕯️ Candles, matches, flashlight, and snacks that don't need cooking.",
    cartName: '🕯️ Blackout Kit',
    reasoning: 'Essential items for surviving a power outage',
    categoryLabels: ['Candles & Matches', 'Flashlights', 'Ready Food'],
  },
  // Cooking & Food
  cook: {
    tags: ['guests', 'new-apartment'],
    categories: ['grocery'],
    label: 'Cooking Essentials',
    reply: "Let's cook! 👨‍🍳 Basic spices, oil, dal, rice, and pantry staples coming your way.",
    cartName: '👨‍🍳 Cooking Starter Kit',
    reasoning: 'Pantry staples and cooking basics for a fresh kitchen',
    categoryLabels: ['Spices', 'Staples', 'Oil & Ghee'],
  },
  breakfast: {
    tags: ['guests'],
    categories: ['grocery', 'beverages'],
    label: 'Breakfast Prep',
    reply: "Good morning! 🍳 Eggs, bread, butter, juice, and tea/coffee for a perfect breakfast.",
    cartName: '🍳 Breakfast Essentials',
    reasoning: 'Quick and complete breakfast setup',
    categoryLabels: ['Eggs & Bread', 'Dairy', 'Beverages'],
  },
  dinner: {
    tags: ['guests'],
    categories: ['grocery', 'beverages', 'snacks'],
    label: 'Dinner Prep',
    reply: "Dinner time! 🍽️ I've added rice, dal, veggies, snacks, and drinks for a complete meal.",
    cartName: '🍽️ Dinner Kit',
    reasoning: 'Complete dinner ingredients and accompaniments',
    categoryLabels: ['Staples', 'Vegetables', 'Sides'],
  },
  lunch: {
    tags: ['guests'],
    categories: ['grocery', 'beverages'],
    label: 'Lunch Prep',
    reply: "Lunch sorted! 🥗 Rice, sabzi ingredients, raita essentials, and refreshing drinks.",
    cartName: '🥗 Lunch Essentials',
    reasoning: 'Quick lunch ingredients for a satisfying meal',
    categoryLabels: ['Grains', 'Vegetables', 'Drinks'],
  },
  // Late night & Cravings
  hungry: {
    tags: ['movie-night', 'exam-prep'],
    categories: ['snacks', 'beverages', 'grocery'],
    label: 'Midnight Hunger',
    reply: "Midnight munchies? 🌙 Instant noodles, chips, biscuits, and a cold drink to satisfy those cravings!",
    cartName: '🌙 Midnight Munchies Pack',
    reasoning: 'Quick late-night food for instant satisfaction',
    categoryLabels: ['Instant Food', 'Snacks', 'Drinks'],
  },
  craving: {
    tags: ['movie-night'],
    categories: ['snacks', 'beverages'],
    label: 'Snack Cravings',
    reply: "Cravings incoming! 🤤 Chips, chocolate, cookies, and fizzy drinks — all the good stuff.",
    cartName: '🤤 Craving Buster Kit',
    reasoning: 'All your guilty pleasures in one cart',
    categoryLabels: ['Chips', 'Chocolates', 'Cold Drinks'],
  },
  // Weather & Seasonal
  rain: {
    tags: ['power-cut'],
    categories: ['beverages', 'snacks', 'grocery', 'emergency-supplies'],
    label: 'Rainy Day Comfort',
    reply: "Rainy day vibes! 🌧️ Hot tea, pakora ingredients, maggi, and some cozy snacks for the weather.",
    cartName: '🌧️ Rainy Day Kit',
    reasoning: 'Comfort food and warm beverages for monsoon weather',
    categoryLabels: ['Hot Beverages', 'Comfort Food', 'Snacks'],
  },
  monsoon: {
    tags: ['power-cut'],
    categories: ['beverages', 'snacks', 'grocery', 'emergency-supplies'],
    label: 'Monsoon Preparedness',
    reply: "Monsoon ready! ☔ Umbrella essentials, chai ingredients, and stocked up on instant food.",
    cartName: '☔ Monsoon Survival Kit',
    reasoning: 'Stocking up for heavy rains and possible power cuts',
    categoryLabels: ['Tea & Coffee', 'Instant Food', 'Emergency'],
  },
  // Work from home
  'work from home': {
    tags: ['exam-prep'],
    categories: ['beverages', 'snacks', 'grocery'],
    label: 'WFH Day',
    reply: "Productive day ahead! 💻 Coffee, healthy snacks, lunch ingredients, and energy boosters.",
    cartName: '💻 WFH Productivity Kit',
    reasoning: 'Stay fueled and focused through a full work-from-home day',
    categoryLabels: ['Coffee & Tea', 'Healthy Snacks', 'Lunch Prep'],
  },
  office: {
    tags: ['exam-prep'],
    categories: ['beverages', 'snacks'],
    label: 'Office Snacks',
    reply: "Office fuel! 🏢 Coffee, biscuits, dry fruits, and energy bars to power through meetings.",
    cartName: '🏢 Office Fuel Kit',
    reasoning: 'Desktop snacking essentials for productivity',
    categoryLabels: ['Caffeine', 'Biscuits', 'Dry Fruits'],
  },
  // Fitness & Health
  gym: {
    tags: ['weekend-trip'],
    categories: ['beverages', 'snacks', 'personal-care'],
    label: 'Gym & Fitness',
    reply: "Gains incoming! 💪 Protein bars, energy drinks, bananas, and post-workout essentials.",
    cartName: '💪 Fitness Fuel Kit',
    reasoning: 'Pre and post workout nutrition',
    categoryLabels: ['Protein', 'Energy', 'Hydration'],
  },
  workout: {
    tags: ['weekend-trip'],
    categories: ['beverages', 'snacks', 'personal-care'],
    label: 'Workout Nutrition',
    reply: "Let's crush it! 🏋️ Energy drinks, nuts, fruit, and recovery essentials.",
    cartName: '🏋️ Workout Pack',
    reasoning: 'Fuel for before, during, and after your workout',
    categoryLabels: ['Energy Drinks', 'Nuts & Fruits', 'Recovery'],
  },
  // Relaxation
  spa: {
    tags: ['weekend-trip'],
    categories: ['personal-care', 'beverages'],
    label: 'Self-Care Day',
    reply: "Pamper time! 🧖 Face masks, body wash, scented candles, and herbal tea for ultimate relaxation.",
    cartName: '🧖 Self-Care Kit',
    reasoning: 'A complete at-home spa experience',
    categoryLabels: ['Skincare', 'Aromatherapy', 'Herbal Tea'],
  },
  relax: {
    tags: ['movie-night'],
    categories: ['snacks', 'beverages', 'personal-care'],
    label: 'Relaxation Time',
    reply: "Time to unwind! 🧘 Tea, chocolates, light snacks, and everything for a peaceful evening.",
    cartName: '🧘 Relaxation Kit',
    reasoning: 'De-stress essentials for a calm evening',
    categoryLabels: ['Tea', 'Comfort Snacks', 'Self-Care'],
  },
  // Special occasions
  birthday: {
    tags: ['party'],
    categories: ['snacks', 'beverages', 'household'],
    label: 'Birthday Party',
    reply: "Happy Birthday! 🎂 Cake mix, candles, balloons, party snacks, and drinks — let's celebrate!",
    cartName: '🎂 Birthday Celebration Kit',
    reasoning: 'Complete birthday party supplies',
    categoryLabels: ['Cake & Candles', 'Decorations', 'Party Food'],
  },
  anniversary: {
    tags: ['party', 'guests'],
    categories: ['snacks', 'beverages', 'grocery'],
    label: 'Anniversary Celebration',
    reply: "Congratulations! 💕 Chocolates, wine (juice), flowers-adjacent items, and a romantic dinner setup.",
    cartName: '💕 Anniversary Special',
    reasoning: 'Romantic celebration essentials',
    categoryLabels: ['Chocolates', 'Drinks', 'Special Items'],
  },
  diwali: {
    tags: ['party', 'guests'],
    categories: ['snacks', 'beverages', 'household', 'grocery'],
    label: 'Diwali Celebration',
    reply: "Happy Diwali! 🪔 Sweets, dry fruits, candles, diyas, and festive snacks for the celebration!",
    cartName: '🪔 Diwali Celebration Kit',
    reasoning: 'Festive essentials for Diwali night',
    categoryLabels: ['Sweets & Dry Fruits', 'Diyas & Candles', 'Festive Snacks'],
  },
  // Picnic & Outdoor
  picnic: {
    tags: ['weekend-trip'],
    categories: ['snacks', 'beverages', 'household'],
    label: 'Picnic Day',
    reply: "Picnic time! 🧺 Sandwiches ingredients, juice, fruits, napkins, and disposable plates.",
    cartName: '🧺 Picnic Basket Kit',
    reasoning: 'Portable food and supplies for an outdoor day',
    categoryLabels: ['Sandwich Stuff', 'Drinks', 'Disposables'],
  },
  camping: {
    tags: ['weekend-trip'],
    categories: ['snacks', 'beverages', 'emergency-supplies'],
    label: 'Camping Trip',
    reply: "Adventure awaits! ⛺ Trail mix, water, flashlight, matches, and instant food for the outdoors.",
    cartName: '⛺ Camping Essentials',
    reasoning: 'Outdoor survival and comfort items',
    categoryLabels: ['Trail Food', 'Hydration', 'Survival Gear'],
  },
  // New apartment / moving
  'new apartment': {
    tags: ['new-apartment'],
    categories: ['household', 'grocery', 'personal-care'],
    label: 'New Apartment Setup',
    reply: "Welcome home! 🏡 Cleaning supplies, kitchen basics, toiletries, and pantry staples for your new place.",
    cartName: '🏡 New Home Starter Kit',
    reasoning: 'First-day essentials for moving into a new apartment',
    categoryLabels: ['Cleaning', 'Kitchen Basics', 'Toiletries'],
  },
  moving: {
    tags: ['new-apartment'],
    categories: ['household', 'grocery', 'personal-care'],
    label: 'Moving Day',
    reply: "Moving day sorted! 📦 Cleaning wipes, trash bags, basic food, water, and energy snacks.",
    cartName: '📦 Moving Day Survival Kit',
    reasoning: 'Essentials to survive moving day',
    categoryLabels: ['Cleaning', 'Quick Food', 'Energy'],
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
  async generateCart(situation: string, _preferences?: { dietary: string[]; householdSize: number }, context?: UserContext): Promise<GenerateCartResult> {
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
      let items = pickItemsForSituation(matchedConfig.tags, matchedConfig.categories, itemCount);

      // Apply dietary filtering if context provides restrictions
      if (context?.profile?.dietaryRestrictions && context.profile.dietaryRestrictions.length > 0) {
        items = this.applyDietaryFilter(items, context.profile.dietaryRestrictions);
      }

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
    let items = getDefaultItems();

    // Apply dietary filtering if context provides restrictions
    if (context?.profile?.dietaryRestrictions && context.profile.dietaryRestrictions.length > 0) {
      items = this.applyDietaryFilter(items, context.profile.dietaryRestrictions);
    }

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

  async modifyCart(currentCart: CartItem[], message: string, _context?: UserContext): Promise<ModifyCartResult> {
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

  /**
   * Filters items based on dietary restrictions.
   * Removes items that conflict with the user's dietary preferences.
   */
  private applyDietaryFilter(items: CartItem[], dietaryRestrictions: string[]): CartItem[] {
    const restrictions = dietaryRestrictions.map((r) => r.toLowerCase());

    return items.filter((item) => {
      const name = item.name.toLowerCase();

      // Vegetarian filter
      if (restrictions.includes('vegetarian') || restrictions.includes('veg')) {
        if (
          name.includes('egg') ||
          name.includes('chicken') ||
          name.includes('meat') ||
          name.includes('fish') ||
          name.includes('mutton')
        ) {
          return false;
        }
      }

      // Vegan filter
      if (restrictions.includes('vegan')) {
        if (
          name.includes('egg') ||
          name.includes('chicken') ||
          name.includes('meat') ||
          name.includes('fish') ||
          name.includes('milk') ||
          name.includes('cheese') ||
          name.includes('butter') ||
          name.includes('paneer') ||
          name.includes('curd') ||
          name.includes('ghee')
        ) {
          return false;
        }
      }

      // Gluten-free filter
      if (restrictions.includes('gluten-free') || restrictions.includes('gluten free')) {
        if (
          name.includes('bread') ||
          name.includes('noodle') ||
          name.includes('pasta') ||
          name.includes('biscuit') ||
          name.includes('cookie')
        ) {
          return false;
        }
      }

      return true;
    });
  }
}
