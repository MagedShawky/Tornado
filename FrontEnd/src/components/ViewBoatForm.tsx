
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BasicBoatInfo } from "./boat-form/BasicBoatInfo";
import { Boat } from "@/types/database";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const viewBoatFormSchema = z.object({
  name: z.string(),
  description: z.string(),
  capacity: z.number(),
  cabin_count: z.number(),
  status: z.enum(["active", "inactive"]),
});

type ViewBoatFormValues = z.infer<typeof viewBoatFormSchema>;

interface ViewBoatFormProps {
  boat: Boat;
  cabins?: any[];
  isEditing?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
}

export function ViewBoatForm({ 
  boat, 
  cabins = [], 
  isEditing = false, 
  onEditingChange
}: ViewBoatFormProps) {
  const [internalIsEditing, setInternalIsEditing] = useState(isEditing);
  const [deckLayoutImage, setDeckLayoutImage] = useState<File | null>(null);
  const [deckLayoutPreview, setDeckLayoutPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Sync external isEditing with internal state
  useEffect(() => {
    setInternalIsEditing(isEditing);
  }, [isEditing]);

  // Calculate total cabin count and capacity
  const totalCabins = cabins.length;
  const totalCapacity = cabins.reduce((sum, cabin) => sum + cabin.bed_count, 0);

  const form = useForm<ViewBoatFormValues>({
    resolver: zodResolver(viewBoatFormSchema),
    defaultValues: {
      name: boat.name,
      description: boat.description,
      capacity: totalCapacity,
      cabin_count: totalCabins,
      status: boat.status as "active" | "inactive",
    },
  });

  // Update form values when cabins change
  useEffect(() => {
    form.setValue('capacity', totalCapacity);
    form.setValue('cabin_count', totalCabins);
  }, [cabins, form, totalCapacity, totalCabins]);

  const onSubmit = async (data: ViewBoatFormValues) => {
    try {
      const { error } = await supabase
        .from('boats')
        .update({
          name: data.name,
          description: data.description,
          capacity: totalCapacity, // Always use calculated values
          cabin_count: totalCabins, // Always use calculated values
          status: data.status,
        })
        .eq('id', boat.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['boat', boat.id] });
      
      toast({
        title: "Success",
        description: "Boat details updated successfully",
      });
      
      toggleEditing(false);
    } catch (error) {
      console.error('Error updating boat:', error);
      toast({
        title: "Error",
        description: "Failed to update boat details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeckLayoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDeckLayoutImage(file);
      setDeckLayoutPreview(URL.createObjectURL(file));
    }
  };

  const toggleEditing = (value: boolean) => {
    setInternalIsEditing(value);
    if (onEditingChange) {
      onEditingChange(value);
    }
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Boat Details</h2>
        <Button
          variant="outline"
          onClick={() => {
            if (internalIsEditing) {
              form.reset();
              setDeckLayoutImage(null);
              setDeckLayoutPreview(null);
            }
            toggleEditing(!internalIsEditing);
          }}
        >
          {internalIsEditing ? "Cancel" : "Edit"}
        </Button>
      </div>
      
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Basic Details</TabsTrigger>
          <TabsTrigger value="layout">Deck Layout</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
                <div className="space-y-6">
                  <BasicBoatInfo 
                    form={form} 
                    disabled={!internalIsEditing} 
                    totalCapacity={totalCapacity}
                    totalCabins={totalCabins}
                  />
                </div>
                <div className="h-full">
                  {boat.feature_photo && (
                    <div className="h-full w-full rounded-md overflow-hidden">
                      <img
                        src={boat.feature_photo}
                        alt={boat.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {internalIsEditing && (
                <Button type="submit" className="w-full">
                  Save Changes
                </Button>
              )}
            </form>
          </Form>
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
                    disabled={!internalIsEditing}
                  />
                  <p className="text-sm text-gray-500">
                    Upload an image showing the deck layout. For a more comprehensive deck layout management, please use the Deck Layout Images section below.
                  </p>
                </div>
                
                {(deckLayoutPreview) && (
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
    </div>
  );
}
