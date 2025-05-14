
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { format, differenceInDays } from "date-fns";
import { AlertTriangle } from "lucide-react";

interface CancelBookingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
  tripStartDate: Date;
  bookingType: "option" | "confirmed";
  selectedBookingsCount: number;
}

export function CancelBookingModal({
  isOpen,
  onOpenChange,
  onConfirm,
  isPending,
  tripStartDate,
  bookingType,
  selectedBookingsCount
}: CancelBookingModalProps) {
  const [penaltyPercentage, setPenaltyPercentage] = useState(0);
  const [penaltyMessage, setPenaltyMessage] = useState("");
  
  useEffect(() => {
    if (isOpen && bookingType === "confirmed") {
      const today = new Date();
      const daysUntilTrip = differenceInDays(tripStartDate, today);
      
      // Calculate penalty based on days until trip
      if (daysUntilTrip <= 7) {
        setPenaltyPercentage(100); // 100% penalty if canceled within 7 days
        setPenaltyMessage("100% penalty (full amount) applies for cancellations within 7 days of the trip");
      } else if (daysUntilTrip <= 14) {
        setPenaltyPercentage(50); // 50% penalty if canceled within 14 days
        setPenaltyMessage("50% penalty applies for cancellations within 14 days of the trip");
      } else if (daysUntilTrip <= 30) {
        setPenaltyPercentage(25); // 25% penalty if canceled within 30 days
        setPenaltyMessage("25% penalty applies for cancellations within 30 days of the trip");
      } else {
        setPenaltyPercentage(10); // 10% penalty if canceled more than 30 days in advance
        setPenaltyMessage("10% penalty applies for cancellations more than 30 days before the trip");
      }
    } else {
      // No penalty for option bookings
      setPenaltyPercentage(0);
      setPenaltyMessage("");
    }
  }, [isOpen, tripStartDate, bookingType]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Cancel {bookingType === "confirmed" ? "Confirmed" : "Option"} Booking
          </DialogTitle>
          <DialogDescription>
            {bookingType === "confirmed" 
              ? "You are about to cancel a confirmed booking. Cancellation penalties may apply."
              : "You are about to cancel an option booking. No penalties will apply."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p>
              <span className="font-medium">Number of bookings to cancel:</span> {selectedBookingsCount}
            </p>
            <p>
              <span className="font-medium">Trip start date:</span> {format(tripStartDate, "PPP")}
            </p>
          </div>

          {bookingType === "confirmed" && (
            <div className="border p-4 rounded-md bg-amber-50">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <Label className="font-medium">Cancellation Policy</Label>
                  <p className="text-sm text-amber-700 mt-1">{penaltyMessage}</p>
                </div>
              </div>
              
              {penaltyPercentage > 0 && (
                <div className="mt-2 pt-2 border-t border-amber-200">
                  <p className="text-sm font-medium text-amber-700">
                    Applying {penaltyPercentage}% cancellation fee
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="bg-gray-50 p-3 rounded-md text-sm">
            <p>
              {bookingType === "confirmed" 
                ? "This action is irreversible. The booking will be canceled and the applicable penalty will be processed."
                : "This action is irreversible. The option booking will be canceled immediately."}
            </p>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep Booking
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm} 
            disabled={isPending}
          >
            {isPending ? "Canceling..." : "Confirm Cancellation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
