
import { useQuery } from "@tanstack/react-query";
import { Cabin } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";

export function useCabins(boatId: string | undefined) {
  return useQuery({
    queryKey: ["cabins", boatId],
    queryFn: async () => {
      console.log("Fetching cabins for boat ID:", boatId);
      
      if (!boatId) {
        console.error("No boat ID available");
        return [];
      }

      const { data, error } = await supabase
        .from("cabins")
        .select("*")
        .eq("boat_id", boatId)
        .order("deck", { ascending: true })
        .order("cabin_number", { ascending: true });

      if (error) {
        console.error("Error fetching cabins:", error);
        throw error;
      }
      
      console.log("Cabins data received:", data);
      return data as Cabin[];
    },
    enabled: !!boatId,
  });
}
