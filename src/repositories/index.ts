import { IOrderRepository, IConversationRepository, IUserRepository, ISavedCartRepository, IPaymentRepository } from './interfaces';
import { DynamoOrderRepository } from './dynamo/orderRepository';
import { DynamoConversationRepository } from './dynamo/conversationRepository';
import { DynamoUserRepository } from './dynamo/userRepository';
import { DynamoSavedCartRepository } from './dynamo/savedCartRepository';
import { DynamoPaymentRepository } from './dynamo/paymentRepository';
import { InMemoryOrderRepository } from './memory/orderRepository';
import { InMemoryConversationRepository } from './memory/conversationRepository';
import { InMemoryUserRepository } from './memory/userRepository';
import { InMemorySavedCartRepository } from './memory/savedCartRepository';
import { InMemoryPaymentRepository } from './memory/paymentRepository';

// Re-export interfaces for convenience
export type { IOrderRepository, IConversationRepository, IUserRepository, ISavedCartRepository, IPaymentRepository };
export type { PaymentRecord } from './interfaces';

function useDynamoDB(): boolean {
  return process.env.USE_DYNAMODB === 'true';
}

// Singleton instances (one per process lifetime)
let orderRepo: IOrderRepository | null = null;
let conversationRepo: IConversationRepository | null = null;
let userRepo: IUserRepository | null = null;
let savedCartRepo: ISavedCartRepository | null = null;
let paymentRepo: IPaymentRepository | null = null;

export function getOrderRepository(): IOrderRepository {
  if (!orderRepo) {
    orderRepo = useDynamoDB()
      ? new DynamoOrderRepository()
      : new InMemoryOrderRepository();
  }
  return orderRepo;
}

export function getConversationRepository(): IConversationRepository {
  if (!conversationRepo) {
    conversationRepo = useDynamoDB()
      ? new DynamoConversationRepository()
      : new InMemoryConversationRepository();
  }
  return conversationRepo;
}

export function getUserRepository(): IUserRepository {
  if (!userRepo) {
    userRepo = useDynamoDB()
      ? new DynamoUserRepository()
      : new InMemoryUserRepository();
  }
  return userRepo;
}

export function getSavedCartRepository(): ISavedCartRepository {
  if (!savedCartRepo) {
    savedCartRepo = useDynamoDB()
      ? new DynamoSavedCartRepository()
      : new InMemorySavedCartRepository();
  }
  return savedCartRepo;
}

export function getPaymentRepository(): IPaymentRepository {
  if (!paymentRepo) {
    paymentRepo = useDynamoDB()
      ? new DynamoPaymentRepository()
      : new InMemoryPaymentRepository();
  }
  return paymentRepo;
}
