import api from "../axiosInstance";

export interface ContactQuery {
  id?: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status?: "new" | "in-progress" | "resolved" | "closed";
  priority?: "low" | "medium" | "high";
  response?: string;
  respondedBy?: string;
  respondedAt?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get all contact queries (admin only)
 */
export const getContactQueries = async (filters?: {
  status?: string;
  priority?: string;
  searchQuery?: string;
}) => {
  try {
    const response = await api.get("/contact-queries", { params: filters });
    return response.data.data || [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch contact queries");
  }
};

/**
 * Get contact query statistics (admin only)
 */
export const getContactQueryStats = async () => {
  try {
    const response = await api.get("/contact-queries/stats");
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch query statistics");
  }
};

/**
 * Get single contact query by ID (admin only)
 */
export const getContactQueryById = async (id: string) => {
  try {
    const response = await api.get(`/contact-queries/${id}`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch contact query");
  }
};

/**
 * Submit new contact query (public)
 */
export const submitContactQuery = async (query: Omit<ContactQuery, "id" | "status" | "priority" | "response">) => {
  try {
    const response = await api.post("/contact-queries", query);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to submit contact query");
  }
};

/**
 * Update contact query (admin only)
 */
export const updateContactQuery = async (
  id: string,
  updates: { status?: string; priority?: string; response?: string }
) => {
  try {
    const response = await api.put(`/contact-queries/${id}`, updates);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update contact query");
  }
};

/**
 * Delete contact query (admin only)
 */
export const deleteContactQuery = async (id: string) => {
  try {
    const response = await api.delete(`/contact-queries/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete contact query");
  }
};
