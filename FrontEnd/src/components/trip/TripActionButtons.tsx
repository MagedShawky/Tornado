
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TripActionButtonsProps {
  tripId: string;
  onEdit: () => void;
  endDate: Date; // Add endDate to check if trip is past
}

export function TripActionButtons({ tripId, onEdit, endDate }: TripActionButtonsProps) {
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    const getUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setUserRole(data?.role);
      }
    };

    getUserRole();
  }, []);

  // Check if the trip is in the past (end date is before today)
  const isPastTrip = new Date(endDate) < new Date();

  return (
    <div className="flex gap-2">
      {/* Only show Edit button to admins */}
      {userRole === 'admin' && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={onEdit}
        >
          Edit
        </Button>
      )}
      
      {/* Only show Book Now button if the trip is not in the past */}
      {!isPastTrip && (
        <Button
          variant="default"
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
          asChild
        >
          <Link to={`/booking/${tripId}`}>
            Book Now
          </Link>
        </Button>
      )}
    </div>
  );
}
