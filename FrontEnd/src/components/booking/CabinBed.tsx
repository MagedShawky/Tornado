import { CheckCircle } from "lucide-react";

interface CabinBedProps {
  bedNumber: number;
  cabinId: string;
  price: number;
  isBooked: boolean;
  bookedGender?: string | null;
  passengerGender?: string | null;
  isSelected: boolean;
  onSelect: () => void;
  genderRestriction?: string | null;
  bookingStatus?: string;
}

export function CabinBed({
  bedNumber,
  cabinId,
  price,
  isBooked,
  bookedGender,
  passengerGender,
  isSelected,
  onSelect,
  genderRestriction,
  bookingStatus
}: CabinBedProps) {
  // Determine bed status and styling
  let statusIcon = null;
  let statusClass = "border-gray-300"; // Default grey border for empty beds
  let clickable = !isBooked;
  let bgClass = "bg-white"; // Default white background
  
  // Use either bookedGender or passengerGender, depending on which is provided
  const gender = passengerGender || bookedGender;
  
  if (isBooked) {
    // Check if this is an option booking or confirmed booking
    if (bookingStatus === "option") {
      // Option booking - yellow border and light yellow background
      statusClass = "border-yellow-400 border-2";
      bgClass = "bg-yellow-50";
    } else {
      // Confirmed booking - red border and light red background
      statusClass = "border-red-500 border-2";
      bgClass = "bg-red-50";
    }
    
    if (gender === "Male") {
      statusIcon = <div className="text-blue-600 w-8 h-8 text-xl font-bold">♂</div>; // Bigger blue male symbol
      
    } else if (gender === "Female") {
      statusIcon = <div className="text-red-600 w-8 h-8 text-xl font-bold">♀</div>; // Bigger red female symbol
      
    } else {
      statusIcon = <div className="text-gray-500 w-8 h-8 text-xl font-bold">⚫</div>;
    }
  } else if (isSelected) {
    statusIcon = <CheckCircle className="w-6 h-6 text-green-500" />;
    statusClass = "border-green-500 border-2";
    bgClass = "bg-green-50";
  } else if (genderRestriction) {
    // Grey border for gender restriction with white background
    statusClass = "border-gray-300 border-2";
    bgClass = "bg-white"; // White background for gender-restricted beds
    
    // Show gender restriction indicator if bed is available but restricted
    if (genderRestriction === "Male") {
      statusIcon = <div className="text-blue-600 w-8 h-8 text-xl opacity-70 font-bold">♂</div>; // Bigger blue male symbol
    } else if (genderRestriction === "Female") {
      statusIcon = <div className="text-red-600 w-8 h-8 text-xl opacity-70 font-bold">♀</div>; // Bigger red female symbol
    }
  }
  // For empty beds, we keep the default grey border and white background

  return (
    <div 
      className={`p-4 border rounded-lg ${statusClass} ${bgClass} ${clickable ? 'cursor-pointer hover:bg-gray-100' : 'cursor-not-allowed'}`}
      onClick={clickable ? onSelect : undefined}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Bed {bedNumber}</h3>
        <div className="flex items-center">
          {statusIcon}
        </div>
      </div>
      <p className="text-lg font-semibold">{price} €</p>
      {genderRestriction && !isBooked && (
        <p className="text-xs text-gray-500 mt-1">
          {genderRestriction === "Male" ? "Male only" : 
           genderRestriction === "Female" ? "Female only" : 
           ""}
        </p>
      )}
    </div>
  );
}
