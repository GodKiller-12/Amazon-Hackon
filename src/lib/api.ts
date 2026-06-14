import { useAuthStore } from '@/stores/authStore';

const API_BASE = '';

interface ApiError extends Error {
  details?: unknown;
  code?: string;
}

function makeApiError(data: { error?: { message?: string; details?: unknown; code?: string } }): ApiError {
  const err = new Error(data.error?.message || 'API error') as ApiError;
  err.details = data.error?.details;
  err.code = data.error?.code;
  return err;
}

async function fetchWithAuth(path: string, method: string, body?: unknown): Promise<Response> {
  const authStore = useAuthStore.getState();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authStore.token) {
    headers['Authorization'] = `Bearer ${authStore.token}`;
  }

  return fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function tryRefreshToken(): Promise<boolean> {
  const authStore = useAuthStore.getState();
  if (!authStore.refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: authStore.refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    if (data.success && data.data?.accessToken) {
      useAuthStore.getState().setTokens(
        data.data.accessToken,
        data.data.refreshToken || authStore.refreshToken!
      );
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetchWithAuth(path, 'POST', body);

  if (res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const retryRes = await fetchWithAuth(path, 'POST', body);
      const retryData = await retryRes.json();
      if (!retryData.success) throw makeApiError(retryData);
      return retryData.data as T;
    }
    // Refresh failed — logout
    useAuthStore.getState().logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Session expired');
  }

  const data = await res.json();
  if (!data.success) throw makeApiError(data);
  return data.data as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetchWithAuth(path, 'GET');

  if (res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const retryRes = await fetchWithAuth(path, 'GET');
      const retryData = await retryRes.json();
      if (!retryData.success) throw makeApiError(retryData);
      return retryData.data as T;
    }
    // Refresh failed — logout
    useAuthStore.getState().logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Session expired');
  }

  const data = await res.json();
  if (!data.success) throw makeApiError(data);
  return data.data as T;
}
