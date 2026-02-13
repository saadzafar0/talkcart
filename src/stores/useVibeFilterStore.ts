import { create } from 'zustand';

interface VibeFilterState {
  /** Message to show when vibe filter is applied (e.g. "Showing cheaper options!") */
  message: string | null;
  /** Timestamp when the filter was applied - used to trigger toast */
  appliedAt: number | null;
  setVibeFilter: (message: string) => void;
  clearVibeFilter: () => void;
}

export const useVibeFilterStore = create<VibeFilterState>((set) => ({
  message: null,
  appliedAt: null,
  setVibeFilter: (message: string) =>
    set({ message, appliedAt: Date.now() }),
  clearVibeFilter: () => set({ message: null, appliedAt: null }),
}));
