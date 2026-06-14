import { type NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getOrders } from '@/lib/order-store';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    if (limitParam && (isNaN(limit!) || limit! < 1)) {
      return errorResponse(
        'VALIDATION_ERROR',
        'Limit must be a positive integer',
        400
      );
    }

    const orders = getOrders(limit);

    return successResponse({
      orders,
      count: orders.length,
    });
  } catch (error) {
    console.error('[orders/history] Unexpected error:', error);
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}
