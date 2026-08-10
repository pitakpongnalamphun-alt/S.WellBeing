import { create } from "zustand";
import { persist } from "zustand/middleware";

import { localDay } from "@/lib/date";

/**
 * A student's talk-appointments. Kept deliberately simple and pressure-free —
 * booking time to talk is never rewarded or gamified (it's help-seeking, not a
 * task to farm). Persisted locally so "my appointments" survives a refresh; a
 * real build would move this to the server behind auth + RLS.
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
        set((s) => ({ appointments: [appt, ...s.appointments] }));
        return appt;
      },

      cancel: (id) =>
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === id ? { ...a, status: "cancelled" } : a,
          ),
        })),

      setStatus: (id, status) =>
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === id ? { ...a, status } : a,
          ),
        })),

      reschedule: (id, date, time) =>
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === id ? { ...a, date, time, status: "confirmed" } : a,
          ),
        })),
    }),
    {
      name: "swb.appointments",
      partialize: (s) => ({ appointments: s.appointments }),
    },
  ),
);
