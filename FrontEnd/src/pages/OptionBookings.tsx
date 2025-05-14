
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
import { useBookMutation } from "@/hooks/useBookMutation";

export default function OptionBookings() {
  const [filters, setFilters] = useState({ status: "option", groupName: "" });
  const [userGroups, setUserGroups] = useState<string[]>([]);
  const navigate = useNavigate();
  const { userRole, session } = useAuthState();
  const bookMutation = useBookMutation();
  
  // Get agent's groups
  useEffect(() => {
    if (userRole !== "agent") return;
    
    const getUserGroups = async () => {
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
          return;
        }
        
        if (!profile || profile.role !== "agent") {
          toast.error("Unauthorized access");
          navigate("/");
          return;
        }
        
        setUserGroups(profile.agent_groups || []);
        console.log("Agent groups loaded:", profile.agent_groups);
      } catch (error) {
        console.error("Error checking user role:", error);
      }
    };
    
    getUserGroups();
  }, [navigate, userRole, session]);
  
  const { data: bookings, isLoading, error, refetch } = useQuery({
    queryKey: ["option-bookings", filters, session?.user?.id],
    queryFn: async () => {
      console.log("Fetching option bookings with filters:", filters);
      
      if (!session?.user) {
        console.log("No authenticated user found");
        return [];
      }
      
      try {
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
          .eq("status", "option");
        
        // Only apply group filter if specified and not "all_groups"
        if (filters.groupName && filters.groupName !== "all_groups") {
          console.log("Applying group filter:", filters.groupName);
          query = query.eq("group_name", filters.groupName);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Query error:", error);
          throw error;
        }
        
        console.log("Option bookings fetched:", data?.length || 0, "bookings found");
        return data || [];
      } catch (error) {
        console.error("Error in fetchOptionBookings:", error);
        throw error;
      }
    },
    enabled: !!session?.user && (userRole === "agent" || userRole === "admin"),
    staleTime: 30000, // Consider data fresh for 30 seconds
    retry: 2, // Retry twice on failure
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  
  const handleFiltersChange = (newFilters: { status: string, groupName: string }) => {
    console.log("Applying new filters:", newFilters);
    setFilters({
      status: "option", // Always keep status as "option" for this page
      groupName: newFilters.groupName
    });
  };

  // Handle confirm bookings
  const handleConfirmBookings = (bookingIds: string[], tripId: string) => {
    bookMutation.mutate({
      tripId,
      bookingIds,
      bookingType: "confirm",
      onSuccess: () => {
        refetch();
      }
    });
  };

  // Handle manual refresh
  const handleRefresh = () => {
    console.log("Manual refresh triggered for option bookings");
    refetch();
  };
  
  if (isLoading) {
    return <LoadingState message="Loading option bookings..." />;
  }
  
  if (error) {
    return (
      <ErrorMessage 
        message="Error loading option bookings" 
        detail={error instanceof Error ? error.message : "Please try again later"} 
      />
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Option Bookings</h1>
      </div>
      
      <BookingFilters
        isRefreshing={isLoading}
        onManualRefresh={handleRefresh}
        onFiltersChange={handleFiltersChange}
        groupNames={userGroups}
        defaultStatus="option"
      />
      
      {bookings && bookings.length > 0 ? (
        <BookingList 
          bookings={bookings} 
          title="Option Bookings" 
          status="option"
          onConfirmBookings={handleConfirmBookings}
          isConfirming={bookMutation.isPending}
        />
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg border">
          <p className="text-xl font-medium text-gray-500">No option bookings found</p>
          <p className="text-gray-400 mt-2">Try adjusting your filters or refreshing the page</p>
        </div>
      )}
    </div>
  );
}
