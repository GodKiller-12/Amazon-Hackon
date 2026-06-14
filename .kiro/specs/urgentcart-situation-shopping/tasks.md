# Implementation Plan: UrgentCart Situation Shopping

## Overview

This plan implements UrgentCart as a 48-hour hackathon project for a single developer with AI assistance. Tasks are ordered by demo value — the core Situation-to-Cart AI flow is built first, then conversational modification, emergency mode, reorder, and replenishment suggestions are layered on. Each feature is self-contained and builds upon the shared foundation (project structure, stores, mock data, layout).

## Tasks

- [x] 1. Project Foundation and Shared Infrastructure
  - [x] 1.1 Initialize Next.js project with App Router, Tailwind CSS, and shadcn/ui
    - Create Next.js app with TypeScript and App Router
    - Install and configure Tailwind CSS and shadcn/ui (Button, Card, Input, Badge, Toast components)
    - Install Zustand for state management
    - Set up project directory structure matching the design (`src/app`, `src/components`, `src/stores`, `src/services`, `src/data`, `src/types`, `src/lib`)
    - _Requirements: 11.1, 11.2, 12.2, 12.5_

  - [x] 1.2 Create TypeScript type definitions
    - Define types in `src/types/`: `product.ts` (Product, ProductCategory), `cart.ts` (CartItem, CartState), `order.ts` (Order, OrderStatus), `conversation.ts` (Message, ConversationState), `emergency.ts` (EmergencyCategory, EmergencyPreset)
    - Include all fields from design: id, name, price, quantity, category, image placeholder, delivery estimate
    - _Requirements: 1.2, 8.1, 8.3_

  - [x] 1.3 Create mock product catalog data
    - Create `src/data/products.json` with 200-300 products across categories: grocery, snacks, beverages, household, pharmacy, personal care, baby care, emergency supplies
    - Each product: id, name, price (INR), category, tags, inStock flag, deliveryMinutes estimate, imageUrl placeholder
    - Ensure products cover all situations: movie night, guests, exam prep, party, fever, power cut, baby care, first aid
    - _Requirements: 8.1, 8.3, 8.4_

  - [x] 1.4 Create trending situations and emergency presets data
    - Create `src/data/trending.json` with 8-10 trending situation suggestions (title, emoji, description)
    - Create `src/data/emergencies.json` with 5 emergency presets (Fever & Cold, Power Cut, Baby Care, First Aid, Natural Disaster) each with 6-10 product IDs, category label, icon, and description
    - _Requirements: 3.1, 11.1, 11.2_

  - [x] 1.5 Implement Zustand stores
    - Create `src/stores/cartStore.ts`: items, situationLabel, total (computed), deliveryEstimate, isLoading, actions (setCartFromAI, addItem, removeItem, updateQuantity, clearCart, loadFromOrder)
    - Create `src/stores/conversationStore.ts`: messages, isAITyping, suggestions, actions (sendMessage, addAIResponse, clearConversation)
    - Create `src/stores/orderStore.ts`: pastOrders (persisted to localStorage), actions (addOrder, getOrders, getOrderById)
    - Create `src/stores/userStore.ts`: name, address, paymentMethod, preferences (all mocked defaults)
    - _Requirements: 1.1, 2.8, 4.1, 7.3_

  - [x] 1.6 Build shared layout components
    - Create `src/components/layout/Header.tsx`: logo, cart badge (item count from cartStore), profile icon
    - Create `src/components/layout/BottomNav.tsx`: 4 tabs (Home, Ask AI, Emergency, Reorder) with active state highlighting
    - Create `src/app/layout.tsx`: root layout wrapping Header + BottomNav around page content
    - Create `src/components/shared/LoadingSpinner.tsx`, `src/components/shared/Toast.tsx`
    - _Requirements: 11.1, 11.2, 12.2_

- [x] 2. Checkpoint - Foundation complete
  - Ensure project builds and runs without errors, all stores are functional, layout renders with navigation. Ask the user if questions arise.

- [ ] 3. Feature 1: Situation-to-Cart AI (Core Flow)
  - [ ] 3.1 Create AI service and prompt templates
    - Create `src/services/aiService.ts`: wrapper for OpenAI GPT-4 API calls
    - Create `src/lib/prompts.ts`: system prompt (UrgentCart persona, JSON response format), situation-to-cart prompt template (includes product catalog context, user preferences, budget hints)
    - Prompt instructs LLM to return JSON array of `{productId, name, quantity, reason}` from the catalog
    - _Requirements: 1.1, 1.5, 1.6_

  - [ ] 3.2 Implement `/api/ai/generate-cart` API route
    - Create `src/app/api/ai/generate-cart/route.ts`
    - Accept POST with `{ situation: string, preferences?: { dietary: string[], householdSize: number } }`
    - Load product catalog, build prompt with catalog context + situation + preferences
    - Call OpenAI API, parse JSON response, map to CartItem[] with real product data (price, delivery estimate)
    - Handle edge cases: situation < 3 chars (return error prompting more context), low confidence (return clarifying question)
    - Return `{ items: CartItem[], situationLabel: string, confidence: number }`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 3.3 Build Home page with situation input
    - Create `src/app/page.tsx` (Home page)
    - Create `src/components/home/SituationInput.tsx`: large text input with placeholder "What's your situation?", submit button, loading state
    - Create `src/components/home/EmergencyQuickActions.tsx`: 3 tappable emergency cards (Fever, Power Cut, Baby Care)
    - Create `src/components/home/TrendingSituations.tsx`: scrollable list of trending situation cards from `trending.json`
    - On situation submit: call generate-cart API, store result in cartStore, navigate to /cart
    - On trending situation tap: auto-fill and submit that situation
    - _Requirements: 11.1, 11.2, 11.3, 1.1_

  - [ ] 3.4 Build Cart page with item display and Buy Now
    - Create `src/app/cart/page.tsx`
    - Create `src/components/cart/CartItemRow.tsx`: product name, quantity controls (+/-), price, remove button
    - Create `src/components/cart/CartSummary.tsx`: subtotal, delivery fee, total, estimated delivery time
    - Create `src/components/cart/BuyNowButton.tsx`: prominent CTA showing saved address + payment method
    - Display situation label at top of cart
    - Quantity +/- updates cartStore, total recomputes reactively
    - "Buy Now" navigates to /checkout
    - _Requirements: 1.2, 6.1, 6.2, 10.1_

  - [ ] 3.5 Build Checkout page with one-tap confirmation
    - Create `src/app/checkout/page.tsx`
    - Create `src/components/checkout/AddressCard.tsx`: display mocked saved address with "Edit" button (non-functional for MVP)
    - Create `src/components/checkout/PaymentCard.tsx`: display mocked UPI payment method with "Edit" button
    - Create `src/components/checkout/ConfirmOrderButton.tsx`: "Confirm Order - Pay ₹X" button
    - On confirm: save order to orderStore (localStorage), clear cart, show success toast, navigate to home
    - Display order summary: item count, total, delivery ETA
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 10.3_

  - [ ]* 3.6 Write property test for cart generation completeness
    - **Property 1: Cart Generation Completeness**
    - Generate random valid situation strings (3+ chars), call generate-cart, verify response has 5-30 items, all with valid product IDs from catalog
    - **Validates: Requirements 1.1, 1.2**

  - [ ]* 3.7 Write property test for cart state invariants
    - **Property 5: Cart State Invariants**
    - After any sequence of add/remove/updateQuantity operations, verify total = sum(price × qty), item count = items.length, no item has qty ≤ 0
    - **Validates: Requirements 1.2, 6.1**

- [ ] 4. Checkpoint - Core situation-to-cart flow working end-to-end
  - Ensure user can type a situation on Home, AI generates a cart, cart displays with correct totals, checkout completes. Ask the user if questions arise.

- [ ] 5. Feature 2: Conversational Cart Modification
  - [ ] 5.1 Implement `/api/ai/modify-cart` API route
    - Create `src/app/api/ai/modify-cart/route.ts`
    - Accept POST with `{ currentCart: CartItem[], message: string, conversationHistory: Message[] }`
    - Build prompt with current cart state, conversation history, and modification request
    - LLM returns `{ reply: string, cartDiff: { add: CartItem[], remove: string[], update: {id, qty}[] } }`
    - Apply diff format: additions include full product data, removals by ID, updates by ID + new qty
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ] 5.2 Build Ask AI page with chat interface
    - Create `src/app/ask-ai/page.tsx`
    - Create `src/components/chat/ChatMessageList.tsx`: scrollable message list
    - Create `src/components/chat/AIMessage.tsx`: AI bubble with optional inline CartPreview component
    - Create `src/components/chat/UserMessage.tsx`: user text bubble (right-aligned)
    - Create `src/components/chat/ChatInput.tsx`: text input + send button at bottom
    - Create `src/components/chat/SuggestionChips.tsx`: quick-action pills ("Add desserts", "Make it vegetarian", "Add for kids")
    - Create `src/components/shared/CartPreview.tsx`: compact inline cart showing items, count, total, "View Full Cart" and "Buy Now" buttons
    - On first message: call generate-cart API, display cart in AI response
    - On subsequent messages: call modify-cart API, apply diff to cartStore, display reply + updated cart
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [ ] 5.3 Add cart modification input to Cart page
    - Create `src/components/cart/CartModificationInput.tsx`: text input with "Send to AI" button on the Cart page
    - On submit: call modify-cart API with current cart + message, apply diff to cartStore
    - Show AI response as a toast or inline message confirming the change
    - _Requirements: 2.1, 2.2, 2.8_

  - [ ]* 5.4 Write property test for conversational modification consistency
    - **Property 2: Conversational Modification Consistency**
    - For random add/remove/swap/quantity operations via the modify-cart API, verify the resulting cart accurately reflects the requested change
    - **Validates: Requirements 2.3, 2.4, 2.5, 2.6**

- [ ] 6. Checkpoint - Conversational flow working
  - Ensure Ask AI page allows full conversation, cart modifications reflect correctly, Chat on Cart page works. Ask the user if questions arise.

- [ ] 7. Feature 3: Emergency Mode
  - [ ] 7.1 Create emergency presets service
    - Create `src/services/emergencyPresets.ts`: loads emergency categories from `emergencies.json`, resolves product IDs to full product data from catalog
    - Function `getEmergencyCart(categoryId)`: returns fully resolved cart items with prices and delivery estimates
    - Function `getCategories()`: returns all emergency categories with metadata
    - _Requirements: 3.1, 3.2_

  - [ ] 7.2 Build Emergency page with category list
    - Create `src/app/emergency/page.tsx`: grid/list of emergency category cards
    - Create `src/components/emergency/EmergencyCategoryCard.tsx`: icon, title, short description, item count, "Order Now" arrow
    - On category tap: navigate to `/emergency/[category]`
    - _Requirements: 3.1, 3.2_

  - [ ] 7.3 Build Emergency Cart view with one-tap ordering
    - Create `src/app/emergency/[category]/page.tsx`
    - Create `src/components/emergency/EmergencyCartView.tsx`: full item list, total, delivery estimate ("~15 min"), prominent "ORDER NOW (1-tap)" button
    - Load preset via emergencyPresets service, display all items with prices
    - "Order Now" button: save order to orderStore, show confirmation, skip checkout screen for speed
    - Include "Edit Cart" link that navigates to /cart with items pre-loaded
    - Wire Home page EmergencyQuickActions cards to navigate to respective emergency category pages
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 7.4 Write property test for emergency cart integrity
    - **Property 3: Emergency Cart Integrity**
    - For all emergency categories, verify preset cart has ≥5 items, all have valid product IDs, positive prices, positive quantities, and loads in under 1 second
    - **Validates: Requirements 3.1, 3.2, 3.4**

- [ ] 8. Checkpoint - Emergency mode complete
  - Ensure all 5 emergency categories load correct carts, one-tap ordering works, Home page quick actions link correctly. Ask the user if questions arise.

- [ ] 9. Feature 4: One-Click Reorder
  - [ ] 9.1 Build Reorder page with past order cards
    - Create `src/app/reorder/page.tsx`
    - Create `src/components/reorder/PastOrderCard.tsx`: situation label (emoji + text), date (relative: "3 days ago"), item count, item preview text, total price, "Reorder" button
    - Load past orders from orderStore (localStorage), display sorted by recency
    - Show empty state with message "No past orders yet" when orderStore is empty
    - _Requirements: 4.1, 4.2, 4.6_

  - [ ] 9.2 Implement reorder flow with cart population
    - On "Reorder" tap: load order items, check against product catalog for availability
    - If all available: populate cartStore with items at current prices, navigate to /cart
    - If some unavailable: flag unavailable items with visible indicator, suggest substitutes (nearest product in same category)
    - Display current prices (may differ from original order price)
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 9.1, 9.3_

  - [ ]* 9.3 Write property test for reorder fidelity
    - **Property 4: Reorder Fidelity**
    - For any stored order, reordering produces a cart where every original item is present (with current price) or flagged as unavailable with a substitute suggestion
    - **Validates: Requirements 4.3, 4.4, 4.6**

- [ ] 10. Checkpoint - Reorder flow complete
  - Ensure past orders display correctly, reorder populates cart, availability checking works. Ask the user if questions arise.

- [ ] 11. Feature 5: Replenishment Suggestions
  - [ ] 11.1 Implement replenishment prediction logic
    - Create `src/services/replenishmentService.ts`
    - Analyze order history from orderStore: identify consumable items purchased more than once
    - Calculate average purchase interval per item
    - Predict next restocking date: lastPurchaseDate + averageInterval
    - Return items predicted to need restocking within 3 days
    - Skip predictions if user has fewer than 3 past orders
    - _Requirements: 5.1, 5.2, 5.5_

  - [ ] 11.2 Add replenishment suggestions to Home page
    - Create `src/components/home/ReplenishmentBanner.tsx`: shows "Running low?" section with predicted items
    - Display product name, last purchased date, "Reorder" button per item
    - "Reorder" button adds item to cart or triggers quick reorder
    - Include dismiss/snooze option (stores snooze state in localStorage for 7 days)
    - Only show when replenishmentService returns items (requires 3+ past orders)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 12. Final Polish and Demo Preparation
  - [ ] 12.1 Add loading states and animations
    - Add skeleton loaders for cart generation (pulsing card placeholders)
    - Add typing indicator animation for AI responses in chat
    - Add smooth transitions between pages
    - Ensure all loading states show within 500ms of user action
    - _Requirements: 12.1, 12.2, 12.4_

  - [ ] 12.2 Seed demo data for presentation
    - Pre-populate 3-4 past orders in localStorage for reorder demo
    - Ensure trending situations produce compelling carts
    - Test all 5 emergency presets for completeness
    - Verify the end-to-end demo flow: Home → Situation → Cart → Checkout works under 60 seconds
    - _Requirements: 11.1, 3.1, 4.1_

- [ ] 13. Final Checkpoint - Full demo flow
  - Ensure all tests pass, full demo sequence works (situation → cart → modify → emergency → reorder → checkout). Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation between features
- Property tests validate universal correctness properties from the design
- Unit tests validate specific examples and edge cases
- The implementation order (Situation AI → Conversation → Emergency → Reorder → Replenishment) maximizes demo value — each checkpoint produces a demonstrable feature
- Mock data and localStorage are used throughout — no real database or payment integration needed
- OpenAI API key is the only external dependency required

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4"] },
    { "id": 2, "tasks": ["1.5", "1.6"] },
    { "id": 3, "tasks": ["3.1"] },
    { "id": 4, "tasks": ["3.2", "3.3"] },
    { "id": 5, "tasks": ["3.4", "3.5"] },
    { "id": 6, "tasks": ["3.6", "3.7"] },
    { "id": 7, "tasks": ["5.1", "7.1"] },
    { "id": 8, "tasks": ["5.2", "5.3", "7.2"] },
    { "id": 9, "tasks": ["5.4", "7.3"] },
    { "id": 10, "tasks": ["7.4", "9.1"] },
    { "id": 11, "tasks": ["9.2"] },
    { "id": 12, "tasks": ["9.3", "11.1"] },
    { "id": 13, "tasks": ["11.2"] },
    { "id": 14, "tasks": ["12.1", "12.2"] }
  ]
}
```
