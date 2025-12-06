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

export const getAllUsers = async (page = 1, limit = 10, search = '', role = 'all'): Promise<any> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (role && role !== 'all') params.append('role', role);

    const res = await api.get(`/users?${params.toString()}`);
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

export const updateProfile = async (data: { name?: string; phone?: string; email?: string }): Promise<{ success: boolean; data: UserProfile; message: string }> => {
  try {
    const uc = getUserCookie();
    const userId = uc?.userId || uc?.id || uc?._id || uc?.user?._id || uc?.user?.id || uc?.data?.user?._id || uc?.data?.user?.id;
    if (!userId) {
      throw new Error('User ID not found in cookie');
    }
    const res = await api.put(`/auth/profile/${userId}`, data);
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
};

export const changePassword = async (data: { currentPassword: string; newPassword: string }): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await api.put('/auth/change-password', data);
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
};

export const sendEmailVerification = async (): Promise<{ success: boolean; message: string; data: { email: string; expiresIn: string } }> => {
  try {
    const res = await api.post('/auth/send-email-verification');
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
};

export const verifyEmail = async (otp: string): Promise<{ success: boolean; message: string; data: { id: string; email: string; isVerified: boolean } }> => {
  try {
    const res = await api.post('/auth/verify-email', { otp });
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
};
