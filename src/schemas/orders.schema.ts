import { z } from 'zod';

export const createOrderRequestSchema = z.object({
  items: z
    .array(
      z.object({
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
      })
    )
    .min(1, 'Order must have at least 1 item'),
  situationLabel: z.string().min(1),
  total: z.number().positive(),
  deliveryAddress: z
    .object({
      label: z.string(),
      street: z.string(),
      city: z.string(),
      pincode: z.string(),
    })
    .optional(),
  paymentMethod: z
    .object({
      type: z.string(),
      label: z.string(),
      details: z.string(),
    })
    .optional(),
});

export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;
