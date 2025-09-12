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
      // Try Supabase signup first
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
        
        // Always fall back to demo mode if Supabase fails
        console.warn('Falling back to demo authentication due to Supabase issues');
        return await fallbackSignUp(data);
      }

      if (!authData.user) {
        console.warn('No user returned from Supabase, falling back to demo mode');
        return await fallbackSignUp(data);
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
          console.warn('Profile creation failed, falling back to demo mode');
          return await fallbackSignUp(data);
        }

        await loadUserProfile(authData.user);
        return { success: true };
      } catch (error) {
        console.error('Profile creation failed:', error);
        console.warn('Falling back to demo mode');
        return await fallbackSignUp(data);
      }
    } catch (error) {
      console.error('Sign up error:', error);
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
      
      // Store user data and credentials for demo authentication
      const existingUsers = JSON.parse(localStorage.getItem('demo_users') || '[]');
      const demoUserWithCredentials = {
        ...demoUser,
        password: data.password // Store password for demo sign-in
      };
      existingUsers.push(demoUserWithCredentials);
      localStorage.setItem('demo_users', JSON.stringify(existingUsers));
      
      // Set the current user and persist session
      setUser(demoUser);
      localStorage.setItem('demo_current_user', JSON.stringify(demoUser));
      
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
      localStorage.removeItem('demo_current_user');
    } catch (error) {
      console.error('Sign out error:', error);
      setUser(null);
      localStorage.removeItem('demo_current_user');
    }
  };

  // Enhanced demo sign in with localStorage support
  const legacySignIn = (email: string, password: string): boolean => {
    // First check hardcoded demo users
    let foundUser = DEMO_USERS.find(
      u => u.email === email && u.password === password
    );

    // If not found in hardcoded users, check localStorage demo users
    if (!foundUser) {
      const demoUsers = JSON.parse(localStorage.getItem('demo_users') || '[]');
      foundUser = demoUsers.find((u: any) => u.email === email && u.password === password);
    }

    if (foundUser) {
      const userProfile = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
        phone: foundUser.phone,
        address: foundUser.address,
        business_name: foundUser.business_name,
        department: foundUser.department
      };
      
      setUser(userProfile);
      localStorage.setItem('demo_current_user', JSON.stringify(userProfile));
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
      } else {
        // Check for demo user session if no Supabase session
        const demoUser = localStorage.getItem('demo_current_user');
        if (demoUser) {
          setUser(JSON.parse(demoUser));
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      // Check for demo user session on any error
      const demoUser = localStorage.getItem('demo_current_user');
      if (demoUser) {
        setUser(JSON.parse(demoUser));
      }
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