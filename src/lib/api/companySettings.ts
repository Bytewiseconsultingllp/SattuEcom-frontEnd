import api from "../axiosInstance";

export interface CompanySettings {
  id?: string;
  companyName: string;
  description?: string;
  email: string;
  phone: string;
  address: string;
  gstNumber?: string;
  panNumber?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  logo?: string;
  signature?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get company settings
 */
export const getCompanySettings = async () => {
  try {
    const response = await api.get("/company-settings");
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch company settings");
  }
};

/**
 * Update company settings
 */
export const updateCompanySettings = async (settings: Partial<CompanySettings>) => {
  try {
    const response = await api.put("/company-settings", settings);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update company settings");
  }
};
