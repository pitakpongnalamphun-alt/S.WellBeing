import { create } from "zustand";
import { persist } from "zustand/middleware";

import { fetchSos, insertSos, patchSos } from "@/lib/data/sosRepo";
import { hasSession } from "@/lib/data/casesRepo";
import { isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * Live SOS alerts raised from the in-school SOS flow (the student picks where
 * they are and a duty teacher is meant to come). External-hours SOS just dials
 * a hotline and produces no alert here.
 *
 * Synced to the sos_alerts table the same way cases are: write LOCAL first
 * (a student in danger must never wait on the network), then push to the
 * server with a retry queue, and let SosSync pull the shared list so a duty
 * teacher on a DIFFERENT machine actually sees the alert land. Without the
 * server leg this store was localStorage-only — an SOS raised on a phone
 * simply never appeared on the staff dashboard.
 *
 * Anti-false-alarm design: a student can withdraw their own alert ("กดผิด") —
 * status "cancelled" — and staff tag every resolved alert with an OUTCOME
 * (real / drill / accident / prank). False alarms become data the school can
 * act on (awareness campaigns), never grounds for punishing the presser.
 */

export type SosStatus = "active" | "resolved" | "cancelled";

/** What actually happened — tagged by staff when closing the alert. */
export type SosOutcome = "real" | "drill" | "accident" | "prank";

export const SOS_OUTCOME_ORDER: SosOutcome[] = ["real", "drill", "accident", "prank"];

export const SOS_OUTCOME_META: Record<SosOutcome, { label: string; tint: string }> = {
  real: { label: "เหตุจริง", tint: "bg-rose-50 text-rose-600 ring-rose-200" },
  drill: { label: "ซ้อม", tint: "bg-sky-50 text-sky-700 ring-sky-200" },
  accident: { label: "กดผิด", tint: "bg-amber-50 text-amber-700 ring-amber-200" },
  prank: { label: "กดเล่น", tint: "bg-slate-100 text-slate-500 ring-slate-200" },
};

/** A resolved outcome that wasn't an emergency — the "false alarm" bucket. */
export const isFalseAlarm = (o?: SosOutcome) => o === "accident" || o === "prank";

export type SosAlert = {
  id: string;
  createdAt: string; // ISO
  place: { th: string; en: string };
  status: SosStatus;
  /** Reporter's profile name — shown to STAFF only (the SOS flow says so upfront). */
  name?: string;
  /** Set by staff at close time; absent while active/cancelled or if closed unclassified. */
  outcome?: SosOutcome;
};

type SosState = {
  alerts: SosAlert[];
  /** The alert THIS device raised last — lets the student page resume/cancel it. */
  lastRaisedId: string | null;
  /**
   * เหตุที่เขียนลงเครื่องแล้วแต่ยังส่งขึ้นเซิร์ฟเวอร์ไม่สำเร็จ (คิวส่งซ้ำ)
   * — SOS คือปุ่มฉุกเฉิน เหตุห้ามหายเงียบเพราะเน็ตหลุดเด็ดขาด
   */
  pending: string[];
  raise: (place: { th: string; en: string }, name?: string) => string;
  resolve: (id: string, outcome?: SosOutcome) => void;
  /** Student-side withdraw ("ฉันกดผิด") — only an active alert can be cancelled. */
  cancel: (id: string) => void;
  /**
   * Student moved — update the live alert's location IN PLACE. A changed
   * situation must never force the false-alarm cancel path (which would tell
   * staff the emergency was a mistake and leave a gap with no active alert).
   */
  updatePlace: (id: string, place: { th: string; en: string }) => void;
  /** ดึงเหตุจากเซิร์ฟเวอร์มาแทนที่ของในเครื่อง (SosSync เรียกเป็นระยะ) */
  syncFromServer: () => Promise<void>;
};

export const useSosStore = create<SosState>()(
  persist(
    (set, get) => ({
      alerts: [],
      lastRaisedId: null,
      pending: [],

      raise: (place, name) => {
        const id = `sos-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
        const alert: SosAlert = {
          id,
          createdAt: new Date().toISOString(),
          place,
          status: "active",
          name,
        };
        // เขียนลงเครื่องก่อนเสมอ — เด็กที่กำลังเดือดร้อนไม่รอเน็ต
        set((s) => ({
          lastRaisedId: id,
          alerts: [alert, ...s.alerts],
          pending: [...s.pending, id],
        }));
        void insertSos(alert).then((ok) => {
          if (ok || !isSupabaseConfigured()) {
            set((s) => ({ pending: s.pending.filter((p) => p !== id) }));
          }
          // ส่งไม่สำเร็จทั้งที่ตั้งค่าไว้ → ค้างคิว แล้ว syncFromServer ส่งซ้ำให้
        });
        return id;
      },

      resolve: (id, outcome) => {
        set((s) => ({
          alerts: s.alerts.map((a) =>
            a.id === id ? { ...a, status: "resolved", outcome } : a,
          ),
        }));
        void patchSos(id, { status: "resolved", outcome: outcome ?? null });
      },

      cancel: (id) => {
        set((s) => ({
          alerts: s.alerts.map((a) =>
            a.id === id && a.status === "active" ? { ...a, status: "cancelled" } : a,
          ),
        }));
        void patchSos(id, { status: "cancelled" });
      },

      updatePlace: (id, place) => {
        set((s) => ({
          alerts: s.alerts.map((a) =>
            a.id === id && a.status === "active" ? { ...a, place } : a,
          ),
        }));
        void patchSos(id, { place_th: place.th, place_en: place.en });
      },

      syncFromServer: async () => {
        if (!isSupabaseConfigured()) return;
        // ยังไม่มี session = RLS คืน 0 แถวเสมอ — ห้ามเอาไปแทนที่ของในเครื่อง
        // (บทเรียนเดียวกับหน้าบันทึกการเข้าถึงที่เคยล้างจอทั้งที่มีข้อมูล)
        if (!(await hasSession())) return;

        // 1) ส่งเหตุที่ค้างคิวขึ้นก่อน
        for (const id of get().pending) {
          const a = get().alerts.find((x) => x.id === id);
          if (a && (await insertSos(a))) {
            set((s) => ({ pending: s.pending.filter((p) => p !== id) }));
          }
        }

        // 2) แล้วค่อยดึงของจริง — เหตุที่ยังส่งไม่ขึ้นต้องคงอยู่บนจอ
        const remote = await fetchSos();
        if (remote === null) return;
        const stillPending = get().pending;
        const localOnly = get().alerts.filter((a) => stillPending.includes(a.id));
        set({ alerts: [...localOnly, ...remote] });
      },
    }),
    {
      name: "swb.sos",
      partialize: (s) => ({
        alerts: s.alerts,
        lastRaisedId: s.lastRaisedId,
        pending: s.pending,
      }),
    },
  ),
);
