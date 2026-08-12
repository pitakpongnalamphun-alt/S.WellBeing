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
  /**
   * วันที่ปล่อยเมฆล่าสุด "YYYY-MM-DD" — ปล่อยได้วันละก้อน ให้ตรงกับที่บันทึกอารมณ์
   * ได้วันละครั้งอยู่แล้ว และกันการกดย้อนกลับในหน้าเช็คอินเพื่อปล่อยรัว ๆ ซึ่งจะทำให้
   * ท้องฟ้าของคนคนเดียวกลบเมฆของคนอื่นจนหาไม่เจอ
   */
  lastReleasedDay: string | null;
  /** ขึ้นเดือนใหม่แล้วล้างท้องฟ้าเริ่มใหม่ — เรียกตอนเปิดหน้าและก่อนปล่อยเมฆ */
  ensureMonth: () => void;
  /** วันนี้ยังปล่อยเมฆได้อีกไหม */
  canReleaseToday: () => boolean;
  /** ปล่อยเมฆนิรนามเข้ากาแล็กซี — คืน id หรือ null ถ้าวันนี้ปล่อยไปแล้ว */
  release: (tertiaryEmotion: string, coreColor: CoreColor) => string | null;
  hug: (id: string) => void;
};

export const useCloudHugsStore = create<CloudHugsState>()(
  persist(
    (set, get) => ({
      month: monthOf(),
      clouds: seedFor(monthOf()),
      lastReleasedDay: null,

      ensureMonth: () => {
        const now = monthOf();
        if (get().month === now) return;
        // ล้างเฉพาะท้องฟ้า — lastReleasedDay ไม่ต้องแตะ วันใหม่ก็ปล่อยได้เองอยู่แล้ว
        set({ month: now, clouds: seedFor(now) });
      },

      canReleaseToday: () => get().lastReleasedDay !== localDay(),

      release: (tertiaryEmotion, coreColor) => {
        get().ensureMonth();
        const today = localDay();
        if (get().lastReleasedDay === today) return null;
        const id = `me-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        set((s) => ({
          clouds: [{ id, tertiaryEmotion, coreColor, hugsReceived: 0, mine: true }, ...s.clouds],
          lastReleasedDay: today,
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
      partialize: (s) => ({
        clouds: s.clouds,
        month: s.month,
        lastReleasedDay: s.lastReleasedDay,
      }),
    },
  ),
);
