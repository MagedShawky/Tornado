
interface TripProgressBarProps {
  availablePercentage: number;
}

export function TripProgressBar({ availablePercentage }: TripProgressBarProps) {
  return (
    <div className="w-1/3 bg-gray-200 rounded-full h-2.5">
      <div 
        className="bg-blue-600 h-2.5 rounded-full" 
        style={{ width: `${100 - availablePercentage}%` }}
      ></div>
    </div>
  );
}
