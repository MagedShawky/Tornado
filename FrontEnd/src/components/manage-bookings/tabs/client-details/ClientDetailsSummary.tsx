
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ClientDetailsSummaryProps {
  totalPassengers: number;
  totalPrice: number;
  isLoading: boolean;
  onSave: () => void;
}

export function ClientDetailsSummary({
  totalPassengers,
  totalPrice,
  isLoading,
  onSave
}: ClientDetailsSummaryProps) {
  // Simple component with no state, should not cause re-renders
  return (
    <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-end">
      <div className="mb-4 md:mb-0">
        <div className="text-sm text-gray-500">Total passengers: {totalPassengers}</div>
        <div className="text-sm text-gray-500">
          Total price: ${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
      <Button 
        onClick={onSave}
        disabled={isLoading}
        className="min-w-[120px]"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : "Save"}
      </Button>
    </div>
  );
}
