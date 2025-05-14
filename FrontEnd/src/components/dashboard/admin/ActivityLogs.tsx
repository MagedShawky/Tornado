
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ActivityLog {
  id: string;
  timestamp: string;
  user_email: string;
  action: string;
  details: string;
  type: string;
}

export function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [logType, setLogType] = useState("all");
  
  const fetchLogs = async () => {
    try {
      setLoading(true);
      console.log("Fetching logs...");
      
      // Fetch booking data
      const { data: bookingData, error: bookingError } = await supabase
        .from("cabin_bookings")
        .select(`
          id, 
          created_at, 
          status, 
          price,
          group_name,
          booked_at
        `)
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (bookingError) throw bookingError;
      
      console.log("Booking data:", bookingData);
      
      // Fetch user profiles separately to avoid join issues
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, created_at, role");
      
      if (profileError) throw profileError;
      
      console.log("Profile data:", profileData);
      
      // Create a mapping of profile IDs to emails for later use
      const profileMap = new Map<string, string>();
      profileData?.forEach((profile) => {
        profileMap.set(profile.id, profile.email);
      });
      
      // Transform booking data into activity logs
      const bookingLogs: ActivityLog[] = (bookingData || []).map((booking) => {
        const bookingStatus = booking.status === 'confirmed' ? 'BOOKING_CONFIRMED' : 
                             booking.status === 'option' ? 'BOOKING_OPTION' : 
                             booking.status === 'canceled' ? 'BOOKING_CANCELED' : 'BOOKING_CREATED';
        
        return {
          id: booking.id,
          timestamp: booking.created_at,
          user_email: booking.group_name || 'system@example.com',
          action: bookingStatus,
          details: `${booking.status} booking${booking.booked_at ? ` on ${new Date(booking.booked_at).toLocaleDateString()}` : ''} for group ${booking.group_name || 'N/A'} with price €${booking.price}`,
          type: 'booking'
        };
      });
      
      // Transform profile data into activity logs - for user creation events
      const profileLogs: ActivityLog[] = (profileData || []).map((profile) => ({
        id: profile.id,
        timestamp: profile.created_at,
        user_email: profile.email || 'admin@example.com',
        action: 'USER_CREATED',
        details: `Created user: ${profile.email || 'Unknown'} with role: ${profile.role}`,
        type: 'user'
      }));
      
      // Combine the logs and sort by timestamp (newest first)
      const combinedLogs = [...bookingLogs, ...profileLogs].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      console.log("Combined logs:", combinedLogs);
      setLogs(combinedLogs);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLogs();
  }, []);
  
  // Filter logs based on search query and type
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesType = logType === "all" || log.type === logType;
    
    return matchesSearch && matchesType;
  });
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Activity Logs</h2>
        <Button variant="outline" onClick={fetchLogs}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search logs..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={logType}
            onValueChange={setLogType}
          >
            <SelectTrigger className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="booking">Bookings</SelectItem>
              <SelectItem value="payment">Payments</SelectItem>
              <SelectItem value="user">User Management</SelectItem>
              <SelectItem value="trip">Trip Management</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>{log.user_email}</TableCell>
                <TableCell>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    log.type === 'booking' ? 'bg-blue-100 text-blue-800' : 
                    log.type === 'payment' ? 'bg-green-100 text-green-800' : 
                    log.type === 'user' ? 'bg-purple-100 text-purple-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {log.action}
                  </span>
                </TableCell>
                <TableCell>{log.details}</TableCell>
              </TableRow>
            ))}
            {filteredLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
