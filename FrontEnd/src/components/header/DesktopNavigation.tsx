
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function DesktopNavigation() {
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
          
        setUserRole(data?.role || null);
      }
    };
    
    getUserRole();
  }, []);
  
  return (
    <nav className="mx-6 flex items-center space-x-4 lg:space-x-6">
      <Link
        to="/"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Trips
      </Link>
      
      {userRole === "admin" && (
        <>
          <Link
            to="/boats"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Boats
          </Link>
          <Link
            to="/confirmed-bookings"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Confirmed Bookings
          </Link>
          <Link
            to="/option-bookings"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Option Bookings
          </Link>
        </>
      )}
      
      {userRole === "agent" && (
        <Link
          to="/agent/bookings"
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          Bookings
        </Link>
      )}
      
      {userRole === "customer" && (
        <Link
          to="/bookings"
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          My Bookings
        </Link>
      )}
    </nav>
  );
}
