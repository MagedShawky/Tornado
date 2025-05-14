
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Percent } from "lucide-react";

interface FilterCheckboxesProps {
  hideSoldOut: boolean;
  onHideSoldOutChange: (checked: boolean) => void;
  onlyGuaranteed: boolean;
  onOnlyGuaranteedChange: (checked: boolean) => void;
  onlySpecialDeals: boolean;
  onOnlySpecialDealsChange: (checked: boolean) => void;
}

export function FilterCheckboxes({
  hideSoldOut,
  onHideSoldOutChange,
  onlyGuaranteed,
  onOnlyGuaranteedChange,
  onlySpecialDeals,
  onOnlySpecialDealsChange
}: FilterCheckboxesProps) {
  return (
    <div className="space-y-2 md:space-y-0 md:flex md:space-x-6">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="hide-sold-out" 
          checked={hideSoldOut}
          onCheckedChange={onHideSoldOutChange}
        />
        <Label htmlFor="hide-sold-out" className="text-sm cursor-pointer">
          Hide sold out trips
        </Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="only-guaranteed" 
          checked={onlyGuaranteed}
          onCheckedChange={onOnlyGuaranteedChange}
        />
        <Label htmlFor="only-guaranteed" className="text-sm cursor-pointer">
          Only guaranteed departures
        </Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="only-special-deals" 
          checked={onlySpecialDeals}
          onCheckedChange={onOnlySpecialDealsChange}
        />
        <Label htmlFor="only-special-deals" className="text-sm cursor-pointer flex items-center">
          Only discounted trips <Percent className="ml-1 h-3 w-3 text-red-500" />
        </Label>
      </div>
    </div>
  );
}
