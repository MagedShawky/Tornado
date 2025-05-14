
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CabinConfig, CabinType } from "../types";
import { CabinTypeSelect } from "./CabinTypeSelect";
import { CabinBedNumbers } from "./CabinBedNumbers";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { Cabin } from "@/types/database";
import { useEffect } from "react";

interface CabinFormProps {
  boatId: string;
  onSuccess: () => void;
  cabin?: Cabin;
}

export function CabinForm({ boatId, onSuccess, cabin }: CabinFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<CabinConfig>({
    defaultValues: {
      deck: cabin?.deck || "Main",
      cabinNumber: cabin?.cabin_number || "",
      type: cabin?.cabin_type || "twin_beds",
      bedCount: cabin?.bed_count || 2,
      bedNumbers: cabin?.bed_numbers || Array(cabin?.bed_count || 2).fill(''),
      basePrice: cabin?.base_price || 0
    }
  });

  const cabinType = form.watch('type');
  const bedCount = cabinType === 'twin_beds_bunk' ? 4 : 2;

  useEffect(() => {
    form.setValue('bedCount', bedCount);
  }, [bedCount, form]);

  const handleTypeChange = (value: CabinType) => {
    form.setValue('type', value);
  };

  const onSubmit = async (data: CabinConfig) => {
    try {
      if (cabin) {
        const { error } = await supabase
          .from('cabins')
          .update({
            deck: data.deck,
            cabin_number: data.cabinNumber,
            cabin_type: data.type,
            bed_count: data.bedCount,
            base_price: data.basePrice,
            bed_numbers: data.bedNumbers
          })
          .eq('id', cabin.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cabins')
          .insert({
            boat_id: boatId,
            deck: data.deck,
            cabin_number: data.cabinNumber,
            cabin_type: data.type,
            bed_count: data.bedCount,
            base_price: data.basePrice,
            bed_numbers: data.bedNumbers
          });

        if (error) throw error;
      }

      await queryClient.invalidateQueries({ queryKey: ['boat-cabins', boatId] });
      toast({
        title: "Success",
        description: `Cabin ${cabin ? 'updated' : 'added'} successfully`,
      });
      onSuccess();
    } catch (error) {
      console.error('Error saving cabin:', error);
      toast({
        title: "Error",
        description: `Failed to ${cabin ? 'update' : 'add'} cabin. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="deck"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="deck">Deck Name</Label>
                <FormControl>
                  <Input
                    id="deck"
                    placeholder="e.g. Main, Upper"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cabinNumber"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="cabinNumber">Cabin Number</Label>
                <FormControl>
                  <Input
                    id="cabinNumber"
                    placeholder="e.g. 101, 201"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="col-span-2">
            <CabinTypeSelect
              value={form.watch('type')}
              onValueChange={handleTypeChange}
            />
          </div>

          <FormField
            control={form.control}
            name="basePrice"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="basePrice">Base Price</Label>
                <FormControl>
                  <Input
                    id="basePrice"
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="col-span-2">
            <CabinBedNumbers
              bedNumbers={form.watch('bedNumbers')}
              onChange={(bedNumbers) => form.setValue('bedNumbers', bedNumbers)}
              maxBeds={bedCount}
            />
          </div>
        </div>

        <Button type="submit" className="w-full">
          {cabin ? 'Update Cabin' : 'Add Cabin'}
        </Button>
      </form>
    </Form>
  );
}
