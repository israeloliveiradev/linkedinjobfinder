import { create } from 'zustand';
import { SearchResult } from '../types/search.types';

export interface ManualFilters {
  period: string;
  workModes: string[];
  experienceLevels: string[];
  jobTypes: string[];
  location: string;
  antiSpam: boolean;
  negativeKeywords: string;
}

interface SearchState {
  currentResult: SearchResult | null;
  isLoading: boolean;
  error: string | null;
  manualFilters: ManualFilters;
  setResult: (result: SearchResult | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setManualFilter: (key: keyof ManualFilters, value: any) => void;
  resetFilters: () => void;
}

const initialFilters: ManualFilters = {
  period: '24h',
  workModes: [],
  experienceLevels: [],
  jobTypes: [],
  location: 'brasil',
  antiSpam: true, // Habilitado por padrão porque consultorias de spam são horríveis!
  negativeKeywords: '',
};

export const useSearchStore = create<SearchState>((set) => ({
  currentResult: null,
  isLoading: false,
  error: null,
  manualFilters: initialFilters,
  setResult: (result) => set({ currentResult: result }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setManualFilter: (key, value) => set((state) => ({
    manualFilters: { ...state.manualFilters, [key]: value }
  })),
  resetFilters: () => set({ manualFilters: initialFilters }),
}));
