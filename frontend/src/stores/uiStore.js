import { create } from 'zustand';

export const useUiStore = create((set) => ({
  // Mobile nav
  mobileNavOpen: false,
  toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),
  closeMobileNav: () => set({ mobileNavOpen: false }),

  // Modals
  confirmModal: null,  // { title, message, onConfirm, onCancel }
  openConfirm: (opts) => set({ confirmModal: opts }),
  closeConfirm: () => set({ confirmModal: null }),

  // Global loader
  globalLoading: false,
  setGlobalLoading: (val) => set({ globalLoading: val }),
}));
