
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookingList } from "@/components/booking/BookingList";
import { LoadingState } from "@/components/booking/LoadingState";
import { ErrorMessage } from "@/components/booking/ErrorMessage";
import { BookingFilters } from "@/components/manage-bookings/BookingFilters";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthState } from "@/hooks/useAuthState";

export default function AgentBookings() {
  const [filters, setFilters] = useState({ status: "all", groupName: "" });
  const [userGroups, setUserGroups] = useState<string[]>([]);
  const navigate = useNavigate();
  const { session } = useAuthState();
  
  // Check if user is an agent
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        if (!session?.user) {
          console.log("No authenticated user found");
          return;
        }
        
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role, agent_groups")
          .eq("id", session.user.id)
          .single();
        
        if (error) {
          console.error("Error fetching user profile:", error);
          toast.error("Failed to load agent profile");
          return;
        }
        
        if (!profile || profile.role !== "agent") {
          toast.error("Unauthorized access");
          navigate("/");
          return;
        }
        
        // Set agent groups for reference only, we're not filtering by them now
        const groups = profile.agent_groups || [];
        console.log("Agent groups loaded for reference:", groups);
        setUserGroups(groups);
      } catch (error) {
        console.error("Error checking user role:", error);
        navigate("/");
      }
    };
    
    checkUserRole();
  }, [navigate, session]);
  
  const { data: bookings, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["agent-bookings", filters, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        console.log("No user ID available, cannot fetch bookings");
        return [];
      }
      
      console.log("Fetching agent bookings with filters:", filters, "for user ID:", session.user.id);
      
      let query = supabase
        .from("cabin_bookings")
        .select(`
          *,
          cabin:cabin_id(*),
          trip:trip_id(
            *,
            boat:boat_id(name, feature_photo)
          )
        `)
        .eq("user_id", session.user.id);  // Filter by user_id instead of group_name
      
      // Apply status filter if not "all"
      if (filters.status && filters.status !== "all" && filters.status !== "all_statuses") {
        console.log(`Applying status filter: ${filters.status}`);
        query = query.eq("status", filters.status.toLowerCase());
      }
      
      // Optional: Add group filtering only if explicitly requested
      if (filters.groupName && filters.groupName !== "all_groups") {
        console.log(`Additionally filtering by group: ${filters.groupName}`);
        query = query.eq("group_name", filters.groupName);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching agent bookings:", error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} bookings for agent with ID: ${session.user.id}`);
      return data || [];
    },
    enabled: !!session?.user?.id,
    refetchOnWindowFocus: true,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
  
  const handleFiltersChange = (newFilters: { status: string, groupName: string }) => {
    console.log("Applying new filters:", newFilters);
    setFilters(newFilters);
  };
  
  if (isLoading) {
    return <LoadingState message="Loading agent bookings..." />;
  }
  
  if (error) {
    return (
      <ErrorMessage 
        message="Error loading bookings" 
        detail={error instanceof Error ? error.message : "Please try again later"} 
      />
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Agent Bookings</h1>
      </div>
      
      <BookingFilters
        isRefreshing={isRefetching}
        onManualRefresh={refetch}
        onFiltersChange={handleFiltersChange}
        groupNames={userGroups}
        defaultStatus="all"
      />
      
      {bookings && bookings.length > 0 ? (
        <BookingList 
          bookings={bookings || []} 
          title="Agent Bookings" 
          status={filters.status} 
        />
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg border">
          <p className="text-xl font-medium text-gray-500">
            No {filters.status !== "all" && filters.status !== "all_statuses" ? filters.status : ""} bookings found
            for your account
          </p>
          <p className="text-gray-400 mt-2">
            Create a booking or try adjusting your filters
          </p>
        </div>
      )}
    </div>
  );
}
