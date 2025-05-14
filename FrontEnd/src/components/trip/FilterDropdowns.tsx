
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SimplifiedBoat {
  id: string;
  name: string;
}

interface FilterDropdownsProps {
  selectedBoat: string;
  selectedDestination: string;
  boats?: SimplifiedBoat[];
  destinations?: string[];
  onBoatChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
}

export function FilterDropdowns({
  selectedBoat,
  selectedDestination,
  boats,
  destinations,
  onBoatChange,
  onDestinationChange
}: FilterDropdownsProps) {
  return (
    <>
      <div className="col-span-1">
        <Label>Nation</Label>
        <Select>
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="--- All ---" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-1">
        <Label>Boats</Label>
        <Select value={selectedBoat} onValueChange={onBoatChange}>
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="--- All ---" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {boats?.map((boat) => (
              <SelectItem key={boat.id} value={boat.id}>
                {boat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-1">
        <Label>Itinerary</Label>
        <Select value={selectedDestination} onValueChange={onDestinationChange}>
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="--- All ---" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_destinations">All</SelectItem>
            {destinations?.map((destination) => (
              <SelectItem key={destination} value={destination}>
                {destination}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-1">
        <Label>Availability</Label>
        <Select>
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="Available" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="sold-out">Sold Out</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
