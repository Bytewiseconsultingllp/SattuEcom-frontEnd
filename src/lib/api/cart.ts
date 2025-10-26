import axios from "axios";
import api from "../axiosInstance";

export async function getCartItems() {
  try {
    const res = await api.get("/cart");
    return res.data;
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

export async function addToCart(product_id: string, quantity: number) {
  const payload = { product_id, quantity };
  try {
    const res = await api.post("/cart", payload);
    return res.data;
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

export async function removeItemFromCart(id: string) {
   try {
    const res = await api.delete(`/cart/${id}`);
    return res.data;
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

export async function updateCartItemQuantity(id: string, quantity: number) {
  try {
    const res = await api.put(`/cart/${id}`, { quantity });
    return res.data;
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
