# Context-Aware AI Architecture

## Overview

UrgentCart's AI system enriches every prompt with user context to deliver personalized cart recommendations. Before each AI request (generate-cart, modify-cart), a ContextBuilder assembles a rich user profile from multiple data sources and injects it into the prompt.

## Architecture Flow

```
API Request → ContextBuilder → AIProvider (with enriched context)
                 ↓
    ┌────────────┼────────────────┐
    │            │                │
UserProfile  OrderHistory  ConversationHistory
    │            │                │
    └────────────┼────────────────┘
                 ↓
        PromptEnrichment → Final Prompt → Bedrock/Mock
```

## Data Sources

### 1. User Profile (UserRepository)
- Name, household size, dietary restrictions, city
- Used for: personalization, dietary filtering, quantity scaling

### 2. Order History (OrderRepository)
- Last 10 orders loaded
- Frequent items extracted (ordered 2+ times)
- Preferred categories (top 3 by item count)
- Price preference (budget / mid-range / premium)
- Used for: brand affinity, category preferences, situational recall

### 3. Conversation Context (ConversationRepository)
- Active conversation messages (last 5)
- Current cart items from last AI response
- Used for: continuity in modify-cart flows

### 4. Time Context (computed)
- Day of week, time of day, weekend flag
- Used for: situational relevance (e.g., weekend snacking, late-night study)

## Request Types

### generate-cart
Loads **full context**: profile + order history + time context.
No conversation context needed (new cart generation).

### modify-cart
Loads **lightweight context**: profile + conversation context + time context.
Skips full order history scan for performance.

## Personalization Flow

1. API receives request with optional `userId`
2. `aiService.ts` creates a `ContextBuilder` and calls `buildContext()` or `buildModifyContext()`
3. Context is passed to the AI provider alongside the situation/message
4. Provider uses `PromptEnrichment` to generate a concise context summary
5. Summary is prepended to the user message sent to the AI model
6. AI model uses context to personalize item selection, quantities, and brands

## Token Budget Management

The context summary is kept **under 500 tokens** by:
- Including only top 5 frequent items (names only)
- Limiting to top 3 preferred categories
- Showing only 3 most recent orders (label + relative date)
- Truncating conversation history to 5 messages
- Using concise bullet-point format

Example context summary (~150 tokens):
```
## User Context:
- Name: Priya, Household: 4
- Dietary: Vegetarian
- Location: Bangalore
- Order History: 12 past orders
- Frequently buys: Amul Butter, Haldiram's Namkeen, Coca-Cola, Parle-G, Maggi
- Prefers: snacks, beverages, grocery
- Recent orders: "Movie Night" (2 days ago), "Guests Arriving" (1 week ago)
- Time: Saturday evening (weekend)
```

## Backward Compatibility

- `userId` is **optional** in all API requests
- When `userId` is not provided, behavior is identical to pre-context implementation
- When `userId` IS provided but context loading fails, the system continues without context
- No frontend changes required
- All existing API contracts remain unchanged

## Error Handling

The ContextBuilder handles errors gracefully:
- If profile loading fails → continues with `null` profile
- If order history loading fails → continues with empty history
- If conversation loading fails → continues with no conversation context
- If the entire context build fails → aiService proceeds without context

## Personalization Examples

### Movie Night (returning user)
- Context: "Previously ordered Butter Popcorn and Coca-Cola for Movie Night"
- Result: Includes their preferred brands, skips items they didn't reorder

### Guests Arriving (household of 4)
- Context: "Household size: 4, frequent buyer of Haldiram's snacks"
- Result: Quantities adjusted for 4+ people, includes their go-to brands

### Exam Prep (vegetarian student)
- Context: "Dietary: Vegetarian, previously ordered coffee and energy drinks"
- Result: No eggs/meat, includes their preferred coffee brand

## File Structure

```
src/services/ai/
├── context.types.ts       # UserContext, EnrichedPromptContext interfaces
├── contextBuilder.ts      # Assembles context from repositories
├── preferenceExtractor.ts # Analyzes orders for implicit preferences
├── promptEnrichment.ts    # Converts context to prompt-ready text
├── types.ts               # AIProvider interface (updated with context param)
├── bedrockProvider.ts     # Production provider (uses enrichment)
├── mockProvider.ts        # Dev provider (dietary filtering)
├── prompts.ts             # System prompt templates
└── index.ts               # Factory + ResilientProvider + exports
```
