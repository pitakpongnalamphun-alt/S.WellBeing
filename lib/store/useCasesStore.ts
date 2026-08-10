import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  fetchAnonReports,
  fetchCases,
  hasSession,
  insertAnonReport,
  insertCase,
  patchCase,
} from "@/lib/data/casesRepo";
import { isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * The shared Safe-Ticket case store — the seam that connects the student side
 * (แจ้งเหตุ) to the admin side (จัดการเคส). A student submitting a report writes
 * here; the admin Cases board reads and triages the same rows.
 *
 * This is a client-side stand-in for a real backend (the report page's TODO
 * points at /api/report + RLS). It works end-to-end within one browser, which
 * is enough to demo the whole flow; a production build moves it server-side.
 *
 * Anonymity is honoured at the data layer: an identified report (urgent/prepare)
 * becomes a trackable `SafeCase` with contact details; an anonymous one becomes
 * an `AnonReport` that keeps only its category + time — no name, no story — so
 * the school sees an aggregate signal, never a person to trace.
 */

export type CaseExpectation = "urgent" | "prepare";
export type CaseStatus = "pending" | "in_progress" | "resolved" | "followup";

export type CaseContact = { name: string; room: string; phone: string };
export type CaseLocation = { th: string; en: string } | null;

export type SafeCase = {
  id: string; // human ticket code, e.g. SWB-K7Q2XM
  createdAt: string; // ISO
  updatedAt: string; // ISO
  categoryId: string;
  categoryLabel: string;
  expectation: CaseExpectation;
  sensitive: boolean; // "unsafe" / "harassment" — surface the 1323 line louder
  contact: CaseContact;
  incident: string;
  victim: string;
  perpetrator: string;
  location: CaseLocation;
  status: CaseStatus;
  note: string; // staff follow-up notes
  assignedTo?: string; // counselor/staff id responsible for the case
  acknowledgedAt?: string; // ISO — when it first left "pending" (SLA is met by this)
};

/** Anonymous reports keep no identity and no story — an aggregate signal only. */
export type AnonReport = {
  id: string;
  createdAt: string;
  categoryId: string;
  categoryLabel: string;
  sensitive: boolean;
};

export const CASE_STATUS_META: Record<
  CaseStatus,
  { label: string; en: string; tint: string; dot: string }
> = {
  pending: { label: "รอรับเรื่อง", en: "Pending", tint: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-400" },
  in_progress: { label: "กำลังดูแล", en: "In Progress", tint: "bg-sky-50 text-sky-700 ring-sky-200", dot: "bg-sky-500" },
  resolved: { label: "คลี่คลายแล้ว", en: "Resolved", tint: "bg-mint-50 text-mint-700 ring-mint-200", dot: "bg-mint-500" },
  followup: { label: "ติดตามผลระยะยาว", en: "Follow-up", tint: "bg-violet-50 text-violet-700 ring-violet-200", dot: "bg-violet-400" },
};

export const CASE_STATUS_ORDER: CaseStatus[] = [
  "pending",
  "in_progress",
  "resolved",
  "followup",
];

/** An open case is one still needing attention (not resolved / not in long-term follow-up). */
export const isOpenStatus = (s: CaseStatus) => s === "pending" || s === "in_progress";

/**
 * SLA: how long staff have to *receive* (leave "pending") a case, by urgency.
 * Urgent asks for a fast pickup; "ขอเวลาเตรียมใจ" is a gentler window.
 */
export const SLA_HOURS: Record<CaseExpectation, number> = { urgent: 2, prepare: 24 };

export type SlaState = "on_track" | "overdue" | "met" | "missed";

/**
 * Where a case stands against its SLA, given the current time (ms). Pass a live
 * `now` so a pending case ticks toward overdue; once acknowledged the outcome
 * (met/missed) is fixed. `remainingMs` is positive while on track, negative once
 * overdue.
 */
export function slaState(
  c: SafeCase,
  now: number,
): { state: SlaState; dueAt: number; remainingMs: number } {
  const dueAt = new Date(c.createdAt).getTime() + SLA_HOURS[c.expectation] * 3_600_000;
  // A received case keeps its fixed met/missed outcome — but only while it stays
  // received. If it's re-opened back to "pending" it must tick live again, so
  // gate on the current status, not just on acknowledgedAt existing.
  if (c.status !== "pending" && c.acknowledgedAt) {
    const ack = new Date(c.acknowledgedAt).getTime();
    return { state: ack <= dueAt ? "met" : "missed", dueAt, remainingMs: 0 };
  }
  const remainingMs = dueAt - now;
  return { state: remainingMs >= 0 ? "on_track" : "overdue", dueAt, remainingMs };
}

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O, 1/I
function makeTicket(used: Set<string>): string {
  const gen = () => {
    let s = "";
    for (let i = 0; i < 6; i += 1) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    return `SWB-${s}`;
  };
  let code = gen();
  while (used.has(code)) code = gen();
  return code;
}

type NewCase = {
  categoryId: string;
  categoryLabel: string;
  expectation: CaseExpectation;
  sensitive: boolean;
  contact: CaseContact;
  incident: string;
  victim: string;
  perpetrator: string;
  location: CaseLocation;
};

/** สถานะการเชื่อมกับฐานข้อมูล — ใช้บอกผู้ใช้ว่ากำลังดูข้อมูลจากที่ไหน */
export type SyncState = "local" | "syncing" | "synced" | "error";

type CasesState = {
  cases: SafeCase[];
  anonymous: AnonReport[];
  sync: SyncState;
  /**
   * รหัสเคสที่เขียนลงเครื่องแล้วแต่ยังส่งขึ้นเซิร์ฟเวอร์ไม่สำเร็จ (คิวส่งซ้ำ)
   *
   * แอปแจ้งเหตุห้ามทำเรื่องของนักเรียนหายเด็ดขาด — ถ้าเน็ตหลุดตอนกดส่ง เรื่องต้อง
   * ค้างอยู่ในเครื่องแล้วส่งเองเมื่อกลับมาออนไลน์ ไม่ใช่หายเงียบ
   */
  pending: string[];
  /** ล้างข้อมูลทั้งหมดในเครื่อง — เรียกตอนออกจากระบบ (คอมโรงเรียนใช้ร่วมกัน) */
  clear: () => void;
  /** Open an identified case; returns the ticket code shown to the student. */
  openCase: (input: NewCase) => string;
  /** Record an anonymous report as an aggregate signal (no identity, no story). */
  addAnonymous: (categoryId: string, categoryLabel: string, sensitive: boolean) => void;
  setStatus: (id: string, status: CaseStatus) => void;
  setNote: (id: string, note: string) => void;
  /** Assign (or, with "", unassign) the responsible staff member. */
  assign: (id: string, assigneeId: string) => void;
  /** ดึงข้อมูลจากเซิร์ฟเวอร์มาแทนที่ของในเครื่อง (เรียกตอนเปิดหน้า) */
  syncFromServer: () => Promise<void>;
};

export const useCasesStore = create<CasesState>()(
  persist(
    (set, get) => ({
      cases: [],
      anonymous: [],

      sync: "local",
      pending: [],

      clear: () => set({ cases: [], anonymous: [], pending: [], sync: "local" }),

      openCase: (input) => {
        const now = new Date().toISOString();
        const ticket = makeTicket(new Set(get().cases.map((c) => c.id)));
        const c: SafeCase = {
          ...input,
          id: ticket,
          createdAt: now,
          updatedAt: now,
          status: "pending",
          note: "",
        };
        // เขียนลงเครื่องก่อนเสมอ แล้วค่อยส่งขึ้นเซิร์ฟเวอร์ — นักเรียนที่กำลังเดือดร้อน
        // ต้องได้รหัสติดตามทันที ไม่ต้องรอเน็ต
        set((s) => ({ cases: [c, ...s.cases], pending: [...s.pending, ticket] }));
        void insertCase(c).then((ok) => {
          if (ok) {
            set((s) => ({ sync: "synced", pending: s.pending.filter((p) => p !== ticket) }));
          } else if (isSupabaseConfigured()) {
            set({ sync: "error" }); // ค้างไว้ในคิว แล้วลองใหม่ตอน sync รอบหน้า
          } else {
            set((s) => ({ pending: s.pending.filter((p) => p !== ticket) }));
          }
        });
        return ticket;
      },

      addAnonymous: (categoryId, categoryLabel, sensitive) => {
        const r: AnonReport = {
          id: `anon-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
          createdAt: new Date().toISOString(),
          categoryId,
          categoryLabel,
          sensitive,
        };
        set((s) => ({ anonymous: [r, ...s.anonymous] }));
        void insertAnonReport(r);
      },

      setStatus: (id, status) => {
        const now = new Date().toISOString();
        let ackForServer: string | null | undefined;
        set((s) => ({
          cases: s.cases.map((c) => {
            if (c.id !== id) return c;
            // The first move off "pending" is when staff received the case —
            // that timestamp is what the SLA is met (or missed) by.
            const acknowledgedAt =
              c.acknowledgedAt ?? (status !== "pending" ? now : undefined);
            ackForServer = acknowledgedAt ?? null;
            return { ...c, status, updatedAt: now, acknowledgedAt };
          }),
        }));
        void patchCase(id, { status, acknowledged_at: ackForServer ?? null });
      },

      setNote: (id, note) => {
        set((s) => ({
          cases: s.cases.map((c) =>
            c.id === id ? { ...c, note, updatedAt: new Date().toISOString() } : c,
          ),
        }));
        void patchCase(id, { note });
      },

      assign: (id, assigneeId) => {
        set((s) => ({
          cases: s.cases.map((c) =>
            c.id === id
              ? { ...c, assignedTo: assigneeId || undefined, updatedAt: new Date().toISOString() }
              : c,
          ),
        }));
        void patchCase(id, { assigned_to: assigneeId || null });
      },

      syncFromServer: async () => {
        if (!isSupabaseConfigured()) {
          set({ sync: "local" });
          return;
        }
        // ยังไม่ล็อกอิน = ฐานข้อมูลจะคืน 0 แถวเสมอ ห้ามเอาไปแทนที่ของในเครื่อง
        // มิฉะนั้นข้อมูลผู้ใช้จะถูกล้างทิ้งทุกครั้งที่เปิดหน้า
        if (!(await hasSession())) {
          set({ sync: "local" });
          return;
        }
        set({ sync: "syncing" });

        // 1) ส่งเรื่องที่ค้างคิวขึ้นก่อน — เรื่องของนักเรียนต้องไปถึงครูให้ได้
        const stuck = get().pending;
        if (stuck.length > 0) {
          const byId = new Map(get().cases.map((c) => [c.id, c]));
          for (const id of stuck) {
            const c = byId.get(id);
            if (c && (await insertCase(c))) {
              set((s) => ({ pending: s.pending.filter((p) => p !== id) }));
            }
          }
        }

        // 2) แล้วค่อยดึงของจริงจากเซิร์ฟเวอร์มาแทนที่
        const [remoteCases, remoteAnon] = await Promise.all([
          fetchCases(),
          fetchAnonReports(),
        ]);
        if (remoteCases === null) {
          set({ sync: "error" });
          return;
        }
        // เซิร์ฟเวอร์คือแหล่งความจริง — แต่เรื่องที่ยังส่งไม่ขึ้นต้องคงอยู่บนจอ
        // ไม่งั้นนักเรียนจะเห็นเรื่องที่เพิ่งแจ้งหายไปต่อหน้า
        const stillPending = get().pending;
        const localOnly = get().cases.filter((c) => stillPending.includes(c.id));
        set({
          cases: [...localOnly, ...remoteCases],
          anonymous: remoteAnon ?? [],
          sync: stillPending.length > 0 ? "error" : "synced",
        });
      },
    }),
    {
      name: "swb.cases",
      // เก็บลงเครื่องเสมอ เพื่อให้เรื่องที่ส่งไม่ขึ้นไม่หายไปตอนรีเฟรช
      // ความเป็นส่วนตัวบนคอมที่ใช้ร่วมกันจัดการด้วย clear() ตอนออกจากระบบแทน
      partialize: (s) =>
        ({ cases: s.cases, anonymous: s.anonymous, pending: s.pending }) as Partial<CasesState>,
    },
  ),
);
