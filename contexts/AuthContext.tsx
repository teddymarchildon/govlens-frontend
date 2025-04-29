'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  hasCompletedOnboarding: boolean;
  checkOnboardingStatus: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);

  const checkOnboardingStatus = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Check user_usage table for saw_onboarding_flow_at
      const { data, error } = await supabase
        .from('user_usage')
        .select('saw_onboarding_flow_at')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        console.error('Error checking onboarding status:', error);
        return false;
      }
      
      // User has completed onboarding if saw_onboarding_flow_at is not null
      const completed = !!(data && data.saw_onboarding_flow_at);
      setHasCompletedOnboarding(completed);
      return completed;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  };

  useEffect(() => {
    // Check for active session on mount
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error checking auth session:', error);
      }
      
      if (data?.session) {
        setUser(data.session.user);
        // Check onboarding status when user is set
        await checkOnboardingStatus();
      }
      
      setLoading(false);
    };

    checkSession();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          
          // Check onboarding status when auth state changes
          if (event === 'SIGNED_IN') {
            await checkOnboardingStatus();
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) throw error;
    
    // Check onboarding status after sign in
    await checkOnboardingStatus();
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) throw error;
    
    // New users haven't completed onboarding
    setHasCompletedOnboarding(false);
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signOut, 
      signUp, 
      hasCompletedOnboarding,
      checkOnboardingStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
