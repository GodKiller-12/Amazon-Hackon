# Design Document

## Introduction

This design covers the hackathon MVP of UrgentCart — a 48-hour build targeting four core features: Situation-to-Cart AI, Conversational Cart Modification, Emergency Mode, and One-Click Reorder. The design prioritizes fast user experience, low implementation complexity, and strong demo value. Authentication, real payments, real inventory systems, and production-scale infrastructure are out of scope — stubs and mocks are used where needed.

---

## Architecture Overview

### Technology Stack (Hackathon MVP)

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | React + Next.js (App Router) | Fast prototyping, SSR for demo speed, file-based routing |
| Styling | Tailwind CSS + shadcn/ui | Rapid UI with polished look, minimal custom CSS |
| State Management | Zustand | Lightweight, minimal boilerplate, works well for cart state |
| AI Integration | OpenAI GPT-4 API (or Amazon Bedrock) | Natural language understanding for situations and conversations |
| Backend | Next.js API Routes | Co-located with frontend, no separate server needed |
| Database | Local JSON files + localStorage | Zero setup, sufficient for demo |
| Mock Services | In-memory product catalog, mock delivery estimator | Simulates real behavior without external dependencies |

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Next.js App                        │
├─────────────────────────────────────────────────────┤
│  Pages/Screens          │  API Routes               │
│  ─────────────          │  ──────────               │
│  / (Home)               │  /api/ai/generate-cart    │
│  /ask-ai                │  /api/ai/modify-cart      │
│  /emergency             │  /api/cart                │
│  /reorder               │  /api/orders              │
│  /cart                   │  /api/products            │
│  /checkout              │                           │
├─────────────────────────────────────────────────────┤
│  Zustand Store (Client State)                        │
│  ─ cartStore: items, total, situation label          │
│  ─ conversationStore: messages, context              │
│  ─ userStore: profile, preferences (mocked)         │
│  ─ orderStore: past orders                          │
├─────────────────────────────────────────────────────┤
│  Services Layer                                      │
│  ─ AI Service (OpenAI/Bedrock wrapper)              │
│  ─ Product Catalog (static JSON, 200-500 items)     │
│  ─ Order History (localStorage)                      │
│  ─ Emergency Presets (static JSON configs)           │
└─────────────────────────────────────────────────────┘
```

---

## Screen Designs

### Screen 1: Home

**Purpose:** Entry point — surface situation suggestions, emergency quick actions, and the AI input bar.

**Layout:**
```
┌──────────────────────────────────┐
│  🛒 UrgentCart          [Profile]│
├──────────────────────────────────┤
│                                  │
│  ┌────────────────────────────┐  │
│  │ "What's your situation?"   │  │
│  │ [Text input with mic icon] │  │
│  │ [Go button]                │  │
│  └────────────────────────────┘  │
│                                  │
│  🔥 QUICK EMERGENCIES            │
│  ┌──────┐ ┌──────┐ ┌──────┐    │
│  │Fever │ │Power │ │Baby  │    │
│  │& Cold│ │ Cut  │ │Care  │    │
│  └──────┘ └──────┘ └──────┘    │
│                                  │
│  💡 TRENDING SITUATIONS          │
│  ┌─────────────────────────────┐ │
│  │ 🎬 Movie Night             │ │
│  │ 🏠 Guests Arriving Soon    │ │
│  │ 📚 Exam Prep All-Nighter   │ │
│  │ 🧳 Weekend Trip            │ │
│  │ 🎉 House Party             │ │
│  │ 🏡 New Apartment Setup     │ │
│  └─────────────────────────────┘ │
│                                  │
├──────────────────────────────────┤
│ [Home] [Ask AI] [Emergency] [⟲] │
└──────────────────────────────────┘
```

**Key Elements:**
- Hero input: Large text field with placeholder "What's your situation?"
- Emergency quick-action cards: 3 tappable cards for most critical emergencies
- Trending situations: Scrollable list of 6+ situation cards
- Bottom navigation: 4 tabs (Home, Ask AI, Emergency, Reorder)

---

### Screen 2: Ask AI (Conversational Cart Builder)

**Purpose:** Chat-based interface where users describe situations and the AI builds/modifies a cart through conversation.

**Layout:**
```
┌──────────────────────────────────┐
│  ← Ask AI              [Cart 🛒]│
├──────────────────────────────────┤
│                                  │
│  ┌─ AI ─────────────────────┐   │
│  │ Hi! Tell me your          │   │
│  │ situation and I'll build  │   │
│  │ your cart instantly. 🚀   │   │
│  └───────────────────────────┘   │
│                                  │
│         ┌─ User ─────────────┐   │
│         │ Guests arriving in │   │
│         │ 30 mins, 4 people  │   │
│         └────────────────────┘   │
│                                  │
│  ┌─ AI ─────────────────────┐   │
│  │ Got it! Here's your cart: │   │
│  │                           │   │
│  │ 🛒 Generated Cart (12)    │   │
│  │ ┌─────────────────────┐  │   │
│  │ │ Chips (2) - ₹60     │  │   │
│  │ │ Soda (6-pack) - ₹180│  │   │
│  │ │ Dip (2) - ₹120      │  │   │
│  │ │ Cookies - ₹90       │  │   │
│  │ │ ... +8 more items    │  │   │
│  │ └─────────────────────┘  │   │
│  │                           │   │
│  │ Total: ₹1,240            │   │
│  │ [View Full Cart] [Buy Now]│   │
│  └───────────────────────────┘   │
│                                  │
│  Suggested: "Add desserts"       │
│             "Make it vegetarian"  │
│             "Add for kids"        │
│                                  │
├──────────────────────────────────┤
│  [Type a message...]    [Send]   │
├──────────────────────────────────┤
│ [Home] [Ask AI] [Emergency] [⟲] │
└──────────────────────────────────┘
```

**Key Elements:**
- Chat message list with AI and user bubbles
- Inline cart preview within AI response bubbles
- Quick-action suggestion chips below last message
- Persistent text input at bottom
- "View Full Cart" and "Buy Now" CTAs inline with cart display

---

### Screen 3: Emergency Mode

**Purpose:** Pre-configured emergency carts for instant ordering with minimal interaction.

**Layout:**
```
┌──────────────────────────────────┐
│  ← Emergency Mode       [Cart 🛒]│
├──────────────────────────────────┤
│                                  │
│  ⚡ SELECT YOUR EMERGENCY        │
│                                  │
│  ┌──────────────────────────┐   │
│  │ 🤒 Fever & Cold          │   │
│  │ Medicines, thermometer,   │   │
│  │ ORS, tissues (8 items)    │   │
│  │              [Order Now ➜]│   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │ 🔦 Power Cut             │   │
│  │ Candles, matches,         │   │
│  │ flashlight, batteries     │   │
│  │              [Order Now ➜]│   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │ 👶 Baby Care Emergency    │   │
│  │ Diapers, wipes, formula,  │   │
│  │ rash cream (10 items)     │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │ 🩹 First Aid             │   │
│  │ Bandages, antiseptic,     │   │
│  │ pain relief (7 items)     │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │ 🌊 Natural Disaster Prep │   │
│  │ Water, canned food,       │   │
│  │ first aid, flashlight     │   │
│  └──────────────────────────┘   │
│                                  │
├──────────────────────────────────┤
│ [Home] [Ask AI] [Emergency] [⟲] │
└──────────────────────────────────┘
```

**Expanded Emergency Cart View (after tapping a category):**
```
┌──────────────────────────────────┐
│  ← Fever & Cold         [Cart 🛒]│
├──────────────────────────────────┤
│                                  │
│  ⚡ EMERGENCY CART (8 items)      │
│  Estimated delivery: 15 min      │
│                                  │
│  ┌──────────────────────────┐   │
│  │ ✓ Paracetamol 500mg  ₹30│   │
│  │ ✓ Digital Thermometer ₹250│  │
│  │ ✓ ORS Packets (5)    ₹45│   │
│  │ ✓ Cold Compress      ₹120│   │
│  │ ✓ Tissues (2 boxes)  ₹80│   │
│  │ ✓ Vapor Rub          ₹95│   │
│  │ ✓ Honey Lemon Tea    ₹60│   │
│  │ ✓ Cough Syrup        ₹110│  │
│  └──────────────────────────┘   │
│                                  │
│  Total: ₹790                    │
│                                  │
│  ┌──────────────────────────┐   │
│  │    🚀 ORDER NOW (1-tap)   │   │
│  │   Delivers in ~15 mins   │   │
│  └──────────────────────────┘   │
│                                  │
│  [Edit Cart] [Change Address]    │
│                                  │
├──────────────────────────────────┤
│ [Home] [Ask AI] [Emergency] [⟲] │
└──────────────────────────────────┘
```

---

### Screen 4: Reorder

**Purpose:** View past orders and reorder them in one tap.

**Layout:**
```
┌──────────────────────────────────┐
│  ← Reorder              [Cart 🛒]│
├──────────────────────────────────┤
│                                  │
│  📦 YOUR PAST ORDERS             │
│                                  │
│  ┌──────────────────────────┐   │
│  │ 🎬 Movie Night           │   │
│  │ 3 days ago • 8 items     │   │
│  │ Popcorn, soda, chips...  │   │
│  │ ₹580      [Reorder ➜]   │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │ 🤒 Fever Emergency       │   │
│  │ 1 week ago • 6 items     │   │
│  │ Paracetamol, ORS, tea... │   │
│  │ ₹420      [Reorder ➜]   │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │ 🏠 Guest Hosting         │   │
│  │ 2 weeks ago • 14 items   │   │
│  │ Snacks, drinks, cups...  │   │
│  │ ₹1,240    [Reorder ➜]   │   │
│  └──────────────────────────┘   │
│                                  │
│  [Load More]                     │
│                                  │
├──────────────────────────────────┤
│ [Home] [Ask AI] [Emergency] [⟲] │
└──────────────────────────────────┘
```

---

### Screen 5: Cart

**Purpose:** Review current cart, make modifications via conversation, and proceed to checkout.

**Layout:**
```
┌──────────────────────────────────┐
│  ← Your Cart (12 items)         │
├──────────────────────────────────┤
│                                  │
│  Situation: "Guests in 30 mins" │
│  ┌──────────────────────────┐   │
│  │ Chips (Lay's Classic)    │   │
│  │ Qty: [−] 2 [+]    ₹60   │   │
│  ├──────────────────────────┤   │
│  │ Coca-Cola 6-pack         │   │
│  │ Qty: [−] 1 [+]    ₹180  │   │
│  ├──────────────────────────┤   │
│  │ Hummus Dip               │   │
│  │ Qty: [−] 2 [+]    ₹120  │   │
│  ├──────────────────────────┤   │
│  │ ... (scrollable)         │   │
│  └──────────────────────────┘   │
│                                  │
│  💬 "Remove the soda and add    │
│      juice instead"             │
│  [Send to AI]                    │
│                                  │
│  ──────────────────────────────  │
│  Subtotal:           ₹1,240     │
│  Delivery:           ₹30        │
│  Total:              ₹1,270     │
│  Est. Delivery:      18 min     │
│                                  │
│  ┌──────────────────────────┐   │
│  │      🛒 BUY NOW          │   │
│  │  (Saved address + UPI)    │   │
│  └──────────────────────────┘   │
│                                  │
├──────────────────────────────────┤
│ [Home] [Ask AI] [Emergency] [⟲] │
└──────────────────────────────────┘
```

---

### Screen 6: Checkout (Simplified)

**Purpose:** One-screen confirmation with pre-filled defaults. Single tap to confirm.

**Layout:**
```
┌──────────────────────────────────┐
│  ← Checkout                      │
├──────────────────────────────────┤
│                                  │
│  📍 DELIVER TO                   │
│  ┌──────────────────────────┐   │
│  │ Home - 42 MG Road,       │   │
│  │ Bangalore 560001  [Edit] │   │
│  └──────────────────────────┘   │
│                                  │
│  💳 PAY WITH                     │
│  ┌──────────────────────────┐   │
│  │ UPI - user@paytm  [Edit] │   │
│  └──────────────────────────┘   │
│                                  │
│  📦 ORDER SUMMARY               │
│  ┌──────────────────────────┐   │
│  │ 12 items • ₹1,240        │   │
│  │ Delivery: ₹30            │   │
│  │ Total: ₹1,270            │   │
│  │ Est. Delivery: 18 min    │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │   ✓ CONFIRM ORDER        │   │
│  │   Pay ₹1,270 via UPI     │   │
│  └──────────────────────────┘   │
│                                  │
├──────────────────────────────────┤
│ [Home] [Ask AI] [Emergency] [⟲] │
└──────────────────────────────────┘
```

---

## Navigation Flow

```
                    ┌───────────┐
                    │   Home    │
                    └─────┬─────┘
           ┌──────────────┼──────────────┐
           │              │              │
     ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐
     │  Ask AI   │ │ Emergency │ │  Reorder  │
     └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
           │              │              │
           │         ┌────▼────┐         │
           │         │Emergency│         │
           │         │Cart View│         │
           │         └────┬────┘         │
           │              │              │
           └──────────────┼──────────────┘
                          │
                    ┌─────▼─────┐
                    │   Cart    │
                    └─────┬─────┘
                          │
                    ┌─────▼─────┐
                    │ Checkout  │
                    └─────┬─────┘
                          │
                    ┌─────▼─────┐
                    │  Order    │
                    │ Confirmed │
                    └───────────┘
```

**Navigation Rules:**
- Bottom tab bar persists on all screens except Checkout and Order Confirmed
- Any cart-generating action (situation input, emergency select, reorder) navigates to Cart screen
- Cart screen always accessible via top-right cart icon
- Back navigation follows standard stack behavior

---

## User Interaction Flows

### Flow 1: Situation → Cart → Checkout (Primary Happy Path)

```
User opens app
  → Sees Home screen with situation input
  → Types "guests arriving in 30 minutes" OR taps a suggestion
  → Loading spinner (1-3 seconds)
  → Cart screen displays with AI-generated items
  → User reviews cart
    → (Optional) Taps chat: "add dessert" → AI adds items
    → (Optional) Adjusts quantities with +/- buttons
  → Taps "Buy Now"
  → Checkout screen with pre-filled address + payment
  → Taps "Confirm Order"
  → Order confirmed screen
```

**Total taps (happy path):** 3 (input → Buy Now → Confirm)
**Total time target:** Under 60 seconds

### Flow 2: Emergency → Order (Fastest Path)

```
User opens app
  → Taps "Emergency" tab
  → Selects emergency category (e.g., "Fever & Cold")
  → Emergency cart displayed with all items
  → Taps "ORDER NOW"
  → Order confirmed (skips separate checkout for saved users)
```

**Total taps:** 3 (Emergency → Category → Order Now)
**Total time target:** Under 15 seconds

### Flow 3: Reorder (Repeat Purchase)

```
User opens app
  → Taps "Reorder" tab
  → Sees past orders as cards
  → Taps "Reorder" on a past order
  → Cart populated with previous items + current prices
  → Taps "Buy Now" → "Confirm"
  → Order confirmed
```

**Total taps:** 4 (Reorder tab → Reorder button → Buy Now → Confirm)

### Flow 4: Conversational Modification

```
User has items in cart (from any flow)
  → On Cart screen, taps chat input
  → Types: "replace chips with something healthier"
  → AI responds: "Replaced Lay's Chips with Multigrain Crackers (₹85)"
  → Cart updates in real-time
  → User types: "also add for 2 more people"
  → AI adjusts quantities and adds more items
  → Cart updates
  → User satisfied → taps "Buy Now"
```

---

## Component Hierarchy

```
App
├── Layout
│   ├── Header (logo, profile icon, cart badge)
│   └── BottomNav (Home, Ask AI, Emergency, Reorder)
│
├── Pages
│   ├── HomePage
│   │   ├── SituationInput (text field + submit button)
│   │   ├── EmergencyQuickActions (3 emergency cards)
│   │   └── TrendingSituations (list of situation cards)
│   │
│   ├── AskAIPage
│   │   ├── ChatMessageList
│   │   │   ├── AIMessage (text + optional CartPreview)
│   │   │   └── UserMessage (text bubble)
│   │   ├── SuggestionChips (quick-action pills)
│   │   └── ChatInput (text field + send button)
│   │
│   ├── EmergencyPage
│   │   ├── EmergencyCategoryList
│   │   │   └── EmergencyCategoryCard (icon, title, description, item count)
│   │   └── EmergencyCartView
│   │       ├── EmergencyCartItemList
│   │       ├── CartSummary (total, delivery estimate)
│   │       └── OrderNowButton
│   │
│   ├── ReorderPage
│   │   └── PastOrderList
│   │       └── PastOrderCard (situation label, date, items preview, reorder button)
│   │
│   ├── CartPage
│   │   ├── CartSituationLabel
│   │   ├── CartItemList
│   │   │   └── CartItemRow (name, quantity controls, price, remove)
│   │   ├── CartModificationInput (chat input for AI modifications)
│   │   ├── CartSummary (subtotal, delivery, total, ETA)
│   │   └── BuyNowButton
│   │
│   └── CheckoutPage
│       ├── AddressCard (saved address with edit option)
│       ├── PaymentCard (saved method with edit option)
│       ├── OrderSummaryCard (item count, total, delivery ETA)
│       └── ConfirmOrderButton
│
└── Shared Components
    ├── ProductCard (image, name, price, quantity)
    ├── CartPreview (compact inline cart for chat)
    ├── LoadingSpinner (AI thinking indicator)
    ├── Badge (item count on cart icon)
    └── Toast (success/error notifications)
```

---

## State Management Approach

### Zustand Store Structure

**cartStore:**
```
{
  items: CartItem[]          // Current cart items
  situationLabel: string     // e.g., "Guests arriving in 30 minutes"
  total: number              // Computed total
  deliveryEstimate: number   // Minutes
  isLoading: boolean         // AI generation in progress
  
  // Actions
  setCartFromAI(items, label)
  addItem(item)
  removeItem(itemId)
  updateQuantity(itemId, qty)
  clearCart()
  loadFromOrder(orderId)
}
```

**conversationStore:**
```
{
  messages: Message[]        // Chat history
  isAITyping: boolean        // Loading state
  suggestions: string[]      // Quick-action chips
  
  // Actions
  sendMessage(text)
  addAIResponse(text, cartUpdates?)
  clearConversation()
}
```

**orderStore:**
```
{
  pastOrders: Order[]        // Order history
  
  // Actions
  addOrder(order)
  getOrders()
  getOrderById(id)
}
```

**userStore:**
```
{
  name: string
  address: Address           // Mocked default address
  paymentMethod: PaymentMethod  // Mocked default payment
  preferences: {
    dietary: string[]
    householdSize: number
  }
}
```

### State Flow

```
User Input (situation text)
  → cartStore.isLoading = true
  → API call to /api/ai/generate-cart
  → AI returns items
  → cartStore.setCartFromAI(items, situationLabel)
  → cartStore.isLoading = false
  → Navigate to Cart screen

User Conversation (modification)
  → conversationStore.sendMessage(text)
  → conversationStore.isAITyping = true
  → API call to /api/ai/modify-cart with current cart + message
  → AI returns cart diff (adds, removes, updates)
  → Apply diff to cartStore
  → conversationStore.addAIResponse(reply, diff)
  → conversationStore.isAITyping = false

Emergency Select
  → Load preset from static JSON
  → cartStore.setCartFromAI(preset.items, preset.label)
  → Navigate to Emergency Cart View

Reorder
  → orderStore.getOrderById(id)
  → cartStore.setCartFromAI(order.items, order.situationLabel)
  → Navigate to Cart screen
```

---

## Frontend Architecture

### Directory Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout with BottomNav
│   ├── page.tsx                # Home page
│   ├── ask-ai/
│   │   └── page.tsx            # Ask AI conversational page
│   ├── emergency/
│   │   ├── page.tsx            # Emergency category list
│   │   └── [category]/
│   │       └── page.tsx        # Emergency cart for specific category
│   ├── reorder/
│   │   └── page.tsx            # Past orders list
│   ├── cart/
│   │   └── page.tsx            # Cart review + modification
│   └── checkout/
│       └── page.tsx            # Checkout confirmation
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── BottomNav.tsx
│   ├── home/
│   │   ├── SituationInput.tsx
│   │   ├── EmergencyQuickActions.tsx
│   │   └── TrendingSituations.tsx
│   ├── chat/
│   │   ├── ChatMessageList.tsx
│   │   ├── AIMessage.tsx
│   │   ├── UserMessage.tsx
│   │   ├── SuggestionChips.tsx
│   │   └── ChatInput.tsx
│   ├── emergency/
│   │   ├── EmergencyCategoryCard.tsx
│   │   └── EmergencyCartView.tsx
│   ├── cart/
│   │   ├── CartItemRow.tsx
│   │   ├── CartSummary.tsx
│   │   ├── CartModificationInput.tsx
│   │   └── BuyNowButton.tsx
│   ├── reorder/
│   │   └── PastOrderCard.tsx
│   ├── checkout/
│   │   ├── AddressCard.tsx
│   │   ├── PaymentCard.tsx
│   │   └── ConfirmOrderButton.tsx
│   └── shared/
│       ├── ProductCard.tsx
│       ├── CartPreview.tsx
│       ├── LoadingSpinner.tsx
│       ├── Badge.tsx
│       └── Toast.tsx
│
├── stores/
│   ├── cartStore.ts
│   ├── conversationStore.ts
│   ├── orderStore.ts
│   └── userStore.ts
│
├── services/
│   ├── aiService.ts            # OpenAI/Bedrock API wrapper
│   ├── productCatalog.ts       # Static product lookup
│   └── emergencyPresets.ts     # Static emergency cart configs
│
├── data/
│   ├── products.json           # Mock product catalog (200-500 items)
│   ├── emergencies.json        # Emergency preset configurations
│   └── trending.json           # Trending situation suggestions
│
├── types/
│   ├── cart.ts
│   ├── product.ts
│   ├── order.ts
│   ├── conversation.ts
│   └── emergency.ts
│
└── lib/
    ├── prompts.ts              # AI prompt templates
    └── utils.ts                # Shared utilities
```

### API Routes Design

**POST /api/ai/generate-cart**
- Input: `{ situation: string, preferences?: UserPreferences }`
- Process: Sends situation + product catalog context to LLM, receives structured cart
- Output: `{ items: CartItem[], situationLabel: string, confidence: number }`

**POST /api/ai/modify-cart**
- Input: `{ currentCart: CartItem[], message: string, conversationHistory: Message[] }`
- Process: Sends current cart + modification request to LLM
- Output: `{ reply: string, cartDiff: { add: CartItem[], remove: string[], update: {id, qty}[] } }`

**GET /api/products**
- Returns full product catalog for client-side filtering

**GET /api/orders**
- Returns past orders from localStorage/mock store

**POST /api/orders**
- Saves a new order to localStorage/mock store

### AI Prompt Strategy

The AI integration uses structured prompts to ensure consistent, parseable output:

1. **System Prompt**: Defines UrgentCart persona, response format (JSON), product catalog subset relevant to the situation category
2. **Situation Prompt**: Includes the user's situation, household preferences, budget hints, and instruction to return a JSON array of items with quantities
3. **Modification Prompt**: Includes current cart state, conversation history, and the new modification request; returns a diff format

**Key Design Decisions:**
- Product catalog is sent as context to the LLM (200-500 items fits within context window)
- LLM returns structured JSON with product IDs from the catalog (ensures real items are returned)
- Fallback: If LLM returns items not in catalog, the service maps to nearest match

---

## Design Decisions and Tradeoffs

| Decision | Rationale | Tradeoff |
|---|---|---|
| Static JSON product catalog | Zero setup, fast reads, no database needed | Limited to ~500 items, no real-time updates |
| localStorage for orders | Instant persistence, no backend DB | Data lost on browser clear, single-device only |
| LLM for cart generation | Natural language understanding, flexible | 1-3s latency, API costs, needs internet |
| Zustand over Redux | Minimal boilerplate for hackathon speed | Less structured for large-scale app |
| Next.js API routes | Co-located backend, single deployment | Not independently scalable |
| Mocked checkout | Demonstrates flow without real payment integration | Not functional for real orders |
| Bottom tab navigation | Mobile-first, thumb-friendly, standard UX | Limited to 4-5 tabs |

---

## Demo Flow (Hackathon Presentation)

1. **Open app** → Show polished Home screen with trending situations
2. **Type "guests arriving in 30 mins"** → AI generates cart in 2-3 seconds → Show cart with 12 relevant items
3. **Chat modification** → Type "make it vegetarian and add desserts" → Cart updates live
4. **Emergency demo** → Tap Emergency → Fever & Cold → Show pre-built cart → One-tap order
5. **Reorder demo** → Show past orders → One-tap reorder → Instant cart population
6. **Checkout** → Show pre-filled checkout → Single confirm tap → Order placed in under 60 seconds

---

## Correctness Properties

### Property 1: Cart Generation Completeness
For all valid Situation descriptions of 3 or more characters, the AI_Engine produces a non-empty cart containing between 5 and 30 items with valid product IDs from the Product_Catalog.

### Property 2: Conversational Modification Consistency
For all cart modification operations (add, remove, swap, quantity change), the resulting cart state accurately reflects the requested modification — added items are present, removed items are absent, swapped items are replaced, and quantities match the requested value.

### Property 3: Emergency Cart Integrity
For all emergency categories, the pre-configured cart contains at least 5 items, all items have valid product IDs, positive prices, and positive quantities. The cart is loadable in under 1 second.

### Property 4: Reorder Fidelity
For all past orders, reordering produces a cart where every item from the original order is either present with current pricing or flagged as unavailable with a suggested substitute.

### Property 5: Cart State Invariants
At all times, the cart total equals the sum of (item price × quantity) for all items in the cart. The item count displayed equals the length of the items array. No item has a quantity of zero or negative.

### Property 6: Navigation State Consistency
Every cart-generating action (situation input, emergency select, reorder) results in navigation to a screen displaying the generated cart. The displayed cart matches the cartStore state.
