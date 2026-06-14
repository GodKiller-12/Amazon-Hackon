import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

/**
 * Singleton DynamoDB Document Client.
 * Uses env vars: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
 * Falls back to local mode when DYNAMODB_ENDPOINT is set (for local development).
 */

let docClient: DynamoDBDocumentClient | null = null;

function createClient(): DynamoDBDocumentClient {
  const endpoint = process.env.DYNAMODB_ENDPOINT;
  const region = process.env.AWS_REGION || 'us-east-1';

  const clientConfig: ConstructorParameters<typeof DynamoDBClient>[0] = {
    region,
  };

  if (endpoint) {
    clientConfig.endpoint = endpoint;
    // Local DynamoDB doesn't need real credentials
    clientConfig.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
    };
  }

  const baseClient = new DynamoDBClient(clientConfig);

  return DynamoDBDocumentClient.from(baseClient, {
    marshallOptions: {
      removeUndefinedValues: true,
      convertEmptyValues: false,
    },
    unmarshallOptions: {
      wrapNumbers: false,
    },
  });
}

export function getDocClient(): DynamoDBDocumentClient {
  if (!docClient) {
    docClient = createClient();
  }
  return docClient;
}

/**
 * Returns the full table name with the configured prefix.
 */
export function tableName(name: string): string {
  const prefix = process.env.DYNAMODB_TABLE_PREFIX || '';
  return `${prefix}${name}`;
}
