
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaymentActions } from "./PaymentActions";
import { Payment } from "./use-payments";

interface PaymentsTableProps {
  payments: Payment[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onReturnToUnpaid: (id: string) => Promise<void>;
}

export function PaymentsTable({ 
  payments, 
  onApprove, 
  onReject, 
  onReturnToUnpaid 
}: PaymentsTableProps) {
  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 border rounded-md">
        <p className="text-gray-500 mb-2">No payments found</p>
        <p className="text-sm text-gray-400">
          There are no payments matching your current filters
        </p>
      </div>
    );
  }
  
  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableCaption>
          Showing {payments.length} {payments.length === 1 ? 'payment' : 'payments'}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>User</TableHead>  
            <TableHead>Type</TableHead>
            <TableHead>Booking</TableHead>
            <TableHead>Trip</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map(payment => (
            <TableRow key={payment.id}>
              <TableCell className="font-mono text-xs">{payment.id.slice(0, 8)}</TableCell>
              <TableCell className="max-w-[150px] truncate">
                {payment.userName || payment.userEmail}
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                  ${payment.userType === 'agent' ? 'bg-purple-100 text-purple-800' : 
                    payment.userType === 'customer' ? 'bg-green-100 text-green-800' : 
                    'bg-gray-100 text-gray-800'}`}
                >
                  {payment.userType || 'customer'}
                </span>
              </TableCell>
              <TableCell className="font-mono text-xs">{payment.bookingId.slice(0, 8)}</TableCell>
              <TableCell className="max-w-[150px] truncate">{payment.trip}</TableCell>
              <TableCell>${payment.amount.toFixed(2)}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                  ${payment.status === 'paid' || payment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                    payment.status === 'pending' || payment.status === 'option' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'}`}
                >
                  {payment.status}
                </span>
              </TableCell>
              <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
              <TableCell>
                <PaymentActions
                  payment={payment}
                  onApprove={onApprove}
                  onReject={onReject}
                  onReturnToUnpaid={onReturnToUnpaid}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
