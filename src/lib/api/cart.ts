import axios from "axios";
import api from "../axiosInstance";
import { getUserCookie } from "@/utils/cookie";

export async function getCartItems() {
  const userId = getUserCookie().userId;
  try {
    const payload = {
      userId,
    };
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
