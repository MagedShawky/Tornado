
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TravelInfoProps } from "./useTravelInfo";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";

interface TransferArrivalTableProps {
  travelInfo: TravelInfoProps[];
  onInfoChange: (index: number, field: keyof TravelInfoProps, value: string | Date | boolean) => void;
}

export function TransferArrivalTable({ travelInfo, onInfoChange }: TransferArrivalTableProps) {
  return (
    <div className="mb-8 overflow-x-auto">
      <Table className="w-full border-collapse">
        <TableHeader className="bg-blue-50">
          <TableRow>
            <TableHead colSpan={1} className="p-2 text-left border font-medium">Clients Info</TableHead>
            <TableHead colSpan={3} className="p-2 text-left border font-medium"></TableHead>
            <TableHead colSpan={3} className="p-2 text-left border font-medium">Hotel at arrival</TableHead>
          </TableRow>
          <TableRow>
            <TableHead className="p-2 text-left border font-medium w-12">Bed N.</TableHead>
            <TableHead className="p-2 text-left border font-medium">Transfer Airport / Boat</TableHead>
            <TableHead className="p-2 text-left border font-medium">Transfer Boat / Hotel</TableHead>
            <TableHead className="p-2 text-left border font-medium">Transfer Hotel / Boat</TableHead>
            <TableHead className="p-2 text-left border font-medium">Night Hotel</TableHead>
            <TableHead className="p-2 text-left border font-medium">Day use Hotel</TableHead>
            <TableHead className="p-2 text-left border font-medium">Arrival Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {travelInfo.map((info, index) => (
            <TableRow key={index}>
              <TableCell className="p-2 border bg-gray-500 text-white text-center">{info.bedNumber}</TableCell>
              <TableCell className="p-2 border">
                <Select 
                  value={info.transferAirportToBoat}
                  onValueChange={(value) => onInfoChange(index, 'transferAirportToBoat', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="--">--</SelectItem>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="p-2 border">
                <Select 
                  value={info.transferBoatToHotel}
                  onValueChange={(value) => onInfoChange(index, 'transferBoatToHotel', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="--">--</SelectItem>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="p-2 border">
                <Select 
                  value={info.transferHotelToBoat}
                  onValueChange={(value) => onInfoChange(index, 'transferHotelToBoat', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="--">--</SelectItem>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="p-2 border">
                <Select 
                  value={info.nightHotel}
                  onValueChange={(value) => onInfoChange(index, 'nightHotel', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="------">------</SelectItem>
                    <SelectItem value="Hotel 1">Hotel 1</SelectItem>
                    <SelectItem value="Hotel 2">Hotel 2</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="p-2 border">
                <Select 
                  value={info.dayUseHotel}
                  onValueChange={(value) => onInfoChange(index, 'dayUseHotel', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="------">------</SelectItem>
                    <SelectItem value="Hotel 1">Hotel 1</SelectItem>
                    <SelectItem value="Hotel 2">Hotel 2</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="p-2 border">
                <Input 
                  value={info.arrivalNotes} 
                  onChange={(e) => onInfoChange(index, 'arrivalNotes', e.target.value)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
