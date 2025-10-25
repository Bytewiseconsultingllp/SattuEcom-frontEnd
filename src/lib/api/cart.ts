import { supabase } from '@/integrations/supabase/client';

export const getCartItems = async (userId: string) => {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      product:products(*)
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return data;
};

export const addToCart = async (userId: string, productId: string, quantity: number = 1) => {
  // Check if item already exists
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  if (existingItem) {
    // Update quantity
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: existingItem.quantity + quantity })
      .eq('id', existingItem.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Create new item
    const { data, error } = await supabase
      .from('cart_items')
      .insert({ user_id: userId, product_id: productId, quantity })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export const updateCartItemQuantity = async (itemId: string, quantity: number) => {
  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const removeFromCart = async (itemId: string) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
};

export const clearCart = async (userId: string) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
};
