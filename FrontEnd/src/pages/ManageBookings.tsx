import { useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from "@/components/booking/LoadingState";
import { ErrorMessage } from "@/components/booking/ErrorMessage";
import { NotFoundMessage } from "@/components/booking/NotFoundMessage";
import { TripSummary } from "@/components/manage-bookings/TripSummary";
import { ManageBookingsTabs } from "@/components/manage-bookings/ManageBookingsTabs";
import { useEffect, useState } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function ManageBookings() {
  const { tripId } = useParams<{ tripId: string }>();
  const location = useLocation();
  const { session } = useAuthState();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRoleChecked, setIsRoleChecked] = useState(false);
  const navigate = useNavigate();
  
  // Extract initial status filter from query params if present, default to all_statuses
  const searchParams = new URLSearchParams(location.search);
  const initialStatus = searchParams.get('status') || "all_statuses";

  // Check user role to determine filtering strategy
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        if (!session?.user) {
          console.log("No authenticated user found");
          setIsRoleChecked(true);
          return;
        }
        
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        
        if (error) {
          console.error("Error fetching user profile:", error);
          toast.error("Failed to verify user role");
          setIsRoleChecked(true);
          return;
        }
        
        console.log("User role detected:", profile?.role);
        setUserRole(profile?.role);
        setIsRoleChecked(true);
      } catch (error) {
        console.error("Error checking user role:", error);
        setIsRoleChecked(true);
      }
    };
    
    checkUserRole();
  }, [navigate, session]);

  const { data: tripData, isLoading: tripLoading, error: tripError } = useQuery({
    queryKey: ["trip-manage", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select(`
          *,
          boat:boat_id(
            id,
            name,
            feature_photo,
            capacity
          )
        `)
        .eq("id", tripId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!tripId,
  });

  const { data: cabinBookings, isLoading: bookingsLoading, error: bookingsError } = useQuery({
    queryKey: ["cabin-bookings-manage", tripId, userRole, session?.user?.id],
    queryFn: async () => {
      if (!tripId) {
        throw new Error("No trip ID provided");
      }
      
      console.log(`Fetching bookings for trip ${tripId} as ${userRole || "unknown role"}`);
      
      let query = supabase
        .from("cabin_bookings")
        .select(`
          *,
          cabin:cabin_id(*)
        `)
        .eq("trip_id", tripId);

      // If user is an agent, only show their bookings
      if (userRole === "agent" && session?.user?.id) {
        console.log("Filtering bookings by user ID:", session.user.id);
        query = query.eq("user_id", session.user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching bookings:", error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} bookings for this trip`);
      return data;
    },
    enabled: !!tripId && isRoleChecked,
  });

  const { data: clientDetailsData, isLoading: clientDetailsLoading } = useQuery({
    queryKey: ["client-details", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_client_details", { trip_id_param: tripId })
        .select("*");

      if (error) {
        console.error("Error fetching client details:", error);
        return [];
      }
      return data || [];
    },
    enabled: !!tripId,
  });

  const { data: clientInfoData, isLoading: clientInfoLoading } = useQuery({
    queryKey: ["client-info", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_client_info", { trip_id_param: tripId })
        .select("*");

      if (error) {
        console.error("Error fetching client info:", error);
        return [];
      }
      return data || [];
    },
    enabled: !!tripId,
  });

  const { data: travelInfoData, isLoading: travelInfoLoading } = useQuery({
    queryKey: ["travel-info", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_travel_info", { trip_id_param: tripId })
        .select("*");

      if (error) {
        console.error("Error fetching travel info:", error);
        return [];
      }
      return data || [];
    },
    enabled: !!tripId,
  });

  const { data: tourismServicesData, isLoading: tourismServicesLoading } = useQuery({
    queryKey: ["tourism-services", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_tourism_services", { trip_id_param: tripId })
        .select("*");

      if (error) {
        console.error("Error fetching tourism services:", error);
        return [];
      }
      return data || [];
    },
    enabled: !!tripId,
  });

  const { data: rentalsData, isLoading: rentalsLoading } = useQuery({
    queryKey: ["rentals", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_rentals", { trip_id_param: tripId })
        .select("*");

      if (error) {
        console.error("Error fetching rentals:", error);
        return [];
      }
      return data || [];
    },
    enabled: !!tripId,
  });

  if (tripLoading || bookingsLoading || !isRoleChecked) {
    return <LoadingState />;
  }

  if (tripError || bookingsError) {
    return (
      <ErrorMessage 
        message="Error loading booking data" 
        detail={
          (tripError instanceof Error ? tripError.message : "") || 
          (bookingsError instanceof Error ? bookingsError.message : "")
        } 
      />
    );
  }

  if (!tripData) {
    return <NotFoundMessage>Trip not found</NotFoundMessage>;
  }

  return (
    <div className="container mx-auto py-8">
      <TripSummary trip={tripData} bookings={cabinBookings || []} />
      <ManageBookingsTabs 
        trip={tripData} 
        cabinBookings={cabinBookings || []} 
        clientDetails={clientDetailsData || []}
        clientInfo={clientInfoData || []}
        travelInfo={travelInfoData || []}
        tourismServices={tourismServicesData || []}
        rentals={rentalsData || []}
        initialStatus={initialStatus}
      />
    </div>
  );
}
