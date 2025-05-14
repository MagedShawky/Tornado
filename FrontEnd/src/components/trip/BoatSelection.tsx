
import * as React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import type { Database } from "@/integrations/supabase/types";
import { BoatSchedules } from "./BoatSchedules";
import { UnavailableBoats } from "./UnavailableBoats";
import { getBookedBoats, getBookedBoatsWithTrips } from "./boatSelectionUtils";

type Boat = Database["public"]["Tables"]["boats"]["Row"];
type Trip = Database["public"]["Tables"]["trips"]["Row"];

interface BoatSelectionProps {
  form: UseFormReturn<any>;
  availableBoats: Boat[] | undefined;
  isLoading: boolean;
  allBoats?: Boat[] | undefined;
  overlappingTrips?: Trip[] | undefined;
  startDate?: Date;
  endDate?: Date;
  tripsByBoat?: Record<string, Trip[]>;
  allTrips?: Trip[] | undefined;
  editingTripId?: string;
}

export function BoatSelection({ 
  form, 
  availableBoats, 
  isLoading, 
  allBoats = [],
  overlappingTrips = [],
  startDate,
  endDate,
  tripsByBoat = {},
  allTrips = [],
  editingTripId
}: BoatSelectionProps) {
  // Get the currently selected boat ID
  const currentBoatId = form.getValues("boat_id");
  
  // If editing a trip, find the boat even if it's not in available boats
  const selectedBoat = React.useMemo(() => {
    if (!currentBoatId) return null;
    
    // First check in available boats
    const boat = availableBoats?.find(b => b.id === currentBoatId);
    if (boat) return boat;
    
    // If not found and we're editing, check in all boats
    if (editingTripId) {
      return allBoats?.find(b => b.id === currentBoatId) || null;
    }
    
    return null;
  }, [currentBoatId, availableBoats, allBoats, editingTripId]);
  
  // Clear the selected boat if it's no longer available and we're not editing
  React.useEffect(() => {
    if (!editingTripId && currentBoatId && availableBoats && 
        !availableBoats.some(boat => boat.id === currentBoatId)) {
      console.log("Selected boat is no longer available, clearing selection");
      form.setValue("boat_id", "");
    }
  }, [availableBoats, form, currentBoatId, editingTripId]);

  const getPlaceholderText = () => {
    if (isLoading) return "Loading boats...";
    if (!availableBoats) return "No boats data";
    if (availableBoats.length === 0) return "No boats available for selected dates";
    return "Select a boat";
  };

  // Get booked boats and their trips
  const bookedBoats = React.useMemo(() => 
    getBookedBoats(allBoats, availableBoats), 
    [allBoats, availableBoats]
  );

  const bookedBoatsWithTrips = React.useMemo(() => 
    getBookedBoatsWithTrips(bookedBoats, overlappingTrips), 
    [bookedBoats, overlappingTrips]
  );

  // Create a combined list of boats for selection when editing
  const selectableBoats = React.useMemo(() => {
    if (editingTripId && selectedBoat && !availableBoats?.some(b => b.id === selectedBoat.id)) {
      // If editing and the selected boat is not in available boats, add it
      return [...(availableBoats || []), selectedBoat];
    }
    return availableBoats || [];
  }, [availableBoats, selectedBoat, editingTripId]);

  console.log("Boat selection rendering with", selectableBoats?.length || 0, "selectable boats");

  return (
    <>
      <FormField
        control={form.control}
        name="boat_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Available Boats</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value}
              disabled={isLoading || (!editingTripId && (!availableBoats || availableBoats.length === 0))}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={getPlaceholderText()} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {selectableBoats.length === 0 && (
                  <SelectItem value="none" disabled>
                    No boats available for selected dates
                  </SelectItem>
                )}
                {selectableBoats.length > 0 && selectableBoats.map((boat) => (
                  <SelectItem key={boat.id} value={boat.id}>
                    {boat.name} (Capacity: {boat.capacity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Show boat schedules */}
      <BoatSchedules 
        allBoats={allBoats}
        availableBoats={availableBoats}
        tripsByBoat={tripsByBoat}
        overlappingTrips={overlappingTrips}
        startDate={startDate}
        endDate={endDate}
      />

      {/* Show unavailable boats with conflicts */}
      <UnavailableBoats 
        bookedBoatsWithTrips={bookedBoatsWithTrips}
        startDate={startDate}
        endDate={endDate}
      />
    </>
  );
}
