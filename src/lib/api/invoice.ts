import api from '../axiosInstance';
import axios from 'axios';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  shippingCharges: number;
  total: number;
  issueDate: string;
  dueDate?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  paymentDate?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  notes?: string;
  terms?: string;
  status: 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

export interface InvoiceItem {
  productId?: string;
  name: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Address {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
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
export async function downloadInvoicePDF(id: string, invoiceNumber: string) {
  try {
    const res = await api.get(`/invoices/${id}/download`, {
      responseType: 'blob',
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice-${invoiceNumber}.pdf`);
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
export async function updateInvoiceStatus(
  id: string,
  status: string,
  paymentStatus?: string
) {
  try {
    const res = await api.patch(`/invoices/${id}/status`, {
      status,
      paymentStatus,
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
