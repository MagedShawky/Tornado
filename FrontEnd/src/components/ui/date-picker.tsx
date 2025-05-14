
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
}

export function DatePicker({ 
  date, 
  setDate, 
  className,
  disabled = false,
  minDate
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedYear, setSelectedYear] = React.useState<number>(
    date ? date.getFullYear() : new Date().getFullYear()
  );
  
  // Generate a list of years (100 years in the past)
  const currentYear = new Date().getFullYear();
  const years = React.useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => currentYear - 100 + i + 1);
  }, [currentYear]);
  
  // Handle year selection change without triggering re-renders
  const handleYearChange = React.useCallback((year: string) => {
    setSelectedYear(parseInt(year));
  }, []);
  
  // Handle date selection with useCallback to prevent unnecessary re-renders
  const handleDateSelect = React.useCallback((selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      setIsOpen(false); // Close the popover when a date is selected
    }
  }, [setDate]);
  
  // Update the year selection when the date changes - with proper dependency
  React.useEffect(() => {
    if (date) {
      setSelectedYear(date.getFullYear());
    }
  }, [date]);

  // Calculate month for calendar display
  const calendarMonth = React.useMemo(() => {
    return new Date(selectedYear, date ? date.getMonth() : 0);
  }, [selectedYear, date]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50" align="start">
          <div className="p-2 border-b">
            <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent className="max-h-80 overflow-y-auto">
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            disabled={disabled}
            fromDate={minDate}
            month={calendarMonth}
            onMonthChange={(month) => setSelectedYear(month.getFullYear())}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
