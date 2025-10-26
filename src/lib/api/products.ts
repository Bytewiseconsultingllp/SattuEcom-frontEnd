import { supabase } from '@/integrations/supabase/client';
import api from '@/lib/axiosInstance';
import axios from 'axios';

export const getWishlistItems = async (userId: string) => {
	const { data, error } = await supabase
		.from('wishlist_items')
		.select(`
			*,
			product:products(*)
		`)
		.eq('user_id', userId);

	if (error) throw error;
	return data;
};

export const addToWishlist = async (userId: string, productId: string) => {
	const { data, error } = await supabase
		.from('wishlist_items')
		.insert({ user_id: userId, product_id: productId })
		.select()
		.single();

	if (error) throw error;
	return data;
};

export const removeFromWishlist = async (itemId: string) => {
	const { error } = await supabase
		.from('wishlist_items')
		.delete()
		.eq('id', itemId);

	if (error) throw error;
};

export const isInWishlist = async (userId: string, productId: string) => {
	const { data, error } = await supabase
		.from('wishlist_items')
		.select('id')
		.eq('user_id', userId)
		.eq('product_id', productId)
		.single();

	if (error && error.code !== 'PGRST116') throw error;
	return !!data;
};

export  const  createProduct = async (productData: any) => {
	// Frontend wrapper: send product data to backend API route POST /api/products
	// Backend should handle auth and persist using server-side privileges.
	try {
    const response = await api.post("/products", productData);
    if(response.data) {
      return response.data;
    } 
  } catch (err: any) {
    // Axios error handling - prefer server message when available
    if (axios.isAxiosError(err)) {
      const serverMsg =
        err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(
        typeof serverMsg === "string" ? serverMsg : JSON.stringify(serverMsg)
      );
    }
    throw err;
  } 
};

export const updateProduct = async (id: string, productData: any) => {
	// Frontend wrapper: send update to backend API route PUT /api/products/:id
    try {
    const response = await api.put(`/products/${id}`, productData);
    if(response.data) {
      return response.data;
    } 
  } catch (err: any) {
    // Axios error handling - prefer server message when available
    if (axios.isAxiosError(err)) {
      const serverMsg =
        err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(
        typeof serverMsg === "string" ? serverMsg : JSON.stringify(serverMsg)
      );
    }
    throw err;
  } 
};

export const getProducts = async () => {
   try {
    const response = await api.get("/products");
    if(response.data) {
      return response.data;
    }
   } catch (err: any) {
    // Axios error handling - prefer server message when available
    if (axios.isAxiosError(err)) {
      const serverMsg =
        err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(
        typeof serverMsg === "string" ? serverMsg : JSON.stringify(serverMsg)
      );
    }
    throw err;
  } 
}


export const deleteAProduct = async (productId:string) => {
   try {
    const response = await api.delete(`/products/${productId}`);
    if(response.data) {
      return response.data;
    }
   } catch (err: any) {
    // Axios error handling - prefer server message when available
    if (axios.isAxiosError(err)) {
      const serverMsg =
        err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(
        typeof serverMsg === "string" ? serverMsg : JSON.stringify(serverMsg)
      );
    }
    throw err;
  } 
}

export const getProductById = async (productId: string) => {
   try {
    const response = await api.get(`/products/${productId}`);
    if(response.data) {
      return response.data;
    }
   } catch (err: any) {
    // Axios error handling - prefer server message when available
    if (axios.isAxiosError(err)) {
      const serverMsg =
        err.response?.data?.message ?? err.response?.data ?? err.message;
      throw new Error(
        typeof serverMsg === "string" ? serverMsg : JSON.stringify(serverMsg)
      );
    }
    throw err;
  } 
}