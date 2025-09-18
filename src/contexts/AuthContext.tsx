import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Database } from '../lib/supabase';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

interface User extends UserProfile {
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

interface SignUpData {
  email: string;
  password: string;
  name: string;
  phone: string;
  address: string;
  userType: 'customer' | 'shop-owner' | 'government';
  businessName?: string;
  department?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        setUser(null);
      } else if (profile) {
        setUser({
          ...profile,
          email: authUser.email || '',
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        await loadUserProfile(data.user);
        return { success: true };
      }

      return { success: false, error: 'Sign in failed' };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signUp = async (data: SignUpData): Promise<{ success: boolean; error?: string }> => {
    try {
      // Sign up the user
      const { data: authResult, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authResult.user) {
        return { success: false, error: 'Failed to create user account' };
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authResult.user.id,
          full_name: data.name,
          role: data.userType,
          phone: data.phone,
          address: data.address,
          business_name: data.businessName || null,
          department: data.department || null,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return { success: false, error: 'Failed to create user profile' };
      }

      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'An unexpected error occurred during sign up' };
    }
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}