import { create } from 'zustand';

interface AppState {
  user: any;
  setUser: (user: any) => void;
  clearUser: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
