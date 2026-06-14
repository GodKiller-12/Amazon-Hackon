import { z } from 'zod';

export const generateCartRequestSchema = z.object({
  situation: z.string().min(3, 'Situation must be at least 3 characters').max(500),
  preferences: z
    .object({
      dietary: z.array(z.string()).optional().default([]),
      householdSize: z.number().int().min(1).max(20).optional().default(2),
    })
    .optional(),
});

export type GenerateCartRequest = z.infer<typeof generateCartRequestSchema>;
