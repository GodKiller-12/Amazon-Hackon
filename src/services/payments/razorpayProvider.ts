import Razorpay from 'razorpay';
import crypto from 'crypto';
import {
  PaymentProvider,
  CreatePaymentOrderRequest,
  PaymentOrder,
  PaymentVerificationRequest,
  PaymentResult,
} from './types';

export class RazorpayProvider implements PaymentProvider {
  private razorpay: Razorpay;
  private keySecret: string;
  private webhookSecret: string;

  constructor() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!keyId || !keySecret) {
      throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required');
    }

    this.keySecret = keySecret;
    this.webhookSecret = webhookSecret || '';

    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  async createOrder(request: CreatePaymentOrderRequest): Promise<PaymentOrder> {
    const amountInPaise = Math.round(request.amount * 100);
    const currency = request.currency || 'INR';
    const receipt = request.receipt || `rcpt_${request.orderId}`;

    const order = await this.razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt,
      notes: request.notes || { orderId: request.orderId },
    });

    return {
      paymentOrderId: order.id,
      orderId: request.orderId,
      amount: amountInPaise,
      currency,
      status: 'created',
      receipt,
      createdAt: new Date().toISOString(),
    };
  }

  async verifyPayment(request: PaymentVerificationRequest): Promise<PaymentResult> {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = request;

    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const verified = expectedSignature === razorpay_signature;

    return {
      verified,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: verified ? 'captured' : 'failed',
    };
  }

  validateWebhook(body: string, signature: string): boolean {
    if (!this.webhookSecret) {
      console.warn('[RazorpayProvider] No webhook secret configured');
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  }
}
