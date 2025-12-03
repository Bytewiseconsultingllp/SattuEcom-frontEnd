import api from '../axiosInstance';
import axios from 'axios';

// ✅ UPDATED: All fields now use snake_case matching backend
export interface Invoice {
  id: string;
  invoice_number: string;
  user_id: string;
  order_id: string;
  
  // User details (from populate)
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  
  // Items
  items: InvoiceItem[];
  
  // Amounts - all snake_case
  subtotal: number;
  discount_amount: number;
  coupon_discount: number;
  gift_price: number;
  delivery_charges: number;
  tax_amount: number;
  total_amount: number;
  
  // Dates
  issue_date: string;
  due_date?: string;
  
  // Payment info
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  payment_date?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  
  // Sale type
  sale_type: 'online' | 'offline';
  
  // UPI (for offline sales)
  upi_qr_code?: string;
  upi_id?: string;
  
  // Addresses
  billing_address?: Address;
  shipping_address?: Address;
  
  // Additional
  notes?: string;
  terms?: string;
  pdf_url?: string;
  
  // Status
  status: 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';
  
  // Timestamps
  created_at: string;
  updated_at?: string;
  
  // Additional for offline tracking
  days_pending?: number;
}

// ✅ UPDATED: Item fields use snake_case
export interface InvoiceItem {
  product_id?: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  amount: number;
}

// ✅ UPDATED: Address fields use snake_case
export interface Address {
  full_name: string;
  phone: string;
  email?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

/**
 * Get user's invoices
 */
export async function getUserInvoices(params?: {
  page?: number;
  limit?: number;
}) {
  try {
    const res = await api.get('/invoices/my-invoices', { params });
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
 * Get invoice by ID
 */
export async function getInvoiceById(id: string) {
  try {
    const res = await api.get(`/invoices/${id}`);
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
 * Download invoice PDF
 */
// ✅ UPDATED: Parameter name changed to snake_case
export async function downloadInvoicePDF(id: string, invoice_number: string) {
  try {
    const res = await api.get(`/invoices/${id}/download`, {
      responseType: 'blob',
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice-${invoice_number}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

/**
 * Get all invoices (admin)
 */
export async function getAllInvoices(params?: {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  search?: string;
}) {
  try {
    const res = await api.get('/invoices', { params });
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
 * Update invoice status (admin)
 */
// ✅ UPDATED: Parameter name changed to snake_case
export async function updateInvoiceStatus(
  id: string,
  status: string,
  payment_status?: string
) {
  try {
    const res = await api.patch(`/invoices/${id}/status`, {
      status,
      payment_status,
    });
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
 * Delete invoice (admin)
 */
export async function deleteInvoice(id: string) {
  try {
    const res = await api.delete(`/invoices/${id}`);
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
 * Get next invoice number (admin)
 */
export async function getNextInvoiceNumber() {
  try {
    const res = await api.get('/invoices/next-number');
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}
