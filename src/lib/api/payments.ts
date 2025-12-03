import api from "../axiosInstance";
import axios from "axios";

// ✅ UPDATED: Added missing fields from backend Payment model
export interface Payment {
  id: string;
  order_id: string;
  user_id: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'partial_refund';
  payment_method?: string;
  payment_email?: string;
  payment_contact?: string;
  refund_id?: string;
  refund_amount: number;
  refund_status: 'none' | 'pending' | 'processed' | 'failed';
  sale_type?: 'online' | 'offline';
  error_code?: string;
  error_description?: string;
  metadata?: any;
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

/**
 * Create Razorpay payment order
 */
export async function createPaymentOrder(orderId: string): Promise<CreatePaymentOrderResponse> {
  try {
    const res = await api.post('/payments/create-order', { order_id: orderId });
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

/**
 * Verify payment after Razorpay checkout
 */
export async function verifyPayment(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  order_id: string;
}): Promise<VerifyPaymentResponse> {
  try {
    const res = await api.post('/payments/verify', data);
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

/**
 * Handle payment failure
 */
export async function handlePaymentFailure(data: {
  razorpay_order_id: string;
  error: {
    code?: string;
    description?: string;
  };
}): Promise<{ success: boolean; message: string }> {
  try {
    const res = await api.post('/payments/failed', data);
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

/**
 * Get user's payment history
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
    const res = await api.get('/payments/my-payments', { params });
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

/**
 * Get payment by ID
 */
export async function getPaymentById(id: string): Promise<{ success: boolean; data: Payment }> {
  try {
    const res = await api.get(`/payments/${id}`);
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

/**
 * Request refund
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
    const res = await api.post(`/payments/${paymentId}/refund`, data);
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

// Admin APIs
/**
 * Get all payments (Admin)
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
    const res = await api.get('/admin/payments', { params });
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

/**
 * Get payment statistics (Admin)
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
    const res = await api.get('/admin/payments/stats');
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

/**
 * Process refund (Admin)
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
    const res = await api.post(`/admin/payments/${paymentId}/refund`, data);
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}
