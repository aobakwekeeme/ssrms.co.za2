import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'shop-owner' | 'government' | 'customer';
  phone?: string;
  address?: string;
  business_name?: string;
  department?: string;
}

interface SignUpData {
  email: string;
  password: string;
  userType: 'customer' | 'shop_owner' | 'government_official';
  name: string;
  phone: string;
  address: string;
  businessName?: string;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => boolean;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  initialize: () => Promise<void>;
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

// Hardcoded users for demo
const DEMO_USERS = [
  {
    id: '1',
    email: 'mokoena@gmail.com',
    password: 'Mokoena2025',
    name: 'Thabo Mokoena',
    role: 'shop-owner' as const
  },
  {
    id: '2',
    email: 'masia@gmail.com',
    password: 'Masia2025',
    name: 'Inspector Sarah Masia',
    role: 'government' as const
  },
  {
    id: '3',
    email: 'kamba@gmail.com',
    password: 'Kamba2025',
    name: 'Nomsa Kamba',
    role: 'customer' as const
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }

      if (profile) {
        setUser({
          id: profile.id,
          email: supabaseUser.email || '',
          name: profile.full_name,
          role: profile.role === 'shop_owner' ? 'shop-owner' : 
                profile.role === 'government_official' ? 'government' : 'customer',
          phone: profile.phone,
          address: profile.address,
          business_name: profile.business_name,
          department: profile.department
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Sign in error:', error);
        // Fall back to demo authentication if Supabase fails
        console.warn('Supabase sign-in failed, trying demo authentication');
        return legacySignIn(email, password);
      }

      if (data.user) {
        await loadUserProfile(data.user);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Sign in error:', error);
      // Fall back to demo authentication on any error
      console.warn('Supabase sign-in error, trying demo authentication');
      return legacySignIn(email, password);
    }
  };

  const signUp = async (data: SignUpData): Promise<{ success: boolean; error?: string }> => {
    try {
      // First, sign up the user with Supabase Auth
      const { data: authResult, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password
      });

      if (signUpError) {
        console.error('Supabase signup error:', signUpError);
        return { success: false, error: signUpError.message };
      }

      if (!authResult.user) {
        return { success: false, error: 'No user returned from signup' };
      }

      // Wait a moment for the user to be fully created in auth.users
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create the user profile in user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authResult.user.id,
          full_name: data.name,
          role: data.userType,
          phone: data.phone,
          address: data.address,
          business_name: data.businessName || null,
          department: data.department || null
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Clean up the auth user if profile creation fails
        await supabase.auth.signOut();
        return { success: false, error: `Profile creation failed: ${profileError.message}` };
      }

      // Load the user profile and set the user state
      await loadUserProfile(authResult.user);
      return { success: true };

    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      setUser(null);
    }
  };

  const legacySignIn = (email: string, password: string): boolean => {
    const foundUser = DEMO_USERS.find(
      u => u.email === email && u.password === password
    );

    if (foundUser) {
      setUser({
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role
      });
      return true;
    }
    return false;
  };

  // Initialize auth state on mount
  React.useEffect(() => {
    initialize();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const initialize = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserProfile(session.user);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, initialize }}>
      {children}
    </AuthContext.Provider>
  );
}