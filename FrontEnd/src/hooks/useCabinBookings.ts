
import { useQuery } from "@tanstack/react-query";
import { CabinBooking } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export function useCabinBookings(tripId: string | undefined) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userGroups, setUserGroups] = useState<string[]>([]);
  const [isUserDataReady, setIsUserDataReady] = useState(false);
  
  useEffect(() => {
    const getUserRoleAndGroups = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("role, agent_groups")
            .eq("id", user.id)
            .single();
          
          if (data) {
            setUserRole(data.role);
            setUserGroups(data.agent_groups || []);
            console.log("useCabinBookings - User role and groups loaded:", data.role, data.agent_groups);
            setIsUserDataReady(true);
          } else {
            setIsUserDataReady(true);
          }
        } else {
          setIsUserDataReady(true);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setIsUserDataReady(true);
      }
    };

    getUserRoleAndGroups();
  }, []);

  return useQuery({
    queryKey: ["cabin-bookings", tripId, userRole, userGroups],
    queryFn: async () => {
      if (!tripId) {
        throw new Error("No trip ID provided");
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No authenticated user found");
      }

      let query = supabase
        .from("cabin_bookings")
        .select("*, cabin:cabin_id(*)")
        .eq("trip_id", tripId);

      // The RLS policies will handle the filtering based on user_id and role
      
      const { data, error } = await query;

      if (error) {
        console.error("Error fetching bookings:", error);
        throw error;
      }
      
      console.log("useCabinBookings - Bookings data after filtering:", data?.length || 0, "bookings found");
      return data as CabinBooking[];
    },
    enabled: !!tripId && isUserDataReady,
  });
}
