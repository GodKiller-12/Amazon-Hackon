import { type NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { createPaymentOrderSchema } from '@/schemas/payment.schema';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getOrderRepository } from '@/repositories';
import { withAuth } from '@/lib/auth/middleware';
import { AuthUser } from '@/lib/auth/types';
import { PaymentService } from '@/services/payments/paymentService';

export const POST = withAuth(async (request: NextRequest, user: AuthUser) => {
  try {
    const body = await request.json();
    const validated = createPaymentOrderSchema.parse(body);

    // Validate order exists and belongs to user
    const orderRepo = getOrderRepository();
    const order = await orderRepo.getById(user.userId, validated.orderId);

    if (!order) {
      return errorResponse('ORDER_NOT_FOUND', 'Order not found', 404);
    }

    const paymentService = new PaymentService();
    const paymentOrder = await paymentService.createPaymentOrder(
      user.userId,
      validated.orderId,
      validated.amount
    );

    return successResponse({
      paymentOrderId: paymentOrder.paymentOrderId,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_mock_key',
    }, 201);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const details = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return errorResponse('VALIDATION_ERROR', 'Invalid request body', 400, details);
    }

    console.error('[payments/create-order] Unexpected error:', error);
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
});
