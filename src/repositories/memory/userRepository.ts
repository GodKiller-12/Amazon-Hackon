import { IUserRepository } from '../interfaces';
import { UserProfile } from '@/types/user';

/**
 * Default mock user data for development.
 */
const DEFAULT_USER: UserProfile = {
  id: 'default-user',
  name: 'Rahul Sharma',
  email: 'rahul@example.com',
  phone: '+91-9876543210',
  address: {
    label: 'Home',
    street: '42, Koramangala 4th Block',
    city: 'Bengaluru',
    pincode: '560034',
  },
  paymentMethod: {
    type: 'upi',
    label: 'UPI',
    details: 'rahul@ybl',
  },
  preferences: {
    dietary: ['vegetarian'],
    householdSize: 3,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * In-memory user repository with mock data.
 * Used when DynamoDB is not configured.
 */
export class InMemoryUserRepository implements IUserRepository {
  private users = new Map<string, UserProfile>();

  constructor() {
    // Seed with default user
    this.users.set(DEFAULT_USER.id, DEFAULT_USER);
  }

  async getById(userId: string): Promise<UserProfile | null> {
    return this.users.get(userId) || null;
  }

  async create(user: UserProfile): Promise<UserProfile> {
    const now = new Date().toISOString();
    const created = {
      ...user,
      createdAt: user.createdAt || now,
      updatedAt: now,
    };
    this.users.set(user.id, created);
    return created;
  }

  async update(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const existing = this.users.get(userId);
    if (!existing) {
      throw new Error(`User ${userId} not found`);
    }
    const updated: UserProfile = {
      ...existing,
      ...updates,
      id: existing.id, // Don't allow ID change
      updatedAt: new Date().toISOString(),
    };
    this.users.set(userId, updated);
    return updated;
  }
}
