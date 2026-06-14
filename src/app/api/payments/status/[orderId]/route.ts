import { type NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { withAuth } from '@/lib/auth/middleware';
import { AuthUser } from '@/lib/auth/types';
import { PaymentService } from '@/services/payments/paymentService';
import { getOrderRepository } from '@/repositories';

export const GET = withAuth(async (request: NextRequest, user: AuthUser) => {
  try {
    const url = new URL(request.url);
    const segments = url.pathname.split('/');
    const orderId = segments[segments.length - 1];

    if (!orderId) {
      return errorResponse('VALIDATION_ERROR', 'Order ID is required', 400);
    }

    // Verify order belongs to user
    const orderRepo = getOrderRepository();
    const order = await orderRepo.getById(user.userId, orderId);

    if (!order) {
      return errorResponse('ORDER_NOT_FOUND', 'Order not found', 404);
    }

    const paymentService = new PaymentService();
    const status = await paymentService.getPaymentStatus(orderId);

    return successResponse({
      orderId,
      paymentStatus: status || 'not_initiated',
    });
  } catch (error) {
    console.error('[payments/status] Unexpected error:', error);
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
});
