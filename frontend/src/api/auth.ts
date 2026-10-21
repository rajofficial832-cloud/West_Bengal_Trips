import { apiFetch } from '@/api/client';
import type { AuthUser } from '@/context/AuthContext';

interface AuthResponse {
  token: string;
  user: AuthUser;
}

export function signupRequest(name: string, email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/signup', { method: 'POST', body: { name, email, password } });
}

export function loginRequest(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } });
}

export function resetPasswordRequest(email: string, newPassword: string): Promise<{ message: string }> {
  return apiFetch('/auth/reset-password', { method: 'POST', body: { email, newPassword } });
}
