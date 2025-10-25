import { supabase } from '@/integrations/supabase/client';

export const getOrders = async (userId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        *,
        product:products(*)
      ),
      shipping_address:addresses(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getOrderById = async (orderId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        *,
        product:products(*)
      ),
      shipping_address:addresses(*)
    `)
    .eq('id', orderId)
    .single();

  if (error) throw error;
  return data;
};

export const createOrder = async (order: {
  user_id: string;
  total_amount: number;
  shipping_address_id: string;
  items: Array<{ product_id: string; quantity: number; price: number }>;
}) => {
  // Create order
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: order.user_id,
      total_amount: order.total_amount,
      shipping_address_id: order.shipping_address_id,
      status: 'pending',
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // Create order items
  const orderItems = order.items.map(item => ({
    order_id: orderData.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return orderData;
};

export const updateOrderStatus = async (
  orderId: string,
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getAllOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      user:users(full_name, email),
      order_items(
        *,
        product:products(name)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
