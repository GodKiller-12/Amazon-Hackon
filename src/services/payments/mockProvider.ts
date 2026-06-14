import {
  PaymentProvider,
  CreatePaymentOrderRequest,
  PaymentOrder,
  PaymentVerificationRequest,
  PaymentResult,
} from './types';

/**
 * Mock payment provider for local development.
 * Simulates Razorpay behavior without real API calls.
 */
export class MockPaymentProvider implements PaymentProvider {
  async createOrder(request: CreatePaymentOrderRequest): Promise<PaymentOrder> {
    // Simulate network delay
    await this.delay(1000);

    const amountInPaise = Math.round(request.amount * 100);
    const currency = request.currency || 'INR';

    return {
      paymentOrderId: `pay_mock_${Date.now()}`,
      orderId: request.orderId,
      amount: amountInPaise,
      currency,
      status: 'created',
      receipt: request.receipt || `rcpt_${request.orderId}`,
      createdAt: new Date().toISOString(),
    };
  }

  async verifyPayment(request: PaymentVerificationRequest): Promise<PaymentResult> {
    await this.delay(1000);

    return {
      verified: true,
      paymentId: request.razorpay_payment_id || `mock_pay_${Date.now()}`,
      orderId: request.razorpay_order_id,
      status: 'captured',
    };
  }

  validateWebhook(_body: string, _signature: string): boolean {
    return true;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
