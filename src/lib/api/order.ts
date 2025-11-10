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

export async function createOrder(payload: {
  total_amount: number;
  shipping_address_id: string;
  items: OrderItemInput[];
  coupon_code?: string;
  discount_amount?: number;
  gift_design_id?: string;
  gift_price?: number;
  gift_card_message?: string;
  gift_wrapping_type?: string;
}) {
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

export async function updateOrderStatus(
  id: string, 
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  shipmentDetails?: { deliveryPartner?: string; trackingNumber?: string; estimatedDelivery?: string }
) {
  try {
    const payload: any = { status };
    if (shipmentDetails) {
      payload.shipment = shipmentDetails;
    }
    const res = await api.patch(`/orders/${id}/status`, payload);
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
