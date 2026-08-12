import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CoreKey } from "@/data/emotionWheel";
import { localDay } from "@/lib/date";

/**
 * สมุดสะสมอารมณ์ "ของฉัน" — ไดอารี่ส่วนตัวที่อยู่แค่ในเครื่องของนักเรียนเอง
 *
 * แยกขาดจากสถิตินิรนามของโรงเรียน (swb.moodstats) แบบเดียวกับที่ประวัติผลประเมิน
 * (swb.myassess) แยกจากสถิติประเมินใจ: สถิติโรงเรียนเก็บแค่ {อารมณ์, เวลา} โดยไม่รู้
 * ว่าใคร ส่วนชุดนี้รู้ว่าเป็นของใครแต่ไม่เคยออกจากเครื่อง ครูจึงไม่มีทางเห็น
 *
 * หนึ่งวันหนึ่งดวง — เช็คอินซ้ำในวันเดียวกันคือ "เปลี่ยนใจ" ไม่ใช่บันทึกใบใหม่
 * (ต่างจากสถิติโรงเรียนที่นับครั้งแรกของวันเท่านั้นเพื่อไม่ให้ตัวเลขรวมเฟ้อ)
 */

export type MoodDiaryEntry = {
  id: string;
  at: string; // ISO
  /** วันตามปฏิทินท้องถิ่น YYYY-MM-DD — คีย์ของ "หนึ่งวันหนึ่งดวง" */
  day: string;
  core: CoreKey;
  secondary: string;
  tertiary: string;
  /** studentId เจ้าของสมุด — เครื่องคอมโรงเรียนถูกใช้ร่วมกัน สมุดต้องผูกกับคน ไม่ใช่เครื่อง */
  owner?: string;
};

type MoodDiaryState = {
  entries: MoodDiaryEntry[];
  record: (r: { core: CoreKey; secondary: string; tertiary: string; owner?: string }) => void;
  /** ล้างสมุดทั้งเครื่อง — เรียกตอนออกจากระบบ กันคนถัดไปบนเครื่องเดียวกันเห็นของเรา */
  clear: () => void;
};

export const useMoodDiaryStore = create<MoodDiaryState>()(
  persist(
    (set) => ({
      entries: [],

      record: (r) => {
        const day = localDay();
        const entry: MoodDiaryEntry = {
          ...r,
          id: `md-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
          at: new Date().toISOString(),
          day,
        };
        set((s) => ({
          // เขียนทับดวงของวันเดียวกัน แล้วเรียงใหม่สุดขึ้นก่อน
          entries: [entry, ...s.entries.filter((e) => e.day !== day)],
        }));
      },

      clear: () => set({ entries: [] }),
    }),
    {
      name: "swb.mooddiary",
      partialize: (s) => ({ entries: s.entries }),
    },
  ),
);
