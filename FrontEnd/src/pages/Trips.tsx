import { useState, useEffect } from "react";
import { TripForm } from "@/components/TripForm";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Database } from "@/integrations/supabase/types";
import { TripFilters } from "@/components/trip/TripFilters";
import { TripList } from "@/components/trip/TripList";
import { Sheet, SheetContent } from "@/components/ui/sheet";

type TripStatus = Database['public']['Enums']['trip_status'];

interface FilterState {
  startDate?: Date;
  endDate?: Date;
  hideSoldOut?: boolean;
  onlyGuaranteed?: boolean;
  onlySpecialDeals?: boolean;
  boatId?: string;
  destination?: string;
}

export default function Trips() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});

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

  const { data: trips, isLoading } = useQuery({
    queryKey: ["trips", filters],
    queryFn: async () => {
      let query = supabase
        .from("trips")
        .select(`
          *,
          boat:boats(name, feature_photo, capacity)
        `)
        .order('start_date', { ascending: true });

      // Apply date filters
      if (filters.startDate) {
        query = query.gte('start_date', format(filters.startDate, 'yyyy-MM-dd'));
      }
      if (filters.endDate) {
        query = query.lte('end_date', format(filters.endDate, 'yyyy-MM-dd'));
      }

      // Hide sold out trips
      if (filters.hideSoldOut) {
        query = query.gt('available_spots', 'booked_spots');
      }

      // Only show guaranteed departures
      if (filters.onlyGuaranteed) {
        query = query.gt('booked_spots', 0);
      }

      // Filter by boat - only apply if boatId is defined and not "all"
      if (filters.boatId && filters.boatId !== 'all') {
        query = query.eq('boat_id', filters.boatId);
      }

      // Filter by destination
      if (filters.destination) {
        query = query.eq('destination', filters.destination);
      }

      // Only show special deals - using scheduled status as placeholder
      if (filters.onlySpecialDeals) {
        query = query.gt('discount', 0);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });

  const handleFilterChange = (newFilters: FilterState) => {
    console.log('Applying filters:', newFilters);
    setFilters(newFilters);
  };

  return (
    <div className="px-4 sm:container mx-auto py-4 sm:py-8">
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Trips</h1>
        {userRole === 'admin' && (
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add Trip"}
          </Button>
        )}
      </div>

      {showForm ? (
        <Sheet open={showForm} onOpenChange={setShowForm}>
          <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
            <div className="py-6">
              <h2 className="text-2xl font-bold mb-6">Add New Trip</h2>
              <TripForm />
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <>
          <TripFilters onFilterChange={handleFilterChange} />
          <TripList trips={trips || []} isLoading={isLoading} />
        </>
      )}
    </div>
  );
}
