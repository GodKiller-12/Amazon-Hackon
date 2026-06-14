import { getPaymentProvider } from './index';
import { getPaymentRepository } from '@/repositories';
import { getOrderRepository } from '@/repositories';
import {
  PaymentOrder,
  PaymentStatus,
  PaymentVerificationRequest,
  PaymentResult,
  WebhookEvent,
} from './types';
import { PaymentRecord } from '@/repositories/interfaces';

/**
 * Higher-level payment orchestration service.
 * Coordinates between the payment provider and the payment repository.
 */
export class PaymentService {
  async createPaymentOrder(
    userId: string,
    orderId: string,
    amount: number
  ): Promise<PaymentOrder> {
    const provider = getPaymentProvider();

    const paymentOrder = await provider.createOrder({
      orderId,
      amount,
      notes: { userId, orderId },
    });

    // Store payment record
    const paymentRepo = getPaymentRepository();
    const record: PaymentRecord = {
      paymentOrderId: paymentOrder.paymentOrderId,
      orderId,
      userId,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      status: paymentOrder.status,
      createdAt: paymentOrder.createdAt,
      updatedAt: paymentOrder.createdAt,
    };

    await paymentRepo.create(record);

    return paymentOrder;
  }

  async verifyPayment(verification: PaymentVerificationRequest): Promise<PaymentResult> {
    const provider = getPaymentProvider();
    const result = await provider.verifyPayment(verification);

    if (result.verified) {
      const paymentRepo = getPaymentRepository();
      await paymentRepo.updateStatus(
        verification.razorpay_order_id,
        'captured',
        result.paymentId
      );

      // Update the order status to 'confirmed'
      const payment = await paymentRepo.getByPaymentOrderId(verification.razorpay_order_id);
      if (payment) {
        const orderRepo = getOrderRepository();
        await orderRepo.updateStatus(payment.userId, payment.orderId, 'confirmed');
      }
    }

    return result;
  }

  async handleWebhook(event: WebhookEvent): Promise<void> {
    const paymentEntity = event.payload.payment.entity;
    const paymentRepo = getPaymentRepository();

    let status: PaymentStatus;
    switch (event.event) {
      case 'payment.authorized':
        status = 'authorized';
        break;
      case 'payment.captured':
        status = 'captured';
        break;
      case 'payment.failed':
        status = 'failed';
        break;
      default:
        console.log(`[PaymentService] Ignoring event: ${event.event}`);
        return;
    }

    await paymentRepo.updateStatus(
      paymentEntity.order_id,
      status,
      paymentEntity.id
    );

    // Update order status based on payment status
    if (status === 'captured') {
      const payment = await paymentRepo.getByPaymentOrderId(paymentEntity.order_id);
      if (payment) {
        const orderRepo = getOrderRepository();
        await orderRepo.updateStatus(payment.userId, payment.orderId, 'confirmed');
      }
    }
  }

  async getPaymentStatus(orderId: string): Promise<PaymentStatus | null> {
    const paymentRepo = getPaymentRepository();
    const payment = await paymentRepo.getByOrderId(orderId);
    return payment?.status ?? null;
  }
}
