
import { useState } from 'react';
import { exportToXLSX } from './exportToXLSX';
import { toast } from 'sonner';

export function useExportBookings() {
  const [isPending, setIsPending] = useState(false);

  const exportToExcel = async (bookings: any[], destination: string, status: string) => {
    try {
      setIsPending(true);
      
      // Format data for export
      const formattedData = bookings.map(booking => ({
        'Booking ID': booking.id,
        'Trip': destination,
        'Cabin': booking.cabin?.cabin_number || 'N/A',
        'Bed': booking.bed_number,
        'Price': booking.price,
        'Status': booking.status,
        'Group Name': booking.group_name || 'Default',
        'Gender': booking.passenger_gender || 'Not specified',
        'Booked Date': booking.booked_at,
        'Expires': booking.cancel_date || 'N/A'
      }));
      
      // Export the formatted data
      await exportToXLSX(formattedData, `${destination}_${status}_bookings`);
      
      toast.success('Bookings exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export bookings');
    } finally {
      setIsPending(false);
    }
  };

  return { exportToExcel, isPending };
}

export * from './exportToCSV';
export * from './exportToXLSX';
