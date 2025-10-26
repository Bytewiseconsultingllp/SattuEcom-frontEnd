import api from '@/lib/axiosInstance';
import axios from 'axios';

export const getWishlistItems = async (): Promise<any> => {
  try {
    const res = await api.get('/wishlist');
    return res.data; // { success, count, data }
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
};

export const addToWishlist = async (productId: string): Promise<any> => {
  try {
    const res = await api.post('/wishlist', { product_id: productId });
    return res.data; // { success, data, message }
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
};

export const removeFromWishlist = async (itemId: string): Promise<any> => {
  try {
    const res = await api.delete(`/wishlist/${itemId}`);
    return res.data; // { success, message }
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
};

export const isInWishlist = async (productId: string): Promise<any> => {
  try {
    const res = await api.get('/wishlist/check', { params: { product_id: productId } });
    return res.data; // { success, data: { inWishlist, itemId } }
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
};

export const clearWishlist = async (): Promise<any> => {
  try {
    const res = await api.delete('/wishlist/clear/all');
    return res.data; // { success, message }
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
};
