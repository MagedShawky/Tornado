
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { DeckPhoto } from "@/types/database";

interface DeckPhotosProps {
  deckNames: string[];
  boatId: string | undefined;
}

export function DeckPhotos({ deckNames, boatId }: DeckPhotosProps) {
  // If there are no decks, don't show the section
  if (deckNames.length === 0) {
    return null;
  }

  // Fetch deck photos
  const { data: deckPhotos, isLoading } = useQuery({
    queryKey: ["deck-photos", boatId],
    queryFn: async () => {
      if (!boatId) return [];
      
      const { data, error } = await supabase
        .from("deck_photos")
        .select("*")
        .eq("boat_id", boatId);
        
      if (error) {
        console.error("Error fetching deck photos:", error);
        throw error;
      }
      
      // Cast the data to proper DeckPhoto type
      return data as unknown as DeckPhoto[];
    },
    enabled: !!boatId,
  });

  // Use placeholder images for decks without photos
  const placeholderImages = [
    "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb", 
    "https://images.unsplash.com/photo-1500673922987-e212871fec22",
    "https://images.unsplash.com/photo-1487252665478-49b61b47f302"
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Deck Plans</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          // Loading states
          Array.from({ length: deckNames.length || 2 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-48 w-full rounded-md" />
            </div>
          ))
        ) : (
          // Map through deck names and show photos or placeholders
          deckNames.map((deckName, index) => {
            // Find photo for this deck
            const deckPhoto = deckPhotos?.find(photo => photo.deck.toLowerCase() === deckName.toLowerCase());
            // Use photo URL or fallback to placeholder
            const photoUrl = deckPhoto?.photo_url || placeholderImages[index % placeholderImages.length];
            
            return (
              <div key={deckName} className="border rounded-lg overflow-hidden shadow-sm">
                <div className="p-2 bg-gray-50 font-medium">
                  Deck {deckName}
                </div>
                <div className="h-48 overflow-hidden">
                  <img
                    src={photoUrl}
                    alt={`Deck ${deckName} Layout`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
