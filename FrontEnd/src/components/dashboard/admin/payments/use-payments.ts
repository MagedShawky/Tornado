
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define Payment type and export it
export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  status: string;
  date: string;
  trip: string;
  userName: string | null;
  userEmail: string;
  userType: string;
}

export function usePayments(showPaid = false) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      
      // Since we don't have a payments table yet, we'll use cabin_bookings as our data source
      // and transform it to match the expected payment interface
      const { data: bookingsData, error } = await supabase
        .from("cabin_bookings")
        .select(`
          *,
          trip:trip_id(destination),
          cabin:cabin_id(cabin_number)
        `)
        .eq("status", showPaid ? "confirmed" : "option")
        .order("created_at", { ascending: false });
      
      if (error) throw error;

      // For each booking, fetch the user information separately if user_id exists
      const transformedData: Payment[] = await Promise.all(bookingsData.map(async booking => {
        let userName = null;
        let userEmail = "Unknown";
        let userType = "customer";
        
        // If we have a user_id, try to fetch user details
        if (booking.user_id) {
          const { data: userData, error: userError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", booking.user_id)
            .single();
          
          if (!userError && userData) {
            userName = (userData.first_name && userData.last_name) 
              ? `${userData.first_name} ${userData.last_name}`
              : null;
            userEmail = userData.email || "Unknown";
            userType = userData.role || "customer";
          }
        }
        
        // Use group_name as userName if available and no user profile found
        if (!userName && booking.group_name) {
          userName = booking.group_name;
        }
        
        return {
          id: booking.id,
          bookingId: booking.id, // Using the same ID for now
          userId: booking.user_id || "",
          amount: booking.price || 0,
          status: booking.status || "pending",
          date: booking.created_at,
          trip: booking.trip?.destination || "Unknown Trip",
          userName: userName,
          userEmail: userEmail,
          userType: userType
        };
      }));
      
      setPayments(transformedData);
      console.log("Fetched payments:", transformedData);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  }, [showPaid]);

  // Handle approve payment - returns a Promise now
  const handleApprovePayment = useCallback(async (paymentId: string): Promise<void> => {
    try {
      // Update booking status instead of payment
      const { error } = await supabase
        .from("cabin_bookings")
        .update({ status: "confirmed" })
        .eq("id", paymentId);
      
      if (error) throw error;
      
      // Refresh payments
      await fetchPayments();
      toast.success("Payment approved successfully");
    } catch (error) {
      console.error("Error approving payment:", error);
      toast.error("Failed to approve payment");
      throw error; // Re-throw to allow handling in component
    }
  }, [fetchPayments]);

  // Handle reject payment - returns a Promise now
  const handleRejectPayment = useCallback(async (paymentId: string): Promise<void> => {
    try {
      // Update booking status
      const { error } = await supabase
        .from("cabin_bookings")
        .update({ status: "rejected" })
        .eq("id", paymentId);
      
      if (error) throw error;
      
      // Refresh payments
      await fetchPayments();
      toast.success("Payment rejected");
    } catch (error) {
      console.error("Error rejecting payment:", error);
      toast.error("Failed to reject payment");
      throw error; // Re-throw to allow handling in component
    }
  }, [fetchPayments]);
  
  // Handle return to unpaid - returns a Promise now
  const handleReturnToUnpaid = useCallback(async (paymentId: string): Promise<void> => {
    try {
      // Update booking status back to option
      const { error } = await supabase
        .from("cabin_bookings")
        .update({ status: "option" })
        .eq("id", paymentId);
      
      if (error) throw error;
      
      // Refresh payments
      await fetchPayments();
      toast.success("Payment returned to pending status");
    } catch (error) {
      console.error("Error returning payment to pending:", error);
      toast.error("Failed to update payment status");
      throw error; // Re-throw to allow handling in component
    }
  }, [fetchPayments]);

  // Initialize state on mount
  useState(() => {
    fetchPayments();
  });

  return {
    payments,
    loading,
    fetchPayments,
    handleApprovePayment,
    handleRejectPayment,
    handleReturnToUnpaid
  };
}
