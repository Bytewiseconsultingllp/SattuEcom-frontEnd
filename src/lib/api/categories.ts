import api from '@/lib/axiosInstance';
import axios from 'axios';

export type Category = {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
};

export const getCategories = async (): Promise<{ success: boolean; data: Category[] }> => {
  try {
    const res = await api.get('/categories');
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
};

export const createCategory = async (name: string): Promise<{ success: boolean; data: Category; message?: string }> => {
  try {
    const res = await api.post('/categories', { name });
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
};
