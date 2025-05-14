import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { BoatFormValues } from "./types";

interface PhotoUploadProps {
  form: UseFormReturn<BoatFormValues>;
  acceptedTypes: string[];
}

export function PhotoUpload({ form, acceptedTypes }: PhotoUploadProps) {
  return (
    <FormField
      control={form.control}
      name="feature_photo"
      render={({ field: { onChange, value, ...field } }) => (
        <FormItem>
          <FormLabel>Feature Photo</FormLabel>
          <FormControl>
            <Input
              type="file"
              accept={acceptedTypes.join(",")}
              onChange={(e) => onChange(e.target.files)}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}