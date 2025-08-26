import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'shop-owner' | 'government' | 'customer';
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => boolean;
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

  const signIn = (email: string, password: string): boolean => {
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

  const signOut = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}