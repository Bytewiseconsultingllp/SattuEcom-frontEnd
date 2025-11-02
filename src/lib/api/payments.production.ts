import api from "../axiosInstance";
import axios, { AxiosError } from "axios";

export interface Payment {
  id: string;
  order_id: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'partial_refund';
  payment_method?: string;
  payment_email?: string;
  payment_contact?: string;
  refund_amount?: number;
  refund_status?: 'none' | 'pending' | 'processed' | 'failed';
  error_description?: string;
  created_at: string;
  updated_at: string;
  order?: {
    total_amount: number;
    status: string;
  };
}

export interface CreatePaymentOrderResponse {
  success: boolean;
  data: {
    razorpay_order_id: string;
    amount: number;
    currency: string;
    key_id: string;
    order_id: string;
    payment_id: string;
  };
  message: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  data: {
    payment_id: string;
    order_id: string;
    status: string;
    amount: number;
  };
  message: string;
}

// Timeout configurations
const TIMEOUTS = {
  CREATE_ORDER: 30000, // 30 seconds
  VERIFY_PAYMENT: 45000, // 45 seconds
  PAYMENT_FAILURE: 15000, // 15 seconds
  GET_PAYMENTS: 20000, // 20 seconds
  REFUND: 30000, // 30 seconds
};

/**
 * Create axios request with timeout
 */
function createRequestWithTimeout<T>(
  requestFn: () => Promise<T>,
  timeout: number,
  errorMessage: string = 'Request timeout'
): Promise<T> {
  return Promise.race([
    requestFn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeout)
    ),
  ]);
}

/**
 * Enhanced error handler
 */
function handleApiError(err: any, context: string): never {
  console.error(`${context} error:`, err);

  if (err.message?.includes('timeout')) {
    throw new Error(`Request timeout. Please check your internet connection and try again.`);
  }

  if (axios.isAxiosError(err)) {
    const axiosError = err as AxiosError<any>;
    
    // Network error
    if (!axiosError.response) {
      throw new Error('Network error. Please check your internet connection.');
    }

    // Server error
    const status = axiosError.response.status;
    const serverMsg = axiosError.response.data?.message ?? axiosError.response.data ?? axiosError.message;
    
    if (status === 401) {
      throw new Error('Session expired. Please login again.');
    }
    
    if (status === 403) {
      throw new Error('Access denied. You do not have permission to perform this action.');
    }
    
    if (status === 404) {
      throw new Error('Resource not found.');
    }
    
    if (status >= 500) {
      throw new Error('Server error. Please try again later.');
    }

    throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
  }

  throw err;
}

/**
 * Create Razorpay payment order with timeout
 */
export async function createPaymentOrder(orderId: string): Promise<CreatePaymentOrderResponse> {
  try {
    return await createRequestWithTimeout(
      () => api.post('/payments/create-order', { order_id: orderId }).then(res => res.data),
      TIMEOUTS.CREATE_ORDER,
      'Payment order creation timeout'
    );
  } catch (err: any) {
    handleApiError(err, 'Create payment order');
  }
}

/**
 * Verify payment after Razorpay checkout with timeout
 */
export async function verifyPayment(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  order_id: string;
}): Promise<VerifyPaymentResponse> {
  try {
    return await createRequestWithTimeout(
      () => api.post('/payments/verify', data).then(res => res.data),
      TIMEOUTS.VERIFY_PAYMENT,
      'Payment verification timeout'
    );
  } catch (err: any) {
    handleApiError(err, 'Verify payment');
  }
}

/**
 * Handle payment failure with timeout
 */
export async function handlePaymentFailure(data: {
  razorpay_order_id: string;
  error: {
    code?: string;
    description?: string;
  };
}): Promise<{ success: boolean; message: string }> {
  try {
    return await createRequestWithTimeout(
      () => api.post('/payments/failed', data).then(res => res.data),
      TIMEOUTS.PAYMENT_FAILURE,
      'Payment failure recording timeout'
    );
  } catch (err: any) {
    // Don't throw error for failure recording - it's not critical
    console.error('Failed to record payment failure:', err);
    return { success: false, message: 'Failed to record payment failure' };
  }
}

/**
 * Get user's payment history with timeout
 */
export async function getMyPayments(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{
  success: boolean;
  count: number;
  total: number;
  page: number;
  limit: number;
  data: Payment[];
}> {
  try {
    return await createRequestWithTimeout(
      () => api.get('/payments/my-payments', { params }).then(res => res.data),
      TIMEOUTS.GET_PAYMENTS,
      'Get payments timeout'
    );
  } catch (err: any) {
    handleApiError(err, 'Get my payments');
  }
}

/**
 * Get payment by ID with timeout
 */
export async function getPaymentById(id: string): Promise<{ success: boolean; data: Payment }> {
  try {
    return await createRequestWithTimeout(
      () => api.get(`/payments/${id}`).then(res => res.data),
      TIMEOUTS.GET_PAYMENTS,
      'Get payment timeout'
    );
  } catch (err: any) {
    handleApiError(err, 'Get payment by ID');
  }
}

/**
 * Request refund with timeout
 */
export async function requestRefund(
  paymentId: string,
  data: { amount?: number; reason?: string }
): Promise<{
  success: boolean;
  data: { refund_id: string; amount: number; status: string };
  message: string;
}> {
  try {
    return await createRequestWithTimeout(
      () => api.post(`/payments/${paymentId}/refund`, data).then(res => res.data),
      TIMEOUTS.REFUND,
      'Refund request timeout'
    );
  } catch (err: any) {
    handleApiError(err, 'Request refund');
  }
}

// Admin APIs
/**
 * Get all payments (Admin) with timeout
 */
export async function getAllPayments(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}): Promise<{
  success: boolean;
  count: number;
  total: number;
  page: number;
  limit: number;
  data: Payment[];
}> {
  try {
    return await createRequestWithTimeout(
      () => api.get('/admin/payments', { params }).then(res => res.data),
      TIMEOUTS.GET_PAYMENTS,
      'Get all payments timeout'
    );
  } catch (err: any) {
    handleApiError(err, 'Get all payments');
  }
}

/**
 * Get payment statistics (Admin) with timeout
 */
export async function getPaymentStats(): Promise<{
  success: boolean;
  data: {
    total_payments: number;
    total_revenue: number;
    total_refunds: number;
    by_status: Array<{ _id: string; count: number; total_amount: number }>;
  };
}> {
  try {
    return await createRequestWithTimeout(
      () => api.get('/admin/payments/stats').then(res => res.data),
      TIMEOUTS.GET_PAYMENTS,
      'Get payment stats timeout'
    );
  } catch (err: any) {
    handleApiError(err, 'Get payment stats');
  }
}

/**
 * Process refund (Admin) with timeout
 */
export async function processRefund(
  paymentId: string,
  data: { amount?: number; reason?: string }
): Promise<{
  success: boolean;
  data: { refund_id: string; amount: number; status: string; payment_status: string };
  message: string;
}> {
  try {
    return await createRequestWithTimeout(
      () => api.post(`/admin/payments/${paymentId}/refund`, data).then(res => res.data),
      TIMEOUTS.REFUND,
      'Process refund timeout'
    );
  } catch (err: any) {
    handleApiError(err, 'Process refund');
  }
}

/**
 * Retry helper for critical operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 2000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt < maxAttempts) {
        // Exponential backoff
        const delay = delayMs * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}
