import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Which wisdom cards a student has saved to read again. Pure keeping — no
 * rewards or streaks; it's a quiet little collection of lines that helped.
 */
type WisdomState = {
  saved: string[]; // wisdom ids, most-recent first
  /**
   * ใบที่เคยเปิดอ่านแล้ว — ใช้บอกความคืบหน้าเฉย ๆ ไม่มีรางวัล ไม่มีสตรีค
   *
   * จงใจไม่ให้เหรียญกับการอ่าน เพราะจะกลายเป็นการปัดผ่านให้ครบแทนการอ่านจริง
   * และหน้านี้ควรเป็นที่ที่ไม่มีอะไรต้องทำให้สำเร็จ
   */
  seen: string[];
  toggleSave: (id: string) => void;
  markSeen: (id: string) => void;
  clear: () => void;
};

export const useWisdomStore = create<WisdomState>()(
  persist(
    (set) => ({
      saved: [],
      seen: [],
      markSeen: (id) =>
        set((s) => (s.seen.includes(id) ? s : { seen: [...s.seen, id] })),
      toggleSave: (id) =>
        set((s) => ({
          saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [id, ...s.saved],
        })),
      clear: () => set({ saved: [], seen: [] }),
    }),
    {
      name: "swb.wisdom",
      partialize: (s) => ({ saved: s.saved, seen: s.seen }),
    },
  ),
);
