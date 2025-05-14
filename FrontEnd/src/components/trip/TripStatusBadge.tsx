
import { Badge } from "@/components/ui/badge";

interface TripStatusBadgeProps {
  status: string;
}

export function TripStatusBadge({ status }: TripStatusBadgeProps) {
  const statusBadgeColor = () => {
    if (status === 'completed') return "bg-green-100 text-green-800";
    if (status === 'cancelled') return "bg-red-100 text-red-800";
    return "bg-blue-100 text-blue-800";
  };

  return (
    <Badge className={statusBadgeColor()}>
      {status}
    </Badge>
  );
}
