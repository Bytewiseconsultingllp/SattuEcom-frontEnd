import api from '@/lib/axiosInstance';
import axios from 'axios';

/**
 * Offline Sales API
 */
export const getOfflineSales = async (page = 1, limit = 10, filters?: any) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.paymentMethod) params.append('paymentMethod', filters.paymentMethod);

    const response = await api.get(`/admin/offline-sales?${params.toString()}`);
    return response.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
};

/**
 * Expenses API
 */
export const getExpenses = async (page = 1, limit = 10, filters?: any) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters?.category) params.append('category', filters.category);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.vendor) params.append('vendor', filters.vendor);

    const response = await api.get(`/admin/expenses?${params.toString()}`);
    return response.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
};

/**
 * Payments API
 */
export const getPayments = async (page = 1, limit = 10, filters?: any) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get(`/admin/payments?${params.toString()}`);
    return response.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
};

/**
 * Reviews API
 */
export const getReviews = async (page = 1, limit = 10, filters?: any) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters?.product_id) params.append('product_id', filters.product_id);
    if (filters?.is_hidden !== undefined) params.append('is_hidden', filters.is_hidden.toString());

    const response = await api.get(`/admin/reviews?${params.toString()}`);
    return response.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
};
