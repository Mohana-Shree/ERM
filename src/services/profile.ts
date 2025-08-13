import { supabase } from '../lib/supabaseClient';
import type { UserProfileView } from '../types';

export async function getCurrentUserProfile(): Promise<UserProfileView | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('user_profile_view')
    .select('*')
    .eq('user_id', user.id)
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateUserProfile(updates: Partial<{
  name: string;
  phone: string;
  avatar_url: string;
  metadata: Record<string, any>;
}>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select('*')
    .single();
    
  if (error) throw error;
  return data;
}
