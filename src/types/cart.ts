export interface CartProduct {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  category: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: CartProduct;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}