
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTrip } from "@/hooks/useTrip";
import { useCabins } from "@/hooks/useCabins";
import { useCabinBookings } from "@/hooks/useCabinBookings";
import { useBookMutation } from "@/hooks/useBookMutation";
import { LoadingState } from "@/components/booking/LoadingState";
import { ErrorMessage } from "@/components/booking/ErrorMessage";
import { NotFoundMessage } from "@/components/booking/NotFoundMessage";
import { BookingContent } from "@/components/booking/BookingContent";
import { toast } from "@/components/ui/use-toast";

export default function Booking() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  // Fetch trip data
  const { 
    data: tripData, 
    isLoading: tripLoading, 
    error: tripError 
  } = useTrip(tripId);

  // Fetch cabins data
  const { 
    data: cabins = [], 
    isLoading: cabinsLoading, 
    error: cabinsError 
  } = useCabins(tripData?.boat?.id);

  // Fetch bookings data
  const { 
    data: bookings = [], 
    isLoading: bookingsLoading, 
    error: bookingsError 
  } = useCabinBookings(tripId);

  // Booking mutation
  const bookingMutation = useBookMutation();

  // Handle form submission from the booking content component
  const handleBooking = (passengerDetails: any[], bookingType: "option" | "confirm" | "waitlist" = "confirm", cancelDate?: Date) => {
    if (!passengerDetails.length || !tripId) {
      toast.error("Booking error", {
        description: "No passenger details provided"
      });
      return;
    }

    // Get the selected beds from the hidden input to get prices
    const selectedBedsElement = document.querySelector('[data-testid="selected-beds-data"]');
    if (!selectedBedsElement) {
      toast.error("Booking error", {
        description: "Selected beds data not found"
      });
      return;
    }
    
    const selectedBedsAttr = selectedBedsElement.getAttribute('data-selected-beds');
    if (!selectedBedsAttr) {
      toast.error("Booking error", {
        description: "Selected beds data is empty"
      });
      return;
    }
    
    const selectedBeds = JSON.parse(selectedBedsAttr);

    // Create an array of beds with their respective gender
    const bedsToBook = passengerDetails.map(passenger => ({
      cabinId: passenger.cabinId,
      bedNumber: passenger.bedNumber,
      price: selectedBeds.find((bed: any) => 
        bed.cabinId === passenger.cabinId && bed.bedNumber === passenger.bedNumber
      )?.price || 0,
      passengerGender: passenger.gender,
      groupName: passenger.groupName || "default"
    }));

    bookingMutation.mutate({
      tripId,
      bedsToBook,
      tripData,
      bookingType,
      cancelDate,
      onSuccess: () => {
        toast.success("Success", {
          description: `Successfully ${bookingType === "waitlist" ? "waitlisted" : 
                      bookingType === "option" ? "optioned" : "confirmed"} ${bedsToBook.length} beds!`
        });
        navigate("/trips");
      }
    });
  };

  // Loading state
  if (tripLoading || cabinsLoading || bookingsLoading) {
    return <LoadingState />;
  }

  // Error state
  if (tripError || cabinsError || bookingsError) {
    const error = tripError || cabinsError || bookingsError;
    return (
      <ErrorMessage 
        message="Error loading booking information" 
        detail={error?.message || "Please try again later or contact support if the problem persists."}
      />
    );
  }

  // Trip not found state
  if (!tripData) {
    return <NotFoundMessage>Trip not found</NotFoundMessage>;
  }

  // Render booking content
  return (
    <div className="container mx-auto py-8 pb-24">
      <BookingContent 
        tripData={tripData}
        cabins={cabins}
        bookings={bookings}
        onBook={handleBooking}
        isPending={bookingMutation.isPending}
      />
    </div>
  );
}
