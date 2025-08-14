import dayjs from 'dayjs';
import { supabase } from '../lib/supabaseClient';
import { uploadFile } from './storage';
import type { Application, ApplicationType } from '../types';

export async function listMyApplications(): Promise<Partial<Application>[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('applications')
    .select('id, type, status, applied_at, resume_path')
    .eq('user_id', user.id)
    .order('applied_at', { ascending: false });
    
  if (error) throw error;
  return data ?? [];
}

export async function createApplication({ 
  type, 
  coverLetter, 
  resumeFile, 
  certificates 
}: {
  type: ApplicationType;
  coverLetter: string;
  resumeFile: File;
  certificates?: File[];
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // 1) Upload resume
  const resumePath = `resumes/${user.id}/${Date.now()}_${resumeFile.name}`;
  const { path: storedResumePath } = await uploadFile('resumes', resumePath, resumeFile);

  // 2) Optional certificates
  const uploadedCertPaths: string[] = [];
  if (certificates?.length) {
    for (const file of certificates) {
      const certPath = `certificates/${user.id}/${Date.now()}_${file.name}`;
      const { path } = await uploadFile('certificates', certPath, file);
      uploadedCertPaths.push(path);
      
      await supabase.from('documents').insert({
        user_id: user.id,
        doc_type: 'certificate',
        storage_path: path,
        mime_type: file.type,
        size_bytes: file.size
      });
    }
  }

  // 3) Insert application
  const { data, error } = await supabase
    .from('applications')
    .insert({
      user_id: user.id,
      type,
      cover_letter: coverLetter,
      resume_path: storedResumePath,
      applied_at: dayjs().toISOString(),
      status: 'submitted'
    })
    .select('*')
    .single();

  if (error) throw error;
  return { application: data, uploadedCertPaths };
}

export async function listAllApplicationsForAdmin({ 
  status 
}: { 
  status?: string 
}): Promise<any[]> {
  let query = supabase
    .from('applications')
    .select(`
      id, 
      type, 
      status, 
      applied_at, 
      resume_path, 
      user_id, 
      users(name, email, role)
    `)
    .order('applied_at', { ascending: false });

  if (status) query = query.eq('status', status);
  
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function updateApplicationStatus({ 
  applicationId, 
  status, 
  currentOwner 
}: {
  applicationId: string;
  status: Application['status'];
  currentOwner?: string | null;
}) {
  const { data, error } = await supabase
    .from('applications')
    .update({ 
      status, 
      last_status_updated_at: new Date().toISOString(), 
      current_owner: currentOwner ?? null 
    })
    .eq('id', applicationId)
    .select('*')
    .single();
    
  if (error) throw error;
  return data;
}

export async function getApplicationById(applicationId: string): Promise<Application | null> {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      users(name, email, phone),
      documents(*)
    `)
    .eq('id', applicationId)
    .single();
    
  if (error) throw error;
  return data;
}
