
import { useState } from "react";
import { toast } from "sonner";
import { BookingTourismServices, CabinBooking, Cabin } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";
import { TourismService, SaveResult } from "./types";

// Implementation of useTourismServices hook
export function useTourismServices(
  tourismServices: BookingTourismServices[] = [],
  tripId?: string,
  cabinBookings: (CabinBooking & { cabin: Cabin })[] = []
) {
  // Transform existing data
  const initialServices = tourismServices.map(service => ({
    id: service.id,
    bookingId: service.booking_id,
    bedNumber: service.bed_number,
    serviceType: service.service_type || "",
    serviceName: service.service_name || "",
    serviceDate: service.service_date ? new Date(service.service_date) : null,
    quantity: service.quantity || 1,
    pricePerUnit: service.price_per_unit || 0,
    totalPrice: service.total_price || 0,
    status: service.status || "pending",
    notes: service.notes || ""
  }));

  console.log("Initial tourism services with bed numbers:", initialServices);
  
  const [services, setServices] = useState<TourismService[]>(initialServices.length > 0 ? initialServices : []);
  const [servicesToDelete, setServicesToDelete] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleServiceChange = (index: number, field: keyof TourismService, value: any) => {
    const updatedServices = [...services];
    const service = { ...updatedServices[index] };
    
    if (field === 'quantity' || field === 'pricePerUnit') {
      service[field] = Number(value);
      service.totalPrice = calculateTotalPrice(service);
    } else if (field === 'serviceDate') {
      service[field] = value === null ? null : new Date(value);
    } else if (field === 'bedNumber') {
      service[field] = value === "no-bed" ? null : Number(value);
      // If we've changed the bed number, we should try to find the corresponding booking ID
      if (tripId && cabinBookings && cabinBookings.length > 0 && value !== "no-bed") {
        const booking = cabinBookings.find(b => b.bed_number === Number(value));
        if (booking) {
          service.bookingId = booking.id;
        }
      }
    } else {
      // Fix for TS2322 error - use type assertion to assign value to the field
      (service[field] as any) = value;
    }
    
    updatedServices[index] = service;
    setServices(updatedServices);
  };

  const calculateTotalPrice = (service: TourismService): number => {
    return service.quantity * service.pricePerUnit;
  };

  const handleAddService = () => {
    setServices([
      ...services,
      {
        serviceType: "",
        serviceName: "",
        serviceDate: null,
        bedNumber: null,
        quantity: 1,
        pricePerUnit: 0,
        totalPrice: 0,
        status: "pending",
        notes: ""
      }
    ]);
  };

  const handleRemoveService = (index: number) => {
    const updatedServices = [...services];
    const serviceToRemove = updatedServices[index];
    
    if (serviceToRemove.id) {
      setServicesToDelete(prev => [...prev, serviceToRemove.id as string]);
    }
    
    updatedServices.splice(index, 1);
    setServices(updatedServices);
  };

  const handleSave = async (): Promise<SaveResult> => {
    if (!tripId) {
      toast.error("Trip ID is missing");
      return { success: false, error: "Trip ID is missing" };
    }

    setIsLoading(true);
    
    try {
      // Process each service
      const savePromises = services.map(async (service) => {
        const serviceData = {
          service_type: service.serviceType,
          service_name: service.serviceName,
          service_date: service.serviceDate ? service.serviceDate.toISOString() : null,
          quantity: service.quantity,
          price_per_unit: service.pricePerUnit,
          total_price: service.totalPrice,
          status: service.status,
          notes: service.notes,
          updated_at: new Date().toISOString(),
          bed_number: service.bedNumber
        };
        
        if (service.id) {
          // Update existing service
          const { error } = await supabase
            .from("booking_tourism_services")
            .update(serviceData)
            .eq("id", service.id);
            
          if (error) throw error;
          return service;
        } else if (service.bookingId) {
          // Create new service with specific booking ID
          const { error } = await supabase
            .from("booking_tourism_services")
            .insert({
              booking_id: service.bookingId,
              trip_id: tripId,
              ...serviceData
            });
            
          if (error) throw error;
          return service;
        } else {
          // For services without a booking ID (trip-level services)
          // Find an existing booking ID to use, preferably linked to the bed if specified
          let bookingId = "";
          
          if (service.bedNumber !== null) {
            // Try to find booking ID for the specific bed
            const matchingBooking = cabinBookings.find(booking => 
              booking.bed_number === service.bedNumber
            );
            
            if (matchingBooking) {
              bookingId = matchingBooking.id;
              console.log(`Found booking ID ${bookingId} for bed number ${service.bedNumber}`);
            } else {
              console.log(`No booking found for bed number ${service.bedNumber}`);
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
            .from("booking_tourism_services")
            .insert({
              booking_id: bookingId,
              trip_id: tripId,
              ...serviceData
            });
            
          if (error) throw error;
          return service;
        }
      });
      
      await Promise.all(savePromises);
      
      // Handle services to delete
      if (servicesToDelete.length > 0) {
        const { error } = await supabase
          .from("booking_tourism_services")
          .delete()
          .in("id", servicesToDelete);
          
        if (error) throw error;
      }
      
      toast.success("Tourism services saved successfully");
      return { success: true };
    } catch (error) {
      console.error("Error saving tourism services:", error);
      toast.error("Failed to save tourism services");
      return { success: false, error: "Failed to save tourism services" };
    } finally {
      setIsLoading(false);
      setServicesToDelete([]);
    }
  };

  return {
    services,
    isLoading,
    handleServiceChange,
    handleAddService,
    handleRemoveService,
    calculateTotalPrice,
    handleSave
  };
}
