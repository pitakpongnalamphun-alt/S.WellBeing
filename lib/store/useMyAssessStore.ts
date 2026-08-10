import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AssessAction } from "@/lib/store/useAssessmentStore";

/**
 * ประวัติผลประเมิน "ของฉัน" — แยกขาดจากสถิตินิรนามของโรงเรียน (swb.assessments)
 * โดยตั้งใจ: สถิติโรงเรียนไม่รู้ว่าใครทำ ส่วนประวัตินี้เป็นของนักเรียนคนเดียว
 * และอยู่แค่ในเครื่องของเขาเอง ใช้วาดกราฟพัฒนาการ "ก่อน-หลัง" ให้เห็นว่า
 * คะแนนเครียด/ซึมเศร้าของตัวเองเปลี่ยนไปยังไงเมื่อเวลาผ่านไป
 *
 * ครูหรือผู้ดูแลระบบไม่มีทางเห็นข้อมูลชุดนี้ — เส้นทางเดียวที่ผลรายคนจะไปถึงครู
 * คือการกดยินยอมส่งต่อของนักเรียนเอง (ConsentShare ในหน้าประเมิน) เท่านั้น
 */

export type MyAssessEntry = {
  id: string;
  at: string; // ISO
  assessmentId: string; // "2Q" | "9Q" | "8Q" | "ST-5" | "GAD-7" | "PHQ-A"
  score: number;
  action: AssessAction;
  /** studentId เจ้าของประวัติ — เครื่องคอมโรงเรียนถูกใช้ร่วมกัน ประวัติต้องผูกกับคน ไม่ใช่เครื่อง */
  owner?: string;
};

type MyAssessState = {
  entries: MyAssessEntry[];
  remember: (r: {
    assessmentId: string;
    score: number;
    action: AssessAction;
    owner?: string;
  }) => void;
  /** ล้างประวัติทั้งเครื่อง — เรียกตอนออกจากระบบ กันคนถัดไปบนเครื่องเดียวกันเห็นของเรา */
  clear: () => void;
};

export const useMyAssessStore = create<MyAssessState>()(
  persist(
    (set) => ({
      entries: [],
      remember: (r) =>
        set((s) => ({
          entries: [
            {
              ...r,
              id: `my-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
              at: new Date().toISOString(),
            },
            ...s.entries,
          ],
        })),
      clear: () => set({ entries: [] }),
    }),
    {
      name: "swb.myassess",
      partialize: (s) => ({ entries: s.entries }),
    },
  ),
);
