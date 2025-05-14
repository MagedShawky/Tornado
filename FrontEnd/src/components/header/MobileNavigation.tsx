
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, CalendarIcon, CheckCircleIcon, ClockIcon, AnchorIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";

export function MobileNavigation() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    const getUserRole = async () => {
      try {
        console.log("Fetching user role for mobile navigation");
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();
            
          if (error) {
            console.error("Error fetching user role:", error);
            return;
          }
          
          console.log("User role for mobile navigation:", data?.role);
          setUserRole(data?.role || null);
        }
      } catch (error) {
        console.error("Error in getUserRole:", error);
      }
    };
    
    getUserRole();
  }, []);

  const navigateAndCloseSheet = (path: string) => {
    navigate(path);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="ml-auto">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <div className="flex flex-col space-y-4 mt-8">
          <Button 
            variant="ghost" 
            className="justify-start" 
            onClick={() => navigateAndCloseSheet("/")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            Trips
          </Button>

          {userRole === "admin" && (
            <>
              <Button 
                variant="ghost" 
                className="justify-start" 
                onClick={() => navigateAndCloseSheet("/boats")}
              >
                <AnchorIcon className="mr-2 h-4 w-4" />
                Boats
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => navigateAndCloseSheet("/confirmed-bookings")}
              >
                <CheckCircleIcon className="mr-2 h-4 w-4" />
                Confirmed Bookings
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => navigateAndCloseSheet("/option-bookings")}
              >
                <ClockIcon className="mr-2 h-4 w-4" />
                Option Bookings
              </Button>
            </>
          )}

          {userRole === "agent" && (
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => navigateAndCloseSheet("/agent/bookings")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              Bookings
            </Button>
          )}

          {userRole === "customer" && (
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => navigateAndCloseSheet("/bookings")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              My Bookings
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
