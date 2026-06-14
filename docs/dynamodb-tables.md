# DynamoDB Table Design

All table names use a configurable prefix via `DYNAMODB_TABLE_PREFIX` env var (e.g., `urgentcart-dev-`).

## Table: `{prefix}users`

Stores user profiles.

| Attribute | Type | Key |
|-----------|------|-----|
| PK | S | Partition Key = `USER#{userId}` |
| SK | S | Sort Key = `PROFILE` |
| userId | S | |
| name | S | |
| email | S | |
| phone | S | |
| address | M | `{label, street, city, pincode}` |
| paymentMethod | M | `{type, label, details}` |
| preferences | M | `{dietary: L, householdSize: N}` |
| createdAt | S | ISO 8601 |
| updatedAt | S | ISO 8601 |

## Table: `{prefix}orders`

Stores order history per user.

| Attribute | Type | Key |
|-----------|------|-----|
| PK | S | Partition Key = `USER#{userId}` |
| SK | S | Sort Key = `ORDER#{orderId}` |
| orderId | S | |
| items | L | CartItem[] |
| situationLabel | S | |
| total | N | |
| status | S | placed / confirmed / delivering / delivered |
| createdAt | S | ISO 8601 |
| updatedAt | S | ISO 8601 |

### GSI: `OrdersByDate`

- Partition Key: `PK` (USER#{userId})
- Sort Key: `createdAt`
- Purpose: Efficient date-sorted queries for order history

## Table: `{prefix}conversations`

Stores AI conversation history with TTL-based auto-expiry.

| Attribute | Type | Key |
|-----------|------|-----|
| PK | S | Partition Key = `USER#{userId}` |
| SK | S | Sort Key = `CONV#{conversationId}` |
| conversationId | S | |
| messages | L | Message[] |
| situationLabel | S | |
| cartSnapshot | L | CartItem[] at end of conversation |
| createdAt | S | ISO 8601 |
| updatedAt | S | ISO 8601 |
| ttl | N | Unix epoch (auto-expire after 30 days) |

## Table: `{prefix}saved-carts`

Stores saved cart snapshots with TTL-based auto-expiry.

| Attribute | Type | Key |
|-----------|------|-----|
| PK | S | Partition Key = `USER#{userId}` |
| SK | S | Sort Key = `CART#{cartId}` |
| cartId | S | |
| items | L | CartItem[] |
| situationLabel | S | |
| total | N | |
| createdAt | S | ISO 8601 |
| ttl | N | Unix epoch (auto-expire after 7 days) |

## Access Patterns

| Pattern | Table | Key Condition |
|---------|-------|---------------|
| Get user profile | users | PK=USER#{id}, SK=PROFILE |
| List user orders (newest first) | orders | PK=USER#{id}, SK begins_with ORDER# |
| Get single order | orders | PK=USER#{id}, SK=ORDER#{orderId} |
| List conversations | conversations | PK=USER#{id}, SK begins_with CONV# |
| Get conversation messages | conversations | PK=USER#{id}, SK=CONV#{convId} |
| List saved carts | saved-carts | PK=USER#{id}, SK begins_with CART# |
| Get saved cart | saved-carts | PK=USER#{id}, SK=CART#{cartId} |

## Configuration

```env
USE_DYNAMODB=false           # Toggle DynamoDB (false = in-memory)
DYNAMODB_ENDPOINT=           # Local DynamoDB endpoint (e.g., http://localhost:8000)
DYNAMODB_TABLE_PREFIX=       # Prefix for all table names (e.g., urgentcart-dev-)
AWS_REGION=us-east-1         # AWS region
AWS_ACCESS_KEY_ID=           # AWS credentials
AWS_SECRET_ACCESS_KEY=       # AWS credentials
```
