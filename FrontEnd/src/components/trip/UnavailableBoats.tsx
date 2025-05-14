
import * as React from "react";
import { format } from "date-fns";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import type { Database } from "@/integrations/supabase/types";
import { isDirectConflict } from "./boatSelectionUtils";

type Boat = Database["public"]["Tables"]["boats"]["Row"];
type Trip = Database["public"]["Tables"]["trips"]["Row"];

interface UnavailableBoatsProps {
  bookedBoatsWithTrips: { boat: Boat, trips: Trip[] }[];
  startDate?: Date;
  endDate?: Date;
}

export function UnavailableBoats({
  bookedBoatsWithTrips,
  startDate,
  endDate
}: UnavailableBoatsProps) {
  if (!startDate || !endDate || bookedBoatsWithTrips.length === 0) return null;

  return (
    <div className="mt-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="unavailable-boats">
          <AccordionTrigger className="text-sm">
            View {bookedBoatsWithTrips.length} unavailable boats
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 text-sm">
              {bookedBoatsWithTrips.map(({ boat, trips }) => (
                <div key={boat.id} className="border p-3 rounded-md">
                  <h4 className="font-medium">{boat.name} (Capacity: {boat.capacity})</h4>
                  <p className="text-muted-foreground mt-1">This boat is unavailable because of the following trips:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    {trips.map(trip => {
                      const isDirectConflictFlag = isDirectConflict(trip, startDate, endDate);
                      
                      return (
                        <li key={trip.id} className={isDirectConflictFlag ? "text-red-600" : "text-amber-600"}>
                          {trip.destination}: {format(new Date(trip.start_date), "MMM d, yyyy")} to {format(new Date(trip.end_date), "MMM d, yyyy")}
                          {!isDirectConflictFlag && " (buffer day conflict)"}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
