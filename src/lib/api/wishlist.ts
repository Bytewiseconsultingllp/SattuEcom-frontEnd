import { supabase } from '@/integrations/supabase/client';

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
