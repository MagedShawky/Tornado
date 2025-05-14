
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Bed } from "lucide-react";
import { Cabin } from "@/types/database";
import { CabinType } from "../types";

interface CabinCardProps {
  cabin: Cabin;
  onEdit: (cabin: Cabin) => void;
  onDelete: (cabinId: string) => void;
  allowEditing?: boolean;
}

const renderCabinType = (type: CabinType) => {
  switch (type) {
    case "twin_beds":
      return "Twin Beds";
    case "twin_beds_bunk":
      return "Twin Beds + Bunk";
    case "suite_double":
      return "Suite (Double)";
    default:
      return type;
  }
};

export function CabinCard({ cabin, onEdit, onDelete, allowEditing = false }: CabinCardProps) {
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h4 className="font-medium">
            Cabin {cabin.cabin_number}
          </h4>
          <div className="text-sm text-gray-600">
            <p>Type: {renderCabinType(cabin.cabin_type)}</p>
            <p>Beds: {cabin.bed_count}</p>
            <p>Base Price: ${cabin.base_price}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {allowEditing && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => onEdit(cabin)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDelete(cabin.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
          {cabin.bed_numbers && cabin.bed_numbers.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
              <Bed className="w-4 h-4" />
              <span>{cabin.bed_numbers.filter(n => n).join(', ')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
