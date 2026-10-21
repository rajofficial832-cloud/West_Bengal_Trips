import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { cancelOrderRequest, fetchOrders, placeOrderRequest } from '@/api/orders';

export interface OrderItem {
  itineraryId: string;
  groupSize: number;
  travelDate: string;
  itemTotal: number;
}

export type OrderStatus = 'active' | 'cancelled';

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

interface OrdersContextValue {
  orders: Order[];
  isLoading: boolean;
  placeOrder: () => Promise<Order>;
  cancelOrder: (orderId: string) => Promise<void>;
}

const OrdersContext = createContext<OrdersContextValue | undefined>(undefined);

export function OrdersProvider({ userId, children }: { userId: string | null; children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setOrders([]);
      return;
    }
    setIsLoading(true);
    fetchOrders()
      .then(setOrders)
      .finally(() => setIsLoading(false));
  }, [userId]);

  const placeOrder = useCallback(async () => {
    if (!userId) {
      throw new Error('You must be logged in to place an order.');
    }
    const order = await placeOrderRequest();
    setOrders((current) => [order, ...current]);
    return order;
  }, [userId]);

  const cancelOrder = useCallback(async (orderId: string) => {
    const updated = await cancelOrderRequest(orderId);
    setOrders((current) => current.map((order) => (order.id === orderId ? updated : order)));
  }, []);

  const value = useMemo(
    () => ({ orders, isLoading, placeOrder, cancelOrder }),
    [orders, isLoading, placeOrder, cancelOrder]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders(): OrdersContextValue {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}
