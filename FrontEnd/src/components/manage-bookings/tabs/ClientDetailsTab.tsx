
import { Trip, CabinBooking, Cabin, BookingClientDetails, BookingClientInfo } from "@/types/database";
import { ClientDetailsTable } from "./client-details/ClientDetailsTable";
import { ClientDetailsSummary } from "./client-details/ClientDetailsSummary";
import { useClientDetails } from "./client-details/useClientDetails";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { useState } from "react";
import { exportBookingsToXLSX } from "@/utils/exportUtils";
import { toast } from "sonner";

interface ClientDetailsTabProps {
  trip: Trip & { 
    boat: { 
      id: string;
      name: string; 
      feature_photo: string | null;
      capacity: number;
    } 
  };
  cabinBookings: (CabinBooking & { cabin: Cabin })[];
  clientDetails?: BookingClientDetails[];
  clientInfo?: BookingClientInfo[];
  onSaved?: () => void;
}

export function ClientDetailsTab({ 
  trip, 
  cabinBookings, 
  clientDetails = [], 
  clientInfo = [], 
  onSaved 
}: ClientDetailsTabProps) {
  const [isExporting, setIsExporting] = useState(false);
  
  const { 
    passengers, 
    isLoading, 
    handlePassengerChange, 
    handleSave 
  } = useClientDetails(trip, cabinBookings, clientDetails, clientInfo);
  
  const totalPassengers = passengers.length;
  const totalPrice = cabinBookings.reduce((sum, booking) => sum + Number(booking.price), 0);
  
  const onSaveHandler = () => {
    handleSave(onSaved);
  };
  
  // Export client details data
  const handleExportClientDetails = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    try {
      const filename = `${trip.destination}-client-details.xlsx`;
      await exportBookingsToXLSX(cabinBookings, trip.id, filename);
      toast.success("Client details exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg">Client Details</div>
        
        <Button
          onClick={handleExportClientDetails}
          variant="outline"
          disabled={isExporting}
        >
          <FileDown className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export Client Details'}
        </Button>
      </div>
      
      <ClientDetailsTable 
        passengers={passengers}
        onPassengerChange={handlePassengerChange}
      />
      
      <ClientDetailsSummary 
        totalPassengers={totalPassengers}
        totalPrice={totalPrice}
        isLoading={isLoading}
        onSave={onSaveHandler}
      />
    </div>
  );
}

export type { ClientDetailsTabProps };
