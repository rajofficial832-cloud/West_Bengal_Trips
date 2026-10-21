// Source of truth for itinerary data now lives in the backend (seeded via App/backend/src/seed).
export interface Itinerary {
  id: string;
  title: string;
  location: string;
  durationDays: number;
  basePricePerPerson: number;
  image: string;
  description: string;
  highlights: string[];
}
