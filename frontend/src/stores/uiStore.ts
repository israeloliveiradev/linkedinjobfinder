import { create } from 'zustand';

interface UIState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isDarkMode: true,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));
