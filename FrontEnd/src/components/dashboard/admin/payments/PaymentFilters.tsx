
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaymentFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  paymentType: string;
  onPaymentTypeChange: (value: string) => void;
}

export function PaymentFilters({
  searchQuery,
  onSearchChange,
  paymentType,
  onPaymentTypeChange
}: PaymentFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-grow">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search payments..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="w-full sm:w-48">
        <Select
          value={paymentType}
          onValueChange={onPaymentTypeChange}
        >
          <SelectTrigger className="w-full">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="customer">Customers</SelectItem>
            <SelectItem value="agent">Agents</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
