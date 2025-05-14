
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BookingList } from "@/components/booking/BookingList";
import { LoadingState } from "@/components/booking/LoadingState";
import { ErrorMessage } from "@/components/booking/ErrorMessage";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCustomerBookings } from "@/hooks/useCustomerBookings";

export default function CustomerBookings() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();
  
  // Check if user is a customer
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        console.log("Checking user role and retrieving user email");
        setAuthLoading(true);
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Error getting user:", userError);
          throw userError;
        }
        
        if (!user?.email) {
          console.error("User email not found");
          toast.error("User email not found");
          navigate("/");
          return;
        }
        
        console.log("Got user with email:", user.email);

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          throw profileError;
        }
        
        if (!profile || profile.role !== "customer") {
          console.error("User is not a customer. Role:", profile?.role);
          toast.error("Unauthorized access");
          navigate("/");
          return;
        }
        
        console.log("User is a customer, setting email for bookings query");
        setUserEmail(user.email);
      } catch (error) {
        console.error("Error checking user role:", error);
        toast.error("Authentication error");
        navigate("/");
      } finally {
        setAuthLoading(false);
      }
    };
    
    checkUserRole();
  }, [navigate]);
  
  const { data: bookings, isLoading, error } = useCustomerBookings(userEmail);
  
  console.log("CustomerBookings rendering state:", { 
    authLoading, 
    bookingsLoading: isLoading, 
    hasError: !!error, 
    hasUserEmail: !!userEmail,
    hasBookings: !!bookings,
    bookingsCount: bookings?.length || 0 
  });
  
  if (authLoading) {
    return <LoadingState message="Verifying your account..." />;
  }
  
  if (isLoading) {
    return <LoadingState message="Loading your bookings..." />;
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
        <h1 className="text-2xl font-bold">My Bookings</h1>
      </div>
      
      <BookingList 
        bookings={bookings || []} 
        title="My Bookings" 
        status="all"
      />
    </div>
  );
}
