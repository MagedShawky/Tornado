
import { ClientInfoTableHeader } from "./ClientInfoTableHeader";
import { ClientInfoRow } from "./ClientInfoRow";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { useState } from "react";
import { exportBookingsToXLSX } from "@/utils/exportUtils";
import { toast } from "sonner";
import { Table, TableBody } from "@/components/ui/table";

interface ClientInfoProps {
  bedNumber: number;
  cabin: string;
  groupName: string;
  name: string;
  surname: string;
  foodRemarks: string;
  dateOfBirth: Date | undefined;
  visaNumber: string;
  visaIssueDate: Date | undefined;
  divingLicenseType: string;
  divingLevel: string;
  documentUploaded: boolean;
  [key: string]: string | number | boolean | Date | undefined;
}

interface ClientInfoTableProps {
  clients: ClientInfoProps[];
  onClientInfoChange: (index: number, field: string, value: string | Date | boolean) => void;
  tripId?: string;
  cabinBookings?: any[];
}

export function ClientInfoTable({ 
  clients, 
  onClientInfoChange,
  tripId,
  cabinBookings = []
}: ClientInfoTableProps) {
  const [isExporting, setIsExporting] = useState(false);
  
  // Sort clients by bed number to ensure consistent display
  const sortedClients = [...clients].sort((a, b) => a.bedNumber - b.bedNumber);
  
  // Export client info data
  const handleExportClientInfo = async () => {
    if (!tripId || isExporting) return;
    
    setIsExporting(true);
    try {
      // Get trip name from first booking
      const tripName = cabinBookings.length > 0 && cabinBookings[0].trip ? 
        cabinBookings[0].trip.destination : 
        "trip";
      
      const filename = `${tripName}-client-info.xlsx`;
      await exportBookingsToXLSX(cabinBookings, tripId, filename);
      toast.success("Client information exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="overflow-x-auto">
      {tripId && (
        <div className="flex justify-end mb-4">
          <Button
            onClick={handleExportClientInfo}
            variant="outline"
            disabled={isExporting || !cabinBookings.length}
          >
            <FileDown className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export Client Info'}
          </Button>
        </div>
      )}
      
      <Table className="w-full border-collapse">
        <ClientInfoTableHeader />
        <TableBody>
          {sortedClients.map((client, index) => {
            // Find the original index in the clients array
            const originalIndex = clients.findIndex(c => 
              c.bedNumber === client.bedNumber && 
              c.cabin === client.cabin
            );
            
            return (
              <ClientInfoRow 
                key={`${client.cabin}-${client.bedNumber}`} 
                client={client} 
                index={originalIndex} 
                onFieldChange={onClientInfoChange} 
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
