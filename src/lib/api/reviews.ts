import api from '@/lib/axiosInstance';
import axios from 'axios';

export type Review = {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  user?: { full_name: string };
  images?: string[]; // base64 data URLs or absolute URLs
};

export async function getProductReviews(
  productId: string,
  params?: { page?: number; limit?: number; rating?: number }
): Promise<{ success: boolean; count: number; page?: number; limit?: number; data: Review[] }> {
  try {
    const res = await api.get(`/reviews/product/${productId}`, { params });
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

export async function getProductReviewSummary(productId: string): Promise<{
  success: boolean;
  data: { average: number; count: number; breakdown: { 1: number; 2: number; 3: number; 4: number; 5: number } };
}> {
  try {
    const res = await api.get(`/reviews/product/${productId}/summary`);
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

export async function hasUserReviewed(productId: string): Promise<{ success: boolean; data: { hasReviewed: boolean; reviewId: string | null } }> {
  try {
    const res = await api.get('/reviews/check', { params: { product_id: productId } });
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

export async function createReview(payload: { product_id: string; rating: number; comment?: string; images?: string[] }): Promise<{ success: boolean; data: Review; message?: string }> {
  try {
    const res = await api.post('/reviews', payload);
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

export async function updateReview(
  id: string,
  payload: { rating?: number; comment?: string; images?: string[]; image_action?: 'append' | 'replace' }
): Promise<{ success: boolean; data: Review; message?: string }> {
  try {
    const res = await api.put(`/reviews/${id}`, payload);
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

export async function deleteReview(id: string): Promise<{ success: boolean; data: {}; message?: string }> {
  try {
    const res = await api.delete(`/reviews/${id}`);
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

export async function getUserReviews(params?: { page?: number; limit?: number }): Promise<{ success: boolean; count: number; page?: number; limit?: number; data: Review[] }> {
  try {
    const res = await api.get('/reviews/my-reviews', { params });
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}
