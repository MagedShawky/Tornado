
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePayments } from "./payments/use-payments";
import { PaymentFilters } from "./payments/PaymentFilters";
import { PaymentsTable } from "./payments/PaymentsTable";

export function PendingPayments() {
  const [showPaid, setShowPaid] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentType, setPaymentType] = useState("all");
  
  const {
    payments,
    loading,
    fetchPayments,
    handleApprovePayment,
    handleRejectPayment,
    handleReturnToUnpaid
  } = usePayments(showPaid);
  
  // Filter payments based on search query and type
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.trip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.userName && payment.userName.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesType = paymentType === "all" || payment.userType === paymentType;
    
    return matchesSearch && matchesType;
  });
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {showPaid ? "Paid Payments" : "Pending Payments"}
        </h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowPaid(!showPaid)}
            className="flex items-center gap-2"
          >
            {showPaid ? "Show Pending" : "Show Paid"}
          </Button>
          <Button variant="outline" onClick={fetchPayments}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      <PaymentFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        paymentType={paymentType}
        onPaymentTypeChange={setPaymentType}
      />
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <PaymentsTable
          payments={filteredPayments}
          onApprove={handleApprovePayment}
          onReject={handleRejectPayment}
          onReturnToUnpaid={handleReturnToUnpaid}
        />
      )}
    </div>
  );
}
