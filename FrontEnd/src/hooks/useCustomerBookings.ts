
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define simplified flat types without circular references
type SimpleCabinDetails = {
  id: string;
  cabin_number: string;
  deck: string;
};

type SimpleBoatDetails = {
  id: string;
  name: string;
};

type SimpleTripDetails = {
  id: string;
  start_date: string;
  end_date: string;
  destination: string;
  boat: SimpleBoatDetails | null;
};

type CustomerBookingBase = {
  id: string;
  created_at: string;
  trip_id: string;
  cabin_id: string;
  bed_number: number;
  booked_at: string | null;
  price: number;
  status: string | null;
  passenger_gender: string | null;
  cancel_date: string | null;
};

type CustomerBooking = CustomerBookingBase & {
  cabin: SimpleCabinDetails | null;
  trip: SimpleTripDetails | null;
};

export function useCustomerBookings(userEmail: string | null) {
  return useQuery({
    queryKey: ["customer-bookings", userEmail],
    queryFn: async (): Promise<CustomerBooking[]> => {
      console.log("Starting customer bookings query with email:", userEmail);
      
      if (!userEmail) {
        console.log("No user email provided, returning empty array");
        return [];
      }
      
      // First, get booking IDs from booking_client_info based on email
      console.log("Querying booking_client_info with email:", userEmail);
      const { data: clientInfos, error: clientInfoError } = await supabase
        .from("booking_client_info")
        .select("booking_id")
        .eq("email", userEmail);
        
      if (clientInfoError) {
        console.error("Error fetching client info:", clientInfoError);
        throw clientInfoError;
      }
      
      console.log("Client infos result:", clientInfos);
      
      if (!clientInfos || clientInfos.length === 0) {
        console.log("No client info found for this email");
        return [];
      }
      
      // Extract booking IDs
      const bookingIds = clientInfos.map(info => info.booking_id);
      console.log("Found booking IDs:", bookingIds);
      
      // Get the actual bookings using these IDs
      console.log("Fetching cabin_bookings with booking IDs");
      const { data: bookingsRaw, error: bookingError } = await supabase
        .from("cabin_bookings")
        .select("id, created_at, trip_id, cabin_id, bed_number, booked_at, price, status, passenger_gender, cancel_date")
        .in("id", bookingIds);
        
      if (bookingError) {
        console.error("Error fetching bookings:", bookingError);
        throw bookingError;
      }
      
      console.log("Bookings raw data:", bookingsRaw);
      
      if (!bookingsRaw || bookingsRaw.length === 0) {
        console.log("No bookings found");
        return [];
      }
      
      // Type assert to avoid deep type inference
      const baseBookings = bookingsRaw as CustomerBookingBase[];
      
      // Initialize result array with base data
      const result: CustomerBooking[] = baseBookings.map(booking => ({
        ...booking,
        cabin: null,
        trip: null,
      }));
      
      // Create a lookup map for easier access
      const bookingMap: Record<string, CustomerBooking> = {};
      result.forEach(booking => {
        bookingMap[booking.id] = booking;
      });
      
      // Collect IDs for related data
      const cabinIds = baseBookings.map(b => b.cabin_id);
      const tripIds = baseBookings.map(b => b.trip_id);
      
      console.log("Fetching related cabin data");
      // Fetch cabin data if we have bookings
      if (cabinIds.length > 0) {
        const { data: cabinsRaw } = await supabase
          .from("cabins")
          .select("id, cabin_number, deck")
          .in("id", cabinIds);
          
        console.log("Cabins data:", cabinsRaw);
          
        if (cabinsRaw && cabinsRaw.length > 0) {
          // Process cabin data with type assertion
          const cabins = cabinsRaw as SimpleCabinDetails[];
          
          // Create a lookup map
          const cabinMap: Record<string, SimpleCabinDetails> = {};
          cabins.forEach(cabin => {
            cabinMap[cabin.id] = cabin;
          });
          
          // Assign cabin data to bookings
          result.forEach(booking => {
            const cabin = cabinMap[booking.cabin_id];
            if (cabin) {
              booking.cabin = cabin;
            }
          });
        }
      }
      
      console.log("Fetching related trip data");
      // Fetch trip and boat data
      if (tripIds.length > 0) {
        const { data: tripsRaw } = await supabase
          .from("trips")
          .select("id, start_date, end_date, destination, boat_id")
          .in("id", tripIds);
          
        console.log("Trips data:", tripsRaw);
          
        if (tripsRaw && tripsRaw.length > 0) {
          // Get boat IDs
          const boatIds = tripsRaw.map(t => t.boat_id).filter(Boolean);
          
          // Fetch boat data
          let boats: SimpleBoatDetails[] = [];
          if (boatIds.length > 0) {
            console.log("Fetching boat data");
            const { data: boatsRaw } = await supabase
              .from("boats")
              .select("id, name")
              .in("id", boatIds);
              
            console.log("Boats data:", boatsRaw);
              
            if (boatsRaw && boatsRaw.length > 0) {
              boats = boatsRaw as SimpleBoatDetails[];
            }
          }
          
          // Create boat lookup map
          const boatMap: Record<string, SimpleBoatDetails> = {};
          boats.forEach(boat => {
            boatMap[boat.id] = boat;
          });
          
          // Create trip objects with boat info
          const tripMap: Record<string, SimpleTripDetails> = {};
          tripsRaw.forEach(trip => {
            tripMap[trip.id] = {
              id: trip.id,
              start_date: trip.start_date,
              end_date: trip.end_date,
              destination: trip.destination,
              boat: trip.boat_id ? boatMap[trip.boat_id] || null : null
            };
          });
          
          // Assign trip data to bookings
          result.forEach(booking => {
            const trip = tripMap[booking.trip_id];
            if (trip) {
              booking.trip = trip;
            }
          });
        }
      }
      
      console.log("Final bookings result:", result);
      return result;
    },
    enabled: !!userEmail,
  });
}
