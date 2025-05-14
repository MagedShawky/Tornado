
import React, { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { ClientDetailsTab } from "./tabs/ClientDetailsTab";
import { ClientInfoTab } from "./tabs/ClientInfoTab";
import { TravelInfoTab } from "./tabs/TravelInfoTab";
import { TourismServicesTab } from "./tabs/TourismServicesTab";
import { RentalsTab } from "./tabs/RentalsTab";
import { Trip, CabinBooking, Cabin, BookingClientDetails, BookingClientInfo, BookingTravelInfo, BookingTourismServices, BookingRentals } from "@/types/database";
import { BookingFilters } from "./BookingFilters";
import { TabHome } from "./tabs/TabHome";
import { TabContent } from "./TabContent";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { exportBookingsToXLSX } from "@/utils/exportUtils";

interface ManageBookingsTabsProps {
  trip: Trip & { 
    boat: { 
      id: string;
      name: string; 
      feature_photo: string | null;
      capacity: number;
    } 
  };
  cabinBookings: (CabinBooking & { cabin: Cabin })[];
  clientDetails?: BookingClientDetails[];
  clientInfo?: BookingClientInfo[];
  travelInfo?: BookingTravelInfo[];
  tourismServices?: BookingTourismServices[];
  rentals?: BookingRentals[];
  initialStatus?: string;
}

export function ManageBookingsTabs({ 
  trip, 
  cabinBookings,
  clientDetails = [],
  clientInfo = [],
  travelInfo = [],
  tourismServices = [],
  rentals = [],
  initialStatus = ""
}: ManageBookingsTabsProps) {
  const [activeTab, setActiveTab] = useState("home");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Default to all_statuses for viewing all bookings
  const effectiveInitialStatus = initialStatus || "all_statuses";
  
  const [filters, setFilters] = useState({ 
    status: effectiveInitialStatus, 
    groupName: "" 
  });
  
  const [filteredBookings, setFilteredBookings] = useState(cabinBookings);
  
  const queryClient = useQueryClient();
  const initialRenderRef = useRef(true);
  const refreshTimeoutRef = useRef<number | null>(null);
  
  const groupNames = [...new Set(cabinBookings
    .map(booking => booking.group_name || "default")
    .filter(Boolean))];
  
  useEffect(() => {
    if (!filters) return;
    
    console.log("Applying filters in ManageBookingsTabs:", filters);
    let filtered = [...cabinBookings];
    
    if (filters.status && filters.status !== "all_statuses") {
      console.log(`Filtering by status: ${filters.status}`);
      filtered = filtered.filter(booking => booking.status === filters.status.toLowerCase());
    } else {
      console.log("No status filter applied, showing all bookings");
    }
    
    if (filters.groupName && filters.groupName !== "all_groups") {
      console.log(`Filtering by group name: ${filters.groupName}`);
      filtered = filtered.filter(booking => {
        const bookingGroup = booking.group_name || "default";
        return bookingGroup === filters.groupName;
      });
    } else {
      console.log("No group name filter applied");
    }
    
    console.log(`Filtered bookings: ${filtered.length} of ${cabinBookings.length}`);
    setFilteredBookings(filtered);
  }, [filters, cabinBookings]);
  
  const refreshActiveTabData = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    try {
      await queryClient.invalidateQueries({
        queryKey: ["cabin-bookings-manage", trip.id]
      });
      
      if (activeTab === "client-details") {
        await queryClient.invalidateQueries({
          queryKey: ["client-details", trip.id]
        });
      } else if (activeTab === "client-info") {
        await queryClient.invalidateQueries({
          queryKey: ["client-info", trip.id]
        });
      } else if (activeTab === "travel-info") {
        await queryClient.invalidateQueries({
          queryKey: ["travel-info", trip.id]
        });
      } else if (activeTab === "tourism-services") {
        await queryClient.invalidateQueries({
          queryKey: ["tourism-services", trip.id]
        });
      } else if (activeTab === "rentals") {
        await queryClient.invalidateQueries({
          queryKey: ["rentals", trip.id]
        });
      }
      
      toast.success("Data refreshed successfully");
      
      if (refreshTimeoutRef.current) window.clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = window.setTimeout(() => {
        setIsRefreshing(false);
        refreshTimeoutRef.current = null;
      }, 2000);
    } catch (error) {
      console.error(`Error refreshing ${activeTab} data:`, error);
      toast.error("Failed to refresh data");
      setIsRefreshing(false);
    }
  };
  
  useEffect(() => {
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }
    refreshActiveTabData();
    
    return () => {
      if (refreshTimeoutRef.current) {
        window.clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [activeTab]);
  
  const handleFiltersChange = (newFilters: { status: string, groupName: string }) => {
    console.log("Filters changed in ManageBookingsTabs:", newFilters);
    setFilters(newFilters);
  };
  
  const handleExportAllData = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    try {
      const bookingsToExport = cabinBookings.map(booking => ({
        ...booking,
        group_name: booking.group_name || "default"
      }));
      
      const filename = `${trip.destination}-complete-data.xlsx`;
      await exportBookingsToXLSX(bookingsToExport, trip.id, filename);
      toast.success("Export completed successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <BookingFilters
          isRefreshing={isRefreshing}
          onManualRefresh={refreshActiveTabData}
          onFiltersChange={handleFiltersChange}
          groupNames={groupNames}
          defaultStatus={effectiveInitialStatus}
        />
        
        <Button 
          onClick={handleExportAllData} 
          variant="outline"
          disabled={isExporting}
          className="ml-auto"
        >
          <FileDown className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export All Data'}
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="home">Overview</TabsTrigger>
          <TabsTrigger value="client-details">Clients details</TabsTrigger>
          <TabsTrigger value="client-info">Clients Info</TabsTrigger>
          <TabsTrigger value="travel-info">Travel Info</TabsTrigger>
          <TabsTrigger value="tourism-services">Tourist services</TabsTrigger>
          <TabsTrigger value="rentals">Rentals</TabsTrigger>
        </TabsList>
        
        <TabContent value="home" activeTab={activeTab} setIsRefreshing={setIsRefreshing}>
          <TabHome trip={trip} />
        </TabContent>
        
        <TabContent value="client-details" activeTab={activeTab} setIsRefreshing={setIsRefreshing}>
          <ClientDetailsTab 
            trip={trip}
            cabinBookings={filteredBookings}
            clientDetails={clientDetails}
            clientInfo={clientInfo}
            onSaved={refreshActiveTabData}
          />
        </TabContent>
        
        <TabContent value="client-info" activeTab={activeTab} setIsRefreshing={setIsRefreshing}>
          <ClientInfoTab 
            trip={trip}
            cabinBookings={filteredBookings}
            clientInfo={clientInfo}
            clientDetails={clientDetails}
            onSaved={refreshActiveTabData}
          />
        </TabContent>
        
        <TabContent value="travel-info" activeTab={activeTab} setIsRefreshing={setIsRefreshing}>
          <TravelInfoTab 
            trip={trip}
            cabinBookings={filteredBookings}
            travelInfo={travelInfo}
            clientDetails={clientDetails}
            onSaved={refreshActiveTabData}
          />
        </TabContent>
        
        <TabContent value="tourism-services" activeTab={activeTab} setIsRefreshing={setIsRefreshing}>
          <TourismServicesTab 
            trip={trip}
            cabinBookings={filteredBookings}
            tourismServices={tourismServices}
            onSaved={refreshActiveTabData}
          />
        </TabContent>
        
        <TabContent value="rentals" activeTab={activeTab} setIsRefreshing={setIsRefreshing}>
          <RentalsTab 
            trip={trip}
            cabinBookings={filteredBookings}
            rentals={rentals}
            onSaved={refreshActiveTabData}
          />
        </TabContent>
      </Tabs>
    </div>
  );
}
