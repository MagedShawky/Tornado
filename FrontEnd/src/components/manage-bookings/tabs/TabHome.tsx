
import { Trip } from "@/types/database";

interface TabHomeProps {
  trip: Trip & { 
    boat: { 
      id: string;
      name: string; 
      feature_photo: string | null;
      capacity: number;
    } 
  };
}

export function TabHome({ trip }: TabHomeProps) {
  return (
    <div className="p-6 border rounded-md bg-gray-50">
      <h3 className="text-lg font-medium mb-4">Overview</h3>
      <p className="text-gray-500">Trip overview and quick stats will be displayed here.</p>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-md border">
          <h4 className="font-medium text-gray-700">Trip Details</h4>
          <p>Destination: {trip.destination}</p>
          <p>Dates: {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}</p>
        </div>
        
        <div className="p-4 bg-white rounded-md border">
          <h4 className="font-medium text-gray-700">Boat Information</h4>
          <p>Name: {trip.boat.name}</p>
          <p>Capacity: {trip.boat.capacity}</p>
        </div>
        
        <div className="p-4 bg-white rounded-md border">
          <h4 className="font-medium text-gray-700">Booking Status</h4>
          <p>Available: {trip.available_spots}</p>
          <p>Booked: {trip.booked_spots}</p>
        </div>
      </div>
    </div>
  );
}
