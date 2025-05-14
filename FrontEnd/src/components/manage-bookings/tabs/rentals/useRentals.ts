
import { useState } from "react";
import { toast } from "sonner";
import { BookingRentals } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";
import { Rental, SaveResult } from "./types";

// Implementation of useRentals hook
export function useRentals(
  rentals: BookingRentals[] = [],
  tripId?: string
) {
  // Transform existing data
  const initialRentals = rentals.map(rental => ({
    id: rental.id,
    bookingId: rental.booking_id,
    bedNumber: rental.bed_number || null,
    equipmentType: rental.equipment_type || "",
    size: rental.size || "",
    brand: rental.brand || "",
    quantity: rental.quantity || 1,
    rentPeriodDays: rental.rent_period_days || 1,
    pricePerUnit: rental.price_per_unit || 0,
    totalPrice: rental.total_price || 0,
    status: rental.status || "pending",
    notes: rental.notes || ""
  }));

  const [rentalItems, setRentalItems] = useState<Rental[]>(initialRentals.length > 0 ? initialRentals : []);
  const [rentalsToDelete, setRentalsToDelete] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleRentalChange = (index: number, field: keyof Rental, value: any) => {
    const updatedRentals = [...rentalItems];
    const rental = { ...updatedRentals[index] };
    
    if (field === 'quantity' || field === 'rentPeriodDays' || field === 'pricePerUnit') {
      rental[field] = Number(value);
      rental.totalPrice = calculateTotalPrice(rental);
    } else if (field === 'bedNumber') {
      rental[field] = value === "no-bed" ? null : Number(value);
    } else {
      // Fix for TS2322 error - use type assertion to assign value to the field
      (rental[field] as any) = value;
    }
    
    updatedRentals[index] = rental;
    setRentalItems(updatedRentals);
  };

  const calculateTotalPrice = (rental: Rental): number => {
    return rental.quantity * rental.pricePerUnit * rental.rentPeriodDays;
  };

  const handleAddRental = () => {
    setRentalItems([
      ...rentalItems,
      {
        bedNumber: null,
        equipmentType: "",
        size: "",
        brand: "",
        quantity: 1,
        rentPeriodDays: 1,
        pricePerUnit: 0,
        totalPrice: 0,
        status: "pending",
        notes: ""
      }
    ]);
  };

  const handleRemoveRental = (index: number) => {
    const updatedRentals = [...rentalItems];
    const rentalToRemove = updatedRentals[index];
    
    if (rentalToRemove.id) {
      setRentalsToDelete(prev => [...prev, rentalToRemove.id as string]);
    }
    
    updatedRentals.splice(index, 1);
    setRentalItems(updatedRentals);
  };

  const handleSave = async (): Promise<SaveResult> => {
    if (!tripId) {
      toast.error("Trip ID is missing");
      return { success: false, error: "Trip ID is missing" };
    }

    setIsLoading(true);
    
    try {
      // Process each rental
      const savePromises = rentalItems.map(async (rental) => {
        const rentalData = {
          equipment_type: rental.equipmentType,
          size: rental.size,
          brand: rental.brand,
          quantity: rental.quantity,
          rent_period_days: rental.rentPeriodDays,
          price_per_unit: rental.pricePerUnit,
          total_price: rental.totalPrice,
          status: rental.status,
          notes: rental.notes,
          updated_at: new Date().toISOString(),
          bed_number: rental.bedNumber
        };
        
        if (rental.id) {
          // Update existing rental
          const { error } = await supabase
            .from("booking_rentals")
            .update(rentalData)
            .eq("id", rental.id);
            
          if (error) throw error;
          return rental;
        } else if (rental.bookingId) {
          // Create new rental with booking ID
          const { error } = await supabase
            .from("booking_rentals")
            .insert({
              booking_id: rental.bookingId,
              trip_id: tripId,
              ...rentalData
            });
            
          if (error) throw error;
          return rental;
        } else {
          // For rentals without a booking ID (trip-level rental)
          // Find an existing booking ID to use, preferably linked to the bed if specified
          let bookingId = "";
          
          if (rental.bedNumber) {
            // Try to find booking ID for the specific bed
            const { data: bookingData } = await supabase
              .from("cabin_bookings")
              .select("id")
              .eq("trip_id", tripId)
              .eq("bed_number", rental.bedNumber)
              .single();
              
            if (bookingData) {
              bookingId = bookingData.id;
            }
          }
          
          // If no specific bed or no booking found for that bed, use any booking from this trip
          if (!bookingId) {
            const { data: anyBooking } = await supabase
              .from("cabin_bookings")
              .select("id")
              .eq("trip_id", tripId)
              .limit(1)
              .single();
              
            if (anyBooking) {
              bookingId = anyBooking.id;
            } else {
              throw new Error("No bookings found for this trip");
            }
          }
          
          const { error } = await supabase
            .from("booking_rentals")
            .insert({
              booking_id: bookingId,
              trip_id: tripId,
              ...rentalData
            });
            
          if (error) throw error;
          return rental;
        }
      });
      
      await Promise.all(savePromises);
      
      // Handle rentals to delete
      if (rentalsToDelete.length > 0) {
        const { error } = await supabase
          .from("booking_rentals")
          .delete()
          .in("id", rentalsToDelete);
          
        if (error) throw error;
      }
      
      toast.success("Rentals saved successfully");
      return { success: true };
    } catch (error) {
      console.error("Error saving rentals:", error);
      toast.error("Failed to save rentals");
      return { success: false, error: "Failed to save rentals" };
    } finally {
      setIsLoading(false);
      setRentalsToDelete([]);
    }
  };

  return {
    rentalItems,
    handleRentalChange,
    handleAddRental,
    handleRemoveRental,
    calculateTotalPrice,
    handleSave,
    isLoading
  };
}
