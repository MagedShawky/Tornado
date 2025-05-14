
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CabinForm } from "./cabin/dialog/CabinForm";
import { Cabin, DeckPhoto } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CabinList } from "./cabin/display/CabinList";
import { DeleteCabinDialog } from "./cabin/display/DeleteCabinDialog";
import { DeckImageUpload } from "./DeckImageUpload";

interface DeckCabinConfigProps {
  allowAddingCabins?: boolean;
  cabins: Cabin[];
  boatId: string;
  isEditing?: boolean;
}

export function DeckCabinConfig({ 
  allowAddingCabins = false, 
  cabins, 
  boatId,
  isEditing = true 
}: DeckCabinConfigProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCabin, setEditingCabin] = useState<Cabin | null>(null);
  const [deletingCabinId, setDeletingCabinId] = useState<string | null>(null);
  const [deckImages, setDeckImages] = useState<Record<string, string | null>>({});
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get unique deck names from cabins
  const deckNames = [...new Set(cabins.map(cabin => cabin.deck))];

  // Fetch existing deck photos on component mount
  useEffect(() => {
    const fetchDeckPhotos = async () => {
      if (!boatId) return;
      
      const { data, error } = await supabase
        .from('deck_photos')
        .select('*')
        .eq('boat_id', boatId);
        
      if (error) {
        console.error("Error fetching deck photos:", error);
        return;
      }
      
      if (data && data.length > 0) {
        // Cast data to DeckPhoto[] type
        const deckPhotosData = data as unknown as DeckPhoto[];
        
        const photosByDeck = deckPhotosData.reduce((acc, photo) => {
          acc[photo.deck] = photo.photo_url;
          return acc;
        }, {} as Record<string, string | null>);
        
        setDeckImages(photosByDeck);
      }
    };
    
    fetchDeckPhotos();
  }, [boatId]);

  const handleDeleteCabin = async (cabinId: string) => {
    try {
      const { error } = await supabase
        .from('cabins')
        .delete()
        .eq('id', cabinId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['boat-cabins', boatId] });
      
      toast({
        title: "Success",
        description: "Cabin deleted successfully",
      });
      
      setDeletingCabinId(null);
    } catch (error) {
      console.error('Error deleting cabin:', error);
      toast({
        title: "Error",
        description: "Failed to delete cabin. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditCabin = (cabin: Cabin) => {
    setEditingCabin(cabin);
    setIsEditDialogOpen(true);
  };

  const handleDeckImageUpdate = async (deckName: string, imageUrl: string | null) => {
    if (!boatId || !deckName) return;
    
    setIsUploading(true);
    
    try {
      if (imageUrl) {
        // For a local file upload (if it's a file URL)
        if (imageUrl.startsWith('blob:')) {
          // In a real app, we would upload to Supabase storage here
          // For now, we'll just store the URL directly
          
          // First check if a record exists for this deck
          const { data: existingData } = await supabase
            .from('deck_photos')
            .select('*')
            .eq('boat_id', boatId)
            .eq('deck', deckName)
            .maybeSingle();
            
          if (existingData) {
            // Update existing record using a type assertion
            await supabase
              .from('deck_photos')
              .update({ photo_url: imageUrl } as any)
              .eq('id', existingData.id);
          } else {
            // Insert new record using a type assertion
            await supabase
              .from('deck_photos')
              .insert({ 
                boat_id: boatId, 
                deck: deckName, 
                photo_url: imageUrl 
              } as any);
          }
          
          // Update local state
          setDeckImages(prev => ({
            ...prev,
            [deckName]: imageUrl
          }));
          
          // Invalidate deck photos query to refresh data elsewhere
          queryClient.invalidateQueries({ queryKey: ['deck-photos', boatId] });
          
          toast({
            title: "Success",
            description: `Deck ${deckName} image updated successfully`,
          });
        }
      } else {
        // Remove the image from the database if imageUrl is null
        await supabase
          .from('deck_photos')
          .delete()
          .eq('boat_id', boatId)
          .eq('deck', deckName);
          
        // Update local state
        setDeckImages(prev => ({
          ...prev,
          [deckName]: null
        }));
        
        // Invalidate deck photos query
        queryClient.invalidateQueries({ queryKey: ['deck-photos', boatId] });
        
        toast({
          title: "Success",
          description: `Deck ${deckName} image removed`,
        });
      }
    } catch (error) {
      console.error("Error updating deck image:", error);
      toast({
        title: "Error",
        description: "Failed to update deck image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const deletingCabin = cabins.find(cabin => cabin.id === deletingCabinId);

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Cabin Configuration</h3>
          {allowAddingCabins && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={!isEditing}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Cabin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Cabin</DialogTitle>
                </DialogHeader>
                <CabinForm 
                  boatId={boatId} 
                  onSuccess={() => setIsAddDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Deck Layout Images */}
        {deckNames.length > 0 && (
          <div className="mb-6 space-y-6">
            <h4 className="font-medium text-gray-700">Deck Layout Images</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {deckNames.map(deckName => (
                <div key={deckName} className="border rounded-lg p-4">
                  <h5 className="font-medium mb-3">{deckName} Deck Layout</h5>
                  <DeckImageUpload 
                    imageUrl={deckImages[deckName] || null}
                    onChange={(url) => handleDeckImageUpdate(deckName, url)}
                    label={`Upload ${deckName} Deck Layout`}
                    disabled={!isEditing || isUploading}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {cabins?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No cabins configured for this boat
          </div>
        ) : (
          <CabinList
            cabins={cabins}
            onEdit={handleEditCabin}
            onDelete={setDeletingCabinId}
            allowEditing={allowAddingCabins && isEditing}
          />
        )}

        {/* Edit Dialog */}
        {editingCabin && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Cabin {editingCabin.cabin_number}</DialogTitle>
              </DialogHeader>
              <CabinForm
                boatId={boatId}
                cabin={editingCabin}
                onSuccess={() => {
                  setIsEditDialogOpen(false);
                  setEditingCabin(null);
                }}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Dialog */}
        {deletingCabin && (
          <DeleteCabinDialog
            cabinNumber={deletingCabin.cabin_number}
            isOpen={!!deletingCabinId}
            onClose={() => setDeletingCabinId(null)}
            onConfirm={() => handleDeleteCabin(deletingCabin.id)}
          />
        )}
      </div>
    </div>
  );
}
