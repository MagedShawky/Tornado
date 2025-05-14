
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BookingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (groupName: string) => void;
  isPending: boolean;
  selectedCount: number;
  totalPrice: number;
  bookingType: "option" | "confirm" | "waitlist";
}

export function BookingModal({
  isOpen,
  onOpenChange,
  onConfirm,
  isPending,
  selectedCount,
  totalPrice,
  bookingType
}: BookingModalProps) {
  const [groupName, setGroupName] = useState("");
  
  useEffect(() => {
    // Reset the group name when the modal is opened
    if (isOpen) {
      setGroupName("");
    }
  }, [isOpen]);

  const handleConfirm = () => {
    // Use a default value if empty
    onConfirm(groupName || "default");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {bookingType === "confirm" ? "Confirm Booking" : 
             bookingType === "waitlist" ? "Waitlist Booking" : "Option Booking"}
          </DialogTitle>
          <DialogDescription>
            {bookingType === "confirm"
              ? "Your beds will be confirmed immediately."
              : bookingType === "waitlist"
              ? "Your beds will be added to the waitlist in case option bookings become available."
              : "Your beds will be held as an option until confirmation."}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto">
          <ScrollArea className="h-full pr-4 max-h-[50vh]">
            <div className="space-y-4">
              <div>
                <p>
                  <span className="font-medium">Beds selected:</span> {selectedCount}
                </p>
                <p>
                  <span className="font-medium">Total price:</span> €{totalPrice}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="group-name" className="font-medium text-lg">Group Name</Label>
                <Input 
                  id="group-name" 
                  value={groupName} 
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="border-2 border-blue-300"
                />
                <p className="text-sm text-blue-600">
                  Please enter a meaningful group name to help organize your bookings
                </p>
              </div>

              <p className="text-sm text-gray-500">
                Continuing will take you to the passenger details screen where you can enter gender for each passenger.
              </p>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isPending}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
