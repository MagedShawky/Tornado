
import { format, addDays, subDays } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type Boat = Database["public"]["Tables"]["boats"]["Row"];
type Trip = Database["public"]["Tables"]["trips"]["Row"];

/**
 * Gets booked boats (boats in allBoats but not in availableBoats)
 */
export const getBookedBoats = (allBoats: Boat[] | undefined, availableBoats: Boat[] | undefined): Boat[] => {
  if (!allBoats || !availableBoats) return [];
  
  const availableBoatIds = new Set(availableBoats.map(boat => boat.id));
  return allBoats.filter(boat => !availableBoatIds.has(boat.id));
};

/**
 * Gets booked boats with their overlapping trips
 */
export const getBookedBoatsWithTrips = (bookedBoats: Boat[], overlappingTrips: Trip[] | undefined): { boat: Boat, trips: Trip[] }[] => {
  return bookedBoats.map(boat => {
    const trips = overlappingTrips?.filter(trip => trip.boat_id === boat.id) || [];
    return { boat, trips };
  });
};

/**
 * Sorts trips chronologically for a boat
 */
export const getSortedTrips = (boatId: string, tripsByBoat: Record<string, Trip[]> = {}): Trip[] => {
  const trips = tripsByBoat[boatId] || [];
  return [...trips].sort((a, b) => 
    new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );
};

/**
 * Checks if a trip would conflict with potential buffer days
 */
export const wouldTripConflictWithBuffers = (trip: Trip, startDate?: Date, endDate?: Date): boolean => {
  if (!startDate || !endDate) return false;
  
  // Add buffer days to our selected range
  const bufferStartDate = subDays(startDate, 1).toISOString().split('T')[0];
  const bufferEndDate = addDays(endDate, 1).toISOString().split('T')[0];
  
  // Check for overlap with buffer days
  const tripStartsInBufferRange = trip.start_date >= bufferStartDate && trip.start_date <= bufferEndDate;
  const tripEndsInBufferRange = trip.end_date >= bufferStartDate && trip.end_date <= bufferEndDate;
  const tripSpansBufferRange = trip.start_date <= bufferStartDate && trip.end_date >= bufferEndDate;
  
  return tripStartsInBufferRange || tripEndsInBufferRange || tripSpansBufferRange;
};

/**
 * Determines if a trip directly conflicts with a date range
 */
export const isDirectConflict = (trip: Trip, startDate?: Date, endDate?: Date): boolean => {
  if (!startDate || !endDate) return false;
  
  const tripStart = new Date(trip.start_date);
  const tripEnd = new Date(trip.end_date);
  
  return (
    (tripStart >= startDate && tripStart <= endDate) ||
    (tripEnd >= startDate && tripEnd <= endDate) ||
    (tripStart <= startDate && tripEnd >= endDate)
  );
};
