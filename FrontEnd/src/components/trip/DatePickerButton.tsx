
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface DatePickerButtonProps {
  label: string;
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  disabledDatePredicate: (date: Date) => boolean;
  className?: string;
}

export function DatePickerButton({
  label,
  date,
  onDateChange,
  disabledDatePredicate,
  className
}: DatePickerButtonProps) {
  return (
    <div className={cn("w-full", className)}>
      <label className="text-sm font-medium">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full pl-3 text-left font-normal text-sm",
              !date && "text-muted-foreground"
            )}
          >
            {date ? (
              format(date, "PPP")
            ) : (
              <span>Pick a date</span>
            )}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            disabled={disabledDatePredicate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
