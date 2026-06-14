import { IPaymentRepository, PaymentRecord } from '../interfaces';
import { PaymentStatus } from '@/services/payments/types';

/**
 * In-memory payment repository. Used when DynamoDB is not configured.
 * Data resets on server restart.
 */
export class InMemoryPaymentRepository implements IPaymentRepository {
  private payments = new Map<string, PaymentRecord>();

  async create(payment: PaymentRecord): Promise<PaymentRecord> {
    this.payments.set(payment.paymentOrderId, payment);
    return payment;
  }

  async getByOrderId(orderId: string): Promise<PaymentRecord | null> {
    for (const payment of this.payments.values()) {
      if (payment.orderId === orderId) {
        return payment;
      }
    }
    return null;
  }

  async getByPaymentOrderId(paymentOrderId: string): Promise<PaymentRecord | null> {
    return this.payments.get(paymentOrderId) || null;
  }

  async updateStatus(
    paymentOrderId: string,
    status: PaymentStatus,
    paymentId?: string
  ): Promise<void> {
    const payment = this.payments.get(paymentOrderId);
    if (!payment) {
      throw new Error(`Payment ${paymentOrderId} not found`);
    }

    const updated: PaymentRecord = {
      ...payment,
      status,
      updatedAt: new Date().toISOString(),
      ...(paymentId && { razorpayPaymentId: paymentId }),
    };

    this.payments.set(paymentOrderId, updated);
  }
}
