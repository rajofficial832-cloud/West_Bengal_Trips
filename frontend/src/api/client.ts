import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';

export class ApiError extends Error {
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

export async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setAuthToken(token: string | null): Promise<void> {
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
}

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const token = await getAuthToken();
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
      // Only a session that *had* a token can "expire" — a plain login/signup 401 is just bad credentials.
      unauthorizedHandler?.();
    }
    const message = (data && typeof data === 'object' && 'message' in data && (data as { message?: string }).message)
      || 'Something went wrong. Please try again.';
    throw new ApiError(message, response.status);
  }

  return data as T;
}
