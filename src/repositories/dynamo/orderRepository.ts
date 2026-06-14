import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { getDocClient, tableName } from '@/lib/dynamodb';
import { IOrderRepository } from '../interfaces';
import { Order, OrderStatus } from '@/types';

export class DynamoOrderRepository implements IOrderRepository {
  private get table() {
    return tableName('orders');
  }

  async create(userId: string, order: Order): Promise<Order> {
    const client = getDocClient();
    const now = new Date().toISOString();

    await client.send(
      new PutCommand({
        TableName: this.table,
        Item: {
          PK: `USER#${userId}`,
          SK: `ORDER#${order.id}`,
          orderId: order.id,
          items: order.items,
          situationLabel: order.situationLabel,
          total: order.total,
          status: order.status,
          createdAt: order.date || now,
          updatedAt: now,
        },
      })
    );

    return order;
  }

  async getById(userId: string, orderId: string): Promise<Order | null> {
    const client = getDocClient();

    const result = await client.send(
      new GetCommand({
        TableName: this.table,
        Key: {
          PK: `USER#${userId}`,
          SK: `ORDER#${orderId}`,
        },
      })
    );

    if (!result.Item) return null;

    return this.toOrder(result.Item);
  }

  async listByUser(userId: string, limit?: number): Promise<Order[]> {
    const client = getDocClient();

    const params: ConstructorParameters<typeof QueryCommand>[0] = {
      TableName: this.table,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':skPrefix': 'ORDER#',
      },
      ScanIndexForward: false,
    };

    if (limit && limit > 0) {
      params.Limit = limit;
    }

    const result = await client.send(new QueryCommand(params));

    return (result.Items || []).map((item) => this.toOrder(item));
  }

  async updateStatus(userId: string, orderId: string, status: OrderStatus): Promise<Order> {
    const client = getDocClient();
    const now = new Date().toISOString();

    const result = await client.send(
      new UpdateCommand({
        TableName: this.table,
        Key: {
          PK: `USER#${userId}`,
          SK: `ORDER#${orderId}`,
        },
        UpdateExpression: 'SET #status = :status, updatedAt = :now',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': status,
          ':now': now,
        },
        ReturnValues: 'ALL_NEW',
      })
    );

    return this.toOrder(result.Attributes!);
  }

  private toOrder(item: Record<string, unknown>): Order {
    return {
      id: item.orderId as string,
      items: item.items as Order['items'],
      situationLabel: item.situationLabel as string,
      total: item.total as number,
      date: item.createdAt as string,
      status: item.status as OrderStatus,
    };
  }
}
