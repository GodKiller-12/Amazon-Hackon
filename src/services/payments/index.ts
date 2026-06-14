import { PaymentProvider } from './types';
import { RazorpayProvider } from './razorpayProvider';
import { MockPaymentProvider } from './mockProvider';

export type {
  PaymentProvider,
  CreatePaymentOrderRequest,
  PaymentOrder,
  PaymentStatus,
  PaymentVerificationRequest,
  PaymentResult,
  WebhookEvent,
} from './types';

/**
 * Factory function that returns the configured payment provider.
 * Reads PAYMENT_MODE env var:
 * - "razorpay" → RazorpayProvider (requires Razorpay credentials)
 * - "local" or undefined → MockPaymentProvider (default)
 */
export function getPaymentProvider(): PaymentProvider {
  const mode = process.env.PAYMENT_MODE || 'local';

  if (mode === 'razorpay') {
    try {
      const provider = new RazorpayProvider();
      console.log('[Payment Provider] Using Razorpay');
      return provider;
    } catch (error) {
      console.warn(
        '[Payment Provider] Failed to initialize Razorpay, falling back to mock:',
        error instanceof Error ? error.message : error
      );
      return new MockPaymentProvider();
    }
  }

  return new MockPaymentProvider();
}
