import api from "../axiosInstance";

export interface OfflineSaleItem {
  product: string;
  quantity: number;
  price: number;
}

export interface OfflineSalesResponse {
  success: boolean;
  data: OfflineSale[];
  count?: number;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface OfflineSale {
  _id?: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: OfflineSaleItem[];
  totalAmount: number;
  finalAmount?: number;
  paymentMethod: string;
  notes?: string; 
  gstType?: string;
  discount?: number;
  created_at?: string;
  updated_at?: string;
  // Optional flags for backend behavior
  suppressEmail?: boolean;
}

/**
 * Get all offline sales
 */
export const getOfflineSales = async (filters?: {
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  gstType?: string;
  q?: string;
  page?: number;
  limit?: number;
}): Promise<OfflineSalesResponse> => {
  try {
    const response = await api.get("/admin/offline-sales", { params: filters });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch offline sales");
  }
};

export const getRegistrationStatus = async (emails: string[]): Promise<Record<string, boolean>> => {
  try {
    if (!emails || emails.length === 0) return {};
    const response = await api.get(`/admin/offline-sales/registered-status`, {
      params: { emails: emails.join(',') },
    });
    return response.data?.data || {};
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch registration status');
  }
};

export const sendCredentialForSale = async (id: string) => {
  try {
    const response = await api.post(`/admin/offline-sales/${id}/send-credential`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to send credential");
  }
};

export const sendCredentialsBulk = async (payload: {
  emails?: string[];
  startDate?: string;
  endDate?: string;
  ratePerMinute?: number;
}) => {
  try {
    const response = await api.post(`/admin/offline-sales/send-credentials`, payload);
    return response.data?.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to send credentials");
  }
};

export const exportOfflineSales = async (period: 'weekly' | 'monthly' | 'quarterly' | 'annually'): Promise<Blob> => {
  try {
    const response = await api.get(`/admin/offline-sales/export`, {
      params: { period },
      responseType: 'blob',
    });
    return response.data as Blob;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Export failed');
  }
};

/**
 * Get offline sales statistics
 */
export const getOfflineSalesStats = async () => {
  try {
    const response = await api.get("/admin/offline-sales/stats");
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch sales statistics");
  }
};


/**
 * Get single offline sale by ID
 */
export const getOfflineSaleById = async (id: string) => {
  try {
    const response = await api.get(`/admin/offline-sales/${id}`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch offline sale");
  }
};

/**
 * Create new offline sale
 */
export const createOfflineSale = async (sale: OfflineSale) => {
  try {
    const response = await api.post("/admin/offline-sales", sale);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create offline sale");
  }
};

/**
 * Update offline sale
 */
export const updateOfflineSale = async (id: string, sale: Partial<OfflineSale>) => {
  try {
    const response = await api.put(`/admin/offline-sales/${id}`, sale);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update offline sale");
  }
};

/**
 * Delete offline sale
 */
export const deleteOfflineSale = async (id: string) => {
  try {
    const response = await api.delete(`/admin/offline-sales/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete offline sale");
  }
};
