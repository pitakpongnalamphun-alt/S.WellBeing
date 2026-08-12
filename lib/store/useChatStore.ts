import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Message } from "@/components/student/chatbot/MessageBubble";

/**
 * บทสนทนากับน้องปุย — เก็บไว้ในเครื่องนี้เครื่องเดียว
 *
 * ตัวละครที่อบอุ่นทำให้นักเรียน *คาดหวัง* ว่าอีกฝ่ายจำเรื่องเมื่อวานได้ ถ้าปล่อยให้
 * บทสนทนาอยู่ใน useState เฉย ๆ (ปิดแท็บแล้วหาย) ก็เท่ากับหลอกโดยไม่ได้ตั้งใจ —
 * จึงเก็บลงเครื่องแบบเดียวกับไดอารี่อารมณ์ (swb.mooddiary)
 *
 * ที่ *ไม่* ทำคือส่งขึ้นเซิร์ฟเวอร์ เพราะบทสนทนาสุขภาพจิตรายบุคคลคือบันทึกที่ต้องมี
 * คนดูแลจริงจัง ไม่ใช่ของที่เก็บไว้เฉย ๆ เพราะเก็บได้ ผลคือปุยจำได้เฉพาะเครื่องเดิม
 * ซึ่งหน้าจอต้องบอกตรง ๆ ไม่ใช่ปล่อยให้เดาเอง
 *
 * เครื่องคอมโรงเรียนใช้ร่วมกัน — useUserStore.signOut() จึงเรียก clear() เสมอ และ
 * หน้าจอมีปุ่มลบที่กดได้ตลอดเวลาโดยไม่ต้องออกจากระบบ
 */

/** เก็บเฉพาะเนื้อความที่จบแล้ว — ฟองที่กำลังสตรีมอยู่ใน state ของหน้าจอ ไม่เขียนลงเครื่องทีละตัวอักษร */
export type StoredMessage = Pick<Message, "id" | "role" | "content" | "kind">;

/**
 * เพดานจำนวนข้อความที่เก็บ ตัดจากท้ายสุดขึ้นมา บทสนทนาที่ยาวมาก ๆ ไม่ได้มีค่ามากขึ้น
 * ตามความยาว แต่กินพื้นที่ localStorage ที่แชร์กับสโตร์อื่นทั้งแอป
 */
const MAX_STORED = 60;

type ChatState = {
  messages: StoredMessage[];
  /** false จนกว่าจะอ่านของเก่าจากเครื่องเสร็จ — กันหน้าจอกะพริบเป็น "ฉากเปิด" ก่อนแล้วค่อยเด้งเป็นบทสนทนาเก่า */
  ready: boolean;
  setReady: () => void;
  append: (m: StoredMessage) => void;
  /** ลบบทสนทนาทั้งหมดในเครื่องนี้ */
  clear: () => void;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      ready: false,
      setReady: () => set({ ready: true }),

      append: (m) =>
        set((s) => ({ messages: [...s.messages, m].slice(-MAX_STORED) })),

      clear: () => set({ messages: [] }),
    }),
    {
      name: "swb.chat",
      partialize: (s) => ({ messages: s.messages }),
      // ยิงทุกครั้งไม่ว่าจะมีของเก่าหรือไม่ หน้าจอจึงไม่ค้างรอ
      onRehydrateStorage: () => (state) => state?.setReady(),
    },
  ),
);
