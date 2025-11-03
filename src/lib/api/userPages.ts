import api from '@/lib/axiosInstance';
import axios from 'axios';

/**
 * Orders API
 */
export const getOrders = async (page = 1, limit = 10, filters?: any) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters?.status) params.append('status', filters.status);

    const response = await api.get(`/orders?${params.toString()}`);
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

    const response = await api.get(`/payments/my-payments?${params.toString()}`);
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
 * Wishlist API
 */
export const getWishlist = async (page = 1, limit = 10, filters?: any) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get(`/wishlist?${params.toString()}`);
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

    const response = await api.get(`/reviews/my-reviews?${params.toString()}`);
    return response.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
};
