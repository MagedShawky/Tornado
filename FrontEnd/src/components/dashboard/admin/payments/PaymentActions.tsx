
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Payment } from "./use-payments";

interface PaymentActionsProps {
  payment: Payment;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onReturnToUnpaid: (id: string) => Promise<void>;
}

export function PaymentActions({
  payment,
  onApprove,
  onReject,
  onReturnToUnpaid
}: PaymentActionsProps) {
  if (payment.status === 'paid' || payment.status === 'confirmed') {
    return (
      <div className="flex justify-end">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onReturnToUnpaid(payment.id)}
          className="text-yellow-600 hover:text-yellow-900"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-end space-x-2">
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => onApprove(payment.id)}
        className="text-green-600 hover:text-green-900"
      >
        <CheckCircle className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => onReject(payment.id)}
        className="text-red-600 hover:text-red-900"
      >
        <XCircle className="h-4 w-4" />
      </Button>
    </div>
  );
}
