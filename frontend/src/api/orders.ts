import { apiFetch } from '@/api/client';
import type { Order } from '@/context/OrdersContext';

export function fetchOrders(): Promise<Order[]> {
  return apiFetch<Order[]>('/orders');
}

export function placeOrderRequest(): Promise<Order> {
  return apiFetch<Order>('/orders', { method: 'POST' });
}

export function cancelOrderRequest(orderId: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${orderId}/cancel`, { method: 'PATCH' });
}
