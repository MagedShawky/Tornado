
import { Button } from "@/components/ui/button";
import { Trip, CabinBooking, Cabin, BookingTourismServices } from "@/types/database";
import { Loader2, Plus } from "lucide-react";
import { TourismServiceTable } from "./tourism-services/TourismServiceTable";
import { useTourismServices } from "./tourism-services/useTourismServices";

interface TourismServicesTabProps {
  trip: Trip & {
    boat: {
      id: string;
      name: string;
      feature_photo: string | null;
      capacity: number;
    }
  };
  cabinBookings: (CabinBooking & { cabin: Cabin })[];
  tourismServices?: BookingTourismServices[];
  onSaved?: () => void;
}

export function TourismServicesTab({ 
  trip, 
  cabinBookings, 
  tourismServices = [],
  onSaved 
}: TourismServicesTabProps) {
  // Get tourism services state and handlers from custom hook
  const {
    services,
    isLoading,
    handleServiceChange,
    handleAddService,
    handleRemoveService,
    calculateTotalPrice,
    handleSave
  } = useTourismServices(tourismServices, trip.id, cabinBookings);

  // Get unique bed numbers from cabin bookings
  const availableBeds = cabinBookings
    .map(booking => booking.bed_number)
    .filter(bedNumber => bedNumber !== undefined && bedNumber !== null)
    .sort((a, b) => a - b);
  
  console.log("Available beds in TourismServicesTab:", availableBeds);

  const handleSaveWithCallback = async () => {
    const result = await handleSave();
    if (result.success && onSaved) {
      onSaved();
    }
    return result;
  };

  return (
    <div>
      <div className="text-lg mb-4">Tourism Services</div>
      
      <TourismServiceTable 
        services={services}
        availableBeds={availableBeds}
        onServiceChange={handleServiceChange}
        onRemoveService={handleRemoveService}
      />
      
      <div className="flex justify-between mt-4">
        <Button 
          variant="outline" 
          onClick={handleAddService}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Add Service
        </Button>
        
        <Button 
          className="bg-red-500 hover:bg-red-600 px-16"
          onClick={handleSaveWithCallback}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              SAVING...
            </>
          ) : (
            'SAVE'
          )}
        </Button>
      </div>
    </div>
  );
}
