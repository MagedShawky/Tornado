
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookingList } from "@/components/booking/BookingList";
import { LoadingState } from "@/components/booking/LoadingState";
import { ErrorMessage } from "@/components/booking/ErrorMessage";
import { BookingFilters } from "@/components/manage-bookings/BookingFilters";
import { toast } from "sonner";

type CabinBookingWithRelations = {
  id: string;
  status: string;
  group_name: string;
  cabin_id: string;
  trip_id: string;
  cabin: Record<string, any> | null;
  trip: {
    id: string;
    boat: { name: string } | null;
    [key: string]: any;
  } | null;
  [key: string]: any;
};

export default function ConfirmedBookings() {
  const [filters, setFilters] = useState({ status: "confirmed", groupName: "" });
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
            console.log("User role and groups loaded:", data.role, data.agent_groups);
          }
        }
        setIsUserDataReady(true);
      } catch (error) {
        console.error("Error fetching user role:", error);
        setIsUserDataReady(true);
      }
    };

    getUserRoleAndGroups();
  }, []);
  
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["confirmed-bookings", filters, userRole, userGroups],
    queryFn: async () => {
      console.log("Fetching confirmed bookings with filters:", filters);
      console.log("User role:", userRole);
      console.log("User groups:", userGroups);
      
      try {
        let query = supabase
          .from("cabin_bookings")
          .select(`
            *,
            cabin:cabin_id(*),
            trip:trip_id(
              *,
              boat:boat_id(name)
            )
          `);
          
        // Apply status filter
        if (!filters.status || filters.status === "all_statuses") {
          query = query.eq("status", "confirmed");
        } else {
          query = query.eq("status", filters.status);
        }
        
        // Apply group name filter if specified
        if (filters.groupName && filters.groupName !== "all_groups") {
          console.log("Applying group filter:", filters.groupName);
          query = query.eq("group_name", filters.groupName);
        }
        
        // If user is an agent with assigned groups, filter by those groups
        if (userRole === "agent" && userGroups.length > 0) {
          console.log("Adding group filter for agent:", userGroups);
          // Only apply the agent group filter if no specific group is selected
          if (!filters.groupName) {
            query = query.in("group_name", userGroups);
          } else {
            // If a specific group is selected, verify it's in the agent's groups
            if (!userGroups.includes(filters.groupName) && filters.groupName !== "") {
              console.log("Selected group is not in agent's groups, reverting to agent groups filter");
              query = query.in("group_name", userGroups);
            }
          }
        }
        
        const { data, error } = await query;

        if (error) {
          console.error("Error fetching bookings:", error);
          toast.error("Failed to load bookings: " + error.message);
          throw error;
        }
        
        console.log(`Found ${data?.length || 0} bookings after filtering`);
        return data || [];
      } catch (error) {
        console.error("Exception in booking query:", error);
        throw error;
      }
    },
    enabled: isUserDataReady,
  });
  
  const handleFiltersChange = (newFilters: { status: string, groupName: string }) => {
    console.log("Filter changed in ConfirmedBookings:", newFilters);
    
    // Make sure we maintain the page's primary status filter for this page
    const statusFilter = newFilters.status === "all_statuses" ? "confirmed" : 
                         (newFilters.status || "confirmed");
                         
    setFilters({ 
      status: statusFilter,
      groupName: newFilters.groupName
    });
  };
  
  const handleManualRefresh = () => {
    refetch();
  };

  if (isLoading && !data) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message="Error loading confirmed bookings" 
        detail={error instanceof Error ? error.message : "Please try again later."} 
      />
    );
  }

  const confirmedBookings = data?.map(booking => ({
    ...booking,
    group_name: booking.group_name || "default"
  })) || [];
  
  // For agents, only show the groups they are assigned to
  const groupNames = userRole === "agent" && userGroups.length > 0
    ? [...new Set(userGroups)]
    : [...new Set(confirmedBookings.map(booking => booking.group_name))];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Confirmed Bookings</h1>
      </div>
      
      <BookingFilters
        isRefreshing={isRefetching}
        onManualRefresh={handleManualRefresh}
        onFiltersChange={handleFiltersChange}
        groupNames={groupNames}
        defaultStatus="confirmed"
      />
      
      <BookingList 
        bookings={confirmedBookings} 
        title="Confirmed Bookings" 
        status="confirmed" 
      />
    </div>
  );
}
