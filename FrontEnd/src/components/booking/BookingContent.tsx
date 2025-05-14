
import { useState, useEffect } from "react";
import { Cabin, CabinBooking, Trip } from "@/types/database";
import { DeckSection } from "./DeckSection";
import { BookingModal } from "./BookingModal";
import { BookingSummary } from "./BookingSummary";
import { PassengerDetailsModal } from "./PassengerDetailsModal";
import { DeckPhotos } from "./DeckPhotos";
import { toast } from "@/components/ui/use-toast";
import { addDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { WaitlistBookingsModal } from "./WaitlistBookingsModal";
import { ViewWaitlistModal } from "./ViewWaitlistModal";

interface BookingContentProps {
  tripData: Trip & { boat: any };
  cabins: Cabin[];
  bookings: CabinBooking[];
  onBook: (passengerDetails: any[], bookingType: "option" | "confirm" | "waitlist", cancelDate?: Date, groupName?: string) => void;
  isPending: boolean;
}

export function BookingContent({ 
  tripData, 
  cabins, 
  bookings, 
  onBook,
  isPending
}: BookingContentProps) {
  const [selectedBeds, setSelectedBeds] = useState<{
    cabinId: string;
    bedNumber: number;
    price: number;
  }[]>([]);
  
  const [isInitialModalOpen, setIsInitialModalOpen] = useState(false);
  const [isPassengerDetailsModalOpen, setIsPassengerDetailsModalOpen] = useState(false);
  const [bookingType, setBookingType] = useState<"option" | "confirm" | "waitlist">("confirm");
  const [cancelDate, setCancelDate] = useState<Date | undefined>(addDays(new Date(), 15));
  const [groupName, setGroupName] = useState("default");
  const [optionBookingsCount, setOptionBookingsCount] = useState(0);
  const [waitlistBookingsCount, setWaitlistBookingsCount] = useState(0);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [isViewWaitlistModalOpen, setIsViewWaitlistModalOpen] = useState(false);

  // Fetch option bookings count
  useEffect(() => {
    async function fetchBookingStats() {
      if (!tripData?.id) return;
      
      // Fetch option bookings
      const { data: optionData, error: optionError } = await supabase
        .from("cabin_bookings")
        .select("id")
        .eq("trip_id", tripData.id)
        .eq("status", "option");
        
      if (optionError) {
        console.error("Error fetching option bookings count:", optionError);
        return;
      }
      
      setOptionBookingsCount(optionData?.length || 0);
      
      // Fetch waitlist bookings
      const { data: waitlistData, error: waitlistError } = await supabase
        .from("cabin_bookings")
        .select("id")
        .eq("trip_id", tripData.id)
        .eq("status", "waitlist");
        
      if (waitlistError) {
        console.error("Error fetching waitlist bookings count:", waitlistError);
        return;
      }
      
      setWaitlistBookingsCount(waitlistData?.length || 0);
    }
    
    fetchBookingStats();
  }, [tripData?.id, bookings]);

  // Check if waitlist is available (fully booked but has option bookings)
  const isFullyBooked = tripData.available_spots === 0;
  const showWaitlistButton = isFullyBooked && optionBookingsCount > 0;

  const handleBedSelection = (cabinId: string, bedNumber: number, price: number) => {
    // Check if this bed is already selected
    const existingIndex = selectedBeds.findIndex(
      bed => bed.cabinId === cabinId && bed.bedNumber === bedNumber
    );
    
    // Toggle selection
    if (existingIndex >= 0) {
      setSelectedBeds(prevSelected => 
        prevSelected.filter((_, index) => index !== existingIndex)
      );
    } else {
      setSelectedBeds(prevSelected => [
        ...prevSelected, 
        { cabinId, bedNumber, price }
      ]);
    }
  };

  const handleOptionClick = () => {
    if (selectedBeds.length === 0) {
      toast.error("Selection required", {
        description: "Please select at least one bed first",
      });
      return;
    }
    setBookingType("option");
    setIsInitialModalOpen(true);
  };

  const handleConfirmClick = () => {
    if (selectedBeds.length === 0) {
      toast.error("Selection required", {
        description: "Please select at least one bed first",
      });
      return;
    }
    setBookingType("confirm");
    setIsInitialModalOpen(true);
  };
  
  const handleWaitlistClick = () => {
    if (selectedBeds.length === 0) {
      toast.error("Selection required", {
        description: "Please select at least one bed first",
      });
      return;
    }
    
    if (selectedBeds.length > optionBookingsCount) {
      toast.error("Too many beds selected", {
        description: `You can only waitlist up to ${optionBookingsCount} beds (equal to the number of option bookings)`,
      });
      return;
    }
    
    setBookingType("waitlist");
    setIsInitialModalOpen(true);
  };

  const handleDirectWaitlistClick = () => {
    setIsWaitlistModalOpen(true);
  };

  const handleViewWaitlistClick = () => {
    setIsViewWaitlistModalOpen(true);
  };

  const handleInitialConfirm = (groupNameValue: string) => {
    setGroupName(groupNameValue);
    setIsInitialModalOpen(false);
    setIsPassengerDetailsModalOpen(true);
  };

  const handlePassengerDetailsConfirm = (passengerDetails: any[]) => {
    // Add group name to each passenger
    const detailsWithGroup = passengerDetails.map(passenger => ({
      ...passenger,
      groupName: groupName // Make sure the group name is correctly set
    }));
    
    console.log("Booking with group name:", groupName, "details:", detailsWithGroup);
    
    setIsPassengerDetailsModalOpen(false);
    onBook(detailsWithGroup, bookingType, 
           (bookingType === "option" || bookingType === "waitlist") ? cancelDate : undefined, 
           groupName);
  };

  const isBedSelected = (cabinId: string, bedNumber: number) => {
    return selectedBeds.some(
      bed => bed.cabinId === cabinId && bed.bedNumber === bedNumber
    );
  };

  const totalPrice = selectedBeds.reduce((sum, bed) => sum + bed.price, 0);
  
  const cabinsByDeck = cabins.reduce((acc, cabin) => {
    const deck = cabin.deck;
    if (!acc[deck]) {
      acc[deck] = [];
    }
    acc[deck].push(cabin);
    return acc;
  }, {} as Record<string, Cabin[]>);

  // Get unique deck names
  const deckNames = Object.keys(cabinsByDeck);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Book a Cabin</h1>
        <p className="text-gray-600">
          Trip to {tripData.destination} ({tripData.start_date} - {tripData.end_date})
        </p>
        <p className="text-gray-600">
          Boat: {tripData.boat?.name || "Unknown"}
        </p>
        
        {isFullyBooked && (
          <div className={optionBookingsCount > 0 ? "bg-amber-50 p-4 border border-amber-200 rounded-md mt-4 flex flex-col md:flex-row md:items-center justify-between" : "bg-red-50 p-3 border border-red-200 rounded-md mt-4"}>
            <p className={optionBookingsCount > 0 ? "text-amber-700 font-medium mb-2 md:mb-0" : "text-red-700 font-medium"}>
              {optionBookingsCount > 0 
                ? `Trip is fully booked with ${optionBookingsCount} option bookings. You can add up to ${optionBookingsCount} waitlist bookings.`
                : "Trip is fully booked with no option bookings. Waitlist is not available."
              }
            </p>
            {optionBookingsCount > 0 && (
              <div className="flex space-x-2">
                <Button 
                  onClick={handleDirectWaitlistClick} 
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Add to Waitlist
                </Button>
                {waitlistBookingsCount > 0 && (
                  <Button 
                    variant="outline" 
                    className="border-purple-600 text-purple-600 hover:bg-purple-100"
                    onClick={handleViewWaitlistClick}
                  >
                    View Waitlist ({waitlistBookingsCount})
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Deck sections */}
      {Object.entries(cabinsByDeck).map(([deck, deckCabins]) => (
        <DeckSection
          key={deck}
          deck={deck}
          cabins={deckCabins}
          bookings={bookings}
          selectedCabin={null}
          selectedBed={null}
          onBedSelect={handleBedSelection}
          tripPrice={tripData.price}
          isBedSelected={isBedSelected}
        />
      ))}

      {/* Display deck photos before the summary */}
      <DeckPhotos 
        deckNames={deckNames} 
        boatId={tripData.boat?.id}
      />

      <BookingModal
        isOpen={isInitialModalOpen}
        onOpenChange={setIsInitialModalOpen}
        onConfirm={handleInitialConfirm}
        isPending={isPending}
        selectedCount={selectedBeds.length}
        totalPrice={totalPrice}
        bookingType={bookingType}
      />
      
      <PassengerDetailsModal
        isOpen={isPassengerDetailsModalOpen}
        onOpenChange={setIsPassengerDetailsModalOpen}
        onConfirm={handlePassengerDetailsConfirm}
        isPending={isPending}
        selectedCount={selectedBeds.length}
        totalPrice={totalPrice}
        bookingType={bookingType}
        cancelDate={cancelDate}
        setCancelDate={setCancelDate}
        selectedBeds={selectedBeds}
        groupName={groupName}
        cabinBookings={bookings}
      />

      <WaitlistBookingsModal
        isOpen={isWaitlistModalOpen}
        onOpenChange={setIsWaitlistModalOpen}
        tripId={tripData.id}
        isPending={isPending}
        maxCount={optionBookingsCount}
      />

      {/* New ViewWaitlistModal component */}
      <ViewWaitlistModal
        isOpen={isViewWaitlistModalOpen}
        onOpenChange={setIsViewWaitlistModalOpen}
        tripId={tripData.id}
      />

      <BookingSummary 
        selectedCount={selectedBeds.length}
        totalPrice={totalPrice}
        onOptionClick={handleOptionClick}
        onConfirmClick={handleConfirmClick}
        onWaitlistClick={handleWaitlistClick}
        showWaitlistButton={showWaitlistButton}
      />
      
      {/* Return selected beds information for parent component */}
      <input 
        type="hidden" 
        data-selected-beds={JSON.stringify(selectedBeds)} 
        data-testid="selected-beds-data"
      />
    </div>
  );
}
