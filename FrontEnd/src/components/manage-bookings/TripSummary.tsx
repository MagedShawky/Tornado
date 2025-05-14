
import { format } from "date-fns";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Trip, CabinBooking, Cabin } from "@/types/database";

interface TripSummaryProps {
  trip: Trip & { 
    boat: { 
      id: string;
      name: string; 
      feature_photo: string | null;
      capacity: number;
    } 
  };
  bookings: (CabinBooking & { cabin: Cabin })[];
}

export function TripSummary({ trip, bookings }: TripSummaryProps) {
  const startDate = format(new Date(trip.start_date), "dd MMM yyyy");
  const endDate = format(new Date(trip.end_date), "dd MMM yyyy");
  const totalPrice = bookings.reduce((sum, booking) => sum + Number(booking.price), 0);
  
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {trip.boat.feature_photo && (
            <div className="w-full md:w-48 h-32 flex-shrink-0">
              <img 
                src={trip.boat.feature_photo} 
                alt={trip.boat.name} 
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">{trip.destination}</h1>
                <h2 className="text-xl text-gray-700 mb-2">{trip.boat.name}</h2>
                <p className="text-gray-600">
                  {startDate} - {endDate}
                </p>
                <p className="text-gray-600 mt-1">
                  {trip.location_from} to {trip.location_to}
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
                <div className="text-lg font-semibold mb-1">Total Bookings: {bookings.length}</div>
                <div className="text-2xl font-bold text-green-600">€ {totalPrice.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
