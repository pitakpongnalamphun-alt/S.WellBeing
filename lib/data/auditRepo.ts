import { getClient } from "@/lib/supabase/client";
import type { AuditEntry } from "@/lib/store/useAuditStore";

/**
 * บันทึกการเข้าถึงข้อมูลฝั่งเซิร์ฟเวอร์ (พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล ม.37)
 *
 * ตาราง audit_log ใน Supabase มี policy สำหรับ INSERT และ SELECT เท่านั้น —
 * ไม่มี policy สำหรับ UPDATE/DELETE แปลว่าฐานข้อมูลปฏิเสธการแก้และการลบเอง
 * ต่อให้บัญชีผู้ดูแลระบบถูกยึด ก็ลบร่องรอยของตัวเองไม่ได้
 *
 * นี่คือความต่างจากการเก็บในเครื่อง: ของในเครื่องลบได้ด้วยการล้างข้อมูลเบราว์เซอร์
 * การอ้างว่า "บันทึกลบไม่ได้" จึงเป็นจริงก็ต่อเมื่อบันทึกไปถึงตารางนี้
 */

type AuditRow = {
  id: string;
  at: string;
  actor: string;
  action: string;
  target_type: string;
  target_id: string;
  subject: string;
  detail: string | null;
};

const rowToEntry = (r: AuditRow): AuditEntry => ({
  id: r.id,
  at: r.at,
  actor: r.actor,
  action: r.action,
  targetType: r.target_type,
  targetId: r.target_id,
  subject: r.subject,
  detail: r.detail ?? undefined,
});

/** เขียนบันทึกขึ้นเซิร์ฟเวอร์ — คืน false เมื่อยังไม่ได้ตั้งค่าหรือส่งไม่สำเร็จ */
export async function insertAudit(e: AuditEntry): Promise<boolean> {
  const db = getClient();
  if (!db) return false;
  const { error } = await db.from("audit_log").insert({
    at: e.at,
    actor: e.actor,
    action: e.action,
    target_type: e.targetType,
    target_id: e.targetId,
    subject: e.subject,
    detail: e.detail ?? null,
  });
  if (error) {
    console.warn("[audit] insert failed:", error.message);
    return false;
  }
  return true;
}

/** ดึงบันทึกจากเซิร์ฟเวอร์ (RLS เปิดให้เฉพาะผู้ดูแลระบบ) */
export async function fetchAudit(): Promise<AuditEntry[] | null> {
  const db = getClient();
  if (!db) return null;
  const { data, error } = await db
    .from("audit_log")
    .select("*")
    .order("at", { ascending: false })
    .limit(1000);
  if (error) {
    console.warn("[audit] fetch failed:", error.message);
    return null;
  }
  return (data as AuditRow[]).map(rowToEntry);
}
