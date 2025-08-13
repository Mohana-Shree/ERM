import { supabase } from '../lib/supabaseClient';

export async function uploadFile(
  bucket: 'resumes' | 'offers' | 'certificates' | 'terms', 
  path: string, 
  file: File
) {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { 
      upsert: true, 
      contentType: file.type 
    });
    
  if (error) throw error;
  
  const { data: publicUrl } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
    
  return { path, publicUrl: publicUrl.publicUrl };
}

export async function downloadFile(bucket: string, path: string) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);
    
  if (error) throw error;
  return data;
}

export async function getFileUrl(bucket: string, path: string) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
    
  return data.publicUrl;
}
