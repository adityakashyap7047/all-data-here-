'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createNeonAuthUrl, createNeonSignUpUrl, createNeonSignOutUrl } from '@/lib/neon-auth';

interface NeonAuthContextType {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: string;
    twoFactorEnabled: boolean;
  } | null;
  loading: boolean;
  signIn: (callbackUrl?: string) => void;
  signUp: (callbackUrl?: string) => void;
  signOut: (callbackUrl?: string) => void;
  refresh: () => Promise<void>;
}

const NeonAuthContext = createContext<NeonAuthContextType | undefined>(undefined);

export function NeonAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<NeonAuthContextType['user']>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const signIn = (callbackUrl = '/dashboard') => {
    window.location.href = createNeonAuthUrl(callbackUrl);
  };

  const signUp = (callbackUrl = '/dashboard') => {
    window.location.href = createNeonSignUpUrl(callbackUrl);
  };

  const signOut = async (callbackUrl = '/') => {
    try {
      await fetch('/api/auth/neon/signout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_url: callbackUrl }),
      });
    } catch {
      window.location.href = createNeonSignOutUrl(callbackUrl);
    }
  };

  return (
    <NeonAuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refresh: fetchUser }}>
      {children}
    </NeonAuthContext.Provider>
  );
}

export function useNeonAuth() {
  const context = useContext(NeonAuthContext);
  if (!context) {
    throw new Error('useNeonAuth must be used within a NeonAuthProvider');
  }
  return context;
}