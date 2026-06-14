import { create } from 'zustand';

interface Address {
  label: string;
  street: string;
  city: string;
  pincode: string;
}

interface PaymentMethod {
  type: string;
  label: string;
  details: string;
}

interface Preferences {
  dietary: string[];
  householdSize: number;
}

interface UserStore {
  name: string;
  address: Address;
  paymentMethod: PaymentMethod;
  preferences: Preferences;
  location: { lat: number; lng: number } | null;
  locationLabel: string;
  setLocation: (lat: number, lng: number, label: string) => void;
  updatePreferences: (dietary: string[], householdSize: number) => void;
  updateAddress: (address: Address) => void;
  updatePaymentMethod: (paymentMethod: PaymentMethod) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  name: 'Priya Sharma',
  address: {
    label: 'Home',
    street: '42 MG Road, Koramangala',
    city: 'Bangalore',
    pincode: '560034',
  },
  paymentMethod: {
    type: 'upi',
    label: 'UPI',
    details: 'priya@paytm',
  },
  preferences: {
    dietary: [],
    householdSize: 2,
  },
  location: null,
  locationLabel: '',

  setLocation: (lat, lng, label) =>
    set({ location: { lat, lng }, locationLabel: label }),

  updatePreferences: (dietary, householdSize) =>
    set({ preferences: { dietary, householdSize } }),

  updateAddress: (address) => set({ address }),

  updatePaymentMethod: (paymentMethod) => set({ paymentMethod }),
}));
