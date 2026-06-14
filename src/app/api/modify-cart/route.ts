import { type NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { modifyCartRequestSchema } from '@/schemas/modify-cart.schema';
import { modifyCart } from '@/services/aiService';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ApiError } from '@/lib/api-error';
import { CartItem } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = modifyCartRequestSchema.parse(body);

    const result = await modifyCart(validated.currentCart as CartItem[], validated.message);

    return successResponse(result);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const details = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return errorResponse('VALIDATION_ERROR', 'Invalid request body', 400, details);
    }

    if (error instanceof ApiError) {
      return errorResponse(error.code, error.message, error.statusCode, error.details);
    }

    console.error('[modify-cart] Unexpected error:', error);
    return errorResponse(
      'AI_GENERATION_ERROR',
      'Failed to modify cart. Please try again.',
      500
    );
  }
}
