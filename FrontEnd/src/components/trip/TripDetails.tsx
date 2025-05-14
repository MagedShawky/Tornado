
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { Percent } from "lucide-react";

interface TripDetailsProps {
  form: UseFormReturn<any>;
}

export function TripDetails({ form }: TripDetailsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Trip Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="destination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination</FormLabel>
              <FormControl>
                <Input placeholder="Destination" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price per Person (€)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  min={0}
                  step={0.01}
                  {...field} 
                  value={field.value} 
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="discount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount (%)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type="number" 
                    placeholder="0" 
                    min={0}
                    max={100}
                    step={1}
                    {...field} 
                    value={field.value} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    className="pr-8"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Percent className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="location_from"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departure Location</FormLabel>
              <FormControl>
                <Input placeholder="Starting point" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location_to"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Arrival Location</FormLabel>
              <FormControl>
                <Input placeholder="Ending point" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
