import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { clearCartRequest, fetchCart, removeCartEntry, updateCartEntryGroupSize, upsertCartEntry } from '@/api/cart';
import { useAuth } from '@/context/AuthContext';
import { useItineraries } from '@/context/ItinerariesContext';

export interface CartEntry {
  itineraryId: string;
  groupSize: number;
  travelDate: string;
}

interface CartContextValue {
  entries: CartEntry[];
  error: string | null;
  addToCart: (itineraryId: string, groupSize: number, travelDate: string) => Promise<void>;
  removeFromCart: (itineraryId: string) => Promise<void>;
  updateGroupSize: (itineraryId: string, groupSize: number) => Promise<void>;
  getEntryTotal: (entry: CartEntry) => number;
  grandTotal: number;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { getItineraryById } = useItineraries();
  const [entries, setEntries] = useState<CartEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      return;
    }
    setError(null);
    fetchCart()
      .then(setEntries)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load your cart.'));
  }, [user]);

  const addToCart = useCallback(async (itineraryId: string, groupSize: number, travelDate: string) => {
    const entry = await upsertCartEntry(itineraryId, groupSize, travelDate);
    setEntries((current) => {
      const existing = current.find((item) => item.itineraryId === itineraryId);
      if (existing) {
        return current.map((item) => (item.itineraryId === itineraryId ? entry : item));
      }
      return [...current, entry];
    });
  }, []);

  const removeFromCart = useCallback(async (itineraryId: string) => {
    await removeCartEntry(itineraryId);
    setEntries((current) => current.filter((entry) => entry.itineraryId !== itineraryId));
  }, []);

  const clearCart = useCallback(async () => {
    await clearCartRequest();
    setEntries([]);
  }, []);

  const updateGroupSize = useCallback(async (itineraryId: string, groupSize: number) => {
    const entry = await updateCartEntryGroupSize(itineraryId, groupSize);
    setEntries((current) => current.map((item) => (item.itineraryId === itineraryId ? entry : item)));
  }, []);

  const getEntryTotal = useCallback(
    (entry: CartEntry) => {
      const itinerary = getItineraryById(entry.itineraryId);
      return itinerary ? itinerary.basePricePerPerson * entry.groupSize : 0;
    },
    [getItineraryById]
  );

  const grandTotal = useMemo(
    () => entries.reduce((sum, entry) => sum + getEntryTotal(entry), 0),
    [entries, getEntryTotal]
  );

  const value = useMemo(
    () => ({ entries, error, addToCart, removeFromCart, updateGroupSize, getEntryTotal, grandTotal, clearCart }),
    [entries, error, addToCart, removeFromCart, updateGroupSize, getEntryTotal, grandTotal, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
