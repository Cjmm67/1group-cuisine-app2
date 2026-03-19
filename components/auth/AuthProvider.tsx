'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  email: string;
  name: string;
  role: 'master_admin' | 'admin' | 'chef';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isMasterAdmin: boolean;
  isAdmin: boolean;
  isChef: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
  isMasterAdmin: false,
  isAdmin: false,
  isChef: false,
});

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const performLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setUser(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    router.push('/login');
  }, [router]);

  // Reset inactivity timer on any user activity
  const resetTimer = useCallback(() => {
    if (!user) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      performLogout();
    }, INACTIVITY_TIMEOUT);
  }, [user, performLogout]);

  // Set up activity listeners
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    const handler = () => resetTimer();

    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    resetTimer(); // Start the timer

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, resetTimer]);

  // Fetch current user on mount — with retry
  useEffect(() => {
    let retries = 0;
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            setLoading(false);
            return;
          }
        }
        // If 401, user is genuinely not logged in
        if (res.status === 401) {
          setUser(null);
          setLoading(false);
          return;
        }
        // Other errors — retry up to 2 times
        if (retries < 2) {
          retries++;
          setTimeout(fetchUser, 1000);
          return;
        }
        setUser(null);
        setLoading(false);
      } catch {
        if (retries < 2) {
          retries++;
          setTimeout(fetchUser, 1000);
          return;
        }
        setUser(null);
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout: performLogout,
        isMasterAdmin: user?.role === 'master_admin',
        isAdmin: user?.role === 'master_admin' || user?.role === 'admin',
        isChef: user?.role === 'chef',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
