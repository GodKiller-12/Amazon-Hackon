import { CartItem } from '@/types';
import { UserContext } from './context.types';

export interface GenerateCartResult {
  items: CartItem[];
  situationLabel: string;
  reply: string;
  cartName: string;       // e.g., "Guest Essentials Kit"
  reasoning: string;      // e.g., "Prepared for 6 guests arriving in 30 minutes"
  categories: string[];   // e.g., ["Snacks", "Cold Drinks", "Disposable Items"]
  estimatedCost: number;  // Total in INR
  estimatedDelivery: number; // Minutes
}

export interface CartDiff {
  add: CartItem[];
  remove: string[];
  update: { id: string; qty: number }[];
}

export interface ModifyCartResult {
  reply: string;
  cartDiff: CartDiff;
}

export interface AIProvider {
  generateCart(situation: string, preferences?: { dietary: string[]; householdSize: number }, context?: UserContext): Promise<GenerateCartResult>;
  modifyCart(currentCart: CartItem[], message: string, context?: UserContext): Promise<ModifyCartResult>;
}
