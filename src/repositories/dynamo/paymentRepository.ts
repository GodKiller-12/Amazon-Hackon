import {
  PutCommand,
  QueryCommand,
  GetCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { getDocClient, tableName } from '@/lib/dynamodb';
import { IPaymentRepository, PaymentRecord } from '../interfaces';
import { PaymentStatus } from '@/services/payments/types';

export class DynamoPaymentRepository implements IPaymentRepository {
  private get table() {
    return tableName('payments');
  }

  async create(payment: PaymentRecord): Promise<PaymentRecord> {
    const client = getDocClient();

    await client.send(
      new PutCommand({
        TableName: this.table,
        Item: {
          PK: `PAYMENT#${payment.paymentOrderId}`,
          SK: `ORDER#${payment.orderId}`,
          GSI1PK: `ORDER#${payment.orderId}`,
          GSI1SK: `PAYMENT#${payment.paymentOrderId}`,
          paymentOrderId: payment.paymentOrderId,
          orderId: payment.orderId,
          userId: payment.userId,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
        },
      })
    );

    return payment;
  }

  async getByOrderId(orderId: string): Promise<PaymentRecord | null> {
    const client = getDocClient();

    const result = await client.send(
      new QueryCommand({
        TableName: this.table,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: {
          ':pk': `ORDER#${orderId}`,
        },
        Limit: 1,
      })
    );

    if (!result.Items || result.Items.length === 0) return null;
    return this.toPaymentRecord(result.Items[0]);
  }

  async getByPaymentOrderId(paymentOrderId: string): Promise<PaymentRecord | null> {
    const client = getDocClient();

    const result = await client.send(
      new QueryCommand({
        TableName: this.table,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
          ':pk': `PAYMENT#${paymentOrderId}`,
        },
        Limit: 1,
      })
    );

    if (!result.Items || result.Items.length === 0) return null;
    return this.toPaymentRecord(result.Items[0]);
  }

  async updateStatus(
    paymentOrderId: string,
    status: PaymentStatus,
    paymentId?: string
  ): Promise<void> {
    const client = getDocClient();
    const now = new Date().toISOString();

    // First find the record to get the SK
    const existing = await this.getByPaymentOrderId(paymentOrderId);
    if (!existing) {
      throw new Error(`Payment ${paymentOrderId} not found`);
    }

    const updateExpr = paymentId
      ? 'SET #status = :status, updatedAt = :now, razorpayPaymentId = :paymentId'
      : 'SET #status = :status, updatedAt = :now';

    const exprValues: Record<string, unknown> = {
      ':status': status,
      ':now': now,
    };

    if (paymentId) {
      exprValues[':paymentId'] = paymentId;
    }

    await client.send(
      new UpdateCommand({
        TableName: this.table,
        Key: {
          PK: `PAYMENT#${paymentOrderId}`,
          SK: `ORDER#${existing.orderId}`,
        },
        UpdateExpression: updateExpr,
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: exprValues,
      })
    );
  }

  private toPaymentRecord(item: Record<string, unknown>): PaymentRecord {
    return {
      paymentOrderId: item.paymentOrderId as string,
      orderId: item.orderId as string,
      userId: item.userId as string,
      amount: item.amount as number,
      currency: item.currency as string,
      status: item.status as PaymentStatus,
      razorpayPaymentId: item.razorpayPaymentId as string | undefined,
      createdAt: item.createdAt as string,
      updatedAt: item.updatedAt as string,
    };
  }
}
