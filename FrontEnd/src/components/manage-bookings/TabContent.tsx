
import { useEffect, useRef, useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";

interface TabContentProps {
  value: string;
  activeTab: string;
  setIsRefreshing: (value: boolean) => void;
  children: React.ReactNode;
}

export function TabContent({
  value,
  activeTab,
  setIsRefreshing,
  children
}: TabContentProps) {
  const queryClient = useQueryClient();
  const initialRenderRef = useRef(true);
  const [isRefreshAllowed, setIsRefreshAllowed] = useState(true);
  const refreshingRef = useRef(false);
  
  // Refresh data when tab becomes active - with more guards against excessive refreshes
  useEffect(() => {
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }
    
    if (activeTab === value && isRefreshAllowed && !refreshingRef.current) {
      setIsRefreshing(true);
      refreshingRef.current = true;
      setIsRefreshAllowed(false); // Prevent multiple rapid refreshes
      
      // Invalidate relevant queries based on the active tab
      const invalidateQueries = async () => {
        try {
          await queryClient.invalidateQueries({
            queryKey: [value.replace("-", "_"), activeTab]
          });
        } catch (error) {
          console.error(`Error refreshing ${activeTab} tab:`, error);
        } finally {
          setIsRefreshing(false);
          refreshingRef.current = false;
          
          // Re-allow refreshes after a delay
          setTimeout(() => {
            setIsRefreshAllowed(true);
          }, 3000);
        }
      };
      
      invalidateQueries();
    }
    
    return () => {
      // Clean up any pending operations
    };
  }, [activeTab, value, setIsRefreshing, queryClient, isRefreshAllowed]);
  
  return (
    <TabsContent value={value}>
      {children}
    </TabsContent>
  );
}
