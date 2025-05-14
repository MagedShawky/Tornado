
import { Badge } from "@/components/ui/badge";

interface TripImageSectionProps {
  imageUrl: string;
  imageAlt: string;
  hasBookedSpots: number;
  discountPercentage: number;
}

export function TripImageSection({ 
  imageUrl, 
  imageAlt, 
  hasBookedSpots, 
  discountPercentage 
}: TripImageSectionProps) {
  return (
    <div className="md:w-1/3 relative overflow-hidden h-48 md:h-auto">
      <img 
        src={imageUrl} 
        alt={imageAlt} 
        className="w-full h-full object-cover"
      />
      {hasBookedSpots > 0 && (
        <Badge className="absolute top-2 left-2 bg-green-500">
          Guaranteed Departure
        </Badge>
      )}
      {discountPercentage > 0 && (
        <Badge className="absolute top-2 right-2 bg-red-500">
          {discountPercentage}% OFF
        </Badge>
      )}
    </div>
  );
}
