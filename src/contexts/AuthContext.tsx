import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'shop-owner' | 'government' | 'customer';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, userData: {
    full_name: string;
    role: 'customer' | 'shop_owner' | 'government_official';
    phone_number?: string;
    address?: string;
    business_name?: string;
    department?: string;
    jurisdiction?: string;
  }) => Promise<boolean>;
  signOut: () => void;
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

  // Initialize auth state
  React.useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setLoading(false);
        return;
      }

      if (profile) {
        // Map database role to frontend role format
        const roleMapping: Record<string, 'shop-owner' | 'government' | 'customer'> = {
          'shop_owner': 'shop-owner',
          'government_official': 'government',
          'customer': 'customer'
        };

        setUser({
          id: profile.id,
          email: profile.email,
          name: profile.full_name,
          role: roleMapping[profile.role] || 'customer'
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign-in error:', error.message);
        return false;
      }

      if (data.user) {
        await fetchUserProfile(data.user.id);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Sign-in error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData: {
      full_name: string;
      role: 'customer' | 'shop_owner' | 'government_official';
      phone_number?: string;
      address?: string;
      business_name?: string;
      department?: string;
      jurisdiction?: string;
    }
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role,
            phone_number: userData.phone_number,
            address: userData.address,
            business_name: userData.business_name,
            department: userData.department,
            jurisdiction: userData.jurisdiction,
          }
        }
      });

      if (error) {
        console.error('Sign-up error:', error.message);
        return false;
      }

      if (data.user) {
        // The user profile will be created automatically by the database trigger
        // For email confirmation flow, we don't automatically sign them in
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Sign-up error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign-out error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
