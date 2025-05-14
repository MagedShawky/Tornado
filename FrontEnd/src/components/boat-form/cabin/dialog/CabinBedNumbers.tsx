import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface CabinBedNumbersProps {
  bedNumbers: string[];
  onChange: (bedNumbers: string[]) => void;
  disabled?: boolean;
  maxBeds: number;
}

export function CabinBedNumbers({ bedNumbers, onChange, disabled, maxBeds }: CabinBedNumbersProps) {
  const { toast } = useToast();

  useEffect(() => {
    // Initialize or adjust bed numbers array when maxBeds changes
    if (bedNumbers.length !== maxBeds) {
      const newBedNumbers = Array.from({ length: maxBeds }, (_, i) => {
        // Preserve existing bed numbers when available
        return i < bedNumbers.length ? bedNumbers[i] : '';
      });
      onChange(newBedNumbers);
    }
  }, [maxBeds, onChange, bedNumbers.length]);

  const handleBedNumberChange = (index: number, value: string) => {
    const newBedNumbers = [...bedNumbers];
    const oldValue = newBedNumbers[index];
    const trimmedValue = value.trim();
    
    // Always allow clearing a field
    if (trimmedValue === '') {
      newBedNumbers[index] = '';
      onChange(newBedNumbers);
      return;
    }

    // Check for duplicates, excluding the current field being edited
    const isDuplicate = newBedNumbers.some(
      (num, i) => num === trimmedValue && i !== index
    );
    
    if (isDuplicate) {
      toast({
        title: "Duplicate bed number",
        description: "Each bed must have a unique number",
        variant: "destructive",
      });
      // Keep the old value
      newBedNumbers[index] = oldValue;
    } else {
      newBedNumbers[index] = trimmedValue;
    }
    
    onChange(newBedNumbers);
  };

  return (
    <div className="col-span-2 space-y-2">
      <FormLabel htmlFor="bed-numbers">Bed Numbers</FormLabel>
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: maxBeds }).map((_, index) => (
          <Input
            key={index}
            id={`bed-number-${index}`}
            placeholder={`Bed ${index + 1}`}
            value={bedNumbers[index] || ''}
            onChange={(e) => handleBedNumberChange(index, e.target.value)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
