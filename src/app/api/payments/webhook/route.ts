import { type NextRequest } from 'next/server';
import { getPaymentProvider } from '@/services/payments';
import { PaymentService } from '@/services/payments/paymentService';
import { WebhookEvent } from '@/services/payments/types';

/**
 * Webhook handler for Razorpay payment events.
 * This route does NOT use auth — webhooks come directly from Razorpay.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';

    // Validate webhook signature
    const provider = getPaymentProvider();
    const isValid = provider.validateWebhook(body, signature);

    if (!isValid) {
      console.warn('[payments/webhook] Invalid webhook signature');
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse and process the event
    const event: WebhookEvent = JSON.parse(body);
    const paymentService = new PaymentService();
    await paymentService.handleWebhook(event);

    return Response.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('[payments/webhook] Error processing webhook:', error);
    // Return 200 to prevent Razorpay from retrying on parse errors
    return Response.json({ status: 'error' }, { status: 200 });
  }
}
