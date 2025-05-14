
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TripForm } from "../TripForm";
import { TripStatusBadge } from "./TripStatusBadge";
import { TripPrice } from "./TripPrice";
import { TripMetadata } from "./TripMetadata";
import { BookingStatusIndicators } from "./BookingStatusIndicators";
import { TripActionButtons } from "./TripActionButtons";
import { TripProgressBar } from "./TripProgressBar";
import { TripListItemHeader } from "./TripListItemHeader";
import { TripImageSection } from "./TripImageSection";

interface TripListItemProps {
  trip: any;
}

export function TripListItem({ trip }: TripListItemProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  
  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  
  // Query to get booking counts by status
  const { data: bookingsData } = useQuery({
    queryKey: ["trip-bookings-count", trip.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cabin_bookings")
        .select("status")
        .eq("trip_id", trip.id);
      
      if (error) throw error;
      
      // Count bookings by status
      const counts = {
        confirmed: 0,
        option: 0,
        waitlist: 0
      };
      
      data.forEach(booking => {
        if (booking.status === 'confirmed') counts.confirmed++;
        if (booking.status === 'option') counts.option++;
        if (booking.status === 'waitlist') counts.waitlist++;
      });
      
      return counts;
    }
  });
  
  const confirmedCount = bookingsData?.confirmed || 0;
  const optionedCount = bookingsData?.option || 0;
  const waitlistCount = bookingsData?.waitlist || 0;
  
  const calculateDays = () => {
    const diff = endDate.getTime() - startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const availablePercentage = trip.available_spots > 0 
    ? (trip.available_spots / (trip.available_spots + trip.booked_spots)) * 100 
    : 0;

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden border">
      <div className="md:flex">
        {/* Image section */}
        <TripImageSection 
          imageUrl={trip.boat?.feature_photo || "/placeholder.svg"}
          imageAlt={trip.boat?.name || "Boat"}
          hasBookedSpots={trip.booked_spots}
          discountPercentage={trip.discount || 0}
        />
        
        {/* Content section */}
        <div className="md:w-2/3 p-4">
          <TripListItemHeader 
            destination={trip.destination}
            duration={calculateDays()}
            badgeComponent={<TripStatusBadge status={trip.status} />}
          />
          
          <TripMetadata 
            startDate={startDate}
            endDate={endDate}
            locationFrom={trip.location_from}
            locationTo={trip.location_to}
            boatName={trip.boat?.name}
            bookedSpots={trip.booked_spots}
            availableSpots={trip.available_spots}
          />
          
          <TripPrice price={trip.price} discount={trip.discount || 0} />
          
          <div className="mt-4 flex justify-between items-center">
            <TripProgressBar availablePercentage={availablePercentage} />
            
            <div className="flex gap-4 items-center">
              <BookingStatusIndicators 
                optionedCount={optionedCount}
                confirmedCount={confirmedCount}
                availableSpots={trip.available_spots}
                waitlistCount={waitlistCount}
              />
              
              <TripActionButtons 
                tripId={trip.id}
                onEdit={() => setShowEditModal(true)}
                endDate={endDate}
              />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Edit Trip</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] pr-4">
            <TripForm initialData={trip} />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
