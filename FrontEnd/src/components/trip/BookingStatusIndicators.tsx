
interface BookingStatusIndicatorsProps {
  optionedCount: number;
  confirmedCount: number;
  availableSpots: number;
  waitlistCount?: number;
}

export function BookingStatusIndicators({
  optionedCount,
  confirmedCount,
  availableSpots,
  waitlistCount = 0
}: BookingStatusIndicatorsProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-center">
        <span className="text-xs uppercase text-amber-500 font-semibold">Optioned</span>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-500 font-bold">
          {optionedCount}
        </div>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs uppercase text-red-500 font-semibold">Confirmed</span>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-500 font-bold">
          {confirmedCount}
        </div>
      </div>
      {waitlistCount > 0 && (
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase text-purple-500 font-semibold">Waitlist</span>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-500 font-bold">
            {waitlistCount}
          </div>
        </div>
      )}
      <div className="flex flex-col items-center">
        <span className="text-xs uppercase text-green-500 font-semibold">Available</span>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-500 font-bold">
          {availableSpots}
        </div>
      </div>
    </div>
  );
}
