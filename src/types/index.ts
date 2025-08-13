export type Role = 'user' | 'admin';
export type ApplicationType = 'intern' | 'employee';
export type ApplicationStatus = 'submitted' | 'under_review' | 'interview_scheduled' | 'offered' | 'accepted' | 'rejected' | 'withdrawn';
export type InternshipStatus = 'pending' | 'joined' | 'terminated' | 'completed';

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface Application {
  id: string;
  user_id: string;
  type: ApplicationType;
  resume_path?: string;
  cover_letter: string;
  applied_at: string;
  status: ApplicationStatus;
  last_status_updated_at: string;
  current_owner?: string;
  source?: string;
  payload?: Record<string, any>;
  user?: User;
}

export interface Interview {
  id: string;
  application_id: string;
  scheduled_by?: string;
  meet_link: string;
  scheduled_for: string;
  duration_minutes: number;
  created_at: string;
}

export interface Internship {
  id: string;
  application_id: string;
  duration_months: number;
  stipend: number;
  terms_template_id?: string;
  terms_path?: string;
  offer_letter_path?: string;
  offer_signed_path?: string;
  start_date: string;
  end_date: string;
  status: InternshipStatus;
  created_at: string;
  updated_at: string;
  application?: Application;
}

export interface Document {
  id: string;
  user_id: string;
  application_id?: string;
  doc_type: string;
  storage_path: string;
  mime_type?: string;
  size_bytes?: number;
  uploaded_at: string;
}

export interface Template {
  id: string;
  name: string;
  template_type: 'offer' | 'terms' | 'certificate';
  template_body: string;
  created_by?: string;
  created_at: string;
}

export interface Certificate {
  id: string;
  internship_id: string;
  credential_id: string;
  credential_url: string;
  issued_at: string;
}

export interface AdminAction {
  id: string;
  admin_id: string;
  application_id?: string;
  action_type: string;
  notes?: string;
  payload?: Record<string, any>;
  created_at: string;
}

export interface UserProfileView {
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  metadata?: Record<string, any>;
  applications: Array<{
    application_id: string;
    type: ApplicationType;
    status: ApplicationStatus;
    applied_at: string;
    resume_path?: string;
  }>;
  documents: Array<{
    document_id: string;
    doc_type: string;
    storage_path: string;
    uploaded_at: string;
  }>;
}
