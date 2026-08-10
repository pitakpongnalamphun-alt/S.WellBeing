import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Which wisdom cards a student has saved to read again. Pure keeping — no
 * rewards or streaks; it's a quiet little collection of lines that helped.
 */
type WisdomState = {
  saved: string[]; // wisdom ids, most-recent first
  toggleSave: (id: string) => void;
  clear: () => void;
};

export const useWisdomStore = create<WisdomState>()(
  persist(
    (set) => ({
      saved: [],
      toggleSave: (id) =>
        set((s) => ({
          saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [id, ...s.saved],
        })),
      clear: () => set({ saved: [] }),
    }),
    {
      name: "swb.wisdom",
      partialize: (s) => ({ saved: s.saved }),
    },
  ),
);
