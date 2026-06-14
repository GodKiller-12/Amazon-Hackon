import { z } from 'zod';

export const productsQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  inStock: z.enum(['true', 'false']).optional(),
  limit: z.string().regex(/^\d+$/).optional().default('250'),
  offset: z.string().regex(/^\d+$/).optional().default('0'),
});

export type ProductsQuery = z.infer<typeof productsQuerySchema>;
