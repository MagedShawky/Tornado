
import { ChangeEvent, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DeckImageUploadProps {
  imageUrl: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  disabled?: boolean;
}

export function DeckImageUpload({ 
  imageUrl, 
  onChange, 
  label = "Upload Layout Image",
  disabled = false
}: DeckImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // For a production app, you would upload to Supabase storage here
      // For demonstration purposes, we're using local object URL
      // In a real implementation, replace this with Supabase storage upload
      
      // Create a URL for the selected file (this is temporary and browser-only)
      const localUrl = URL.createObjectURL(file);
      
      // Call the onChange handler with the URL
      onChange(localUrl);
    } catch (error) {
      console.error("Error handling file upload:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onChange(null);
  };

  return (
    <div className="space-y-2">
      {imageUrl ? (
        <div className="relative">
          <img 
            src={imageUrl} 
            alt="Deck Layout" 
            className="w-full h-auto max-h-[300px] object-contain border rounded"
          />
          <Button 
            variant="destructive" 
            size="icon" 
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer",
            (isUploading || disabled) && "opacity-50 pointer-events-none"
          )}
        >
          <label className={cn("block w-full", disabled ? "cursor-not-allowed" : "cursor-pointer")}>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading || disabled}
            />
            <div className="flex flex-col items-center py-4">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium">
                {isUploading ? "Uploading..." : label}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          </label>
        </div>
      )}
    </div>
  );
}
