
import { Badge } from "@/components/ui/badge";

interface TripListItemHeaderProps {
  destination: string;
  duration: number;
  badgeComponent: React.ReactNode;
}

export function TripListItemHeader({ 
  destination, 
  duration, 
  badgeComponent 
}: TripListItemHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-lg font-bold">{destination}</h3>
        <p className="text-sm text-gray-500">{duration} Days Liveaboard</p>
      </div>
      {badgeComponent}
    </div>
  );
}
