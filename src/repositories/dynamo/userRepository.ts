import {
  PutCommand,
  GetCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { getDocClient, tableName } from '@/lib/dynamodb';
import { IUserRepository } from '../interfaces';
import { UserProfile } from '@/types/user';

export class DynamoUserRepository implements IUserRepository {
  private get table() {
    return tableName('users');
  }

  async getById(userId: string): Promise<UserProfile | null> {
    const client = getDocClient();

    const result = await client.send(
      new GetCommand({
        TableName: this.table,
        Key: {
          PK: `USER#${userId}`,
          SK: 'PROFILE',
        },
      })
    );

    if (!result.Item) return null;

    return this.toUserProfile(result.Item);
  }

  async create(user: UserProfile): Promise<UserProfile> {
    const client = getDocClient();
    const now = new Date().toISOString();

    const item = {
      PK: `USER#${user.id}`,
      SK: 'PROFILE',
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      paymentMethod: user.paymentMethod,
      preferences: user.preferences,
      createdAt: user.createdAt || now,
      updatedAt: now,
    };

    await client.send(
      new PutCommand({
        TableName: this.table,
        Item: item,
      })
    );

    return { ...user, createdAt: item.createdAt, updatedAt: item.updatedAt };
  }

  async update(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const client = getDocClient();
    const now = new Date().toISOString();

    // Build dynamic update expression
    const expressionParts: string[] = ['updatedAt = :now'];
    const expressionValues: Record<string, unknown> = { ':now': now };
    const expressionNames: Record<string, string> = {};

    const allowedFields = ['name', 'email', 'phone', 'address', 'paymentMethod', 'preferences'] as const;

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        const placeholder = `:${field}`;
        const nameAlias = `#${field}`;
        expressionParts.push(`${nameAlias} = ${placeholder}`);
        expressionValues[placeholder] = updates[field];
        expressionNames[nameAlias] = field;
      }
    }

    const result = await client.send(
      new UpdateCommand({
        TableName: this.table,
        Key: {
          PK: `USER#${userId}`,
          SK: 'PROFILE',
        },
        UpdateExpression: `SET ${expressionParts.join(', ')}`,
        ExpressionAttributeValues: expressionValues,
        ...(Object.keys(expressionNames).length > 0 && {
          ExpressionAttributeNames: expressionNames,
        }),
        ReturnValues: 'ALL_NEW',
      })
    );

    return this.toUserProfile(result.Attributes!);
  }

  private toUserProfile(item: Record<string, unknown>): UserProfile {
    return {
      id: item.userId as string,
      name: item.name as string,
      email: item.email as string | undefined,
      phone: item.phone as string | undefined,
      address: item.address as UserProfile['address'],
      paymentMethod: item.paymentMethod as UserProfile['paymentMethod'],
      preferences: item.preferences as UserProfile['preferences'],
      createdAt: item.createdAt as string,
      updatedAt: item.updatedAt as string,
    };
  }
}
