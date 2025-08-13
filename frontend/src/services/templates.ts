import { supabase } from '../lib/supabaseClient';
import type { Template } from '../types';

export async function listTemplatesByType(templateType: 'offer' | 'terms' | 'certificate'): Promise<Template[]> {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('template_type', templateType)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data ?? [];
}

export async function getTemplate(id: string): Promise<Template | null> {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
}

export async function createTemplate({ 
  name, 
  templateType, 
  templateBody 
}: {
  name: string;
  templateType: 'offer' | 'terms' | 'certificate';
  templateBody: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('templates')
    .insert({
      name,
      template_type: templateType,
      template_body: templateBody,
      created_by: user?.id ?? null
    })
    .select('*')
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateTemplate({ 
  id, 
  updates 
}: {
  id: string;
  updates: Partial<Pick<Template, 'name' | 'template_body'>>;
}) {
  const { data, error } = await supabase
    .from('templates')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();
    
  if (error) throw error;
  return data;
}

export async function deleteTemplate(id: string) {
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}
