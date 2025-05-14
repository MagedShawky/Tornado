
import { Button } from "@/components/ui/button";
import { Trip, CabinBooking, Cabin, BookingTravelInfo, BookingClientDetails } from "@/types/database";
import { FlightInfoTable } from "./travel-info/FlightInfoTable";
import { TransferArrivalTable } from "./travel-info/TransferArrivalTable";
import { TransferDepartureTable } from "./travel-info/TransferDepartureTable";
import { useTravelInfo } from "./travel-info/useTravelInfo";
import { Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface TravelInfoTabProps {
  trip: Trip & {
    boat: {
      id: string;
      name: string;
      feature_photo: string | null;
      capacity: number;
    }
  };
  cabinBookings: (CabinBooking & { cabin: Cabin })[];
  travelInfo?: BookingTravelInfo[];
  clientDetails?: BookingClientDetails[];
  onSaved?: () => void;
}

export function TravelInfoTab({ 
  trip, 
  cabinBookings, 
  travelInfo = [], 
  clientDetails = [],
  onSaved 
}: TravelInfoTabProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  
  const { travelInfoState, handleTravelInfoChange, handleSave, isLoading } = useTravelInfo(
    travelInfo, 
    trip.id,
    cabinBookings,
    clientDetails
  );

  const refreshData = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({
        queryKey: ["travel-info", trip.id]
      });
      toast.success("Travel information refreshed");
    } catch (error) {
      console.error("Error refreshing travel info:", error);
      toast.error("Failed to refresh data");
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 2000);
    }
  };

  const handleSaveWithCallback = async () => {
    const result = await handleSave();
    if (result && onSaved) {
      onSaved();
    }
  };

  return (
    <div>
      <div className="mb-4 text-lg">Travel Information</div>
      
      <FlightInfoTable 
        travelInfo={travelInfoState} 
        onInfoChange={handleTravelInfoChange} 
      />
      
      <TransferArrivalTable 
        travelInfo={travelInfoState} 
        onInfoChange={handleTravelInfoChange} 
      />
      
      <TransferDepartureTable 
        travelInfo={travelInfoState} 
        onInfoChange={handleTravelInfoChange} 
      />

      <div className="mt-6 flex justify-end gap-4">
        <Button 
          variant="outline" 
          onClick={refreshData} 
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
        
        <Button 
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
