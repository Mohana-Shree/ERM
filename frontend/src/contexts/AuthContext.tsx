import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSession, getCurrentUser, signOut as authSignOut } from '../services/auth';
import { supabase } from '../lib/supabaseClient';
import type { User } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get initial session
        const session = await getSession();
        console.log('Initial session:', !!session);
        
        setSession(session);
        
        if (session?.user) {
          try {
            const userData = await getCurrentUser();
            console.log('User data fetched:', !!userData);
            setUser(userData);
          } catch (error) {
            console.error('Error fetching initial user data:', error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Add a timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timeout - forcing loading to false');
        setLoading(false);
      }
    }, 5000); // Reduced to 5 seconds

    // Initialize auth
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('Auth state changed:', _event, !!session);
        setSession(session);
        
        if (session?.user) {
          try {
            const userData = await getCurrentUser();
            setUser(userData);
          } catch (error) {
            console.error('Error fetching user data:', error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []); // Remove loading dependency to prevent infinite loops

  const signOut = async () => {
    try {
      await authSignOut();
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Debug logging
  console.log('AuthContext state:', { session: !!session, user: !!user, loading });

  const value = {
    session,
    user,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
