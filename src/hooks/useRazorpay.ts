import { useState } from 'react';
import { createPaymentOrder, verifyPayment, handlePaymentFailure } from '@/lib/api/payments';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export const useRazorpay = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Load Razorpay script
   */
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  /**
   * Initiate payment
   */
  const initiatePayment = async (
    orderId: string,
    userDetails?: {
      name?: string;
      email?: string;
      contact?: string;
    }
  ): Promise<{ success: boolean; paymentId?: string; error?: string }> => {
    try {
      setIsProcessing(true);

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway');
        return { success: false, error: 'Failed to load Razorpay script' };
      }

      // Create payment order
      const orderResponse = await createPaymentOrder(orderId);
      const { razorpay_order_id, amount, currency, key_id } = orderResponse.data;

      // Razorpay options
      const options: RazorpayOptions = {
        key: key_id,
        amount: amount * 100, // Amount in paise
        currency,
        name: 'Sattu Ecom',
        description: 'Order Payment',
        order_id: razorpay_order_id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderId,
            });

            if (verifyResponse.success) {
              toast.success('Payment successful!');
              setIsProcessing(false);
              // Redirect to success page
              window.location.href = `/payment-success?order_id=${orderId}&payment_id=${response.razorpay_payment_id}`;
              return { success: true, paymentId: verifyResponse.data.payment_id };
            } else {
              toast.error('Payment verification failed');
              setIsProcessing(false);
              // Redirect to failed page
              window.location.href = `/payment-failed?order_id=${orderId}&error_description=${encodeURIComponent('Verification failed')}`;
              return { success: false, error: 'Verification failed' };
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            toast.error(error.message || 'Payment verification failed');
            setIsProcessing(false);
            // Redirect to failed page
            window.location.href = `/payment-failed?order_id=${orderId}&error_description=${encodeURIComponent(error.message || 'Payment verification failed')}`;
            return { success: false, error: error.message };
          }
        },
        prefill: {
          name: userDetails?.name,
          email: userDetails?.email,
          contact: userDetails?.contact,
        },
        theme: {
          color: '#F97316', // Orange color
        },
        modal: {
          ondismiss: async () => {
            // Handle payment cancellation
            try {
              await handlePaymentFailure({
                razorpay_order_id,
                error: {
                  description: 'Payment cancelled by user',
                },
              });
              toast.info('Payment cancelled');
              // Redirect to pending page
              window.location.href = `/payment-pending?order_id=${orderId}`;
            } catch (error) {
              console.error('Failed to record payment cancellation:', error);
            }
            setIsProcessing(false);
          },
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', async (response: any) => {
        try {
          await handlePaymentFailure({
            razorpay_order_id,
            error: {
              code: response.error.code,
              description: response.error.description,
            },
          });
          toast.error(response.error.description || 'Payment failed');
          // Redirect to failed page
          window.location.href = `/payment-failed?order_id=${orderId}&error_code=${response.error.code}&error_description=${encodeURIComponent(response.error.description || 'Payment failed')}`;
        } catch (error) {
          console.error('Failed to record payment failure:', error);
        }
        setIsProcessing(false);
      });

      razorpay.open();
      return { success: true };
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      toast.error(error.message || 'Failed to initiate payment');
      setIsProcessing(false);
      return { success: false, error: error.message };
    }
  };

  return {
    initiatePayment,
    isProcessing,
  };
};
