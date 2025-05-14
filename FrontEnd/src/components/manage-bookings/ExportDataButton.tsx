
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { exportBookingsToXLSX } from "@/utils/exportUtils";
import { toast } from "sonner";

interface ExportDataButtonProps {
  trip: {
    id: string;
    destination: string;
  };
  bookings: any[];
  label?: string;
  variant?: "default" | "outline" | "secondary";
  className?: string;
}

export function ExportDataButton({
  trip,
  bookings,
  label = "Export All Data",
  variant = "outline",
  className = ""
}: ExportDataButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    try {
      const bookingsToExport = bookings.map(booking => ({
        ...booking,
        group_name: booking.group_name || "default"
      }));
      
      const filename = `${trip.destination}-complete-data.xlsx`;
      await exportBookingsToXLSX(bookingsToExport, trip.id, filename);
      toast.success("Export completed successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      onClick={handleExport} 
      variant={variant}
      disabled={isExporting}
      className={className}
    >
      <FileDown className="mr-2 h-4 w-4" />
      {isExporting ? 'Exporting...' : label}
    </Button>
  );
}
