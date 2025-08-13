import { supabase } from '../lib/supabaseClient';
import { uploadFile } from './storage';
import { updateApplicationStatus } from './applications';
import type { Internship, InternshipStatus } from '../types';

export async function offerInternship({ 
  applicationId, 
  stipend, 
  durationMonths, 
  startDate, 
  endDate, 
  termsTemplateId, 
  offerBlob, 
  termsBlob 
}: {
  applicationId: string;
  stipend: number;
  durationMonths: number;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  termsTemplateId?: string;
  offerBlob: Blob; // generated PDF/HTML as blob
  termsBlob?: Blob;
}) {
  // Upload generated offer + terms
  const offerPath = `offers/${applicationId}/offer_${Date.now()}.pdf`;
  const { path: storedOfferPath } = await uploadFile(
    'offers', 
    offerPath, 
    new File([offerBlob], 'offer.pdf', { type: 'application/pdf' })
  );
  
  let storedTermsPath: string | null = null;
  if (termsBlob) {
    const termsPath = `terms/${applicationId}/terms_${Date.now()}.pdf`;
    const { path } = await uploadFile(
      'terms', 
      termsPath, 
      new File([termsBlob], 'terms.pdf', { type: 'application/pdf' })
    );
    storedTermsPath = path;
  }

  const { data, error } = await supabase
    .from('internships')
    .insert({
      application_id: applicationId,
      stipend,
      duration_months: durationMonths,
      offer_letter_path: storedOfferPath,
      terms_template_id: termsTemplateId ?? null,
      terms_path: storedTermsPath,
      start_date: startDate,
      end_date: endDate,
      status: 'pending'
    })
    .select('*')
    .single();
    
  if (error) throw error;

  await updateApplicationStatus({ applicationId, status: 'offered' });
  return data;
}

export async function listActiveInternsAndEmployees(): Promise<any[]> {
  const { data, error } = await supabase
    .from('internships')
    .select(`
      id, 
      application_id, 
      start_date, 
      end_date, 
      status, 
      applications(type, user_id, users(name, email, role))
    `)
    .in('status', ['pending', 'joined'])
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data ?? [];
}

export async function updateInternshipStatus({ 
  internshipId, 
  status 
}: { 
  internshipId: string; 
  status: InternshipStatus; 
}) {
  const { data, error } = await supabase
    .from('internships')
    .update({ status })
    .eq('id', internshipId)
    .select('*')
    .single();
    
  if (error) throw error;
  return data;
}

export async function uploadSignedOffer({ 
  internshipId, 
  signedFile 
}: { 
  internshipId: string; 
  signedFile: File; 
}) {
  // Upload signed offer and link to internship
  const signedPath = `offers/${internshipId}/signed_${Date.now()}_${signedFile.name}`;
  const { path } = await uploadFile('offers', signedPath, signedFile);
  
  const { data, error } = await supabase
    .from('internships')
    .update({ offer_signed_path: path, status: 'joined' })
    .eq('id', internshipId)
    .select('*')
    .single();
    
  if (error) throw error;
  return data;
}

export async function getInternshipById(internshipId: string): Promise<Internship | null> {
  const { data, error } = await supabase
    .from('internships')
    .select(`
      *,
      applications(*, users(name, email))
    `)
    .eq('id', internshipId)
    .single();
    
  if (error) throw error;
  return data;
}

export async function getInternshipByApplication(applicationId: string): Promise<Internship | null> {
  const { data, error } = await supabase
    .from('internships')
    .select('*')
    .eq('application_id', applicationId)
    .single();
    
  if (error) throw error;
  return data;
}
