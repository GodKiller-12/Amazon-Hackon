import { z } from 'zod';

export const signupSchema = z.object({
  phone: z.string().min(10).max(15),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100),
  email: z.string().email().optional(),
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const verifySchema = z.object({
  username: z.string().min(1),
  code: z.string().length(6),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});
