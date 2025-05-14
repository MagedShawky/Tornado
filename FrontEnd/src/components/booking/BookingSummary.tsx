
import { Button } from "@/components/ui/button";

interface BookingSummaryProps {
  selectedCount: number;
  totalPrice: number;
  onOptionClick: () => void;
  onConfirmClick: () => void;
  onWaitlistClick?: () => void;
  showWaitlistButton?: boolean;
}

export function BookingSummary({ 
  selectedCount, 
  totalPrice, 
  onOptionClick, 
  onConfirmClick,
  onWaitlistClick,
  showWaitlistButton = false
}: BookingSummaryProps) {
  return (
    <div className="bg-white sticky bottom-0 border-t p-4 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 md:gap-8">
          <div>
            <span className="text-gray-600 mr-2">N. Pax</span>
            <span className="text-xl font-bold text-blue-500">{selectedCount}</span>
          </div>
          <div>
            <span className="text-gray-600 mr-2">Total Price</span>
            <span className="text-xl font-bold">€ {totalPrice}</span>
          </div>
        </div>
        <div className="flex gap-2 md:gap-4">
          {showWaitlistButton && onWaitlistClick && (
            <Button 
              className="flex-1 md:flex-none bg-purple-600 hover:bg-purple-700 text-white px-2 md:px-4"
              onClick={onWaitlistClick}
              disabled={selectedCount === 0}
            >
              WAITLIST
            </Button>
          )}
          <Button 
            className="flex-1 md:flex-none bg-[#FFC107] hover:bg-[#FFC107]/90 text-black px-2 md:px-4"
            onClick={onOptionClick}
            disabled={selectedCount === 0}
          >
            OPTION
          </Button>
          <Button 
            className="flex-1 md:flex-none bg-[#E53E3E] hover:bg-[#E53E3E]/90 text-white px-2 md:px-4"
            onClick={onConfirmClick}
            disabled={selectedCount === 0}
          >
            CONFIRM
          </Button>
        </div>
      </div>
    </div>
  );
}
