'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  userId: string;
  name: string;
  email?: string;
  phone?: string;
}

interface AuthStore {
  isAuthenticated: boolean;
  token: string | null;
  user: AuthUser | null;

  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  setUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      user: null,

      login: (token, user) =>
        set({
          isAuthenticated: true,
          token,
          user,
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          token: null,
          user: null,
        }),

      setUser: (user) => set({ user }),
    }),
    {
      name: 'urgentcart-auth',
    }
  )
);
