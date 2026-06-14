export interface CreatePaymentOrderRequest {
  orderId: string;
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface PaymentOrder {
  paymentOrderId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  receipt: string;
  createdAt: string;
}

export type PaymentStatus = 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';

export interface PaymentVerificationRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentResult {
  verified: boolean;
  paymentId: string;
  orderId: string;
  status: PaymentStatus;
}

export interface WebhookEvent {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
        method: string;
      };
    };
  };
}

export interface PaymentProvider {
  createOrder(request: CreatePaymentOrderRequest): Promise<PaymentOrder>;
  verifyPayment(request: PaymentVerificationRequest): Promise<PaymentResult>;
  validateWebhook(body: string, signature: string): boolean;
}
