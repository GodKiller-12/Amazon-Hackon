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
  refreshToken: string | null;
  user: AuthUser | null;

  login: (token: string, user: AuthUser, refreshToken?: string) => void;
  logout: () => void;
  setUser: (user: AuthUser) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      user: null,

      login: (token, user, refreshToken) =>
        set({
          isAuthenticated: true,
          token,
          refreshToken: refreshToken || null,
          user,
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          token: null,
          refreshToken: null,
          user: null,
        }),

      setUser: (user) => set({ user }),

      setTokens: (accessToken, refreshToken) =>
        set({
          token: accessToken,
          refreshToken,
        }),
    }),
    {
      name: 'urgentcart-auth',
    }
  )
);
