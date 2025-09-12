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
        return false;
      }

      if (data.user) {
        await loadUserProfile(data.user);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Sign in error:', error);
      return false;
    }
  };

  const signUp = async (data: SignUpData): Promise<{ success: boolean; error?: string }> => {
    try {
      // First try with email confirmation disabled
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: undefined,
          data: {}
        }
      });

      if (authError) {
        console.error('Supabase auth signup error:', authError);
        
        // If Supabase auth fails, fall back to demo mode
        if (authError.message.includes('Database error') || authError.message.includes('unexpected_failure')) {
          console.warn('Falling back to demo authentication due to Supabase configuration issues');
          return await fallbackSignUp(data);
        }
        
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create user account' };
      }

      // Create user profile
      try {
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            full_name: data.name,
            role: data.userType,
            phone: data.phone,
            address: data.address,
            business_name: data.businessName || null,
            department: data.department || null
          });

        if (insertError) {
          console.error('Manual profile creation error:', insertError);
          // If profile creation fails, still consider signup successful
          // The user can complete their profile later
          console.warn('Profile creation failed, but auth user created successfully');
        }

        await loadUserProfile(authData.user);
        return { success: true };
      } catch (error) {
        console.error('Manual profile creation failed:', error);
        // Auth user was created successfully, profile creation can be retried
        await loadUserProfile(authData.user);
        return { success: true };
      }
    } catch (error) {
      console.error('Sign up error:', error);
      
      // Fall back to demo mode if there's any unexpected error
      console.warn('Falling back to demo authentication due to unexpected error');
      return await fallbackSignUp(data);
    }
  };

  // Fallback signup for demo purposes when Supabase is not properly configured
  const fallbackSignUp = async (data: SignUpData): Promise<{ success: boolean; error?: string }> => {
    try {
      // Generate a demo user ID
      const demoUserId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create a demo user object
      const demoUser: User = {
        id: demoUserId,
        email: data.email,
        name: data.name,
        role: data.userType === 'shop_owner' ? 'shop-owner' : 
              data.userType === 'government_official' ? 'government' : 'customer',
        phone: data.phone,
        address: data.address,
        business_name: data.businessName,
        department: data.department
      };
      
      // Store in localStorage for persistence across sessions
      const existingUsers = JSON.parse(localStorage.getItem('demo_users') || '[]');
      existingUsers.push(demoUser);
      localStorage.setItem('demo_users', JSON.stringify(existingUsers));
      
      // Set the current user
      setUser(demoUser);
      
      return { success: true };
    } catch (error) {
      console.error('Fallback signup error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      // Also clear demo user data
      localStorage.removeItem('demo_current_user');
    } catch (error) {
      console.error('Sign out error:', error);
      // Fallback signout
      setUser(null);
      localStorage.removeItem('demo_current_user');
    }
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

  // Legacy demo sign in for fallback
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

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, initialize }}>
      {children}
    </AuthContext.Provider>
  );
}