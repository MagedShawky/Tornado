
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { format, addDays, subDays } from "date-fns";

type Boat = Database["public"]["Tables"]["boats"]["Row"];
type Trip = Database["public"]["Tables"]["trips"]["Row"];

export type TripFormData = {
  boat_id: string;
  destination: string;
  price: number;
  discount: number;
  location_from: string;
  location_to: string;
};

interface UseTripFormProps {
  initialData?: any;
}

export function useTripForm({ initialData }: UseTripFormProps = {}) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const queryClient = useQueryClient();

  const form = useForm<TripFormData>({
    defaultValues: {
      destination: initialData?.destination || "",
      price: initialData?.price || 0,
      discount: initialData?.discount || 0,
      location_from: initialData?.location_from || "",
      location_to: initialData?.location_to || "",
      boat_id: initialData?.boat_id || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      setStartDate(new Date(initialData.start_date));
      setEndDate(new Date(initialData.end_date));
      
      // Update form values with initial data
      form.reset({
        destination: initialData.destination || "",
        price: initialData.price || 0,
        discount: initialData.discount || 0,
        location_from: initialData.location_from || "",
        location_to: initialData.location_to || "",
        boat_id: initialData.boat_id || "",
      });
    }
  }, [initialData, form]);

  // Query to get all active boats
  const { data: allBoats, isLoading: boatsLoading } = useQuery({
    queryKey: ["all-boats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("boats")
        .select("*")
        .eq("status", "active");

      if (error) {
        console.error("Error fetching boats:", error);
        throw error;
      }

      console.log("All active boats:", data?.length || 0);
      return data || [];
    },
  });

  // Query to get all trips regardless of date
  const { data: allTrips, isLoading: allTripsLoading } = useQuery({
    queryKey: ["all-trips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("*");

      if (error) {
        console.error("Error fetching all trips:", error);
        throw error;
      }

      console.log("All trips fetched:", data?.length || 0);
      return data || [];
    },
  });

  // Function to refresh data when needed
  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["all-boats"] });
    queryClient.invalidateQueries({ queryKey: ["all-trips"] });
  }, [queryClient]);

  // Get overlapping trips based on the selected date range plus buffer days
  const overlappingTrips = (() => {
    if (!startDate || !endDate || !allTrips) {
      return [];
    }

    // Add buffer day to our query by extending the effective date range
    // This extends the "conflict" window by one day on each side
    const bufferStartDate = subDays(startDate, 1);
    const bufferEndDate = addDays(endDate, 1);
    
    const formattedBufferStartDate = bufferStartDate.toISOString().split('T')[0];
    const formattedBufferEndDate = bufferEndDate.toISOString().split('T')[0];

    // A trip overlaps if it has any days in common with our selected date range including buffer
    return allTrips.filter(trip => {
      // Exclude current trip if editing
      if (initialData?.id && trip.id === initialData.id) {
        return false;
      }

      // Check for overlap:
      // 1. Trip starts during our period (including buffer)
      // 2. Trip ends during our period (including buffer)
      // 3. Trip completely spans our period
      const tripStartsInRange = trip.start_date >= formattedBufferStartDate && trip.start_date <= formattedBufferEndDate;
      const tripEndsInRange = trip.end_date >= formattedBufferStartDate && trip.end_date <= formattedBufferEndDate;
      const tripSpansRange = trip.start_date <= formattedBufferStartDate && trip.end_date >= formattedBufferEndDate;

      return tripStartsInRange || tripEndsInRange || tripSpansRange;
    });
  })();

  // Group trips by boat_id to create a timeline
  const tripsByBoat = (() => {
    if (!allTrips) return {};
    
    return allTrips.reduce((acc: Record<string, Trip[]>, trip) => {
      if (!acc[trip.boat_id]) {
        acc[trip.boat_id] = [];
      }
      acc[trip.boat_id].push(trip);
      return acc;
    }, {});
  })();

  // Determine available boats based only on status and scheduling conflicts
  const availableBoats = (() => {
    if (!startDate || !endDate || !allBoats) {
      return [];
    }

    // Get set of boat IDs that have overlapping trips
    const bookedBoatIds = new Set(overlappingTrips.map(trip => trip.boat_id));
    
    // Filter out booked boats
    const available = allBoats.filter(boat => !bookedBoatIds.has(boat.id));
    
    console.log(`Found ${available.length} available boats out of ${allBoats.length} total active boats`);
    return available;
  })();

  const isLoading = boatsLoading || allTripsLoading;

  return {
    form,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    availableBoats,
    isLoading,
    allBoats,
    overlappingTrips,
    tripsByBoat,
    allTrips,
    refreshData
  };
}
