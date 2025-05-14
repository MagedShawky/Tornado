
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
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { CabinBooking } from "@/types/database";
import { toast } from "@/components/ui/use-toast";

interface PassengerDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (passengerDetails: PassengerDetail[]) => void;
  isPending: boolean;
  selectedCount: number;
  totalPrice: number;
  bookingType: "option" | "confirm" | "waitlist";
  cancelDate: Date | undefined;
  setCancelDate: (date: Date | undefined) => void;
  selectedBeds: {
    cabinId: string;
    bedNumber: number;
    price: number;
  }[];
  groupName: string;
  cabinBookings: CabinBooking[];
}

interface PassengerDetail {
  cabinId: string;
  bedNumber: number;
  gender: string;
  groupName: string;
}

export function PassengerDetailsModal({
  isOpen,
  onOpenChange,
  onConfirm,
  isPending,
  selectedCount,
  totalPrice,
  bookingType,
  cancelDate,
  setCancelDate,
  selectedBeds,
  groupName,
  cabinBookings = []
}: PassengerDetailsModalProps) {
  const [passengerDetails, setPassengerDetails] = useState<PassengerDetail[]>([]);

  // Initialize passenger details when selected beds change
  useEffect(() => {
    if (selectedBeds.length > 0) {
      const cabinGenderRestrictions = getCabinGenderRestrictions();
      
      const details = selectedBeds.map(bed => {
        // Check if this cabin has a gender restriction
        const gender = cabinGenderRestrictions[bed.cabinId] || "";
        
        return {
          cabinId: bed.cabinId,
          bedNumber: bed.bedNumber,
          gender: gender, // Use the restricted gender if available, otherwise empty
          groupName: groupName || "default"
        };
      });
      
      setPassengerDetails(details);
    } else {
      setPassengerDetails([]);
    }
  }, [selectedBeds, groupName, isOpen, cabinBookings]);

  const handleGenderChange = (index: number, gender: string) => {
    const updatedDetails = [...passengerDetails];
    if (updatedDetails[index]) {
      updatedDetails[index].gender = gender;
      setPassengerDetails(updatedDetails);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate all passengers have gender selected
    const invalidPassenger = passengerDetails.find(p => !p.gender);
    if (invalidPassenger) {
      toast.error("Missing information", {
        description: "Please select gender for all passengers",
      });
      return;
    }
    
    onConfirm(passengerDetails);
  };

  // Find gender restrictions for each cabin
  const getCabinGenderRestrictions = () => {
    const restrictions: Record<string, string | null> = {};
    
    // Group bookings by cabin
    const cabinBookingMap: Record<string, CabinBooking[]> = {};
    
    if (Array.isArray(cabinBookings)) {
      cabinBookings.forEach(booking => {
        const key = booking.cabin_id;
        if (!cabinBookingMap[key]) {
          cabinBookingMap[key] = [];
        }
        cabinBookingMap[key].push(booking);
      });
    }
    
    // Check if there's a consistent gender in each cabin's bookings
    Object.entries(cabinBookingMap).forEach(([cabinId, bookings]) => {
      if (bookings.length === 0) return;
      
      // Get all the genders from bookings in this cabin
      const genders = bookings
        .map(booking => booking.passenger_gender)
        .filter(gender => gender === "Male" || gender === "Female"); 
      
      // If there's at least one gendered booking and they're all the same gender
      if (genders.length > 0 && new Set(genders).size === 1) {
        restrictions[cabinId] = genders[0];
      }
    });
    
    return restrictions;
  };
  
  const cabinGenderRestrictions = getCabinGenderRestrictions();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {bookingType === "confirm" ? "Confirm Booking" : 
             bookingType === "waitlist" ? "Waitlist Booking" : "Option Booking"}
          </DialogTitle>
          <DialogDescription>
            Please provide passenger details for each selected bed
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto">
          <ScrollArea className="h-full pr-4 max-h-[50vh]">
            <div className="space-y-4">
              {bookingType !== "confirm" && (
                <div className="space-y-2">
                  <Label htmlFor="cancel-date">Expiration Date</Label>
                  <DatePicker
                    date={cancelDate}
                    setDate={setCancelDate}
                    disabled={isPending}
                  />
                </div>
              )}

              <div>
                <p>
                  <span className="font-medium">Group Name:</span> {groupName}
                </p>
                <p>
                  <span className="font-medium">Total Price:</span> €{totalPrice}
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Passenger Details</h3>
                
                {Array.isArray(passengerDetails) && passengerDetails.map((passenger, index) => {
                  const cabinGenderRestriction = cabinGenderRestrictions[passenger.cabinId];
                  
                  return (
                    <div key={`${passenger.cabinId}-${passenger.bedNumber}`} className="space-y-2 border p-3 rounded-md">
                      <div className="flex justify-between">
                        <p>Bed {passenger.bedNumber}</p>
                        {cabinGenderRestriction && (
                          <p className="text-sm text-blue-600">
                            {cabinGenderRestriction === "Male" ? "Male only cabin" : "Female only cabin"}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`gender-${index}`}>Passenger Gender</Label>
                        <Select 
                          value={passenger.gender} 
                          onValueChange={(value) => handleGenderChange(index, value)}
                          disabled={!!cabinGenderRestriction}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male" disabled={cabinGenderRestriction === "Female"}>Male</SelectItem>
                            <SelectItem value="Female" disabled={cabinGenderRestriction === "Male"}>Female</SelectItem>
                          </SelectContent>
                        </Select>
                        {cabinGenderRestriction && (
                          <input 
                            type="hidden" 
                            value={cabinGenderRestriction} 
                            onChange={() => {}}
                          />
                        )}
                        {cabinGenderRestriction && (
                          <p className="text-xs text-gray-500">
                            This cabin already has {cabinGenderRestriction} passengers
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              const formEvent = new Event('submit', { cancelable: true }) as unknown as React.FormEvent<HTMLFormElement>;
              handleSubmit(formEvent);
            }} 
            disabled={isPending}
          >
            {isPending ? "Processing..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
