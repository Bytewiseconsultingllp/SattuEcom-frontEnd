import api from "../axiosInstance";

export interface DashboardStats {
  onlineSales: number;
  offlineSales: number;
  expenses: number;
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  productsChange: number;
}

/**
 * Get dashboard statistics for admin
 * Calculates: Total Revenue = Online Sales + Offline Sales - Expenses
 */
export const getAdminDashboardStats = async () => {
  try {
    const response = await api.get("/admin/dashboard/stats");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch dashboard statistics");
  }
};

/**
 * Get online sales total
 */
export const getOnlineSalesTotal = async (filters?: {
  startDate?: string;
  endDate?: string;
}) => {
  try {
    const response = await api.get("/admin/dashboard/online-sales", { params: filters });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch online sales");
  }
};

/**
 * Get offline sales total
 */
export const getOfflineSalesTotal = async (filters?: {
  startDate?: string;
  endDate?: string;
}) => {
  try {
    const response = await api.get("/admin/dashboard/offline-sales", { params: filters });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch offline sales");
  }
};

/**
 * Get expenses total
 */
export const getExpensesTotal = async (filters?: { startDate?: string; endDate?: string }) => {
  try {
    const response = await api.get("/admin/dashboard/expenses", { params: filters });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch expenses");
  }
};

export const getRevenueOverview = async () => {
  try {
    const response = await api.get("/admin/dashboard/revenue-overview");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch revenue overview");
  }
};

export const getTopCategories = async () => {
  try {
    const response = await api.get("/admin/dashboard/top-categories");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch top categories");
  }
};

export const getRecentOrders = async (limit?: number) => {
  try {
    const response = await api.get("/admin/dashboard/recent-orders", { 
      params: limit ? { limit } : {} 
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch recent orders");
  }
};

export const getTopProducts = async (limit?: number) => {
  try {
    const response = await api.get("/admin/dashboard/top-products", { 
      params: limit ? { limit } : {} 
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch top products");
  }
};
