
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface BookingListFooterProps {
  totalBookings: number;
  selectedCount: number;
  status: string;
  onConfirmSelected?: () => void;
  isConfirming?: boolean;
  showConfirmButton?: boolean;
  onCancelSelected?: () => void;
  isCanceling?: boolean;
}

export function BookingListFooter({
  totalBookings,
  selectedCount,
  status,
  onConfirmSelected,
  isConfirming = false,
  showConfirmButton = false,
  onCancelSelected,
  isCanceling = false
}: BookingListFooterProps) {
  return (
    <div className="p-4 border-t flex justify-between items-center bg-gray-50">
      <div>
        <p className="text-sm text-gray-600">
          <span className="font-medium">{totalBookings}</span> booking{totalBookings !== 1 ? 's' : ''} total
          {selectedCount > 0 && (
            <>, <span className="font-medium">{selectedCount}</span> selected</>
          )}
        </p>
      </div>
      
      <div className="flex gap-3">
        {selectedCount > 0 && onCancelSelected && (
          <Button 
            variant="destructive"
            size="sm"
            onClick={onCancelSelected}
            disabled={isCanceling}
          >
            <X className="mr-1 h-4 w-4" />
            {isCanceling ? 'Canceling...' : 'Cancel Selected'}
          </Button>
        )}
        
        {showConfirmButton && selectedCount > 0 && onConfirmSelected && (
          <Button 
            variant="default"
            size="sm"
            onClick={onConfirmSelected}
            disabled={isConfirming}
          >
            <Check className="mr-1 h-4 w-4" />
            {isConfirming ? 'Confirming...' : 'Confirm Selected'}
          </Button>
        )}
      </div>
    </div>
  );
}
