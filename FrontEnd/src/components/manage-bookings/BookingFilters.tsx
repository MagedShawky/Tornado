
import { useState, useEffect, useCallback } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface BookingFiltersProps {
  isRefreshing: boolean;
  onManualRefresh: () => void;
  onFiltersChange?: (filters: { status: string, groupName: string }) => void;
  groupNames?: string[];
  defaultStatus?: string;
}

export function BookingFilters({ 
  isRefreshing, 
  onManualRefresh,
  onFiltersChange,
  groupNames = [],
  defaultStatus = "all_statuses" // Setting default value to all_statuses
}: BookingFiltersProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>(defaultStatus);
  const [selectedGroup, setSelectedGroup] = useState<string>("all_groups");
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRefreshDisabled, setIsRefreshDisabled] = useState(false);
  
  // Create a unique list of group names including the default option
  const uniqueGroupNames = [...new Set(["default", ...groupNames])];
  
  // Initialize filters with default values on component mount - only once
  useEffect(() => {
    if (!isInitialized && onFiltersChange) {
      // Apply filters immediately on mount to show all bookings by default
      onFiltersChange({ 
        status: "all_statuses", // Always use all_statuses on initial load
        groupName: "" 
      });
      setIsInitialized(true);
    }
  }, [onFiltersChange, isInitialized]);
  
  // Set default status if provided and changed
  useEffect(() => {
    if (defaultStatus && selectedStatus !== defaultStatus && !isInitialized) {
      console.log(`Updating selected status to match default: ${defaultStatus}`);
      setSelectedStatus(defaultStatus);
    }
  }, [defaultStatus, selectedStatus, isInitialized]);
  
  // Apply filters when button is clicked
  const handleFilterSelected = useCallback(() => {
    if (onFiltersChange) {
      // Convert "all_groups" to empty string for the filter logic
      const groupNameFilter = selectedGroup === "all_groups" ? "" : selectedGroup;
      
      console.log("Applying filters:", { status: selectedStatus, groupName: groupNameFilter });
      onFiltersChange({ 
        status: selectedStatus, 
        groupName: groupNameFilter 
      });
      toast.info("Filters applied");
    }
  }, [selectedStatus, selectedGroup, onFiltersChange]);
  
  const handleClearSelection = useCallback(() => {
    // Reset to default status if provided, otherwise empty string
    setSelectedStatus("all_statuses");
    setSelectedGroup("all_groups");
    if (onFiltersChange) {
      console.log("Clearing filters, reverting to default status: all_statuses");
      onFiltersChange({ 
        status: "all_statuses", 
        groupName: "" 
      });
    }
    toast.success("Filters cleared");
  }, [onFiltersChange]);
  
  // Handle refresh with debounce protection
  const handleSafeRefresh = useCallback(() => {
    if (isRefreshDisabled) return;
    
    setIsRefreshDisabled(true);
    onManualRefresh();
    
    // Re-enable refresh after a delay
    setTimeout(() => {
      setIsRefreshDisabled(false);
    }, 3000);
  }, [isRefreshDisabled, onManualRefresh]);
  
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select Status</label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="--Select--" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_statuses">All</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="option">Option</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Select Group</label>
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger>
              <SelectValue placeholder="--Group name--" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_groups">All Groups</SelectItem>
              {uniqueGroupNames.map(group => (
                <SelectItem key={group} value={group}>
                  {group.charAt(0).toUpperCase() + group.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex gap-3 sm:self-end">
        <Button onClick={handleFilterSelected} className="flex-1 sm:flex-none">
          FILTER SELECTED
        </Button>
        <Button variant="destructive" onClick={handleClearSelection} className="flex-1 sm:flex-none">
          CLEAR SELECTION
        </Button>
        <Button 
          variant="outline" 
          onClick={handleSafeRefresh} 
          disabled={isRefreshing || isRefreshDisabled}
          className="flex-1 sm:flex-none"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
    </div>
  );
}
