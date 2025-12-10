import { useState, useRef } from 'react';
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
    escape?: boolean;
    backdropclose?: boolean;
  };
  timeout?: number;
  retry?: {
    enabled?: boolean;
    max_count?: number;
  };
}

// Configuration constants
const CONFIG = {
  SCRIPT_LOAD_TIMEOUT: 10000, // 10 seconds
  PAYMENT_ORDER_TIMEOUT: 30000, // 30 seconds
  PAYMENT_VERIFY_TIMEOUT: 45000, // 45 seconds
  RAZORPAY_CHECKOUT_TIMEOUT: 150000, // 15 minutes
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 2000, // 2 seconds
};

export const useRazorpay = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const paymentInProgressRef = useRef(false);
  const razorpayInstanceRef = useRef<any>(null);

  /**
   * Load Razorpay script with timeout
   */
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const timeout = setTimeout(() => {
        console.error('Razorpay script load timeout');
        resolve(false);
      }, CONFIG.SCRIPT_LOAD_TIMEOUT);

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };
      
      script.onerror = () => {
        clearTimeout(timeout);
        console.error('Failed to load Razorpay script');
        resolve(false);
      };
      
      document.body.appendChild(script);
    });
  };

  /**
   * Create payment order with timeout and retry
   */
  const createOrderWithRetry = async (
    orderId: string,
    attempt: number = 1
  ): Promise<any> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.PAYMENT_ORDER_TIMEOUT);

      const orderResponse = await Promise.race([
        createPaymentOrder(orderId),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Payment order creation timeout')), CONFIG.PAYMENT_ORDER_TIMEOUT)
        ),
      ]);

      clearTimeout(timeoutId);
      return orderResponse;
    } catch (error: any) {
      console.error(`Payment order creation attempt ${attempt} failed:`, error);

      if (attempt < CONFIG.MAX_RETRY_ATTEMPTS) {
        // Exponential backoff
        const delay = CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return createOrderWithRetry(orderId, attempt + 1);
      }

      throw error;
    }
  };

  /**
   * Verify payment with timeout and retry
   */
  const verifyPaymentWithRetry = async (
    data: any,
    attempt: number = 1
  ): Promise<any> => {
    try {
      const verifyResponse = await Promise.race([
        verifyPayment(data),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Payment verification timeout')), CONFIG.PAYMENT_VERIFY_TIMEOUT)
        ),
      ]);

      return verifyResponse;
    } catch (error: any) {
      console.error(`Payment verification attempt ${attempt} failed:`, error);

      if (attempt < CONFIG.MAX_RETRY_ATTEMPTS) {
        const delay = CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return verifyPaymentWithRetry(data, attempt + 1);
      }

      throw error;
    }
  };

  /**
   * Handle payment timeout
   */
  const handlePaymentTimeout = async (orderId: string, razorpay_order_id: string) => {
    try {
      await handlePaymentFailure({
        razorpay_order_id,
        error: {
          code: 'PAYMENT_TIMEOUT',
          description: 'Payment session expired. Please try again.',
        },
      });
      
      toast.error('Payment session expired');
      window.location.href = `/payment-pending?order_id=${orderId}&timeout=true`;
    } catch (error) {
      console.error('Failed to record payment timeout:', error);
    }
  };

  /**
   * Cleanup function
   */
  const cleanup = () => {
    setIsProcessing(false);
    paymentInProgressRef.current = false;
    
    // Clear delivery options and address from sessionStorage
    try {
      sessionStorage.removeItem('delivery_options');
      sessionStorage.removeItem('selected_address_id');
    } catch (e) {
      console.error('Failed to clear session storage:', e);
    }
    
    if (razorpayInstanceRef.current) {
      try {
        razorpayInstanceRef.current.close();
      } catch (e) {
        console.error('Error closing Razorpay instance:', e);
      }
      razorpayInstanceRef.current = null;
    }
  };

  /**
   * Initiate payment with production-ready features
   */
  const initiatePayment = async (
    orderId: string,
    userDetails?: {
      name?: string;
      email?: string;
      contact?: string;
    }
  ): Promise<{ success: boolean; paymentId?: string; error?: string }> => {
    // Prevent duplicate payment attempts
    if (paymentInProgressRef.current) {
      toast.warning('Payment is already in progress');
      return { success: false, error: 'Payment already in progress' };
    }

    try {
      setIsProcessing(true);
      paymentInProgressRef.current = true;

      // Load Razorpay script with timeout
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway. Please check your internet connection.');
        cleanup();
        return { success: false, error: 'Failed to load Razorpay script' };
      }

      // Create payment order with retry
      const orderResponse = await createOrderWithRetry(orderId);
      const { razorpay_order_id, amount, currency, key_id } = orderResponse.data;

      // Set payment timeout
      const paymentTimeoutId = setTimeout(() => {
        handlePaymentTimeout(orderId, razorpay_order_id);
        cleanup();
      }, CONFIG.RAZORPAY_CHECKOUT_TIMEOUT);

      // Razorpay options with production settings
      const options: RazorpayOptions = {
        key: key_id,
        amount: amount * 100, // Amount in paise
        currency,
        name: 'Sattu Ecom',
        description: 'Order Payment',
        order_id: razorpay_order_id,
        timeout: CONFIG.RAZORPAY_CHECKOUT_TIMEOUT / 1000, // Convert to seconds
        retry: {
          enabled: true,
          max_count: 3,
        },
        handler: async (response: any) => {
          clearTimeout(paymentTimeoutId);
          
          try {
            // Verify payment with retry
            const verifyResponse = await verifyPaymentWithRetry({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderId,
            });

            if (verifyResponse.success) {
              toast.success('Payment successful!');
              cleanup();
              // Redirect to order confirmation page
              window.location.href = `/order-confirmation?order_id=${orderId}&payment_id=${response.razorpay_payment_id}`;
              return { success: true, paymentId: verifyResponse.data.payment_id };
            } else {
              toast.error('Payment verification failed. Please contact support.');
              cleanup();
              // Redirect to failed page
              window.location.href = `/payment-failed?order_id=${orderId}&error_code=VERIFICATION_FAILED&error_description=${encodeURIComponent('Payment verification failed')}`;
              return { success: false, error: 'Verification failed' };
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            
            const errorMessage = error.message || 'Payment verification failed';
            const isTimeout = errorMessage.includes('timeout');
            
            toast.error(isTimeout ? 'Verification timeout. Please check your order status.' : errorMessage);
            cleanup();
            
            // Redirect to appropriate page
            window.location.href = isTimeout
              ? `/payment-pending?order_id=${orderId}&verification_timeout=true`
              : `/payment-failed?order_id=${orderId}&error_code=VERIFICATION_ERROR&error_description=${encodeURIComponent(errorMessage)}`;
            
            return { success: false, error: errorMessage };
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
            clearTimeout(paymentTimeoutId);
            
            // Handle payment cancellation
            try {
              await handlePaymentFailure({
                razorpay_order_id,
                error: {
                  code: 'USER_CANCELLED',
                  description: 'Payment cancelled by user',
                },
              });
              toast.info('Payment cancelled');
              // Redirect to pending page
              window.location.href = `/payment-pending?order_id=${orderId}&cancelled=true`;
            } catch (error) {
              console.error('Failed to record payment cancellation:', error);
            }
            cleanup();
          },
          escape: true,
          backdropclose: false, // Prevent accidental closure
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpayInstanceRef.current = razorpay;

      // Handle payment failure event
      razorpay.on('payment.failed', async (response: any) => {
        clearTimeout(paymentTimeoutId);
        
        try {
          await handlePaymentFailure({
            razorpay_order_id,
            error: {
              code: response.error.code,
              description: response.error.description,
            },
          });
          
          const errorCode = response.error.code;
          const errorDesc = response.error.description || 'Payment failed';
          
          toast.error(errorDesc);
          cleanup();
          
          // Redirect to failed page with detailed error
          window.location.href = `/payment-failed?order_id=${orderId}&error_code=${errorCode}&error_description=${encodeURIComponent(errorDesc)}`;
        } catch (error) {
          console.error('Failed to record payment failure:', error);
        }
      });

      razorpay.open();
      return { success: true };
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      
      const errorMessage = error.message || 'Failed to initiate payment';
      const isTimeout = errorMessage.includes('timeout');
      
      toast.error(isTimeout ? 'Request timeout. Please try again.' : errorMessage);
      cleanup();
      
      return { success: false, error: errorMessage };
    }
  };

  return {
    initiatePayment,
    isProcessing,
  };
};
