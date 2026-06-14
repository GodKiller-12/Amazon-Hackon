import { type NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { verifyPaymentSchema } from '@/schemas/payment.schema';
import { successResponse, errorResponse } from '@/lib/api-response';
import { withAuth } from '@/lib/auth/middleware';
import { AuthUser } from '@/lib/auth/types';
import { PaymentService } from '@/services/payments/paymentService';

export const POST = withAuth(async (request: NextRequest, _user: AuthUser) => {
  try {
    const body = await request.json();
    const validated = verifyPaymentSchema.parse(body);

    const paymentService = new PaymentService();
    const result = await paymentService.verifyPayment(validated);

    if (!result.verified) {
      return errorResponse('PAYMENT_VERIFICATION_FAILED', 'Payment signature verification failed', 400);
    }

    return successResponse({
      verified: true,
      orderId: result.orderId,
      paymentId: result.paymentId,
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const details = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return errorResponse('VALIDATION_ERROR', 'Invalid request body', 400, details);
    }

    console.error('[payments/verify] Unexpected error:', error);
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
});
