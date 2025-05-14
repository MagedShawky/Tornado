
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { Link } from "react-router-dom";

interface BookingListHeaderProps {
  title: string;
  tripId: string;
  tripDestination: string;
  boat: {
    name: string;
  };
  startDate: Date;
  endDate: Date;
  isExporting: boolean;
  onExport: () => void;
  hasSelectedBookings: boolean;
  isConfirming: boolean;
  onConfirmSelected: () => void;
  status: string;
  showConfirmButton: boolean;
}

export function BookingListHeader({
  title,
  tripId,
  tripDestination,
  boat,
  startDate,
  endDate,
  isExporting,
  onExport,
  hasSelectedBookings,
  isConfirming,
  onConfirmSelected,
  status,
  showConfirmButton
}: BookingListHeaderProps) {
  return (
    <div className="bg-gray-50 p-4 flex justify-between items-center">
      <div>
        <h3 className="text-xl font-semibold">{tripDestination}</h3>
        <p className="text-gray-600">
          {boat.name} • {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
        </p>
      </div>
      <div className="flex gap-3">
        <Link 
          to={`/manage-bookings/${tripId}?status=${status}`} 
          className="text-blue-600 hover:underline"
        >
          <Button variant="outline">View Details</Button>
        </Link>
        
        <Button 
          onClick={onExport} 
          variant="outline"
          disabled={isExporting}
        >
          <FileDown className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export Excel'}
        </Button>
        
        {showConfirmButton && (
          <Button 
            onClick={onConfirmSelected}
            disabled={!hasSelectedBookings || isConfirming}
            variant="default"
          >
            {isConfirming ? 'Confirming...' : 'Confirm Selected'}
          </Button>
        )}
      </div>
    </div>
  );
}
