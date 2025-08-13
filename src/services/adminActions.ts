import { supabase } from '../lib/supabaseClient';
import type { AdminAction } from '../types';

export async function logAdminAction({ 
  applicationId, 
  actionType, 
  notes, 
  payload 
}: {
  applicationId?: string | null;
  actionType: string;
  notes?: string;
  payload?: Record<string, unknown>;
}): Promise<AdminAction> {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('admin_actions')
    .insert({
      admin_id: user?.id ?? null,
      application_id: applicationId ?? null,
      action_type: actionType,
      notes: notes ?? null,
      payload: payload ?? {}
    })
    .select('*')
    .single();
    
  if (error) throw error;
  return data;
}

export async function listAdminActions({ 
  applicationId, 
  actionType 
}: { 
  applicationId?: string; 
  actionType?: string; 
}): Promise<AdminAction[]> {
  let query = supabase
    .from('admin_actions')
    .select('*')
    .order('created_at', { ascending: false });

  if (applicationId) query = query.eq('application_id', applicationId);
  if (actionType) query = query.eq('action_type', actionType);
  
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
