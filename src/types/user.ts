/**
 * Represents a user profile in the system.
 */
export interface UserProfile {
  /** Unique user identifier */
  id: string;
  /** Display name */
  name: string;
  /** Email address */
  email?: string;
  /** Phone number */
  phone?: string;
  /** Delivery address */
  address: {
    label: string;
    street: string;
    city: string;
    pincode: string;
  };
  /** Preferred payment method */
  paymentMethod: {
    type: string;
    label: string;
    details: string;
  };
  /** User preferences */
  preferences: {
    dietary: string[];
    householdSize: number;
  };
  /** ISO 8601 creation timestamp */
  createdAt: string;
  /** ISO 8601 last update timestamp */
  updatedAt: string;
}

/**
 * Represents a saved cart snapshot.
 */
export interface SavedCart {
  /** Unique cart identifier */
  cartId: string;
  /** Owner user ID */
  userId: string;
  /** Items in the saved cart */
  items: import('./cart').CartItem[];
  /** Situation label describing what the cart was for */
  situationLabel: string;
  /** Total price in INR */
  total: number;
  /** ISO 8601 creation timestamp */
  createdAt: string;
}
