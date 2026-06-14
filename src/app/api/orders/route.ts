import { type NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { createOrderRequestSchema } from '@/schemas/orders.schema';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getOrderRepository } from '@/repositories';
import { Order, CartItem } from '@/types';

const DEFAULT_USER_ID = 'default-user';

function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `ORD-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createOrderRequestSchema.parse(body);

    const order: Order = {
      id: generateOrderId(),
      items: validated.items as CartItem[],
      situationLabel: validated.situationLabel,
      total: validated.total,
      date: new Date().toISOString(),
      status: 'placed',
    };

    const orderRepo = getOrderRepository();
    const created = await orderRepo.create(DEFAULT_USER_ID, order);

    return successResponse(created, 201);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const details = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return errorResponse('VALIDATION_ERROR', 'Invalid request body', 400, details);
    }

    console.error('[orders] Unexpected error:', error);
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}
