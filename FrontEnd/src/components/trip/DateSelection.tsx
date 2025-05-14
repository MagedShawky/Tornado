
import { DatePickerButton } from "./DatePickerButton";

interface DateSelectionProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
}

export function DateSelection({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateSelectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-4">
        <DatePickerButton
          label="Start Date"
          date={startDate}
          onDateChange={onStartDateChange}
          disabledDatePredicate={(date) =>
            date < new Date() || (endDate ? date > endDate : false)
          }
        />

        <DatePickerButton
          label="End Date"
          date={endDate}
          onDateChange={onEndDateChange}
          disabledDatePredicate={(date) =>
            date < new Date() || (startDate ? date < startDate : false)
          }
        />
      </div>
      
      {startDate && endDate && (
        <div className="text-xs text-muted-foreground italic mt-1">
          Note: A one-day buffer will be added before and after this trip for boat travel time.
        </div>
      )}
    </div>
  );
}
