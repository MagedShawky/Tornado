
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormLabel } from "@/components/ui/form";
import { CabinType } from "../types";

interface CabinTypeSelectProps {
  value: CabinType;
  onValueChange: (value: CabinType) => void;
  disabled?: boolean;
}

export function CabinTypeSelect({ value, onValueChange, disabled }: CabinTypeSelectProps) {
  return (
    <div className="space-y-2">
      <FormLabel>Cabin Type</FormLabel>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="twin_beds">Twin Beds</SelectItem>
          <SelectItem value="twin_beds_bunk">Twin Beds + Bunk</SelectItem>
          <SelectItem value="suite_double">Suite (Double)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
