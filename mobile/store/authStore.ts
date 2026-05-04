import { create } from 'zustand';
import { AuthResponse } from '../lib/api';

interface AuthState {
  user: AuthResponse['user'] | null;
  token: string | null;
  setUser: (user: AuthResponse['user'] | null, token?: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setUser: (user, token) => set((state) => ({ user, token: token !== undefined ? token : state.token })),
  logout: () => set({ user: null, token: null }),
}));
