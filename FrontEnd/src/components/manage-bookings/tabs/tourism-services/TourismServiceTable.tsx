
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { TourismService } from "./types";

interface TourismServiceTableProps {
  services: TourismService[];
  availableBeds: number[];
  onServiceChange: (index: number, field: keyof TourismService, value: any) => void;
  onRemoveService: (index: number) => void;
}

export function TourismServiceTable({
  services,
  availableBeds,
  onServiceChange,
  onRemoveService
}: TourismServiceTableProps) {
  return (
    <div className="border rounded-md">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Bed Number</TableHead>
              <TableHead>Service Name</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price/Unit</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Select 
                    value={service.bedNumber !== null ? service.bedNumber.toString() : "no-bed"} 
                    onValueChange={(value) => onServiceChange(index, 'bedNumber', value === "no-bed" ? null : Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bed" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-bed">No bed</SelectItem>
                      {availableBeds.map((bedNumber) => (
                        <SelectItem key={bedNumber} value={bedNumber.toString()}>
                          {bedNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input 
                    value={service.serviceName} 
                    onChange={(e) => onServiceChange(index, 'serviceName', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Select 
                    value={service.serviceType} 
                    onValueChange={(value) => onServiceChange(index, 'serviceType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excursion">Excursion</SelectItem>
                      <SelectItem value="tour">Tour</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                      <SelectItem value="activity">Activity</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input 
                    type="date"
                    value={service.serviceDate ? new Date(service.serviceDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => onServiceChange(index, 'serviceDate', e.target.value ? new Date(e.target.value) : null)}
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    type="number" 
                    value={service.quantity} 
                    onChange={(e) => onServiceChange(index, 'quantity', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    type="number" 
                    value={service.pricePerUnit} 
                    onChange={(e) => onServiceChange(index, 'pricePerUnit', e.target.value)}
                  />
                </TableCell>
                <TableCell className="font-bold">
                  {service.totalPrice.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Select 
                    value={service.status} 
                    onValueChange={(value) => onServiceChange(index, 'status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input 
                    value={service.notes} 
                    onChange={(e) => onServiceChange(index, 'notes', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onRemoveService(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
