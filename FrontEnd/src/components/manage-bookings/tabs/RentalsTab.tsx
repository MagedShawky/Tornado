
import { Trip, CabinBooking, Cabin, BookingRentals } from "@/types/database";
import { useRentals } from "./rentals/useRentals";
import { RentalTable } from "./rentals/RentalTable";
import { RentalActions } from "./rentals/RentalActions";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { useState } from "react";
import { exportBookingsToXLSX } from "@/utils/exportUtils";
import { toast } from "sonner";

interface RentalsTabProps {
  trip: Trip & {
    boat: {
      id: string;
      name: string;
      feature_photo: string | null;
      capacity: number;
    }
  };
  cabinBookings: (CabinBooking & { cabin: Cabin })[];
  rentals?: BookingRentals[];
  onSaved?: () => void;
}

export function RentalsTab({ 
  trip, 
  cabinBookings, 
  rentals = [],
  onSaved
}: RentalsTabProps) {
  const [isExporting, setIsExporting] = useState(false);
  
  // Use the custom hook
  const {
    rentalItems,
    isLoading,
    handleRentalChange,
    handleAddRental,
    handleRemoveRental,
    handleSave
  } = useRentals(rentals, trip.id);

  // Get unique bed numbers from cabin bookings
  const availableBeds = cabinBookings.map(booking => booking.bed_number).sort((a, b) => a - b);

  const handleSaveWithCallback = async () => {
    const result = await handleSave();
    if (result.success && onSaved) {
      onSaved();
    }
    return result;
  };

  // Export just the rentals data
  const handleExportRentals = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    try {
      const filename = `${trip.destination}-rentals.xlsx`;
      await exportBookingsToXLSX(cabinBookings, trip.id, filename);
      toast.success("Rentals data exported successfully");
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
        <div className="text-lg">Equipment Rentals</div>
        
        <Button
          onClick={handleExportRentals}
          variant="outline"
          disabled={isExporting}
        >
          <FileDown className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export Rentals'}
        </Button>
      </div>
      
      <RentalTable 
        rentals={rentalItems}
        availableBeds={availableBeds}
        onRentalChange={handleRentalChange}
        onRemoveRental={handleRemoveRental}
      />
      
      <RentalActions 
        isLoading={isLoading}
        onAddRental={handleAddRental}
        onSave={handleSaveWithCallback}
      />
    </div>
  );
}
