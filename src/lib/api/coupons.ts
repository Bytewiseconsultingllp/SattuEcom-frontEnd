import api from '@/lib/axiosInstance';
import axios from 'axios';

export type CouponType = 'percentage' | 'fixed' | 'buy_x_get_y' | 'free_shipping';

export type Coupon = {
  id: string;
  code: string;
  type: CouponType;
  description?: string;
  discount_value?: number; // For percentage or fixed
  min_purchase_amount?: number;
  max_discount_amount?: number; // For percentage type
  buy_quantity?: number; // For buy_x_get_y
  get_quantity?: number; // For buy_x_get_y
  applicable_products?: string[]; // Product IDs
  applicable_categories?: string[]; // Category names
  start_date?: string;
  end_date?: string;
  usage_limit?: number;
  usage_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export async function getAllCoupons(params?: { is_active?: boolean }): Promise<{ success: boolean; data: Coupon[] }> {
  try {
    const res = await api.get('/coupons', { params });
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

export async function getAllAdminCoupons(params?: { is_active?: boolean }): Promise<{ success: boolean; data: Coupon[] }> {
  try {
    const res = await api.get('/admin/coupons', { params });
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

export async function getActiveCoupons(): Promise<{ success: boolean; data: Coupon[] }> {
  try {
    const res = await api.get('/coupons/active');
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

export async function validateCoupon(code: string, cartTotal: number): Promise<{ 
  success: boolean; 
  data: { valid: boolean; coupon?: Coupon; discount_amount?: number; message?: string } 
}> {
  try {
    const res = await api.post('/coupons/validate', { code, cart_total: cartTotal });
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

export async function applyCoupon(code: string, cartItems: any[]): Promise<{ 
  success: boolean; 
  data: { coupon: Coupon; discount_amount: number; final_amount: number } 
}> {
  try {
    const res = await api.post('/coupons/apply', { code, cart_items: cartItems });
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

// Admin functions
export async function createCoupon(payload: Omit<Coupon, 'id' | 'created_at' | 'updated_at' | 'usage_count'>): Promise<{ success: boolean; data: Coupon; message?: string }> {
  try {
    const res = await api.post('/admin/coupons', payload);
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

export async function updateCoupon(id: string, payload: Partial<Coupon>): Promise<{ success: boolean; data: Coupon; message?: string }> {
  try {
    const res = await api.put(`/admin/coupons/${id}`, payload);
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

export async function deleteCoupon(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await api.delete(`/admin/coupons/${id}`);
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

export async function toggleCouponStatus(id: string, isActive: boolean): Promise<{ success: boolean; data: Coupon; message?: string }> {
  try {
    const res = await api.patch(`/admin/coupons/${id}/status`, { is_active: isActive });
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}
