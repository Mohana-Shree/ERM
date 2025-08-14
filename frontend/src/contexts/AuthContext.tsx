import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSession, getCurrentUser, signOut as authSignOut } from '../services/auth';
import type { User } from '../types';

interface AuthContextType {
  session: any | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Check if we have a stored token
        const token = localStorage.getItem('supabase_token');
        if (!token) {
          console.log('No stored token found');
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }

        // Get session from backend
        const sessionData = await getSession();
        console.log('Initial session:', !!sessionData);
        setSession(sessionData);

        if (sessionData) {
          try {
            const userData = await getCurrentUser();
            console.log('User data fetched:', !!userData);
            setUser(userData);
          } catch (error) {
            console.error('Error fetching initial user data:', error);
            setUser(null);
            setSession(null);
            // Clear invalid token
            localStorage.removeItem('supabase_token');
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        setSession(null);
        // Clear invalid token
        localStorage.removeItem('supabase_token');
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
    }, 5000);

    // Initialize auth
    initializeAuth();

    // Listen for storage changes (token updates from other tabs)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'supabase_token') {
        if (event.newValue) {
          // Token was added/updated, reinitialize
          initializeAuth();
        } else {
          // Token was removed, clear state
          setSession(null);
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const signOut = async () => {
    try {
      await authSignOut();
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      // Force clear state even if backend call fails
      setSession(null);
      setUser(null);
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