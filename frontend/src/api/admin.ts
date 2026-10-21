import { adminApiFetch } from '@/api/adminClient';
import type { Itinerary } from '@/data/itineraries';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminOrderItem {
  itineraryId: string;
  groupSize: number;
  travelDate: string;
  itemTotal: number;
}

export interface AdminOrder {
  id: string;
  userId: { id: string; name: string; email: string } | null;
  items: AdminOrderItem[];
  total: number;
  status: 'active' | 'cancelled';
  createdAt: string;
}

export interface AnalyticsSummary {
  totals: { totalUsers: number; totalItineraries: number; totalOrders: number; totalRevenue: number };
  breakdown: {
    active: { count: number; revenue: number };
    cancelled: { count: number; revenue: number };
  };
  topItineraries: { itineraryId: string; title: string; bookings: number; revenue: number }[];
  timeSeries: { month: string; orders: number; revenue: number }[];
}

export interface AdminAuthResponse {
  token: string;
  admin: { id: string; name: string; email: string };
}

export function adminLoginRequest(email: string, password: string): Promise<AdminAuthResponse> {
  return adminApiFetch<AdminAuthResponse>('/admin/auth/login', { method: 'POST', body: { email, password } });
}

export function fetchAdminUsers(): Promise<AdminUser[]> {
  return adminApiFetch<AdminUser[]>('/admin/users');
}

export function setUserActiveRequest(userId: string, isActive: boolean): Promise<AdminUser> {
  return adminApiFetch<AdminUser>(`/admin/users/${userId}/active`, { method: 'PATCH', body: { isActive } });
}

export function deleteUserRequest(userId: string): Promise<void> {
  return adminApiFetch<void>(`/admin/users/${userId}`, { method: 'DELETE' });
}

export interface ItineraryInput {
  title: string;
  location: string;
  durationDays: number;
  basePricePerPerson: number;
  image: string;
  description: string;
  highlights: string[];
}

export function createItineraryRequest(input: ItineraryInput): Promise<Itinerary> {
  return adminApiFetch<Itinerary>('/admin/itineraries', { method: 'POST', body: input });
}

export function updateItineraryRequest(id: string, input: Partial<ItineraryInput>): Promise<Itinerary> {
  return adminApiFetch<Itinerary>(`/admin/itineraries/${id}`, { method: 'PUT', body: input });
}

export function deleteItineraryRequest(id: string): Promise<void> {
  return adminApiFetch<void>(`/admin/itineraries/${id}`, { method: 'DELETE' });
}

export function fetchAdminOrders(status?: 'active' | 'cancelled'): Promise<AdminOrder[]> {
  const query = status ? `?status=${status}` : '';
  return adminApiFetch<AdminOrder[]>(`/admin/orders${query}`);
}

export function adminCancelOrderRequest(orderId: string): Promise<AdminOrder> {
  return adminApiFetch<AdminOrder>(`/admin/orders/${orderId}/cancel`, { method: 'PATCH' });
}

export function fetchAnalytics(): Promise<AnalyticsSummary> {
  return adminApiFetch<AnalyticsSummary>('/admin/analytics');
}
