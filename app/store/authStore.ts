import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      login: (user, token) => {
        // In case avatar isn't provided by backend, provide a default
        const avatar = user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=FF6B00&color=fff`;
        set({ user: { ...user, avatar }, token, isLoggedIn: true });
      },
      logout: () => set({ user: null, token: null, isLoggedIn: false }),
    }),
    {
      name: 'nikill_auth_store', // unique name for local storage
    }
  )
);
