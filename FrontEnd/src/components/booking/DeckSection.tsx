
import { Cabin, CabinBooking } from "@/types/database";
import { CabinCard } from "./CabinCard";

interface DeckSectionProps {
  deck: string;
  cabins: Cabin[];
  bookings: CabinBooking[];
  selectedCabin: string | null;
  selectedBed: number | null;
  onBedSelect: (cabinId: string, bedNumber: number, price: number) => void;
  tripPrice: number;
  isBedSelected: (cabinId: string, bedNumber: number) => boolean;
}

export function DeckSection({
  deck,
  cabins,
  bookings,
  selectedCabin,
  selectedBed,
  onBedSelect,
  tripPrice,
  isBedSelected
}: DeckSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold border-b pb-2">Deck {deck}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cabins.map(cabin => (
          <CabinCard
            key={cabin.id}
            cabin={cabin}
            bookings={bookings.filter(booking => booking.cabin_id === cabin.id)}
            selectedCabin={selectedCabin}
            selectedBed={selectedBed}
            onBedSelect={onBedSelect}
            tripPrice={tripPrice}
            isBedSelected={isBedSelected}
          />
        ))}
      </div>
    </div>
  );
}
