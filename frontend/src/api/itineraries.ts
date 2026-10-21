import { apiFetch } from '@/api/client';
import type { Itinerary } from '@/data/itineraries';

export function fetchItineraries(): Promise<Itinerary[]> {
  return apiFetch<Itinerary[]>('/itineraries');
}
