import { create } from "zustand";
import { persist } from "zustand/middleware";

import { INITIAL_CLOUDS, type CoreColor, type MoodCloud } from "@/data/cloudHugs";
import { localDay } from "@/lib/date";

/**
 * The shared galaxy of anonymous mood clouds. Releasing (from the mood tracker)
 * and hugging (from the galaxy) both flow through here, so a cloud a student
 * lets go of genuinely appears for others to hug. Persisted locally for the demo;
 * a real build would sync this to the server behind auth.
 *
 * กาแล็กซีเริ่มใหม่ทุกเดือน: ความรู้สึกหนัก ๆ ของเดือนที่แล้วไม่ควรลอยค้างให้เห็น
 * ไปเรื่อย ๆ (ทั้งของเจ้าตัวและของเพื่อน) และการรีเซ็ตยังคุมจำนวนเมฆไม่ให้ล้นจน
 * ทับกันจนกดส่งกอดไม่ได้ — เดือนใหม่ = ท้องฟ้าใหม่
 */

/** "2026-08-12" → "2026-08" */
const monthOf = (day: string = localDay()) => day.slice(0, 7);

/** เมฆตั้งต้นของเดือนนั้น ๆ — id ผูกกับเดือน เมฆเดือนก่อนจึงไม่ปนกับเดือนใหม่ */
const seedFor = (month: string): MoodCloud[] =>
  INITIAL_CLOUDS.map((c) => ({ ...c, id: `${c.id}-${month}` }));

type CloudHugsState = {
  /** เดือนของกาแล็กซีชุดที่ถืออยู่ "YYYY-MM" */
  month: string;
  clouds: MoodCloud[];
  /** ขึ้นเดือนใหม่แล้วล้างท้องฟ้าเริ่มใหม่ — เรียกตอนเปิดหน้าและก่อนปล่อยเมฆ */
  ensureMonth: () => void;
  /** Send an anonymous cloud into the galaxy; returns its id. */
  release: (tertiaryEmotion: string, coreColor: CoreColor) => string;
  hug: (id: string) => void;
};

export const useCloudHugsStore = create<CloudHugsState>()(
  persist(
    (set, get) => ({
      month: monthOf(),
      clouds: seedFor(monthOf()),

      ensureMonth: () => {
        const now = monthOf();
        if (get().month === now) return;
        set({ month: now, clouds: seedFor(now) });
      },

      release: (tertiaryEmotion, coreColor) => {
        get().ensureMonth();
        const id = `me-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        set((s) => ({
          clouds: [{ id, tertiaryEmotion, coreColor, hugsReceived: 0, mine: true }, ...s.clouds],
        }));
        return id;
      },

      hug: (id) =>
        set((s) => ({
          clouds: s.clouds.map((c) => (c.id === id ? { ...c, hugsReceived: c.hugsReceived + 1 } : c)),
        })),
    }),
    {
      name: "swb.cloudhugs",
      partialize: (s) => ({ clouds: s.clouds, month: s.month }),
    },
  ),
);
