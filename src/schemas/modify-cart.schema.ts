import { z } from 'zod';

const cartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().positive(),
  category: z.string(),
  tags: z.array(z.string()),
  inStock: z.boolean(),
  deliveryMinutes: z.number().positive(),
  imageUrl: z.string(),
  brand: z.string(),
  description: z.string(),
  quantity: z.number().int().positive(),
  reason: z.string().optional(),
});

export const modifyCartRequestSchema = z.object({
  currentCart: z.array(cartItemSchema).min(1, 'Cart must have at least 1 item'),
  message: z.string().min(1, 'Message cannot be empty').max(500),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'ai']),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
  userId: z.string().optional(),
  conversationId: z.string().optional(),
});

export type ModifyCartRequest = z.infer<typeof modifyCartRequestSchema>;
