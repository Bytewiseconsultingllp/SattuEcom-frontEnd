import { supabase } from '@/integrations/supabase/client';

export const getAddresses = async (userId: string) => {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false });

  if (error) throw error;
  return data;
};

export const getAddressById = async (addressId: string) => {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('id', addressId)
    .single();

  if (error) throw error;
  return data;
};

export const createAddress = async (address: any) => {
  const { data, error } = await supabase
    .from('addresses')
    .insert(address)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateAddress = async (addressId: string, updates: any) => {
  const { data, error } = await supabase
    .from('addresses')
    .update(updates)
    .eq('id', addressId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteAddress = async (addressId: string) => {
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', addressId);

  if (error) throw error;
};

export const setDefaultAddress = async (userId: string, addressId: string) => {
  // First, unset all defaults for this user
  await supabase
    .from('addresses')
    .update({ is_default: false })
    .eq('user_id', userId);

  // Then set the new default
  const { data, error } = await supabase
    .from('addresses')
    .update({ is_default: true })
    .eq('id', addressId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
