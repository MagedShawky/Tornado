
import { Cabin, CabinBooking } from "@/types/database";
import { CabinBed } from "./CabinBed";

interface CabinCardProps {
  cabin: Cabin;
  bookings: CabinBooking[];
  selectedCabin: string | null;
  selectedBed: number | null;
  onBedSelect: (cabinId: string, bedNumber: number, price?: number) => void;
  tripPrice: number;
  isBedSelected?: (cabinId: string, bedNumber: number) => boolean;
}

// Helper function to format cabin type
const formatCabinType = (cabinType: string): string => {
  return cabinType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function CabinCard({
  cabin,
  bookings,
  selectedCabin,
  selectedBed,
  onBedSelect,
  tripPrice,
  isBedSelected = () => false,
}: CabinCardProps) {
  // Get the actual bed numbers from cabin data if available, otherwise use sequential numbers
  const bedNumbers = cabin.bed_numbers || Array.from({ length: cabin.bed_count }, (_, i) => `${i + 1}`);

  // Determine if there are any gender-specific bookings in this cabin
  const cabinBookings = bookings.filter(booking => booking.cabin_id === cabin.id);
  
  // Find if there's a consistent gender in this cabin's bookings
  let existingGender: string | null = null;
  
  if (cabinBookings.length > 0) {
    // Get all the genders from bookings
    const genders = cabinBookings
      .map(booking => booking.passenger_gender)
      .filter(gender => gender === "Male" || gender === "Female"); // Only consider male/female
    
    // If there's at least one gendered booking and they're all the same gender
    if (genders.length > 0 && new Set(genders).size === 1) {
      existingGender = genders[0];
    }
  }

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Cabin {cabin.cabin_number}</h3>
        <span className="text-sm text-gray-600">{formatCabinType(cabin.cabin_type)}</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {bedNumbers.map((bedNumber, index) => {
          // Convert the bedNumber to a numeric value for the booking lookup
          const bedNumberValue = parseInt(bedNumber, 10) || (index + 1);
          const booking = bookings.find(b => b.bed_number === bedNumberValue);
          const bedPrice = cabin.base_price || tripPrice;
          
          // Determine gender restriction for this bed
          const genderRestriction = !booking && existingGender ? existingGender : null;
          
          return (
            <CabinBed
              key={`${cabin.id}-${bedNumber}`}
              bedNumber={bedNumberValue}
              cabinId={cabin.id}
              isBooked={!!booking}
              price={bedPrice}
              passengerGender={booking?.passenger_gender}
              isSelected={
                (selectedCabin === cabin.id && selectedBed === bedNumberValue) || 
                isBedSelected(cabin.id, bedNumberValue)
              }
              onSelect={() => onBedSelect(cabin.id, bedNumberValue, bedPrice)}
              genderRestriction={genderRestriction}
              bookingStatus={booking?.status}
            />
          );
        })}
      </div>
    </div>
  );
}
