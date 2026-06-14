import {
  PutCommand,
  GetCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { getDocClient, tableName } from '@/lib/dynamodb';
import { IConversationRepository } from '../interfaces';
import { Message, CartItem } from '@/types';

const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;

export class DynamoConversationRepository implements IConversationRepository {
  private get table() {
    return tableName('conversations');
  }

  async create(userId: string, conversationId: string, situationLabel?: string): Promise<void> {
    const client = getDocClient();
    const now = new Date().toISOString();
    const ttl = Math.floor(Date.now() / 1000) + THIRTY_DAYS_IN_SECONDS;

    await client.send(
      new PutCommand({
        TableName: this.table,
        Item: {
          PK: `USER#${userId}`,
          SK: `CONV#${conversationId}`,
          conversationId,
          messages: [],
          situationLabel: situationLabel || '',
          cartSnapshot: [],
          createdAt: now,
          updatedAt: now,
          ttl,
        },
      })
    );
  }

  async addMessage(userId: string, conversationId: string, message: Message): Promise<void> {
    const client = getDocClient();
    const now = new Date().toISOString();

    await client.send(
      new UpdateCommand({
        TableName: this.table,
        Key: {
          PK: `USER#${userId}`,
          SK: `CONV#${conversationId}`,
        },
        UpdateExpression: 'SET messages = list_append(if_not_exists(messages, :empty), :msg), updatedAt = :now',
        ExpressionAttributeValues: {
          ':msg': [message],
          ':empty': [],
          ':now': now,
        },
      })
    );
  }

  async getMessages(userId: string, conversationId: string): Promise<Message[]> {
    const client = getDocClient();

    const result = await client.send(
      new GetCommand({
        TableName: this.table,
        Key: {
          PK: `USER#${userId}`,
          SK: `CONV#${conversationId}`,
        },
        ProjectionExpression: 'messages',
      })
    );

    if (!result.Item) return [];

    return (result.Item.messages as Message[]) || [];
  }

  async saveCartSnapshot(userId: string, conversationId: string, cart: CartItem[]): Promise<void> {
    const client = getDocClient();
    const now = new Date().toISOString();

    await client.send(
      new UpdateCommand({
        TableName: this.table,
        Key: {
          PK: `USER#${userId}`,
          SK: `CONV#${conversationId}`,
        },
        UpdateExpression: 'SET cartSnapshot = :cart, updatedAt = :now',
        ExpressionAttributeValues: {
          ':cart': cart,
          ':now': now,
        },
      })
    );
  }
}
