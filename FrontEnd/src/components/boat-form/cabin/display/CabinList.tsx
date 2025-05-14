
import { Cabin } from "@/types/database";
import { CabinCard } from "./CabinCard";

interface CabinListProps {
  cabins: Cabin[];
  onEdit: (cabin: Cabin) => void;
  onDelete: (cabinId: string) => void;
  allowEditing?: boolean;
}

export function CabinList({ cabins, onEdit, onDelete, allowEditing }: CabinListProps) {
  const cabinsByDeck = cabins.reduce<Record<string, typeof cabins>>((acc, cabin) => {
    if (!acc[cabin.deck]) {
      acc[cabin.deck] = [];
    }
    acc[cabin.deck].push(cabin);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(cabinsByDeck).map(([deck, deckCabins]) => (
        <div key={deck} className="space-y-4">
          <h4 className="text-md font-medium text-gray-700 border-b pb-2">
            {deck} Deck
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deckCabins.map((cabin) => (
              <CabinCard
                key={cabin.id}
                cabin={cabin}
                onEdit={onEdit}
                onDelete={onDelete}
                allowEditing={allowEditing}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
