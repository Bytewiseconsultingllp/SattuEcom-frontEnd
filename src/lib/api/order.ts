import axios from 'axios';
import api from '../axiosInstance';

export type OrderItemInput = { product_id: string; quantity: number; price: number };

export async function getOrders() {
  try {
    const res = await api.get('/orders');
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

export async function getOrderById(id: string) {
  try {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

export async function createOrder(payload: { total_amount: number; shipping_address_id: string; items: OrderItemInput[] }) {
  try {
    const res = await api.post('/orders', payload);
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

export async function updateOrderStatus(id: string, status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled') {
  try {
    const res = await api.patch(`/orders/${id}/status`, { status });
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

export async function cancelOrder(id: string, reason?: string) {
  try {
    const res = await api.patch(`/orders/${id}/cancel`, reason ? { reason } : undefined);
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

export async function getAllOrders() {
  try {
    const res = await api.get('/orders/all');
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}
