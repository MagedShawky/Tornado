
import { Toaster } from "@/components/ui/toaster";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BasicBoatInfo } from "./boat-form/BasicBoatInfo";
import { PhotoUpload } from "./boat-form/PhotoUpload";
import { StatusSelect } from "./boat-form/StatusSelect";
import { DeckCabinConfig } from "./boat-form/DeckCabinConfig";
import { boatFormSchema, ACCEPTED_IMAGE_TYPES, BoatFormValues } from "./boat-form/types";
import { CabinInsert } from "@/types/database";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

interface BoatFormProps {
  onSuccess?: () => void;
}

type CabinType = "twin_beds" | "twin_beds_bunk" | "suite_double";

const defaultCabins: CabinInsert[] = [
  { cabin_number: '101', cabin_type: 'twin_beds', deck: 'Main', bed_count: 2, base_price: 1150, boat_id: '' },
  { cabin_number: '102', cabin_type: 'twin_beds', deck: 'Main', bed_count: 2, base_price: 1150, boat_id: '' },
  { cabin_number: '103', cabin_type: 'twin_beds_bunk', deck: 'Main', bed_count: 4, base_price: 950, boat_id: '' },
  { cabin_number: '201', cabin_type: 'suite_double', deck: 'Upper', bed_count: 2, base_price: 1350, boat_id: '' },
  { cabin_number: '202', cabin_type: 'suite_double', deck: 'Upper', bed_count: 2, base_price: 1350, boat_id: '' },
];

const createDefaultCabins = async (boatId: string) => {
  const cabinsWithBoatId = defaultCabins.map(cabin => ({
    ...cabin,
    boat_id: boatId
  }));

  const { error } = await supabase
    .from('cabins')
    .insert(cabinsWithBoatId);

  if (error) throw error;
};

export function BoatForm({ onSuccess }: BoatFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBoatId, setNewBoatId] = useState<string>('');
  const [deckLayoutImage, setDeckLayoutImage] = useState<File | null>(null);
  const [deckLayoutPreview, setDeckLayoutPreview] = useState<string | null>(null);
  
  // Calculate total capacity and cabin count from default cabins
  const totalCapacity = defaultCabins.reduce((sum, cabin) => sum + cabin.bed_count, 0);
  const totalCabins = defaultCabins.length;
  
  const form = useForm<BoatFormValues>({
    resolver: zodResolver(boatFormSchema),
    defaultValues: {
      name: "",
      description: "",
      capacity: totalCapacity,
      cabin_count: totalCabins,
      status: "active",
    },
  });

  const handleDeckLayoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDeckLayoutImage(file);
      setDeckLayoutPreview(URL.createObjectURL(file));
    }
  };

  async function onSubmit(data: BoatFormValues) {
    try {
      setIsSubmitting(true);
      
      // Upload image to storage
      const file = data.feature_photo[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('boat-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('boat-photos')
        .getPublicUrl(fileName);

      // Insert boat data with feature photo URL and calculated totals directly from defaultCabins
      const { data: boatData, error } = await supabase
        .from('boats')
        .insert([
          {
            name: data.name,
            description: data.description,
            capacity: defaultCabins.reduce((sum, cabin) => sum + cabin.bed_count, 0),
            cabin_count: defaultCabins.length,
            status: data.status,
            feature_photo: publicUrl,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setNewBoatId(boatData.id);

      // Create default cabins for the new boat
      await createDefaultCabins(boatData.id);

      toast({
        title: "Success!",
        description: "Boat and cabins have been successfully added.",
        variant: "default",
      });
      
      queryClient.invalidateQueries({ queryKey: ["boats"] });
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error inserting boat:', error);
      toast({
        title: "Error",
        description: "Failed to add boat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="details">Basic Details</TabsTrigger>
              <TabsTrigger value="layout">Deck Layout</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <BasicBoatInfo 
                    form={form} 
                    totalCapacity={totalCapacity} 
                    totalCabins={totalCabins}
                  />
                  <StatusSelect form={form} />
                </div>
                <div className="space-y-6">
                  <PhotoUpload form={form} acceptedTypes={ACCEPTED_IMAGE_TYPES} />
                  <DeckCabinConfig 
                    allowAddingCabins={false} 
                    cabins={[]} 
                    boatId={newBoatId} 
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layout">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="deck-layout">Deck Layout Image</Label>
                      <Input
                        id="deck-layout"
                        type="file"
                        accept="image/*"
                        onChange={handleDeckLayoutChange}
                      />
                      <p className="text-sm text-gray-500">
                        Upload an image showing the deck layout. This is only for visualization and won't be saved in the database.
                      </p>
                    </div>
                    
                    {deckLayoutPreview && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">Deck Layout Preview</h3>
                        <div className="border rounded-md overflow-hidden">
                          <img
                            src={deckLayoutPreview}
                            alt="Deck Layout"
                            className="w-full h-auto max-h-[500px] object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding Boat..." : "Add Boat"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
