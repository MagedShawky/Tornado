
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Rental } from "./types";

interface RentalTableRowProps {
  rental: Rental;
  index: number;
  availableBeds: number[];
  onRentalChange: (index: number, field: keyof Rental, value: any) => void;
  onRemoveRental: (index: number) => void;
}

export function RentalTableRow({ 
  rental, 
  index, 
  availableBeds,
  onRentalChange, 
  onRemoveRental 
}: RentalTableRowProps) {
  return (
    <TableRow key={index}>
      <TableCell>
        <Select 
          value={rental.bedNumber !== null ? rental.bedNumber.toString() : "no-bed"} 
          onValueChange={(value) => onRentalChange(index, 'bedNumber', value === "no-bed" ? null : Number(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select bed" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no-bed">No bed</SelectItem>
            {availableBeds.map((bedNumber) => (
              <SelectItem key={bedNumber} value={bedNumber.toString()}>
                {bedNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select 
          value={rental.equipmentType} 
          onValueChange={(value) => onRentalChange(index, 'equipmentType', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Equipment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="diving_gear">Diving Gear</SelectItem>
            <SelectItem value="wetsuit">Wetsuit</SelectItem>
            <SelectItem value="bcd">BCD</SelectItem>
            <SelectItem value="regulator">Regulator</SelectItem>
            <SelectItem value="fins">Fins</SelectItem>
            <SelectItem value="mask">Mask</SelectItem>
            <SelectItem value="snorkel">Snorkel</SelectItem>
            <SelectItem value="camera">Camera</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Input 
          value={rental.size} 
          onChange={(e) => onRentalChange(index, 'size', e.target.value)}
        />
      </TableCell>
      <TableCell>
        <Input 
          value={rental.brand} 
          onChange={(e) => onRentalChange(index, 'brand', e.target.value)}
        />
      </TableCell>
      <TableCell>
        <Input 
          type="number" 
          value={rental.quantity} 
          onChange={(e) => onRentalChange(index, 'quantity', e.target.value)}
        />
      </TableCell>
      <TableCell>
        <Input 
          type="number" 
          value={rental.rentPeriodDays} 
          onChange={(e) => onRentalChange(index, 'rentPeriodDays', e.target.value)}
        />
      </TableCell>
      <TableCell>
        <Input 
          type="number" 
          value={rental.pricePerUnit} 
          onChange={(e) => onRentalChange(index, 'pricePerUnit', e.target.value)}
        />
      </TableCell>
      <TableCell className="font-bold">
        {rental.totalPrice.toFixed(2)}
      </TableCell>
      <TableCell>
        <Select 
          value={rental.status} 
          onValueChange={(value) => onRentalChange(index, 'status', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Input 
          value={rental.notes} 
          onChange={(e) => onRentalChange(index, 'notes', e.target.value)}
        />
      </TableCell>
      <TableCell>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onRemoveRental(index)}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
