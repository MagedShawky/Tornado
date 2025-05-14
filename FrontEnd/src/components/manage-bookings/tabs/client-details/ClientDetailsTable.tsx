
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PassengerDetails } from "./useClientDetails";

interface ClientDetailsTableProps {
  passengers: PassengerDetails[];
  onPassengerChange: (index: number, field: keyof PassengerDetails, value: any) => void;
}

export function ClientDetailsTable({ passengers, onPassengerChange }: ClientDetailsTableProps) {
  // Sort passengers by bed number
  const sortedPassengers = [...passengers].sort((a, b) => a.bedNumber - b.bedNumber);

  // This function checks if a bed should be disabled due to another bed in the same cabin being marked as single use
  const isBedDisabled = (passenger: PassengerDetails): boolean => {
    // Find other beds in the same cabin
    const otherBedsInCabin = passengers.filter(p => 
      p.cabin === passenger.cabin && p.bedNumber !== passenger.bedNumber
    );
    
    // Check if any other bed in this cabin is marked as single use
    return otherBedsInCabin.some(p => p.singleUse);
  };

  return (
    <div className="overflow-x-auto mb-6">
      <table className="w-full border-collapse">
        <thead className="bg-blue-50">
          <tr className="text-sm font-medium text-left">
            <th className="p-2 border w-12">Bed</th>
            <th className="p-2 border w-24">Cabin</th>
            <th className="p-2 border w-28">Single Use</th>
            <th className="p-2 border">Group Name</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Surname</th>
            <th className="p-2 border">Category</th>
            <th className="p-2 border">Gender</th>
            <th className="p-2 border">Nationality</th>
          </tr>
        </thead>
        <tbody>
          {sortedPassengers.map((passenger, index) => {
            // Find the original index in the unsorted passengers array
            const originalIndex = passengers.findIndex(p => 
              p.bookingId === passenger.bookingId
            );
            
            const isDisabled = isBedDisabled(passenger);
            
            return (
              <tr 
                key={`${passenger.bookingId || index}`} 
                className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} ${isDisabled ? "opacity-50" : ""}`}
              >
                <td className="p-2 border bg-gray-500 text-white text-center">
                  {passenger.bedNumber}
                </td>
                <td className="p-2 border">{passenger.cabin}</td>
                <td className="p-2 border text-center">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      id={`single-use-${index}`}
                      checked={passenger.singleUse}
                      onCheckedChange={(checked) => {
                        console.log(`Single use checkbox changed for passenger ${index} to`, checked);
                        onPassengerChange(originalIndex, 'singleUse', !!checked);
                      }}
                    />
                    <Label htmlFor={`single-use-${index}`} className="ml-2 cursor-pointer">
                      Single
                    </Label>
                  </div>
                </td>
                <td className="p-2 border">
                  <Input
                    value={passenger.groupName || ""}
                    onChange={(e) => {
                      onPassengerChange(originalIndex, 'groupName', e.target.value);
                    }}
                    className="w-full"
                    disabled={isDisabled}
                  />
                </td>
                <td className="p-2 border">
                  <Input
                    value={passenger.name || ""}
                    onChange={(e) => {
                      onPassengerChange(originalIndex, 'name', e.target.value);
                    }}
                    className="w-full"
                    disabled={isDisabled}
                  />
                </td>
                <td className="p-2 border">
                  <Input
                    value={passenger.surname || ""}
                    onChange={(e) => {
                      onPassengerChange(originalIndex, 'surname', e.target.value);
                    }}
                    className="w-full"
                    disabled={isDisabled}
                  />
                </td>
                <td className="p-2 border">
                  <Select
                    value={passenger.category}
                    onValueChange={(value) => {
                      onPassengerChange(originalIndex, 'category', value);
                    }}
                    disabled={isDisabled}
                  >
                    <SelectTrigger>
                      <SelectValue>{passenger.category}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twin beds">Twin beds</SelectItem>
                      <SelectItem value="Suite double-bed">Suite double-bed</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-2 border">
                  <Select
                    value={passenger.gender || "--"}
                    onValueChange={(value) => {
                      onPassengerChange(originalIndex, 'gender', value);
                    }}
                    disabled={isDisabled}
                  >
                    <SelectTrigger>
                      <SelectValue>{passenger.gender || "--"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="--">Select Gender</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-2 border">
                  <Input
                    value={passenger.nationality || ""}
                    onChange={(e) => {
                      onPassengerChange(originalIndex, 'nationality', e.target.value);
                    }}
                    className="w-full"
                    disabled={isDisabled}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
