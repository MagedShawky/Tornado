
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CabinBooking, Cabin, BookingClientInfo, BookingClientDetails } from "@/types/database";

interface ClientInfoProps {
  bedNumber: number;
  cabin: string;
  groupName: string;
  name: string;
  surname: string;
  foodRemarks: string;
  dateOfBirth: Date | undefined;
  visaNumber: string;
  visaIssueDate: Date | undefined;
  divingLicenseType: string;
  divingLevel: string;
  documentUploaded: boolean;
  bookingId?: string; // Add bookingId to track which booking this client belongs to
  [key: string]: string | number | boolean | Date | undefined;
}

export function useClientInfo(
  initialClientInfo: BookingClientInfo[] = [],
  tripId: string,
  cabinBookings: (CabinBooking & { cabin: Cabin })[] = [],
  clientDetails: BookingClientDetails[] = []
) {
  const [clients, setClients] = useState<ClientInfoProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize client info from cabin bookings and existing data - only once
  useEffect(() => {
    if (!tripId || !cabinBookings.length || isInitialized) return;
    
    console.log("Initializing client info with:", { 
      cabinBookings: cabinBookings.length,
      clientDetails: clientDetails.length,
      initialClientInfo: initialClientInfo.length 
    });

    // Map cabin bookings to client info format
    const initializedClients = cabinBookings.map(booking => {
      // Try to find existing client info for this bed
      const existingClientInfo = initialClientInfo.find(
        ci => ci.bed_number === booking.bed_number
      );

      // Try to find client details for this bed
      const clientDetail = clientDetails.find(
        cd => cd.bed_number === booking.bed_number
      );
      
      // Prepare cabin info
      const cabinNumber = booking.cabin?.cabin_number || '';

      // Create client info with existing data or defaults
      // IMPORTANT: prioritize clientDetails for name and surname since they can only be edited there
      return {
        bedNumber: booking.bed_number,
        cabin: cabinNumber,
        bookingId: booking.id, // Store the booking ID for later use
        groupName: booking.group_name || '',
        name: clientDetail?.name || '', // Always use client details as the source of truth for name
        surname: clientDetail?.surname || '', // Always use client details as the source of truth for surname
        foodRemarks: existingClientInfo?.food_remarks || '',
        dateOfBirth: existingClientInfo?.date_of_birth ? new Date(existingClientInfo.date_of_birth) : undefined,
        visaNumber: existingClientInfo?.visa_number || '',
        visaIssueDate: existingClientInfo?.visa_issue_date ? new Date(existingClientInfo.visa_issue_date) : undefined,
        divingLicenseType: existingClientInfo?.diving_license_type || '',
        divingLevel: existingClientInfo?.diving_level || '',
        documentUploaded: existingClientInfo?.document_uploaded || false,
      };
    });

    setClients(initializedClients);
    setIsInitialized(true);
  }, [tripId, cabinBookings, initialClientInfo, clientDetails, isInitialized]);

  const handleClientInfoChange = useCallback((index: number, field: string, value: string | Date | boolean) => {
    setClients(prevClients => {
      const updatedClients = [...prevClients];
      
      if (!updatedClients[index]) {
        console.warn(`Client at index ${index} is undefined. This might indicate an issue with data synchronization.`);
        return prevClients;
      }
      
      updatedClients[index] = {
        ...updatedClients[index],
        [field]: value,
      };
      return updatedClients;
    });
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (!tripId) {
        throw new Error("Trip ID is missing");
      }

      // Prepare data for saving
      const clientInfoToSave = clients.map(client => {
        // Check if bookingId exists, throw an error if not
        if (!client.bookingId) {
          console.error("Missing booking ID for client", client);
          throw new Error(`Missing booking ID for client at bed ${client.bedNumber}`);
        }
        
        return {
          trip_id: tripId,
          booking_id: client.bookingId,
          bed_number: client.bedNumber,
          name: client.name,
          surname: client.surname,
          food_remarks: client.foodRemarks,
          date_of_birth: client.dateOfBirth ? client.dateOfBirth.toISOString() : null,
          visa_number: client.visaNumber,
          visa_issue_date: client.visaIssueDate ? client.visaIssueDate.toISOString() : null,
          diving_license_type: client.divingLicenseType,
          diving_level: client.divingLevel,
          document_uploaded: client.documentUploaded,
        };
      });

      // Changed approach: First delete existing records for this trip's client info
      // to avoid ON CONFLICT issues, then insert new records
      const { error: deleteError } = await supabase
        .from("booking_client_info")
        .delete()
        .eq("trip_id", tripId)
        .in("bed_number", clients.map(client => client.bedNumber));

      if (deleteError) {
        console.error("Error deleting existing client information:", deleteError);
        throw deleteError;
      }

      // Now insert the new/updated client info records
      const { error: insertError } = await supabase
        .from("booking_client_info")
        .insert(clientInfoToSave);

      if (insertError) {
        throw insertError;
      }

      toast.success("Client information saved successfully");
    } catch (error) {
      console.error("Error saving client information:", error);
      toast.error("Failed to save client information");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    clients,
    isLoading,
    handleClientInfoChange,
    handleSave,
  };
}
