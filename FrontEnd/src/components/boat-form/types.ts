
import { z } from "zod";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const boatFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  capacity: z.number().min(1, "Capacity must be a positive number"),
  cabin_count: z.number().min(0, "Cabin count must be a non-negative number"),
  status: z.enum(["active", "inactive"]),
  feature_photo: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, "Image is required")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, "Max file size is 5MB")
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported"
    ),
});

export type BoatFormValues = z.infer<typeof boatFormSchema>;
