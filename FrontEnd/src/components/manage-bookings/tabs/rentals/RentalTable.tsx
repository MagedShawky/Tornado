
import { Table, TableBody } from "@/components/ui/table";
import { RentalTableHeader } from "./RentalTableHeader";
import { RentalTableRow } from "./RentalTableRow";
import { Rental } from "./types";

interface RentalTableProps {
  rentals: Rental[];
  availableBeds: number[];
  onRentalChange: (index: number, field: keyof Rental, value: any) => void;
  onRemoveRental: (index: number) => void;
}

export function RentalTable({ 
  rentals,
  availableBeds,
  onRentalChange,
  onRemoveRental
}: RentalTableProps) {
  return (
    <div className="border rounded-md">
      <div className="overflow-x-auto">
        <Table>
          <RentalTableHeader />
          <TableBody>
            {rentals.map((rental, index) => (
              <RentalTableRow 
                key={index}
                rental={rental}
                index={index}
                availableBeds={availableBeds}
                onRentalChange={onRentalChange}
                onRemoveRental={onRemoveRental}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
