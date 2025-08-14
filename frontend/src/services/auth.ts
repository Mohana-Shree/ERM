// Frontend auth service that calls backend API only
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

import type { User } from '../types';

// Helper function to make API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add auth token if it exists in localStorage
  const token = localStorage.getItem('supabase_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function signUpWithEmail({
  email,
  password,
  name
}: {
  email: string;
  password: string;
  name: string;
}) {
  console.log('signUpWithEmail called with:', { email, name });
  
  const response = await apiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });

  console.log('Backend signup response:', response);
  return response;
}

export async function signInWithEmail({
  email,
  password
}: {
  email: string;
  password: string;
}) {
  console.log('signInWithEmail called with:', { email });
  
  const response = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  console.log('Backend login response:', response);

  // Store the token from the session
  if (response.session?.access_token) {
    localStorage.setItem('supabase_token', response.session.access_token);
  }

  return {
    user: response.user,
    session: response.session,
  };
}

export async function getSession() {
  try {
    const response = await apiCall('/auth/session');
    return response.session;
  } catch (error) {
    console.error('Error getting session:', error);
    // Clear invalid token
    localStorage.removeItem('supabase_token');
    return null;
  }
}

export async function signOut() {
  try {
    await apiCall('/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error signing out:', error);
  } finally {
    // Always clear local token
    localStorage.removeItem('supabase_token');
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    console.log('getCurrentUser called');
    
    const response = await apiCall('/auth/me');
    console.log('Backend user response:', response);
    
    return response.user;
  } catch (error) {
    console.error('getCurrentUser error:', error);
    // Clear invalid token
    localStorage.removeItem('supabase_token');
    return null;
  }
}