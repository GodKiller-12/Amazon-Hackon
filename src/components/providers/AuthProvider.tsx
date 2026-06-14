'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { apiGet } from '@/lib/api';

const DEMO_USER = {
  userId: 'demo-user',
  name: 'Priya Sharma',
  email: 'priya@example.com',
  phone: '+919876543210',
};

const DEMO_TOKEN = 'dev-token-demo-user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const authMode = process.env.NEXT_PUBLIC_AUTH_MODE;

    if (authMode === 'local' && !isAuthenticated) {
      // Auto-login in local/demo mode
      login(DEMO_TOKEN, DEMO_USER);
    } else if (authMode === 'cognito' && isAuthenticated && token) {
      // In cognito mode, validate the token on mount
      apiGet('/api/auth/me').catch(() => {
        // Token invalid or expired and refresh failed (handled by interceptor)
        logout();
      });
    }
  }, [isAuthenticated, login, token, logout]);

  return <>{children}</>;
}
