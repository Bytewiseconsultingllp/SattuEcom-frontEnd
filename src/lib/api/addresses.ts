import api from '@/lib/axiosInstance';
import axios from 'axios';

export const getAddresses = async (): Promise<any> => {
  try {
    const res = await api.get('/addresses');
    return res.data; // { success, count, data }
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
};

export const getAddressById = async (id: string): Promise<any> => {
  try {
    const res = await api.get(`/addresses/${id}`);
    return res.data; // { success, data }
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
};

export const createAddress = async (payload: any): Promise<any> => {
  try {
    const res = await api.post('/addresses', payload);
    return res.data; // { success, data }
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
};

export const updateAddress = async (id: string, payload: any): Promise<any> => {
  try {
    const res = await api.put(`/addresses/${id}`, payload);
    return res.data; // { success, data }
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
};

export const deleteAddress = async (id: string): Promise<any> => {
  try {
    const res = await api.delete(`/addresses/${id}`);
    return res.data; // { success, message }
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
};

export const setDefaultAddress = async (id: string): Promise<any> => {
  try {
    const res = await api.patch(`/addresses/${id}/set-default`);
    return res.data; // { success, data }
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
};
