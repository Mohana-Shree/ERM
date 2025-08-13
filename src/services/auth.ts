import { supabase } from '../lib/supabaseClient';
import type { User } from '../types';

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
  
  try {
    const { data: signUpData, error } = await supabase.auth.signUp({ 
      email, 
      password, 
      options: { data: { name } } 
    });
    
    console.log('Supabase signup response:', { data: !!signUpData, error: !!error });
    
    if (error) {
      console.error('Supabase signup error:', error);
      throw error;
    }
    
    if (!signUpData.user) {
      throw new Error('No user data returned from signup');
    }
    
    // Ensure a profile row exists in `users` with id matching auth.uid
    const userId = signUpData.user.id;
    console.log('Creating user profile for ID:', userId);
    
    try {
      const { error: profileError } = await supabase.from('users').upsert({ 
        id: userId, 
        email, 
        name, 
        role: 'user' 
      }, { onConflict: 'id' });
      
      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // Don't throw here, as the auth user was created successfully
      } else {
        console.log('User profile created successfully');
      }
    } catch (profileError) {
      console.error('Exception creating user profile:', profileError);
      // Don't throw here, as the auth user was created successfully
    }
    
    console.log('Signup completed successfully');
    
    // Don't auto sign-in - let the user manually sign in
    // This ensures they go to the login page first
    console.log('User account created, no auto sign-in');
    
    return signUpData;
  } catch (error) {
    console.error('signUpWithEmail error:', error);
    throw error;
  }
}

export async function signInWithEmail({ 
  email, 
  password 
}: { 
  email: string; 
  password: string; 
}) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    console.log('getCurrentUser called');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Error getting auth user:', authError);
      return null;
    }
    
    if (!user) {
      console.log('No auth user found');
      return null;
    }
    
    console.log('Auth user found, ID:', user.id);
    
    // Try to get user profile from database
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      
      // If profile doesn't exist, try to create it
      if (error.code === 'PGRST116') { // No rows returned
        console.log('User profile not found, attempting to create...');
        
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || 'Unknown',
            role: 'user'
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating user profile:', createError);
          return null;
        }
        
        console.log('User profile created successfully:', newProfile);
        return newProfile;
      }
      
      throw error;
    }
    
    console.log('User profile fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
}
