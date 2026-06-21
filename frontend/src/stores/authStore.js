import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getStoredUser, setStoredUser, clearStoredUser } from '../utils/auth';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: getStoredUser(),
      isAuthenticated: Boolean(getStoredUser()),

      setUser: (user) => {
        setStoredUser(user);
        set({ user, isAuthenticated: true });
      },

      clearUser: () => {
        clearStoredUser();
        set({ user: null, isAuthenticated: false });
      },

      isAdmin: () => get().user?.role === 'admin',
      isUser:  () => get().user?.role === 'user',
      userId:  () => get().user?.user_id ?? get().user?.uid ?? null,
      token:   () => get().user?.token ?? null,
    }),
    {
      name:    'mythic-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
