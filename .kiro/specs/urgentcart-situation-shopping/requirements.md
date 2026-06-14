# Requirements Document

## Introduction

UrgentCart is an AI-powered quick commerce platform designed for Amazon HackOn Season 6.0. The platform eliminates traditional product-search workflows by allowing users to describe a situation in natural language. The AI engine interprets the situation, generates an optimized shopping cart, and enables purchase completion in under 60 seconds through a streamlined 1-2 click flow. The platform targets time-sensitive shopping scenarios — from hosting guests on short notice to managing medical emergencies — where speed and relevance outweigh the need to browse.

---

## Glossary

- **Platform**: The UrgentCart application including all client interfaces and backend services
- **AI_Engine**: The natural language processing and recommendation subsystem that interprets situations and generates carts
- **Cart_Generator**: The component of the AI_Engine responsible for assembling product lists from situation descriptions
- **Conversation_Interface**: The chat-based UI through which users interact with the AI_Engine to build or modify carts
- **Emergency_Module**: The subsystem that provides pre-configured carts for urgent, time-critical situations
- **Replenishment_Engine**: The subsystem that predicts when a user's previously purchased consumable items need restocking
- **Checkout_Service**: The subsystem handling payment processing, address selection, and order placement
- **Product_Catalog**: The integrated inventory of available products with pricing, availability, and metadata
- **Situation**: A natural-language description of a user's context or need (e.g., "guests arriving in 30 minutes")
- **Generated_Cart**: A shopping cart assembled by the AI_Engine in response to a Situation
- **User_Profile**: The stored preferences, order history, dietary restrictions, and household information for a registered user
- **Reorder_Service**: The subsystem enabling one-click reordering of previous purchases
- **Delivery_Estimator**: The component that calculates estimated delivery time based on location, inventory, and logistics capacity

---

## User Personas

### Persona 1: Busy Professional (Priya, 32)
- **Role**: Marketing Manager at a tech company
- **Context**: Works 10+ hours daily, frequently hosts impromptu team dinners at home, values time above all
- **Pain Points**: Spends 15-20 minutes searching for individual items; forgets essentials when shopping under time pressure; decision fatigue after a long workday
- **Goal**: Describe "team dinner for 6 in 45 minutes" and receive a complete cart instantly

### Persona 2: Young Parent (Rahul, 29)
- **Role**: Software engineer, father of a 10-month-old
- **Context**: Sleep-deprived, handles baby emergencies at odd hours, needs specific products quickly
- **Pain Points**: Panics during baby emergencies (diaper rash, sudden fever); can't remember exact product names; needs items delivered in minutes, not hours
- **Goal**: Tap "Baby Emergency" and get a pre-configured cart of essentials delivered fastest

### Persona 3: College Student (Ananya, 21)
- **Role**: Final-year engineering student
- **Context**: Lives in a hostel, budget-conscious, pulls all-nighters during exams, hosts movie nights with friends
- **Pain Points**: Limited budget makes browsing overwhelming; forgets snacks/supplies for group events; needs exam-prep supplies at odd hours
- **Goal**: Say "exam prep all-nighter" and get an affordable cart of energy drinks, snacks, and stationery

### Persona 4: Elderly User (Mr. Sharma, 68)
- **Role**: Retired school principal
- **Context**: Lives alone, manages chronic health conditions, not tech-savvy, prefers minimal app interaction
- **Pain Points**: Complex app navigation is confusing; forgets to reorder medicines; struggles with small text and multi-step checkouts
- **Goal**: Receive a reminder to reorder medicines and complete the purchase in one tap

### Persona 5: Party Host / Social Organizer (Meera, 27)
- **Role**: HR executive who organizes social gatherings frequently
- **Context**: Hosts parties, potlucks, and celebrations; needs themed collections of items; values variety and completeness
- **Pain Points**: Manually building party carts takes 30+ minutes; always forgets disposable plates or ice; needs items grouped by theme
- **Goal**: Describe "Diwali party for 20 people" and receive a themed, complete cart with decorations, snacks, drinks, and supplies

---

## User Journeys

### Journey 1: Situation-Based Cart Generation
1. User opens the Platform and lands on the Home screen
2. User sees trending situation suggestions (e.g., "Movie Night", "Guests Arriving Soon")
3. User taps a suggested situation or types a custom one: "guests arriving in 30 minutes"
4. AI_Engine processes the situation and generates a cart within 3 seconds
5. User reviews the Generated_Cart (15-20 relevant items with quantities)
6. User optionally modifies via Conversation_Interface ("add a dessert", "remove alcohol")
7. User taps "Buy Now" — saved address and payment method are pre-selected
8. Order is placed in under 60 seconds from initial input

### Journey 2: Emergency Shopping
1. User opens the Platform in a panic (child has a fever at 2 AM)
2. User taps "Emergency" tab on the bottom navigation
3. User selects "Fever & Cold" from the pre-configured emergency categories
4. Emergency_Module instantly displays a curated cart (thermometer, paracetamol, ORS, cold compress, tissues)
5. User taps "Order Now" — no modifications needed
6. Checkout_Service uses saved defaults; order placed in under 15 seconds
7. Delivery_Estimator shows fastest delivery option pre-selected

### Journey 3: One-Click Reorder Flow
1. User opens the Platform and navigates to "Reorder" tab
2. User sees past orders displayed as situation-labeled cards (e.g., "Movie Night — 3 days ago")
3. User taps "Reorder" on a past order
4. Platform checks real-time inventory and flags any unavailable items with suggested substitutes
5. User confirms; order placed in one tap

### Journey 4: Cart Modification via Conversation
1. User has a Generated_Cart on screen (from any source)
2. User taps the chat icon or types in the Conversation_Interface
3. User says: "replace chips with healthier snacks" or "add items for 2 more people"
4. AI_Engine modifies the cart in real-time, showing additions/removals with explanations
5. User confirms changes or continues conversing until satisfied

---

## Customer Pain Points Addressed

| Pain Point | How UrgentCart Solves It |
|---|---|
| Too much time spent searching for individual products | Situation-based input eliminates per-item searches entirely |
| Decision fatigue from too many choices | AI curates a single optimized cart; user only approves or tweaks |
| Forgetting items for specific situations | AI uses situation context to include commonly forgotten items |
| Emergency needs not served fast enough | Pre-configured emergency carts enable sub-15-second ordering |
| Repetitive reordering friction | One-click reorder with automatic availability checking |
| Complex checkout flows | Saved defaults + 1-2 click checkout eliminates form-filling |
| Running out of essentials unexpectedly | Smart replenishment reminders predict restocking needs |

---

## Requirements

### Requirement 1: Situation Understanding and Cart Generation

**User Story:** As a time-pressed shopper, I want to describe my situation in natural language, so that I receive a complete, relevant shopping cart without searching for individual items.

#### Acceptance Criteria

1. WHEN a user submits a Situation description, THE AI_Engine SHALL generate a relevant cart of 5-30 items within 3 seconds
2. WHEN generating a cart, THE Cart_Generator SHALL include item names, quantities, prices, and estimated delivery time for each item
3. WHEN the Situation description contains fewer than 3 characters, THE AI_Engine SHALL prompt the user for additional context
4. WHEN the AI_Engine cannot interpret a Situation with confidence above 70%, THE AI_Engine SHALL ask one clarifying question before generating the cart
5. THE Cart_Generator SHALL rank items by relevance to the described Situation and display them in descending relevance order
6. WHEN a user has a User_Profile with dietary restrictions or preferences, THE Cart_Generator SHALL filter out items that violate those preferences
7. WHEN a generated item is out of stock, THE Cart_Generator SHALL substitute it with the nearest available alternative and indicate the substitution

### Requirement 2: Conversational Cart Building

**User Story:** As a shopper who finds typing difficult, I want to build my cart through a conversational interface, so that I can describe what I need naturally and refine the cart interactively.

#### Acceptance Criteria

1. THE Conversation_Interface SHALL accept natural-language text input for cart creation and modification
2. WHEN a user sends a message in the Conversation_Interface, THE AI_Engine SHALL respond with cart modifications within 2 seconds
3. WHEN a user requests an item addition, THE AI_Engine SHALL add the most relevant matching product from the Product_Catalog to the cart
4. WHEN a user requests an item removal, THE AI_Engine SHALL remove the specified item and confirm the removal
5. WHEN a user requests a swap (e.g., "replace chips with popcorn"), THE AI_Engine SHALL remove the original item and add the replacement in a single operation
6. WHEN a user requests a quantity change, THE AI_Engine SHALL update the quantity and reflect the updated cart total
7. WHEN the AI_Engine cannot match a user request to a specific product, THE AI_Engine SHALL present up to 3 alternatives for the user to choose from
8. THE Conversation_Interface SHALL maintain context across the entire session so that follow-up messages reference previous items correctly

### Requirement 3: Emergency Mode

**User Story:** As a user in an urgent situation, I want to access pre-configured emergency carts, so that I can place an order in under 15 seconds without any decision-making.

#### Acceptance Criteria

1. THE Emergency_Module SHALL provide pre-configured carts for at least the following categories: Fever and Cold, Power Cut, Baby Care Emergency, First Aid, and Natural Disaster Preparedness
2. WHEN a user selects an emergency category, THE Emergency_Module SHALL display the pre-configured cart within 1 second
3. THE Emergency_Module SHALL pre-select the fastest available delivery option for all emergency orders
4. WHEN an item in a pre-configured emergency cart is unavailable, THE Emergency_Module SHALL substitute it with the nearest equivalent and flag the substitution visibly
5. THE Emergency_Module SHALL allow one-tap ordering without requiring cart review when the user has saved payment and address defaults
6. WHEN a user has no saved payment method or address, THE Emergency_Module SHALL prompt the user to complete minimum required fields before placing the order

### Requirement 4: One-Click Reorder

**User Story:** As a repeat shopper, I want to reorder my previous purchases with one click, so that I can replenish routine items without rebuilding my cart.

#### Acceptance Criteria

1. THE Reorder_Service SHALL display past orders sorted by recency with the most recent order first
2. THE Reorder_Service SHALL label past orders with the original Situation description or a generated summary
3. WHEN a user taps "Reorder" on a past order, THE Reorder_Service SHALL add all items from that order to the cart
4. WHEN one or more items from a past order are unavailable, THE Reorder_Service SHALL flag unavailable items and suggest substitutes
5. WHEN all items from a past order are available, THE Reorder_Service SHALL enable one-tap checkout from the reorder screen
6. THE Reorder_Service SHALL display the current price for each item (prices may differ from the original order)

### Requirement 5: Smart Replenishment Reminders

**User Story:** As a forgetful shopper, I want to receive reminders when my consumable items are likely running out, so that I never run out of essentials unexpectedly.

#### Acceptance Criteria

1. THE Replenishment_Engine SHALL analyze purchase history to predict restocking dates for consumable items
2. WHEN a predicted restocking date is within 3 days, THE Replenishment_Engine SHALL send a push notification to the user
3. WHEN a user receives a replenishment reminder, THE Platform SHALL provide a one-tap reorder option within the notification
4. THE Replenishment_Engine SHALL allow users to dismiss or snooze reminders for 7 days
5. WHEN a user has fewer than 3 past orders, THE Replenishment_Engine SHALL not generate predictions (insufficient data)
6. THE Replenishment_Engine SHALL improve prediction accuracy over time by incorporating user feedback on reminder timing

### Requirement 6: Fast Checkout

**User Story:** As an impatient shopper, I want to complete checkout in 1-2 taps, so that I can place orders without filling forms or navigating multiple screens.

#### Acceptance Criteria

1. THE Checkout_Service SHALL pre-select the user's default saved address and payment method
2. WHEN a user has a saved address and payment method, THE Checkout_Service SHALL enable one-tap order placement from the cart screen
3. WHEN a user taps "Buy Now", THE Checkout_Service SHALL process the payment and confirm the order within 5 seconds
4. IF a payment fails, THEN THE Checkout_Service SHALL display a clear error message and allow the user to select an alternative payment method without losing the cart
5. THE Checkout_Service SHALL display the estimated delivery time on the checkout confirmation screen
6. WHEN a user has no saved address, THE Checkout_Service SHALL present an address entry form with auto-complete for faster input
7. THE Checkout_Service SHALL support at least UPI, credit card, debit card, and net banking as payment methods

### Requirement 7: User Authentication and Profiles

**User Story:** As a returning user, I want my preferences, order history, and payment methods saved securely, so that the platform personalizes my experience across sessions.

#### Acceptance Criteria

1. THE Platform SHALL support user registration via phone number with OTP verification
2. THE Platform SHALL support social login via Google and Apple accounts
3. WHEN a user logs in, THE Platform SHALL load the User_Profile including dietary preferences, household size, saved addresses, and payment methods within 2 seconds
4. THE Platform SHALL allow users to set dietary restrictions (vegetarian, vegan, gluten-free, nut-free) in the User_Profile
5. THE Platform SHALL allow users to specify household size and composition (adults, children, infants) in the User_Profile
6. WHEN a user updates their User_Profile, THE Platform SHALL persist the changes and reflect them in subsequent cart generations within the same session

### Requirement 8: Product Catalog Integration

**User Story:** As a platform operator, I want the system integrated with a real-time product catalog, so that users only see available, accurately priced products.

#### Acceptance Criteria

1. THE Product_Catalog SHALL contain at least 10,000 SKUs across grocery, household, pharmacy, and personal care categories
2. THE Product_Catalog SHALL update product availability in real-time with a maximum staleness of 60 seconds
3. WHEN the Cart_Generator selects an item, THE Product_Catalog SHALL return current price, stock status, and estimated delivery time
4. THE Product_Catalog SHALL support search by product name, category, brand, and tags
5. WHEN a product goes out of stock after being added to a user's cart, THE Platform SHALL notify the user and suggest a substitute before checkout

### Requirement 9: Real-Time Inventory Checking

**User Story:** As a shopper, I want inventory checked in real-time so that I do not discover items are unavailable only at checkout.

#### Acceptance Criteria

1. WHEN the Cart_Generator adds an item to a Generated_Cart, THE Platform SHALL verify inventory availability at that moment
2. WHEN a user views their cart, THE Platform SHALL re-verify inventory for all cart items and flag any that have become unavailable
3. WHEN an item becomes unavailable while in a user's cart, THE Platform SHALL display a visible indicator and suggest up to 3 substitutes
4. THE Platform SHALL not allow checkout to proceed with unavailable items in the cart

### Requirement 10: Delivery Time Estimation

**User Story:** As a shopper in a hurry, I want to see accurate delivery time estimates, so that I can decide whether to place an order or seek alternatives.

#### Acceptance Criteria

1. THE Delivery_Estimator SHALL display estimated delivery time for each item in the cart
2. THE Delivery_Estimator SHALL calculate delivery estimates based on user location, warehouse proximity, and current logistics load
3. WHEN all items in a cart are available from the same warehouse, THE Delivery_Estimator SHALL show a single consolidated delivery time
4. WHEN items in a cart are from multiple warehouses, THE Delivery_Estimator SHALL show per-item or per-shipment delivery times
5. THE Delivery_Estimator SHALL update estimates in real-time as items are added or removed from the cart

### Requirement 11: Home Screen and Situation Discovery

**User Story:** As a new user, I want to see situation suggestions and quick actions on the home screen, so that I can get started without knowing exactly what to type.

#### Acceptance Criteria

1. THE Platform SHALL display at least 6 trending situation suggestions on the Home screen
2. THE Platform SHALL display quick-action buttons for the top 3 emergency categories on the Home screen
3. WHEN a user taps a suggested situation, THE Platform SHALL pass it to the AI_Engine and generate a cart as per Requirement 1
4. THE Platform SHALL personalize Home screen suggestions based on the User_Profile and past order history after the user's third order
5. THE Platform SHALL refresh trending situations at least once every 24 hours based on aggregate user behavior and seasonal context

---

## Non-Functional Requirements

### Requirement 12: Performance

**User Story:** As a user in a hurry, I want the platform to respond instantly, so that I experience no delays between my intent and the result.

#### Acceptance Criteria

1. THE AI_Engine SHALL generate a cart from a Situation description in under 3 seconds at the 95th percentile
2. THE Platform SHALL render any screen transition in under 500 milliseconds
3. THE Checkout_Service SHALL confirm an order within 5 seconds of payment initiation
4. THE Conversation_Interface SHALL return AI responses within 2 seconds at the 95th percentile
5. THE Platform SHALL load the Home screen within 2 seconds on a 4G network connection

### Requirement 13: Scalability

**User Story:** As a platform operator, I want the system to handle millions of concurrent users, so that performance does not degrade during peak demand.

#### Acceptance Criteria

1. THE Platform SHALL support at least 1 million concurrent users without degradation of response times beyond 20% of baseline
2. THE AI_Engine SHALL scale horizontally to handle traffic spikes of up to 10x normal load within 2 minutes
3. THE Product_Catalog SHALL support at least 1,000 read queries per second per instance

### Requirement 14: Availability

**User Story:** As a user who may need the platform at any time (especially emergencies), I want the system to be available around the clock.

#### Acceptance Criteria

1. THE Platform SHALL maintain 99.9% uptime measured on a monthly basis
2. THE Emergency_Module SHALL maintain 99.99% uptime as it serves critical, time-sensitive use cases
3. IF a subsystem failure occurs, THEN THE Platform SHALL degrade gracefully by disabling non-essential features while maintaining core checkout and emergency functionality

### Requirement 15: Security

**User Story:** As a user trusting the platform with my payment information, I want my data protected to industry standards.

#### Acceptance Criteria

1. THE Checkout_Service SHALL comply with PCI-DSS Level 1 requirements for payment data handling
2. THE Platform SHALL encrypt all data in transit using TLS 1.2 or higher
3. THE Platform SHALL encrypt all personally identifiable information at rest using AES-256
4. THE Platform SHALL enforce rate limiting on authentication endpoints to prevent brute-force attacks
5. WHEN a user session is inactive for 30 minutes, THE Platform SHALL require re-authentication for payment actions

### Requirement 16: Accessibility

**User Story:** As a user with a disability, I want the platform to be accessible, so that I can use all features regardless of my abilities.

#### Acceptance Criteria

1. THE Platform SHALL conform to WCAG 2.1 Level AA guidelines across all screens
2. THE Platform SHALL support screen reader navigation for all interactive elements
3. THE Platform SHALL maintain a minimum color contrast ratio of 4.5:1 for all text elements
4. THE Conversation_Interface SHALL support voice input as an alternative to typed text
5. THE Platform SHALL support dynamic text resizing up to 200% without loss of functionality

---

## Success Metrics

| Metric | Target | Measurement Method |
|---|---|---|
| Time to purchase completion | Under 60 seconds from situation input to order placed | End-to-end timer in analytics |
| Emergency order completion time | Under 15 seconds from emergency tap to order placed | End-to-end timer in analytics |
| Cart acceptance rate | Over 60% of AI-generated carts accepted without modification | Cart modification tracking |
| Conversion rate | Over 40% of situation inputs result in a completed order | Funnel analytics |
| AI response accuracy | Over 85% of generated carts rated "relevant" by users | Post-order feedback survey |
| User retention (7-day) | Over 50% of new users return within 7 days | Cohort analysis |
| Replenishment reminder accuracy | Over 70% of reminders result in a reorder within 48 hours | Reminder-to-order tracking |
| App load time | Under 2 seconds on 4G | Performance monitoring |
| System uptime | 99.9% monthly | Infrastructure monitoring |

---

## Scope

### MVP Scope (Hackathon Deliverable)

1. Situation-based cart generation with AI_Engine (text input)
2. Conversational cart modification (add, remove, swap, quantity change)
3. Emergency mode with 5 pre-configured categories
4. One-click reorder of past orders
5. Fast checkout with saved payment and address
6. User authentication (phone OTP + Google login)
7. Home screen with situation suggestions and emergency quick actions
8. Real-time inventory checking and substitution
9. Basic delivery time estimation

### Future Scope (Post-Hackathon)

1. Voice-based situation input and conversational interaction
2. Family accounts with shared carts and preferences
3. Scheduled and recurring deliveries
4. Social shopping (share carts with friends, collaborative party planning)
5. AR product preview for home setup scenarios
6. Multi-language support (Hindi, Tamil, Telugu, Bengali)
7. Loyalty program with situation-based rewards
8. Integration with smart home devices (Alexa, Google Home)
9. Predictive pre-staging (pre-position inventory based on predicted demand)
10. Community-contributed situation templates

---

## Screen Flow

### Navigation Structure

```
Onboarding → Home → [Ask AI | Emergency | Reorder | Cart] → Checkout → Order Tracking
```

### Screen Descriptions

| Screen | Purpose | Key Elements |
|---|---|---|
| Onboarding | Collect User_Profile basics on first launch | Phone/Google login, dietary preferences, household size, address entry |
| Home | Surface situation suggestions and quick actions | Trending situations (6+), emergency quick actions (3), search bar, personalized suggestions |
| Ask AI | Conversational cart builder | Chat interface, suggested prompts, real-time cart preview panel |
| Emergency | Pre-configured emergency carts | Category grid (Fever, Power Cut, Baby, First Aid, Disaster), one-tap order buttons |
| Reorder | Past order history with reorder capability | Order cards with situation labels, "Reorder" button per card, price update indicators |
| Cart | Current cart review and modification | Item list with quantities/prices, AI suggestion bar, chat icon for modifications, "Buy Now" button |
| Checkout | Final confirmation and payment | Pre-selected address, pre-selected payment, delivery ETA, order total, single "Confirm" button |
| Order Tracking | Post-order status | Real-time delivery tracking, ETA updates, support chat |

---

## Additional Considerations

### Personalization Strategy
- Cold start: Use trending situations and popular carts for new users
- Warm start (3+ orders): Personalize suggestions based on order history, time of day, and day of week
- Deep personalization (10+ orders): Predict situations proactively and send preemptive suggestions

### Edge Cases
- User describes an ambiguous situation: AI asks one clarifying question
- All items in a generated cart are unavailable: Platform informs user and suggests alternative situations
- User has no internet mid-checkout: Platform queues order and retries when connectivity returns
- Multiple concurrent users ordering last-in-stock items: Real-time inventory lock during checkout prevents overselling
