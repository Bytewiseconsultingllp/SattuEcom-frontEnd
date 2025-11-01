import api from '@/lib/axiosInstance';
import axios from 'axios';
import { getUserCookie } from '@/utils/cookie';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  isVerified?: boolean;
  address?: any;
  createdAt?: string;
};

export const getAllUsers = async (): Promise<{ success: boolean; data: UserProfile[] }> => {
  try {
    const res = await api.get('/users');
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
};

export const getProfile = async (): Promise<{ success: boolean; data: UserProfile }> => {
  try {
    const uc = getUserCookie();
    // Try multiple shapes to find the user id from cookie payload
    const userId = uc?.userId || uc?.id || uc?._id || uc?.user?._id || uc?.user?.id || uc?.data?.user?._id || uc?.data?.user?.id;
    if (!userId) {
      throw new Error('User ID not found in cookie');
    }
   const res = await api.get(`/auth/profile/${userId}`);
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
};
