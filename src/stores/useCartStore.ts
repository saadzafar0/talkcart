import { create } from 'zustand';

interface CartState {
  count: number;
  setCount: (count: number) => void;
  incrementCount: (by?: number) => void;
  fetchCount: () => Promise<void>;
  clearCount: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  count: 0,
  setCount: (count) => set({ count }),
  incrementCount: (by = 1) => set((state) => ({ count: state.count + by })),
  fetchCount: async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        set({ count: data.data?.item_count || 0 });
      }
    } catch {
      // Cart badge is non-critical
    }
  },
  clearCount: () => set({ count: 0 }),
}));
