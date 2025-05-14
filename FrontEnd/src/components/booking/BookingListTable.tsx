
import { Checkbox } from "@/components/ui/checkbox";

interface BookingListTableProps {
  bookings: any[];
  selectedBookings: string[];
  onToggleSelection?: (bookingId: string) => void;
  onToggleBookingSelection?: (bookingId: string) => void;
  showSelectionColumn?: boolean;
}

export function BookingListTable({
  bookings,
  selectedBookings,
  onToggleSelection,
  onToggleBookingSelection,
  showSelectionColumn = true
}: BookingListTableProps) {
  // Use either onToggleSelection or onToggleBookingSelection (for backward compatibility)
  const handleToggle = onToggleBookingSelection || onToggleSelection;
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            {showSelectionColumn && (
              <th className="p-3 text-left">
                <span className="sr-only">Select</span>
              </th>
            )}
            <th className="p-3 text-left">Cabin</th>
            <th className="p-3 text-left">Bed</th>
            <th className="p-3 text-left">Gender</th>
            <th className="p-3 text-left">Group</th>
            <th className="p-3 text-right">Price</th>
            <th className="p-3 text-center">Cancel Date</th>
            <th className="p-3 text-center">Booked</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking, index) => (
            <tr 
              key={booking.id} 
              className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              {showSelectionColumn && (
                <td className="p-3">
                  <Checkbox 
                    checked={selectedBookings.includes(booking.id)}
                    onCheckedChange={() => handleToggle && handleToggle(booking.id)} 
                    id={`booking-${booking.id}`}
                  />
                </td>
              )}
              <td className="p-3">{booking.cabin?.cabin_number || booking.cabin_number || '-'}</td>
              <td className="p-3">{booking.bed_number}</td>
              <td className="p-3">{booking.passenger_gender || '-'}</td>
              <td className="p-3">{booking.group_name || 'default'}</td>
              <td className="p-3 text-right">€{booking.price}</td>
              <td className="p-3 text-center">
                {booking.cancel_date ? new Date(booking.cancel_date).toLocaleDateString() : '-'}
              </td>
              <td className="p-3 text-center">
                {booking.booked_at ? new Date(booking.booked_at).toLocaleDateString() : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
