import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  fetchAppointments,
  insertAppointment,
  patchAppointment,
} from "@/lib/data/appointmentsRepo";
import { hasSession } from "@/lib/data/casesRepo";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { localDay } from "@/lib/date";

/**
 * A student's talk-appointments. Kept deliberately simple and pressure-free —
 * booking time to talk is never rewarded or gamified (it's help-seeking, not a
 * task to farm).
 *
 * เขียนลงเครื่องก่อนเสมอ แล้วค่อยส่งขึ้นเซิร์ฟเวอร์พร้อมคิวส่งซ้ำ — แบบเดียวกับเคส
 * และ SOS เพราะก่อนหน้านี้นัดอยู่แค่ localStorage ของเครื่องที่จอง ครูที่เปิด
 * แดชบอร์ดคนละเครื่องจึงเห็นคิวว่างเปล่า ทั้งที่นักเรียนจองเข้ามาแล้ว
 */

export type AppointmentFormat = "onsite" | "video" | "phone";
export type AppointmentStatus = "pending" | "confirmed" | "done" | "cancelled";

export type Appointment = {
  id: string;
  code: string; // human-friendly reference, e.g. APT-K7Q2
  counselorId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  format: AppointmentFormat;
  topic: string;
  name: string;
  room: string;
  status: AppointmentStatus;
  createdAt: string; // YYYY-MM-DD
};

export const FORMAT_META: Record<
  AppointmentFormat,
  { label: string; emoji: string; hint: string }
> = {
  onsite: { label: "พบที่ห้องแนะแนว", emoji: "🏫", hint: "เจอกันตัวเป็น ๆ ที่โรงเรียน" },
  video: { label: "วิดีโอคอล", emoji: "💻", hint: "คุยผ่านวิดีโอจากที่ไหนก็ได้" },
  phone: { label: "โทรศัพท์", emoji: "📞", hint: "คุยทางเสียง ไม่ต้องเปิดกล้อง" },
};

export const STATUS_META: Record<
  AppointmentStatus,
  { label: string; tint: string; dot: string }
> = {
  pending: { label: "รอยืนยัน", tint: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-400" },
  confirmed: { label: "ยืนยันแล้ว", tint: "bg-mint-50 text-mint-700 ring-mint-200", dot: "bg-mint-500" },
  done: { label: "เสร็จสิ้น", tint: "bg-slate-100 text-slate-500 ring-slate-200", dot: "bg-slate-400" },
  cancelled: { label: "ยกเลิกแล้ว", tint: "bg-rose-50 text-rose-600 ring-rose-200", dot: "bg-rose-400" },
};

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O, 1/I
function makeCode(): string {
  let s = "";
  for (let i = 0; i < 4; i += 1) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return `APT-${s}`;
}

type NewAppointment = Pick<
  Appointment,
  "counselorId" | "date" | "time" | "format" | "topic" | "name" | "room"
>;

type AppointmentState = {
  appointments: Appointment[];
  /** นัดที่เขียนลงเครื่องแล้วแต่ยังส่งขึ้นเซิร์ฟเวอร์ไม่สำเร็จ (คิวส่งซ้ำ) */
  pending: string[];
  /** ดึงนัดจากเซิร์ฟเวอร์: นักเรียนเห็นของตัวเอง ครูเห็นทุกใบ (RLS ตัดสิน) */
  syncFromServer: () => Promise<void>;
  /**
   * Create a booking. Defaults to "pending" (a student asking for time). Staff
   * booking directly for a student pass "confirmed" — they're the one arranging
   * it, so there is nobody left to confirm to.
   */
  book: (input: NewAppointment, status?: AppointmentStatus) => Appointment;
  cancel: (id: string) => void;
  /** Staff-side: move a booking through its lifecycle (confirm / mark done / cancel). */
  setStatus: (id: string, status: AppointmentStatus) => void;
  /** Staff-side: offer a new time — updates the slot and confirms it. */
  reschedule: (id: string, date: string, time: string) => void;
};

export const useAppointmentStore = create<AppointmentState>()(
  persist(
    (set, get) => ({
      appointments: [],
      pending: [],

      book: (input, status = "pending") => {
        // Keep the human-facing code unique so it can't ambiguously point at two bookings.
        const used = new Set(get().appointments.map((a) => a.code));
        let code = makeCode();
        while (used.has(code)) code = makeCode();
        const appt: Appointment = {
          ...input,
          id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
          code,
          status,
          createdAt: localDay(),
        };
        // ลงเครื่องก่อน แล้วค่อยส่ง — จองแล้วต้องเห็นทันทีแม้เน็ตจะช้า
        set((s) => ({
          appointments: [appt, ...s.appointments],
          pending: [...s.pending, appt.id],
        }));
        void insertAppointment(appt).then((ok) => {
          if (ok || !isSupabaseConfigured()) {
            set((s) => ({ pending: s.pending.filter((p) => p !== appt.id) }));
          }
        });
        return appt;
      },

      cancel: (id) => {
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === id ? { ...a, status: "cancelled" } : a,
          ),
        }));
        void patchAppointment(id, { status: "cancelled" });
      },

      setStatus: (id, status) => {
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === id ? { ...a, status } : a,
          ),
        }));
        void patchAppointment(id, { status });
      },

      reschedule: (id, date, time) => {
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === id ? { ...a, date, time, status: "confirmed" } : a,
          ),
        }));
        void patchAppointment(id, { date, time, status: "confirmed" });
      },

      syncFromServer: async () => {
        if (!isSupabaseConfigured()) return;
        // ยังไม่ล็อกอิน = RLS คืน 0 แถวเสมอ ห้ามเอาไปแทนที่ของในเครื่อง
        if (!(await hasSession())) return;

        // 1) ดูก่อนว่าเซิร์ฟเวอร์มีอะไรบ้าง
        const remote = await fetchAppointments();
        if (remote === null) return;
        const remoteIds = new Set(remote.map((r) => r.id));

        // 2) นัดในเครื่องที่เซิร์ฟเวอร์ยังไม่มี = ต้องส่งขึ้น ไม่ใช่แค่ที่ค้างคิว
        //    รวมถึงนัดเก่าที่จองไว้ตั้งแต่ยังไม่มีเซิร์ฟเวอร์ — ถ้าไม่ส่งขึ้นให้
        //    มันจะหายจากจอทันทีที่ซิงก์ครั้งแรก ทั้งที่นักเรียนจองไว้จริง
        const stuck: string[] = [];
        for (const a of get().appointments) {
          if (remoteIds.has(a.id)) continue;
          if (!(await insertAppointment(a))) stuck.push(a.id);
        }

        // 3) รวมจอ: ของเซิร์ฟเวอร์เป็นหลัก + ที่ยังส่งไม่ขึ้นคงไว้ให้เห็น
        const localOnly = get().appointments.filter((a) => stuck.includes(a.id));
        set({ appointments: [...localOnly, ...remote], pending: stuck });
      },
    }),
    {
      name: "swb.appointments",
      partialize: (s) => ({ appointments: s.appointments, pending: s.pending }),
    },
  ),
);
