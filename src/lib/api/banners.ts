import api from "../axiosInstance";

export interface Banner {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl?: string;
  season?: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  position?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get all banners
 */
export const getBanners = async (filters?: { isActive?: boolean; season?: string }) => {
  try {
    const response = await api.get("/banners", { params: filters });
    return response.data.data || [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch banners");
  }
};

/**
 * Get single banner by ID
 */
export const getBannerById = async (id: string) => {
  try {
    const response = await api.get(`/banners/${id}`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch banner");
  }
};

/**
 * Create new banner
 */
export const createBanner = async (banner: Banner) => {
  try {
    const response = await api.post("/banners", banner);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create banner");
  }
};

/**
 * Update banner
 */
export const updateBanner = async (id: string, banner: Partial<Banner>) => {
  try {
    const response = await api.put(`/banners/${id}`, banner);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update banner");
  }
};

/**
 * Delete banner
 */
export const deleteBanner = async (id: string) => {
  try {
    const response = await api.delete(`/banners/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete banner");
  }
};
