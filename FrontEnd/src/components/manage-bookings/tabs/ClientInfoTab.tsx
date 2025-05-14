
import { Button } from "@/components/ui/button";
import { Trip, CabinBooking, Cabin, BookingClientInfo, BookingClientDetails } from "@/types/database";
import { ClientInfoTable } from "./client-info/ClientInfoTable";
import { useClientInfo } from "./client-info/useClientInfo";
import { Loader2 } from "lucide-react";

interface ClientInfoTabProps {
  trip: Trip & {
    boat: {
      id: string;
      name: string;
      feature_photo: string | null;
      capacity: number;
    }
  };
  cabinBookings: (CabinBooking & { cabin: Cabin })[];
  clientInfo?: BookingClientInfo[];
  clientDetails?: BookingClientDetails[];
  onSaved?: () => void;
}

export function ClientInfoTab({ 
  trip, 
  cabinBookings, 
  clientInfo = [],
  clientDetails = [], 
  onSaved 
}: ClientInfoTabProps) {
  const { clients, handleClientInfoChange, handleSave, isLoading } = useClientInfo(
    clientInfo, 
    trip.id, 
    cabinBookings,
    clientDetails
  );

  const handleSaveWithCallback = async () => {
    await handleSave();
    if (onSaved) {
      onSaved();
    }
  };

  return (
    <div>
      <div className="mb-4 text-neutral-500 italic">
        Note: Name and surname cannot be changed here. Please update them in the Client Details tab.
      </div>
      
      <ClientInfoTable 
        clients={clients} 
        onClientInfoChange={handleClientInfoChange} 
        tripId={trip.id}
        cabinBookings={cabinBookings}
      />
      
      <div className="mt-6 flex justify-end">
        <Button 
          className="px-16"
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
