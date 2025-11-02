import api from "../axiosInstance";

export interface Expense {
  id?: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  vendor: string;
  invoiceNumber?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get all expenses
 */
export const getExpenses = async (filters?: {
  category?: string;
  startDate?: string;
  endDate?: string;
  vendor?: string;
}) => {
  try {
    const response = await api.get("/admin/expenses", { params: filters });
    return response.data.data || [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch expenses");
  }
};

/**
 * Get expense statistics
 */
export const getExpenseStats = async () => {
  try {
    const response = await api.get("/admin/expenses/stats");
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch expense statistics");
  }
};

/**
 * Get single expense by ID
 */
export const getExpenseById = async (id: string) => {
  try {
    const response = await api.get(`/admin/expenses/${id}`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch expense");
  }
};

/**
 * Create new expense
 */
export const createExpense = async (expense: Expense) => {
  try {
    const response = await api.post("/admin/expenses", expense);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create expense");
  }
};

/**
 * Update expense
 */
export const updateExpense = async (id: string, expense: Partial<Expense>) => {
  try {
    const response = await api.put(`/admin/expenses/${id}`, expense);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update expense");
  }
};

/**
 * Delete expense
 */
export const deleteExpense = async (id: string) => {
  try {
    const response = await api.delete(`/admin/expenses/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete expense");
  }
};
