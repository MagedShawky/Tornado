
import { Trip } from "@/types/database";
import { TripListItem } from "./TripListItem";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarX } from "lucide-react";

interface TripListProps {
  trips: (Trip & { 
    boat: { 
      name: string; 
      feature_photo: string;
      capacity: number;
    } | null 
  })[];
  isLoading: boolean;
}

export function TripList({ trips, isLoading }: TripListProps) {
  const [showPastTrips, setShowPastTrips] = useState(false);
  
  if (isLoading) {
    return <div className="flex justify-center py-12">Loading trips...</div>;
  }

  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg text-gray-600 mb-2">No trips found</p>
        <p className="text-sm text-gray-500">Try adjusting your filters to see more results</p>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison

  const currentTrips = trips.filter(trip => {
    const endDate = new Date(trip.end_date);
    return endDate >= today;
  });
  
  const pastTrips = trips.filter(trip => {
    const endDate = new Date(trip.end_date);
    return endDate < today;
  });

  const hasCurrentTrips = currentTrips.length > 0;
  const hasPastTrips = pastTrips.length > 0;
  
  return (
    <div>
      {hasPastTrips && (
        <div className="flex justify-end mb-4">
          <Button 
            variant="outline" 
            onClick={() => setShowPastTrips(!showPastTrips)}
            className="flex items-center gap-2"
          >
            {showPastTrips ? (
              <>
                <CalendarX className="h-4 w-4" />
                Hide Past Trips
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4" />
                Show Past Trips ({pastTrips.length})
              </>
            )}
          </Button>
        </div>
      )}
      
      <div className="grid gap-6">
        {currentTrips.map((trip) => (
          <TripListItem key={trip.id} trip={trip} />
        ))}
        
        {showPastTrips && pastTrips.length > 0 && (
          <>
            {hasCurrentTrips && (
              <div className="border-t pt-6 mt-2">
                <h2 className="text-lg font-medium text-gray-600 mb-4">Past Trips</h2>
              </div>
            )}
            
            {pastTrips.map((trip) => (
              <TripListItem key={trip.id} trip={trip} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
