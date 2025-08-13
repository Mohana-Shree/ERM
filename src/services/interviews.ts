import { supabase } from '../lib/supabaseClient';
import { updateApplicationStatus } from './applications';
import type { Interview } from '../types';

export async function scheduleInterview({ 
  applicationId, 
  meetLink, 
  scheduledFor, 
  durationMinutes 
}: {
  applicationId: string;
  meetLink: string;
  scheduledFor: string; // ISO
  durationMinutes: number;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('interviews')
    .insert({
      application_id: applicationId,
      scheduled_by: user?.id ?? null,
      meet_link: meetLink,
      scheduled_for: scheduledFor,
      duration_minutes: durationMinutes
    })
    .select('*')
    .single();
    
  if (error) throw error;

  // Update application status to interview_scheduled
  await updateApplicationStatus({
    applicationId,
    status: 'interview_scheduled',
    currentOwner: user?.id ?? null
  });

  return data;
}

export async function getInterviewByApplication(applicationId: string): Promise<Interview | null> {
  const { data, error } = await supabase
    .from('interviews')
    .select('*')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
    
  if (error) throw error;
  return data;
}

export async function updateInterview({ 
  interviewId, 
  updates 
}: {
  interviewId: string;
  updates: Partial<Pick<Interview, 'meet_link' | 'scheduled_for' | 'duration_minutes'>>;
}) {
  const { data, error } = await supabase
    .from('interviews')
    .update(updates)
    .eq('id', interviewId)
    .select('*')
    .single();
    
  if (error) throw error;
  return data;
}

export async function cancelInterview(interviewId: string) {
  const { error } = await supabase
    .from('interviews')
    .delete()
    .eq('id', interviewId);
    
  if (error) throw error;
}
