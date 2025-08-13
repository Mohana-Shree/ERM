import { supabase } from '../lib/supabaseClient';
import { uploadFile } from './storage';
import type { Document } from '../types';

export async function uploadUserDocument({ 
  applicationId, 
  docType, 
  file 
}: {
  applicationId?: string | null;
  docType: string;
  file: File;
}): Promise<Document> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const path = `documents/${user.id}/${Date.now()}_${file.name}`;
  const { path: storedPath } = await uploadFile('certificates', path, file);

  const { data, error } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      application_id: applicationId ?? null,
      doc_type: docType,
      storage_path: storedPath,
      mime_type: file.type,
      size_bytes: file.size
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function listUserDocuments(): Promise<Document[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('uploaded_at', { ascending: false });
    
  if (error) throw error;
  return data ?? [];
}

export async function getDocumentById(documentId: string): Promise<Document | null> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single();
    
  if (error) throw error;
  return data;
}

export async function deleteDocument(documentId: string) {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId);
    
  if (error) throw error;
}
