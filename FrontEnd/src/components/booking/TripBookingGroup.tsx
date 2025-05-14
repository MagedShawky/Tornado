
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { BookingListHeader } from "./BookingListHeader";
import { BookingListTable } from "./BookingListTable";
import { BookingListFooter } from "./BookingListFooter";
import { useCancelBookingMutation } from "@/hooks/useCancelBookingMutation";
import { CancelBookingModal } from "./CancelBookingModal";
import { useExportBookings } from "@/utils/exportUtils/index";

interface TripBookingGroupProps {
  tripId: string;
  bookings: any[];
  selectedBookings: string[];
  onToggleBookingSelection: (bookingId: string) => void;
  status: string;
  onConfirmBookings?: (bookingIds: string[], tripId: string) => void;
  isConfirming?: boolean;
}

export function TripBookingGroup({
  tripId,
  bookings,
  selectedBookings,
  onToggleBookingSelection,
  status,
  onConfirmBookings,
  isConfirming = false
}: TripBookingGroupProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  const cancelBookingMutation = useCancelBookingMutation();
  
  // Get trip information from the first booking
  const tripData = bookings[0]?.trip || {};
  const boatData = bookings[0]?.trip?.boat || {};
  
  // Get selected bookings for this trip
  const selectedBookingsForTrip = selectedBookings.filter(id => 
    bookings.some(booking => booking.id === id)
  );
  
  const hasSelectedBookingsForTrip = selectedBookingsForTrip.length > 0;
  
  const { exportToExcel, isPending: isExportPending } = useExportBookings();
  
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToExcel(bookings, tripData.destination, status);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleConfirmSelection = () => {
    if (onConfirmBookings && selectedBookingsForTrip.length > 0) {
      onConfirmBookings(selectedBookingsForTrip, tripId);
    }
  };
  
  const handleCancelSelection = () => {
    if (selectedBookingsForTrip.length > 0) {
      setShowCancelModal(true);
    }
  };
  
  const handleConfirmCancellation = () => {
    if (selectedBookingsForTrip.length > 0) {
      cancelBookingMutation.mutate({
        bookingIds: selectedBookingsForTrip,
        tripId: tripId,
        bookingType: status as "option" | "confirmed",
        tripStartDate: new Date(tripData.start_date),
        onSuccess: () => {
          setShowCancelModal(false);
        }
      });
    }
  };
  
  const startDate = new Date(tripData.start_date);
  const endDate = new Date(tripData.end_date);
  
  return (
    <div className="mb-10 border rounded-md overflow-hidden shadow-sm">
      <BookingListHeader 
        title={`Trip to ${tripData.destination}`}
        tripId={tripId}
        tripDestination={tripData.destination}
        boat={boatData}
        startDate={startDate}
        endDate={endDate}
        isExporting={isExporting}
        onExport={handleExport}
        hasSelectedBookings={hasSelectedBookingsForTrip}
        isConfirming={isConfirming || false}
        onConfirmSelected={handleConfirmSelection}
        status={status}
        showConfirmButton={status === "option" && !!onConfirmBookings}
      />
      
      <BookingListTable 
        bookings={bookings}
        selectedBookings={selectedBookings}
        onToggleSelection={onToggleBookingSelection}
        showSelectionColumn={true}
      />
      
      <BookingListFooter 
        totalBookings={bookings.length}
        selectedCount={selectedBookingsForTrip.length}
        status={status}
        onConfirmSelected={handleConfirmSelection}
        isConfirming={isConfirming || false}
        showConfirmButton={status === "option" && !!onConfirmBookings}
        onCancelSelected={handleCancelSelection}
        isCanceling={cancelBookingMutation.isPending}
      />
      
      <CancelBookingModal
        isOpen={showCancelModal}
        onOpenChange={setShowCancelModal}
        onConfirm={handleConfirmCancellation}
        isPending={cancelBookingMutation.isPending}
        tripStartDate={startDate}
        bookingType={status as "option" | "confirmed"}
        selectedBookingsCount={selectedBookingsForTrip.length}
      />
    </div>
  );
}
