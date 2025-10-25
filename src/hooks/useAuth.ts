import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Supabase is configured
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase is not configured. Please enable Supabase in project settings.');
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        data: null, 
        error: { message: 'Supabase is not configured. Please enable it in project settings.' } as any 
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        data: null, 
        error: { message: 'Supabase is not configured. Please enable it in project settings.' } as any 
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (data.user && !error) {
      // Create user profile
      await supabase.from('users').insert({
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName,
      });
    }

    return { data, error };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: null };
    }

    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
};
