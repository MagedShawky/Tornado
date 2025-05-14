
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { BoatFormValues } from "./types";
import { StatusSelect } from "./StatusSelect";

interface BasicBoatInfoProps {
  form: UseFormReturn<any>;
  disabled?: boolean;
  totalCapacity: number;
  totalCabins: number;
}

export function BasicBoatInfo({ form, disabled = false, totalCapacity, totalCabins }: BasicBoatInfoProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Boat Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter boat name" {...field} disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Enter boat description"
                className="min-h-[100px]"
                {...field}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="capacity"
          render={({ field: { value } }) => (
            <FormItem>
              <FormLabel>Capacity</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  value={totalCapacity}
                  disabled={true}
                  className="bg-gray-50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cabin_count"
          render={({ field: { value } }) => (
            <FormItem>
              <FormLabel>Cabin Count</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  value={totalCabins}
                  disabled={true}
                  className="bg-gray-50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <StatusSelect form={form} disabled={disabled} />
      </div>
    </div>
  );
}
