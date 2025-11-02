import { useState } from "react";
import { Button } from "./ui/button";
import { useRazorpay } from "@/hooks/useRazorpay.production";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PaymentButtonProps {
  orderId: string;
  amount: number;
  userDetails?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess?: () => void;
  onFailure?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function PaymentButton({
  orderId,
  amount,
  userDetails,
  onSuccess,
  onFailure,
  className,
  children,
}: PaymentButtonProps) {
  const { initiatePayment, isProcessing } = useRazorpay();
  const navigate = useNavigate();

  const handlePayment = async () => {
    const result = await initiatePayment(orderId, userDetails);

    if (result.success) {
      onSuccess?.();
      // Navigate to order success page
      navigate(`/orders/${orderId}?payment=success`);
    } else {
      onFailure?.();
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isProcessing}
      className={className}
      size="lg"
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children || `Pay ₹${amount.toFixed(2)}`
      )}
    </Button>
  );
}
