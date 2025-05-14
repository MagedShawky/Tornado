
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface WaitlistEntry {
  id: string;
  passenger_gender: string;
  created_at: string;
  group_name: string;
}

interface ViewWaitlistModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
}

export function ViewWaitlistModal({
  isOpen,
  onOpenChange,
  tripId
}: ViewWaitlistModalProps) {
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && tripId) {
      fetchWaitlistEntries();
    }
  }, [isOpen, tripId]);

  const fetchWaitlistEntries = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("cabin_bookings")
        .select("id, passenger_gender, created_at, group_name")
        .eq("trip_id", tripId)
        .eq("status", "waitlist")
        .order("created_at", { ascending: true });
        
      if (error) {
        throw error;
      }
      
      setWaitlistEntries(data || []);
    } catch (err) {
      console.error("Error fetching waitlist entries:", err);
      setError(err instanceof Error ? err.message : "Failed to load waitlist entries");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Waitlist Entries</DialogTitle>
          <DialogDescription>
            Current waitlist for this trip.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">
            {error}
          </div>
        ) : waitlistEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No waitlist entries found for this trip.
          </div>
        ) : (
          <div className="overflow-auto max-h-[50vh]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 border">Gender</th>
                  <th className="p-2 border">Group</th>
                  <th className="p-2 border">Added On</th>
                </tr>
              </thead>
              <tbody>
                {waitlistEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="p-2 border capitalize">
                      {entry.passenger_gender || "Not specified"}
                    </td>
                    <td className="p-2 border">
                      {entry.group_name || "Default"}
                    </td>
                    <td className="p-2 border">
                      {formatDate(entry.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
          {!isLoading && !error && (
            <Button variant="outline" onClick={fetchWaitlistEntries}>
              Refresh
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
