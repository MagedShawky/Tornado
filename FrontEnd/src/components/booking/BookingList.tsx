
import { useState, useEffect } from "react";
import { TripBookingGroup } from "./TripBookingGroup";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarX } from "lucide-react";
import { useBookMutation } from "@/hooks/useBookMutation";
import { toast } from "sonner";

interface BookingListProps {
  bookings: any[];
  title: string;
  status: string;
  onConfirmBookings?: (bookingIds: string[], tripId: string) => void;
  isConfirming?: boolean;
}

export function BookingList({
  bookings,
  title,
  status,
  onConfirmBookings,
  isConfirming = false
}: BookingListProps) {
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>(bookings);
  const [showPastTrips, setShowPastTrips] = useState(false);
  const bookMutation = useBookMutation();

  // Filter out expired option bookings on component mount and whenever bookings change
  useEffect(() => {
    // Only filter out expired options when we're looking at option bookings
    if (status === "option") {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

      const validBookings = bookings.filter(booking => {
        // If it's an option booking with a cancel_date that's in the past, filter it out
        if (booking.status === "option" && booking.cancel_date) {
          const cancelDate = new Date(booking.cancel_date);
          return cancelDate >= today;
        }
        return true;
      });
      setFilteredBookings(validBookings);
    } else {
      setFilteredBookings(bookings);
    }
  }, [bookings, status]);

  // Group bookings by trip
  const bookingsByTrip = filteredBookings.reduce<Record<string, any[]>>((groups, booking) => {
    const tripId = booking.trip_id;
    if (!groups[tripId]) {
      groups[tripId] = [];
    }
    groups[tripId].push(booking);
    return groups;
  }, {});

  // Toggle booking selection
  const toggleBookingSelection = (bookingId: string) => {
    setSelectedBookings(prev => prev.includes(bookingId) ? prev.filter(id => id !== bookingId) : [...prev, bookingId]);
  };

  // Handle converting selected option bookings to confirmed
  const handleConfirmBookings = (bookingIds: string[], tripId: string) => {
    if (bookingIds.length === 0) {
      toast.warning("Please select at least one booking to confirm");
      return;
    }
    
    bookMutation.mutate({
      tripId,
      bookingType: "confirm",
      bookingIds,
      onSuccess: () => {
        setSelectedBookings([]);
      }
    });
  };

  // Filter trips into current and past based on end_date
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison

  const currentTrips: Record<string, any[]> = {};
  const pastTrips: Record<string, any[]> = {};

  // Categorize trips as current or past
  Object.entries(bookingsByTrip).forEach(([tripId, tripBookings]) => {
    if (tripBookings.length > 0) {
      const endDate = new Date(tripBookings[0].trip.end_date);
      if (endDate >= today) {
        currentTrips[tripId] = tripBookings;
      } else {
        pastTrips[tripId] = tripBookings;
      }
    }
  });
  
  const hasPastTrips = Object.keys(pastTrips).length > 0;
  const hasCurrentTrips = Object.keys(currentTrips).length > 0;

  // Count total past bookings for display in button
  const pastBookingsCount = Object.values(pastTrips).reduce((total, bookings) => total + bookings.length, 0);
  
  return (
    <div>
      {hasPastTrips && (
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            onClick={() => setShowPastTrips(!showPastTrips)}
            className="flex items-center gap-2"
          >
            {showPastTrips ? (
              <>
                <CalendarX className="h-4 w-4" />
                Hide Past Trips
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4" />
                Show Past Trips ({pastBookingsCount})
              </>
            )}
          </Button>
        </div>
      )}
      
      {hasCurrentTrips ? (
        Object.entries(currentTrips).map(([tripId, tripBookings]) => (
          <TripBookingGroup
            key={tripId}
            tripId={tripId}
            bookings={tripBookings}
            selectedBookings={selectedBookings}
            onToggleBookingSelection={toggleBookingSelection}
            status={status}
            onConfirmBookings={status === "option" ? handleConfirmBookings : undefined}
            isConfirming={bookMutation.isPending}
          />
        ))
      ) : (
        !hasPastTrips && (
          <p className="text-gray-500 text-center py-8">No current {status} bookings found.</p>
        )
      )}
      
      {showPastTrips && hasPastTrips && (
        <div className="mt-8">
          {hasCurrentTrips && (
            <div className="border-t pt-6 mb-6">
              <h2 className="text-lg font-medium text-gray-600 mb-4">Past Trips</h2>
            </div>
          )}
          
          {Object.entries(pastTrips).map(([tripId, tripBookings]) => (
            <TripBookingGroup
              key={tripId}
              tripId={tripId}
              bookings={tripBookings}
              selectedBookings={selectedBookings}
              onToggleBookingSelection={toggleBookingSelection}
              status={status}
              onConfirmBookings={status === "option" ? handleConfirmBookings : undefined}
              isConfirming={bookMutation.isPending}
            />
          ))}
        </div>
      )}
      
      {!hasCurrentTrips && !hasPastTrips && (
        <p className="text-gray-500 text-center py-8">No {status} bookings found.</p>
      )}
    </div>
  );
}
