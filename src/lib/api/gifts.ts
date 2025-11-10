import api from '@/lib/axiosInstance';
import axios from 'axios';

export type GiftDesignType = 'single_product' | 'combo';

export type GiftDesign = {
  _id: string;
  name: string;
  description?: string;
  type: GiftDesignType;
  price: number;
  product_id?: string;
  product_quantity?: number;
  combo_items?: Array<{ product_id: string; quantity: number }>;
  image_url?: string;
  wrapping_style?: string;
  includes_card?: boolean;
  card_message_template?: string;
  is_active: boolean;
  stock_available?: number;
  tags?: string[];
  category?: 'birthday' | 'anniversary' | 'wedding' | 'corporate' | 'thank-you' | 'congratulations' | 'get-well' | 'general';
  created_at: string;
  updated_at: string;
};

export type CustomGiftRequest = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  budget_min?: number;
  budget_max?: number;
  recipient_name?: string;
  occasion?: string;
  recipient_preferences?: string;
  design_images?: string[];
  reference_links?: string[];
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed';
  admin_notes?: string;
  estimated_price?: number;
  estimated_completion_date?: string;
  submitted_at: string;
  reviewed_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
};

// ============ PUBLIC GIFT DESIGN ROUTES ============

export async function getActiveGiftDesigns(type?: GiftDesignType): Promise<{ success: boolean; data: GiftDesign[] }> {
  try {
    const params = type ? { type } : {};
    const res = await api.get('/gifts/active', { params });
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

export async function getGiftDesignById(id: string): Promise<{ success: boolean; data: GiftDesign }> {
  try {
    const res = await api.get(`/gifts/${id}`);
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

// ============ ADMIN GIFT DESIGN ROUTES ============

export async function getAllAdminGiftDesigns(params?: {
  type?: GiftDesignType;
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ success: boolean; data: GiftDesign[]; pagination?: any }> {
  try {
    const res = await api.get('/admin/gifts', { params });
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

export async function createGiftDesign(payload: Omit<GiftDesign, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data: GiftDesign; message?: string }> {
  try {
    const res = await api.post('/admin/gifts', payload);
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

export async function updateGiftDesign(id: string, payload: Partial<GiftDesign>): Promise<{ success: boolean; data: GiftDesign; message?: string }> {
  try {
    const res = await api.put(`/admin/gifts/${id}`, payload);
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

export async function deleteGiftDesign(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await api.delete(`/admin/gifts/${id}`);
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

export async function toggleGiftDesignStatus(id: string, is_active: boolean): Promise<{ success: boolean; data: GiftDesign; message?: string }> {
  try {
    const res = await api.patch(`/admin/gifts/${id}/status`, { is_active });
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

// ============ CUSTOM GIFT REQUEST ROUTES ============

export async function submitCustomGiftRequest(payload: {
  title: string;
  description: string;
  budget_min?: number;
  budget_max?: number;
  recipient_name?: string;
  occasion?: string;
  recipient_preferences?: string;
  design_images?: string[];
  reference_links?: string[];
}): Promise<{ success: boolean; data: CustomGiftRequest; message?: string }> {
  try {
    const res = await api.post('/custom-gifts', payload);
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

export async function getUserCustomGiftRequests(params?: {
  page?: number;
  limit?: number;
}): Promise<{ success: boolean; data: CustomGiftRequest[]; pagination?: any }> {
  try {
    const res = await api.get('/custom-gifts/my-requests', { params });
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

export async function getCustomGiftRequestById(id: string): Promise<{ success: boolean; data: CustomGiftRequest }> {
  try {
    const res = await api.get(`/custom-gifts/my-requests/${id}`);
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

export async function getAllAdminCustomGiftRequests(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ success: boolean; data: CustomGiftRequest[]; pagination?: any }> {
  try {
    const res = await api.get('/admin/custom-gifts', { params });
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

export async function updateCustomGiftRequest(id: string, payload: {
  status?: string;
  admin_notes?: string;
  estimated_price?: number;
  estimated_completion_date?: string;
}): Promise<{ success: boolean; data: CustomGiftRequest; message?: string }> {
  try {
    const res = await api.put(`/admin/custom-gifts/${id}`, payload);
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}

export async function deleteCustomGiftRequest(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await api.delete(`/admin/custom-gifts/${id}`);
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw err;
  }
}
