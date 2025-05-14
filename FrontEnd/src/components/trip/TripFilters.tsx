import { useState, useEffect, useCallback } from "react";
import { DatePickerButton } from "./DatePickerButton";
import { FilterCheckboxes } from "./FilterCheckboxes";
import { FilterDropdowns } from "./FilterDropdowns";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TripFiltersProps {
  onFilterChange: (filters: {
    startDate?: Date;
    endDate?: Date;
    hideSoldOut?: boolean;
    onlyGuaranteed?: boolean;
    onlySpecialDeals?: boolean;
    boatId?: string;
    destination?: string;
  }) => void;
}

export function TripFilters({ onFilterChange }: TripFiltersProps) {
  // Filter state
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [hideSoldOut, setHideSoldOut] = useState(false);
  const [onlyGuaranteed, setOnlyGuaranteed] = useState(false);
  const [onlySpecialDeals, setOnlySpecialDeals] = useState(false);
  const [selectedBoat, setSelectedBoat] = useState<string>("all");
  const [selectedDestination, setSelectedDestination] = useState<string>("all_destinations");
  
  // To prevent multiple calls during initialization
  const [isInitialized, setIsInitialized] = useState(false);
  const [pendingFilterUpdate, setPendingFilterUpdate] = useState(false);
  
  // Get unique destinations from trips
  const { data: destinations } = useQuery({
    queryKey: ["destinations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("destination")
        .order("destination");
      
      if (error) throw error;
      
      // Extract unique destinations
      const uniqueDestinations = [...new Set(data.map(trip => trip.destination))];
      return uniqueDestinations;
    },
  });
  
  // Get all boats for filtering
  const { data: boats } = useQuery({
    queryKey: ["filter-boats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("boats")
        .select("id, name")
        .eq("status", "active")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });
  
  // This effect detects changes in filter values and marks that we need an update
  useEffect(() => {
    // Only mark pending updates after initialization
    if (isInitialized) {
      setPendingFilterUpdate(true);
    }
  }, [startDate, endDate, hideSoldOut, onlyGuaranteed, onlySpecialDeals, selectedBoat, selectedDestination]);
  
  // This separate effect performs the actual filter update when needed
  useEffect(() => {
    // Only update filters if initialized and there's a pending update
    if (isInitialized && pendingFilterUpdate) {
      console.log("Updating filters from TripFilters");
      onFilterChange({
        startDate,
        endDate,
        hideSoldOut,
        onlyGuaranteed,
        onlySpecialDeals,
        boatId: selectedBoat !== "all" ? selectedBoat : undefined,
        destination: selectedDestination !== "all_destinations" ? selectedDestination : undefined,
      });
      setPendingFilterUpdate(false);
    }
  }, [pendingFilterUpdate, isInitialized, startDate, endDate, hideSoldOut, onlyGuaranteed, onlySpecialDeals, selectedBoat, selectedDestination, onFilterChange]);
  
  // Initialize on mount
  useEffect(() => {
    if (!isInitialized) {
      // Set a small delay to ensure all other initialization is complete
      const timer = setTimeout(() => {
        console.log("TripFilters initialized");
        setIsInitialized(true);
        // Initial filter update
        setPendingFilterUpdate(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);
  
  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setHideSoldOut(false);
    setOnlyGuaranteed(false);
    setOnlySpecialDeals(false);
    setSelectedBoat("all");
    setSelectedDestination("all_destinations");
    // The filter change will be triggered by the state change effect
  };
  
  const hasActiveFilters = startDate || endDate || hideSoldOut || onlyGuaranteed || onlySpecialDeals || selectedBoat !== "all" || selectedDestination !== "all_destinations";

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="col-span-1">
          <DatePickerButton
            date={startDate}
            onDateChange={setStartDate}
            label="Start Date"
            disabledDatePredicate={(date) => false}
            className="w-full"
          />
        </div>
        <div className="col-span-1">
          <DatePickerButton
            date={endDate}
            onDateChange={setEndDate}
            label="End Date"
            disabledDatePredicate={(date) => false}
            className="w-full"
          />
        </div>
        <FilterDropdowns
          boats={boats || []}
          selectedBoat={selectedBoat}
          onBoatChange={setSelectedBoat}
          destinations={destinations || []}
          selectedDestination={selectedDestination}
          onDestinationChange={setSelectedDestination}
        />
      </div>
      
      <div className="flex flex-wrap justify-between items-center gap-2">
        <FilterCheckboxes
          hideSoldOut={hideSoldOut}
          onHideSoldOutChange={setHideSoldOut}
          onlyGuaranteed={onlyGuaranteed}
          onOnlyGuaranteedChange={setOnlyGuaranteed}
          onlySpecialDeals={onlySpecialDeals}
          onOnlySpecialDealsChange={setOnlySpecialDeals}
        />
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
