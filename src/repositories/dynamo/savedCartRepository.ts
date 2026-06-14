import {
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { getDocClient, tableName } from '@/lib/dynamodb';
import { ISavedCartRepository } from '../interfaces';
import { CartItem } from '@/types';
import { SavedCart } from '@/types/user';

const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60;

export class DynamoSavedCartRepository implements ISavedCartRepository {
  private get table() {
    return tableName('saved-carts');
  }

  async save(
    userId: string,
    cartId: string,
    items: CartItem[],
    situationLabel: string,
    total: number
  ): Promise<void> {
    const client = getDocClient();
    const now = new Date().toISOString();
    const ttl = Math.floor(Date.now() / 1000) + SEVEN_DAYS_IN_SECONDS;

    await client.send(
      new PutCommand({
        TableName: this.table,
        Item: {
          PK: `USER#${userId}`,
          SK: `CART#${cartId}`,
          cartId,
          items,
          situationLabel,
          total,
          createdAt: now,
          ttl,
        },
      })
    );
  }

  async getById(userId: string, cartId: string): Promise<SavedCart | null> {
    const client = getDocClient();

    const result = await client.send(
      new GetCommand({
        TableName: this.table,
        Key: {
          PK: `USER#${userId}`,
          SK: `CART#${cartId}`,
        },
      })
    );

    if (!result.Item) return null;

    return this.toSavedCart(userId, result.Item);
  }

  async listByUser(userId: string): Promise<SavedCart[]> {
    const client = getDocClient();

    const result = await client.send(
      new QueryCommand({
        TableName: this.table,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':skPrefix': 'CART#',
        },
        ScanIndexForward: false,
      })
    );

    return (result.Items || []).map((item) => this.toSavedCart(userId, item));
  }

  async delete(userId: string, cartId: string): Promise<void> {
    const client = getDocClient();

    await client.send(
      new DeleteCommand({
        TableName: this.table,
        Key: {
          PK: `USER#${userId}`,
          SK: `CART#${cartId}`,
        },
      })
    );
  }

  private toSavedCart(userId: string, item: Record<string, unknown>): SavedCart {
    return {
      cartId: item.cartId as string,
      userId,
      items: item.items as CartItem[],
      situationLabel: item.situationLabel as string,
      total: item.total as number,
      createdAt: item.createdAt as string,
    };
  }
}
