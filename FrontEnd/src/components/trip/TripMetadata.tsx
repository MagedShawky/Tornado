
import { format } from "date-fns";
import { Calendar, MapPin, Ship, Users } from "lucide-react";

interface TripMetadataProps {
  startDate: Date;
  endDate: Date;
  locationFrom: string;
  locationTo: string;
  boatName: string;
  bookedSpots: number;
  availableSpots: number;
}

export function TripMetadata({
  startDate,
  endDate,
  locationFrom,
  locationTo,
  boatName,
  bookedSpots,
  availableSpots,
}: TripMetadataProps) {
  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center text-sm">
        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
        <span>
          {format(startDate, "d MMM yyyy")} - {format(endDate, "d MMM yyyy")}
        </span>
      </div>
      
      <div className="flex items-center text-sm">
        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
        <span>{locationFrom} to {locationTo}</span>
      </div>
      
      <div className="flex items-center text-sm">
        <Ship className="h-4 w-4 mr-2 text-gray-500" />
        <span>{boatName}</span>
      </div>
      
      <div className="flex items-center text-sm">
        <Users className="h-4 w-4 mr-2 text-gray-500" />
        <span>
          {bookedSpots} booked, {availableSpots} available
        </span>
      </div>
    </div>
  );
}
