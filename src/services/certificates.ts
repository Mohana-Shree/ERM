import { supabase } from '../lib/supabaseClient';
import { uploadFile } from './storage';
import type { Certificate } from '../types';

export async function issueCertificate({ 
  internshipId, 
  pdfBlob 
}: { 
  internshipId: string; 
  pdfBlob: Blob; 
}) {
  // Upload certificate file
  const path = `certificates/${internshipId}/certificate_${Date.now()}.pdf`;
  const { path: storedPath, publicUrl } = await uploadFile(
    'certificates', 
    path, 
    new File([pdfBlob], 'certificate.pdf', { type: 'application/pdf' })
  );

  // Insert certificate row
  const { data, error } = await supabase
    .from('certificates')
    .insert({
      internship_id: internshipId,
      credential_url: publicUrl
    })
    .select('*')
    .single();
    
  if (error) throw error;
  return { certificate: data, path: storedPath, publicUrl };
}

export async function listCertificatesByInternship(internshipId: string): Promise<Certificate[]> {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('internship_id', internshipId)
    .order('issued_at', { ascending: false });
    
  if (error) throw error;
  return data ?? [];
}

export async function getCertificateById(certificateId: string): Promise<Certificate | null> {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('id', certificateId)
    .single();
    
  if (error) throw error;
  return data;
}
