import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'admin_auth_token';

export class AdminApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getBaseUrl(): string {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error('EXPO_PUBLIC_API_URL is not set. Add it to App/.env.');
  }
  return baseUrl;
}

export async function getAdminToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setAdminToken(token: string | null): Promise<void> {
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
}

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setAdminUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

interface AdminApiFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
}

export async function adminApiFetch<T>(path: string, options: AdminApiFetchOptions = {}): Promise<T> {
  const token = await getAdminToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && token) {
      unauthorizedHandler?.();
    }
    const message = (data && typeof data === 'object' && 'message' in data && (data as { message?: string }).message)
      || 'Something went wrong. Please try again.';
    throw new AdminApiError(message, response.status);
  }

  return data as T;
}
