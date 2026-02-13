import { create } from 'zustand';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
}

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  fetchUser: async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        set({ user: data.data.user, isLoading: false });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch {
      set({ user: null, isLoading: false });
    }
  },
  clearUser: () => set({ user: null }),
}));
