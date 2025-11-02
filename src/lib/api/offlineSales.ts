import api from "../axiosInstance";

export interface OfflineSaleItem {
  product: string;
  quantity: number;
  price: number;
}

export interface OfflineSale {
  id?: string;
  date: string;
  customerName: string;
  customerPhone: string;
  items: OfflineSaleItem[];
  totalAmount: number;
  paymentMethod: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get all offline sales
 */
export const getOfflineSales = async (filters?: {
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
}) => {
  try {
    const response = await api.get("/admin/offline-sales", { params: filters });
    return response.data.data || [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch offline sales");
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
