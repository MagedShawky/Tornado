
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TravelInfoProps } from "./useTravelInfo";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";

interface FlightInfoTableProps {
  travelInfo: TravelInfoProps[];
  onInfoChange: (index: number, field: keyof TravelInfoProps, value: string | Date | boolean) => void;
}

export function FlightInfoTable({ travelInfo, onInfoChange }: FlightInfoTableProps) {
  return (
    <div className="mb-8 overflow-x-auto">
      <Table className="w-full border-collapse">
        <TableHeader className="bg-blue-50">
          <TableRow>
            <TableHead colSpan={3} className="p-2 text-left border font-medium">Clients Info</TableHead>
            <TableHead colSpan={4} className="p-2 text-left border font-medium">Arrival</TableHead>
            <TableHead colSpan={4} className="p-2 text-left border font-medium">Departure</TableHead>
          </TableRow>
          <TableRow>
            <TableHead className="p-2 text-left border font-medium w-12">Bed N.</TableHead>
            <TableHead className="p-2 text-left border font-medium">Name</TableHead>
            <TableHead className="p-2 text-left border font-medium">Surname</TableHead>
            <TableHead className="p-2 text-left border font-medium">Arrival date</TableHead>
            <TableHead className="p-2 text-left border font-medium">Flight arrival number</TableHead>
            <TableHead className="p-2 text-left border font-medium">Flight arrival time</TableHead>
            <TableHead className="p-2 text-left border font-medium">Flight from / to</TableHead>
            <TableHead className="p-2 text-left border font-medium">Departure date</TableHead>
            <TableHead className="p-2 text-left border font-medium">Flight departure number</TableHead>
            <TableHead className="p-2 text-left border font-medium">Flight departure time</TableHead>
            <TableHead className="p-2 text-left border font-medium">Flight from / to</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {travelInfo.map((info, index) => (
            <TableRow key={index}>
              <TableCell className="p-2 border bg-gray-500 text-white text-center">{info.bedNumber}</TableCell>
              <TableCell className="p-2 border">{info.name}</TableCell>
              <TableCell className="p-2 border">{info.surname}</TableCell>
              <TableCell className="p-2 border">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !info.arrivalDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {info.arrivalDate ? format(info.arrivalDate, "MM/dd/yyyy") : "mm/dd/yyyy"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={info.arrivalDate}
                      onSelect={(date) => onInfoChange(index, 'arrivalDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </TableCell>
              <TableCell className="p-2 border">
                <Input 
                  value={info.flightArrivalNumber} 
                  onChange={(e) => onInfoChange(index, 'flightArrivalNumber', e.target.value)}
                />
              </TableCell>
              <TableCell className="p-2 border">
                <Input 
                  value={info.flightArrivalTime} 
                  onChange={(e) => onInfoChange(index, 'flightArrivalTime', e.target.value)}
                  placeholder="HH:MM"
                />
              </TableCell>
              <TableCell className="p-2 border">
                <Input 
                  value={info.flightArrivalFrom} 
                  onChange={(e) => onInfoChange(index, 'flightArrivalFrom', e.target.value)}
                />
              </TableCell>
              <TableCell className="p-2 border">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !info.departureDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {info.departureDate ? format(info.departureDate, "MM/dd/yyyy") : "mm/dd/yyyy"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={info.departureDate}
                      onSelect={(date) => onInfoChange(index, 'departureDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </TableCell>
              <TableCell className="p-2 border">
                <Input 
                  value={info.flightDepartureNumber} 
                  onChange={(e) => onInfoChange(index, 'flightDepartureNumber', e.target.value)}
                />
              </TableCell>
              <TableCell className="p-2 border">
                <Input 
                  value={info.flightDepartureTime} 
                  onChange={(e) => onInfoChange(index, 'flightDepartureTime', e.target.value)}
                  placeholder="HH:MM"
                />
              </TableCell>
              <TableCell className="p-2 border">
                <Input 
                  value={info.flightDepartureTo} 
                  onChange={(e) => onInfoChange(index, 'flightDepartureTo', e.target.value)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
