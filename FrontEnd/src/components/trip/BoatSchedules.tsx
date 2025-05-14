
import * as React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import type { Database } from "@/integrations/supabase/types";
import { getSortedTrips, wouldTripConflictWithBuffers } from "./boatSelectionUtils";

type Boat = Database["public"]["Tables"]["boats"]["Row"];
type Trip = Database["public"]["Tables"]["trips"]["Row"];

interface BoatSchedulesProps {
  allBoats: Boat[] | undefined;
  availableBoats: Boat[] | undefined;
  tripsByBoat: Record<string, Trip[]>;
  overlappingTrips: Trip[] | undefined;
  startDate?: Date;
  endDate?: Date;
}

export function BoatSchedules({
  allBoats,
  availableBoats,
  tripsByBoat,
  overlappingTrips,
  startDate,
  endDate
}: BoatSchedulesProps) {
  if (!allBoats || allBoats.length === 0) return null;

  return (
    <div className="mt-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="boat-schedules">
          <AccordionTrigger className="text-sm">
            View boat schedules ({allBoats.length} boats)
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              {allBoats.map(boat => {
                const boatTrips = getSortedTrips(boat.id, tripsByBoat);
                const isAvailable = availableBoats?.some(b => b.id === boat.id);
                
                return (
                  <div key={boat.id} className={`border p-4 rounded-lg ${isAvailable ? 'border-green-300 bg-green-50' : 'border-gray-300'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{boat.name} (Capacity: {boat.capacity})</h4>
                      {isAvailable ? (
                        <Badge className="bg-green-500">Available</Badge>
                      ) : (
                        <Badge className="bg-red-500">Unavailable</Badge>
                      )}
                    </div>
                    
                    <div className="text-sm">
                      <p className="text-muted-foreground mb-2">Boat Status: <span className="font-medium">{boat.status}</span></p>
                      
                      {boatTrips.length > 0 ? (
                        <>
                          <p className="font-medium mt-2 mb-1">Scheduled Trips:</p>
                          <div className="space-y-2">
                            {boatTrips.map(trip => {
                              const isDirectlyOverlapping = overlappingTrips?.some(t => t.id === trip.id);
                              const isBufferOverlapping = !isDirectlyOverlapping && wouldTripConflictWithBuffers(trip, startDate, endDate);
                              
                              return (
                                <div 
                                  key={trip.id} 
                                  className={`p-2 rounded ${
                                    isDirectlyOverlapping 
                                      ? 'bg-red-100 border border-red-200' 
                                      : isBufferOverlapping 
                                        ? 'bg-amber-100 border border-amber-200'
                                        : 'bg-gray-100'
                                  }`}
                                >
                                  <div className="flex justify-between">
                                    <span>{trip.destination}</span>
                                    {isDirectlyOverlapping && startDate && endDate && (
                                      <Badge className="bg-red-500">Conflicts with selection</Badge>
                                    )}
                                    {isBufferOverlapping && startDate && endDate && (
                                      <Badge className="bg-amber-500">Conflicts with buffer day</Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    {format(new Date(trip.start_date), "MMM d, yyyy")} - {format(new Date(trip.end_date), "MMM d, yyyy")}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <p className="italic text-gray-500">No scheduled trips</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
