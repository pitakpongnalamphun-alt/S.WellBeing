import { create } from "zustand";
import { persist } from "zustand/middleware";

import { fetchAudit, insertAudit } from "@/lib/data/auditRepo";
import { isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * Accountability log for PDPA §37 (พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล ม.37) — the
 * controller must be able to show who did what to whose personal data and when.
 * It records both ACCESS to a student's identifying details (revealing contact
 * info) and case-HANDLING actions that process their data (status changes,
 * assignment, follow-up notes), so the trail answers "who touched whose case."
 *
 * Append-only on purpose: there is a `log` action but no edit or delete, because
 * an audit trail you can quietly rewrite is not a trail.
 *
 * เมื่อเชื่อมฐานข้อมูลแล้ว ทุกบันทึกจะถูกส่งขึ้นตาราง audit_log ซึ่งมีเฉพาะ
 * policy สำหรับ INSERT/SELECT — ฐานข้อมูลปฏิเสธการแก้และการลบด้วยตัวเอง
 * ส่วนสำเนาในเครื่องยังเก็บไว้เพื่อให้โหมดสาธิต (ไม่มีฐานข้อมูล) ยังใช้งานได้
 */

export type AuditEntry = {
  id: string;
  at: string; // ISO
  actor: string; // who acted (staff name)
  action: string; // action code, see AUDIT_ACTION_LABEL
  targetType: string; // e.g. "เคส"
  targetId: string; // e.g. the ticket code
  subject: string; // whose data — the student
  detail?: string; // optional specifics, e.g. "→ กำลังดูแล" (never the note body)
};

export const AUDIT_ACTION_LABEL: Record<string, string> = {
  view_contact: "เปิดดูข้อมูลติดต่อผู้แจ้ง",
  change_status: "เปลี่ยนสถานะเคส",
  assign_case: "มอบหมายผู้รับผิดชอบ",
  edit_note: "แก้บันทึกการติดตาม",
  export_cases: "ส่งออกสรุปเคส (CSV)",
  export_audit: "ส่งออกบันทึกการเข้าถึง (CSV)",
};

/** บันทึกอยู่ที่ไหน — ใช้บอกผู้ดูแลระบบว่ากำลังดูของจริงหรือสำเนาในเครื่อง */
export type AuditSource = "local" | "server";

type AuditState = {
  entries: AuditEntry[];
  source: AuditSource;
  log: (e: Omit<AuditEntry, "id" | "at">) => void;
  /** ดึงบันทึกจากเซิร์ฟเวอร์มาแทนสำเนาในเครื่อง (เรียกตอนเปิดหน้าบันทึก) */
  syncFromServer: () => Promise<void>;
};

export const useAuditStore = create<AuditState>()(
  persist(
    (set) => ({
      entries: [],
      source: "local",
      log: (e) => {
        const entry: AuditEntry = {
          ...e,
          id: `au-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
          at: new Date().toISOString(),
        };
        // เขียนลงเครื่องก่อนเสมอ เพื่อให้ร่องรอยไม่หายแม้เน็ตหลุด
        set((s) => ({ entries: [entry, ...s.entries] }));
        void insertAudit(entry);
      },

      syncFromServer: async () => {
        if (!isSupabaseConfigured()) {
          set({ source: "local" });
          return;
        }
        const remote = await fetchAudit();
        // null = ดึงไม่สำเร็จ (ไม่ได้ล็อกอิน/ไม่มีสิทธิ์) — คงสำเนาในเครื่องไว้
        if (remote === null) {
          set({ source: "local" });
          return;
        }
        set({ entries: remote, source: "server" });
      },
    }),
    {
      name: "swb.audit",
      partialize: (s) => ({ entries: s.entries }),
    },
  ),
);
