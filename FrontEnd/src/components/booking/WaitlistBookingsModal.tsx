
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useBookMutation } from "@/hooks/useBookMutation";
import { toast } from "@/components/ui/use-toast";
import { addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface WaitlistBookingsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  isPending: boolean;
  maxCount: number;
}

export function WaitlistBookingsModal({
  isOpen,
  onOpenChange,
  tripId,
  isPending,
  maxCount
}: WaitlistBookingsModalProps) {
  const [bedsToAdd, setBedsToAdd] = useState(1);
  const [gender, setGender] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelDate, setCancelDate] = useState<Date | undefined>(addDays(new Date(), 15));
  const [groupName, setGroupName] = useState("waitlist");
  const [boatId, setBoatId] = useState<string | null>(null);

  const bookMutation = useBookMutation();

  useEffect(() => {
    async function fetchBoatId() {
      const { data, error } = await supabase
        .from("trips")
        .select("boat_id")
        .eq("id", tripId)
        .single();

      if (error) {
        console.error("Error fetching boat ID:", error);
        return;
      }

      setBoatId(data?.boat_id);
    }

    if (tripId) {
      fetchBoatId();
    }
  }, [tripId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!gender) {
      toast.error("Missing information", {
        description: "Please select a gender"
      });
      return;
    }
    
    if (bedsToAdd <= 0 || bedsToAdd > maxCount) {
      toast.error("Invalid number of beds", {
        description: `Please select between 1 and ${maxCount} beds`
      });
      return;
    }
    
    if (!tripId) {
      toast.error("Missing trip", {
        description: "Trip ID is required"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get a valid cabin from the trip's boat to use for the waitlist entry
      const { data: cabinData, error: cabinError } = await supabase
        .from("cabins")
        .select("id")
        .eq("boat_id", boatId)
        .limit(1)
        .single();
        
      if (cabinError || !cabinData) {
        throw new Error("Could not find a cabin to associate with the waitlist entry");
      }
      
      // Get the highest bed number currently used for this cabin in waitlist
      const { data: highestBedData } = await supabase
        .from("cabin_bookings")
        .select("bed_number")
        .eq("trip_id", tripId)
        .eq("cabin_id", cabinData.id)
        .order("bed_number", { ascending: false })
        .limit(1);
        
      // Start bed numbers from after the highest used number or from 1000 (to avoid conflicts)
      let startBedNumber = 1000;
      if (highestBedData && highestBedData.length > 0) {
        const highestBed = highestBedData[0].bed_number;
        startBedNumber = Math.max(startBedNumber, highestBed + 1);
      }

      // Create dummy beds for waitlist with a valid cabin_id and unique bed numbers
      const bedsToBook = Array.from({ length: bedsToAdd }, (_, i) => ({
        cabinId: cabinData.id, // Use a real cabin ID from the boat
        bedNumber: startBedNumber + i, // Use unique bed numbers starting from the calculated value
        price: 0, // Price isn't relevant for waitlist
        passengerGender: gender,
        groupName: groupName || "waitlist"
      }));

      console.log("Adding waitlist entries with bed numbers starting from:", startBedNumber);

      // Use the booking mutation
      await bookMutation.mutateAsync({
        tripId,
        bedsToBook,
        bookingType: "waitlist",
        cancelDate: cancelDate,
        onSuccess: () => {
          toast.success("Success", {
            description: `Successfully added ${bedsToAdd} spot(s) to the waitlist!`
          });
          onOpenChange(false);
        }
      });
      
    } catch (error) {
      console.error("Error adding to waitlist:", error);
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to add to waitlist"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Waitlist</DialogTitle>
          <DialogDescription>
            Add spots to the waitlist for this trip.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="beds">Number of Beds</Label>
            <Input
              type="number"
              id="beds"
              defaultValue="1"
              min="1"
              max={maxCount}
              onChange={(e) => setBedsToAdd(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select onValueChange={setGender} value={gender}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="any">Any</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="cancel-date">Cancel Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !cancelDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {cancelDate ? format(cancelDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center" side="bottom">
                <Calendar
                  mode="single"
                  selected={cancelDate}
                  onSelect={setCancelDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending || isSubmitting}>
              {isPending || isSubmitting ? "Submitting..." : "Add to Waitlist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
