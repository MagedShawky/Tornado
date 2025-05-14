
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function RentalTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-24">Bed Number</TableHead>
        <TableHead>Equipment</TableHead>
        <TableHead>Size</TableHead>
        <TableHead>Brand</TableHead>
        <TableHead>Quantity</TableHead>
        <TableHead>Days</TableHead>
        <TableHead>Price/Unit</TableHead>
        <TableHead>Total Price</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Notes</TableHead>
        <TableHead className="w-10"></TableHead>
      </TableRow>
    </TableHeader>
  );
}
