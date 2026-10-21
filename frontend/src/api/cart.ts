import { apiFetch } from '@/api/client';
import type { CartEntry } from '@/context/CartContext';

export function fetchCart(): Promise<CartEntry[]> {
  return apiFetch<CartEntry[]>('/cart');
}

export function upsertCartEntry(itineraryId: string, groupSize: number, travelDate: string): Promise<CartEntry> {
  return apiFetch<CartEntry>('/cart', { method: 'POST', body: { itineraryId, groupSize, travelDate } });
}

export function updateCartEntryGroupSize(itineraryId: string, groupSize: number): Promise<CartEntry> {
  return apiFetch<CartEntry>(`/cart/${itineraryId}`, { method: 'PATCH', body: { groupSize } });
}

export function removeCartEntry(itineraryId: string): Promise<void> {
  return apiFetch<void>(`/cart/${itineraryId}`, { method: 'DELETE' });
}

export function clearCartRequest(): Promise<void> {
  return apiFetch<void>('/cart', { method: 'DELETE' });
}
