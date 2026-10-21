import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { fetchItineraries } from '@/api/itineraries';
import type { Itinerary } from '@/data/itineraries';

interface ItinerariesContextValue {
  itineraries: Itinerary[];
  isLoading: boolean;
  error: string | null;
  getItineraryById: (id: string) => Itinerary | undefined;
  refetch: () => void;
}

const ItinerariesContext = createContext<ItinerariesContextValue | undefined>(undefined);

export function ItinerariesProvider({ children }: { children: React.ReactNode }) {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);
    fetchItineraries()
      .then(setItineraries)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load trips.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const getItineraryById = useCallback(
    (id: string) => itineraries.find((item) => item.id === id),
    [itineraries]
  );

  const value = useMemo(
    () => ({ itineraries, isLoading, error, getItineraryById, refetch: load }),
    [itineraries, isLoading, error, getItineraryById, load]
  );

  return <ItinerariesContext.Provider value={value}>{children}</ItinerariesContext.Provider>;
}

export function useItineraries(): ItinerariesContextValue {
  const context = useContext(ItinerariesContext);
  if (!context) {
    throw new Error('useItineraries must be used within an ItinerariesProvider');
  }
  return context;
}
