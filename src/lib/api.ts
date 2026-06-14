import { useAuthStore } from '@/stores/authStore';

const API_BASE = '';

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const authStore = useAuthStore.getState();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authStore.token) {
    headers['Authorization'] = `Bearer ${authStore.token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!data.success) {
    const err = new Error(data.error?.message || 'API error') as Error & {
      details?: unknown;
      code?: string;
    };
    err.details = data.error?.details;
    err.code = data.error?.code;
    throw err;
  }
  return data.data as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const authStore = useAuthStore.getState();
  const headers: Record<string, string> = {};
  if (authStore.token) {
    headers['Authorization'] = `Bearer ${authStore.token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers,
  });

  const data = await res.json();
  if (!data.success) {
    const err = new Error(data.error?.message || 'API error') as Error & {
      details?: unknown;
      code?: string;
    };
    err.details = data.error?.details;
    err.code = data.error?.code;
    throw err;
  }
  return data.data as T;
}
