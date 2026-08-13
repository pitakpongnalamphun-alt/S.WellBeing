import { getClient } from "@/lib/supabase/client";
import type {
  AnonReport,
  CaseStatus,
  SafeCase,
} from "@/lib/store/useCasesStore";

/**
 * ชั้นแปลงข้อมูลระหว่างตารางใน Supabase (snake_case) กับชนิดข้อมูลในแอป (camelCase)
 *
 * ทุกฟังก์ชันคืน null/false เมื่อยังไม่ได้ตั้งค่าฐานข้อมูล เพื่อให้ store เดิม
 * ถอยไปทำงานแบบเก็บในเครื่องได้ — แอปต้องใช้งานได้เสมอแม้เน็ตหรือฐานข้อมูลล่ม
 * (นี่คือแอปแจ้งเหตุ การล้มเหลวแบบเงียบ ๆ แล้วใช้ไม่ได้เป็นเรื่องรับไม่ได้)
 */

type CaseRow = {
  id: string;
  created_at: string;
  updated_at: string;
  category_id: string;
  category_label: string;
  sub_categories: string[] | null;
  expectation: "urgent" | "prepare";
  sensitive: boolean;
  contact_name: string;
  contact_room: string;
  contact_phone: string;
  incident: string;
  victim: string;
  perpetrator: string;
  location_th: string | null;
  location_en: string | null;
  status: CaseStatus;
  note: string;
  assigned_to: string | null;
  acknowledged_at: string | null;
};

function rowToCase(r: CaseRow): SafeCase {
  return {
    id: r.id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    categoryId: r.category_id,
    categoryLabel: r.category_label,
    subCategories: r.sub_categories ?? undefined,
    expectation: r.expectation,
    sensitive: r.sensitive,
    contact: { name: r.contact_name, room: r.contact_room, phone: r.contact_phone },
    incident: r.incident,
    victim: r.victim,
    perpetrator: r.perpetrator,
    location: r.location_th ? { th: r.location_th, en: r.location_en ?? r.location_th } : null,
    status: r.status,
    note: r.note,
    assignedTo: r.assigned_to ?? undefined,
    acknowledgedAt: r.acknowledged_at ?? undefined,
  };
}

function caseToRow(c: SafeCase, reporter: string | null) {
  return {
    id: c.id,
    reporter,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
    category_id: c.categoryId,
    category_label: c.categoryLabel,
    sub_categories: c.subCategories ?? null,
    expectation: c.expectation,
    sensitive: c.sensitive,
    contact_name: c.contact.name,
    contact_room: c.contact.room,
    contact_phone: c.contact.phone,
    incident: c.incident,
    victim: c.victim,
    perpetrator: c.perpetrator,
    location_th: c.location?.th ?? null,
    location_en: c.location?.en ?? null,
    status: c.status,
    note: c.note,
    assigned_to: c.assignedTo ?? null,
    acknowledged_at: c.acknowledgedAt ?? null,
  };
}

/**
 * มี session กับฐานข้อมูลอยู่หรือไม่
 *
 * สำคัญ: เมื่อยังไม่ล็อกอิน RLS จะคืน "0 แถว" เฉย ๆ ไม่ใช่ error — ถ้าเอาผลนั้น
 * ไปแทนที่ข้อมูลในเครื่องตรง ๆ จะกลายเป็นล้างข้อมูลของผู้ใช้ทิ้ง ทุกจุดที่ซิงก์
 * ต้องเช็คตัวนี้ก่อนเสมอ
 */
export async function hasSession(): Promise<boolean> {
  const db = getClient();
  if (!db) return false;
  const { data } = await db.auth.getSession();
  return Boolean(data.session);
}

/** ดึงเคสทั้งหมดที่ผู้ใช้ปัจจุบัน "มีสิทธิ์เห็น" (RLS เป็นคนตัดสิน ไม่ใช่โค้ดนี้) */
export async function fetchCases(): Promise<SafeCase[] | null> {
  const db = getClient();
  if (!db) return null;
  const { data, error } = await db
    .from("cases")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("[cases] fetch failed:", error.message);
    return null;
  }
  return (data as CaseRow[]).map(rowToCase);
}

/** ดึงรายงานนิรนาม (ครูเท่านั้นตาม RLS) */
export async function fetchAnonReports(): Promise<AnonReport[] | null> {
  const db = getClient();
  if (!db) return null;
  const { data, error } = await db
    .from("anon_reports")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("[anon] fetch failed:", error.message);
    return null;
  }
  return (data as { id: string; created_at: string; category_id: string; category_label: string; sub_categories: string[] | null; sensitive: boolean }[]).map(
    (r) => ({
      id: r.id,
      createdAt: r.created_at,
      categoryId: r.category_id,
      categoryLabel: r.category_label,
      subCategories: r.sub_categories ?? undefined,
      sensitive: r.sensitive,
    }),
  );
}

export async function insertCase(c: SafeCase): Promise<boolean> {
  const db = getClient();
  if (!db) return false;
  const { data: auth } = await db.auth.getUser();
  const { error } = await db.from("cases").insert(caseToRow(c, auth.user?.id ?? null));
  if (error) {
    console.warn("[cases] insert failed:", error.message);
    return false;
  }
  return true;
}

/** รายงานนิรนาม: ตารางปลายทางไม่มีคอลัมน์ผู้ส่ง จึงไม่มีอะไรให้ผูกกลับได้ */
export async function insertAnonReport(r: AnonReport): Promise<boolean> {
  const db = getClient();
  if (!db) return false;
  const { error } = await db.from("anon_reports").insert({
    category_id: r.categoryId,
    category_label: r.categoryLabel,
    sub_categories: r.subCategories ?? null,
    sensitive: r.sensitive,
  });
  if (error) {
    console.warn("[anon] insert failed:", error.message);
    return false;
  }
  return true;
}

export async function patchCase(
  id: string,
  patch: Partial<{
    status: CaseStatus;
    note: string;
    assigned_to: string | null;
    acknowledged_at: string | null;
  }>,
): Promise<boolean> {
  const db = getClient();
  if (!db) return false;
  const { error } = await db
    .from("cases")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) {
    console.warn("[cases] update failed:", error.message);
    return false;
  }
  return true;
}
