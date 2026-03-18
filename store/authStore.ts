import { create } from 'zustand';
import { User } from '@/types/index';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  setUser: (user) =>
    set({ user, isAuthenticated: !!user }),

  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        localStorage.removeItem('authToken');
      }
    }
    set({ token });
  },

  setLoading: (isLoading) => set({ isLoading }),

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  initialize: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        set({ token, isAuthenticated: true });
      }
    }
  },
}));
