'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

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

  useEffect(() => {
    const authMode = process.env.NEXT_PUBLIC_AUTH_MODE;
    if (authMode === 'local' && !isAuthenticated) {
      login(DEMO_TOKEN, DEMO_USER);
    }
  }, [isAuthenticated, login]);

  return <>{children}</>;
}
