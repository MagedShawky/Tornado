
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TravelInfoProps } from "./useTravelInfo";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";

interface TransferDepartureTableProps {
  travelInfo: TravelInfoProps[];
  onInfoChange: (index: number, field: keyof TravelInfoProps, value: string | Date | boolean) => void;
}

export function TransferDepartureTable({ travelInfo, onInfoChange }: TransferDepartureTableProps) {
  return (
    <div className="mb-8 overflow-x-auto">
      <Table className="w-full border-collapse">
        <TableHeader className="bg-blue-50">
          <TableRow>
            <TableHead colSpan={1} className="p-2 text-left border font-medium">Clients Info</TableHead>
            <TableHead colSpan={3} className="p-2 text-left border font-medium">Transfer at departure</TableHead>
            <TableHead colSpan={3} className="p-2 text-left border font-medium">Hotel at departure</TableHead>
          </TableRow>
          <TableRow>
            <TableHead className="p-2 text-left border font-medium w-12">Bed N.</TableHead>
            <TableHead className="p-2 text-left border font-medium">Transfer Boat / Airport</TableHead>
            <TableHead className="p-2 text-left border font-medium">Transfer Boat / Hotel</TableHead>
            <TableHead className="p-2 text-left border font-medium">Transfer Hotel / Airport</TableHead>
            <TableHead className="p-2 text-left border font-medium">Night Hotel</TableHead>
            <TableHead className="p-2 text-left border font-medium">Day Use Hotel</TableHead>
            <TableHead className="p-2 text-left border font-medium">Departure Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {travelInfo.map((info, index) => (
            <TableRow key={index}>
              <TableCell className="p-2 border bg-gray-500 text-white text-center">{info.bedNumber}</TableCell>
              <TableCell className="p-2 border">
                <Select 
                  value={info.transferBoatToAirport}
                  onValueChange={(value) => onInfoChange(index, 'transferBoatToAirport', value)}
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
                  value={info.transferBoatToHotelDeparture}
                  onValueChange={(value) => onInfoChange(index, 'transferBoatToHotelDeparture', value)}
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
                  value={info.transferHotelToAirport}
                  onValueChange={(value) => onInfoChange(index, 'transferHotelToAirport', value)}
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
                  value={info.nightHotelDeparture}
                  onValueChange={(value) => onInfoChange(index, 'nightHotelDeparture', value)}
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
                  value={info.dayUseHotelDeparture}
                  onValueChange={(value) => onInfoChange(index, 'dayUseHotelDeparture', value)}
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
                  value={info.departureNotes} 
                  onChange={(e) => onInfoChange(index, 'departureNotes', e.target.value)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
