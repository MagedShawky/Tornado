
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Search, Filter, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function RecentBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingType, setBookingType] = useState("all");
  const navigate = useNavigate();
  
  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log("Fetching bookings...");
      
      // Fetch cabin bookings with related trip and boat info
      const { data, error } = await supabase
        .from("cabin_bookings")
        .select(`
          id,
          status,
          bed_number,
          price,
          booked_at,
          group_name,
          passenger_gender,
          trip:trip_id (
            id,
            destination,
            start_date,
            end_date,
            boat:boat_id (
              name
            )
          ),
          cabin:cabin_id (
            cabin_number
          )
        `)
        .order("created_at", { ascending: false })
        .limit(20);
        
      if (error) throw error;
      
      console.log("Booking data received:", data);
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBookings();
  }, []);
  
  // Filter bookings based on search query and type
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      (booking.group_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (booking.trip?.destination.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (booking.trip?.boat?.name.toLowerCase() || "").includes(searchQuery.toLowerCase());
      
    const matchesType = bookingType === "all" || booking.status === bookingType;
    
    return matchesSearch && matchesType;
  });
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case "option":
        return <Badge className="bg-yellow-500">Option</Badge>;
      case "canceled":
        return <Badge className="bg-red-500">Canceled</Badge>;
      default:
        return <Badge className="bg-gray-500">Pending</Badge>;
    }
  };
  
  const viewBookingDetails = (tripId: string) => {
    navigate(`/manage-bookings/${tripId}`);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recent Bookings</h2>
        <Button variant="outline" onClick={fetchBookings}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search bookings..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={bookingType}
            onValueChange={setBookingType}
          >
            <SelectTrigger className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="option">Option</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Boat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.booked_at ? formatDate(booking.booked_at) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.group_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.trip?.destination || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.trip ? `${formatDate(booking.trip.start_date)} - ${formatDate(booking.trip.end_date)}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.trip?.boat?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-700">
                    €{booking.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getStatusBadge(booking.status || 'pending')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => viewBookingDetails(booking.trip?.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
