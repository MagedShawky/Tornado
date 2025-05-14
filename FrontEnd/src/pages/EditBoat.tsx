
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ViewBoatForm } from "@/components/ViewBoatForm";
import { DeckCabinConfig } from "@/components/boat-form/DeckCabinConfig";
import { useState } from "react";

const EditBoat = () => {
  const { boatId } = useParams();
  const [isEditing, setIsEditing] = useState(false);

  const { data: boat, isLoading: isLoadingBoat } = useQuery({
    queryKey: ["boat", boatId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("boats")
        .select("*")
        .eq("id", boatId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const { data: cabins, isLoading: isLoadingCabins } = useQuery({
    queryKey: ["boat-cabins", boatId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cabins")
        .select("*")
        .eq("boat_id", boatId)
        .order("deck", { ascending: true })
        .order("cabin_number", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!boatId,
  });

  const isLoading = isLoadingBoat || isLoadingCabins;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!boat) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-red-500">Boat not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-8">
        <h1 className="text-3xl font-bold">Edit Boat: {boat.name}</h1>
      </div>
      <div className="space-y-8">
        <ViewBoatForm 
          boat={boat} 
          cabins={cabins} 
          onEditingChange={setIsEditing}
          isEditing={isEditing}
        />
        <DeckCabinConfig 
          allowAddingCabins={true} 
          cabins={cabins || []} 
          boatId={boat.id}
          isEditing={isEditing}
        />
      </div>
    </div>
  );
};

export default EditBoat;
