import { getClient } from "@/lib/supabase/client";
import type { SosAlert, SosOutcome, SosStatus } from "@/lib/store/useSosStore";

/**
 * ชั้นแปลงข้อมูล SOS ระหว่าง Supabase (snake_case) กับแอป (camelCase) —
 * แบบแผนเดียวกับ casesRepo ทุกประการ: คืน null/false เมื่อฐานข้อมูลไม่พร้อม
 * เพื่อให้ store ถอยไปโหมดเก็บในเครื่องได้เสมอ ปุ่มฉุกเฉินห้ามพังเงียบ ๆ
 */

type SosRow = {
  id: string;
  created_at: string;
  place_th: string;
  place_en: string;
  status: SosStatus;
  name: string;
  outcome: SosOutcome | null;
  // คอลัมน์ "รับเรื่องแล้ว" เพิ่มทีหลัง — ฐานข้อมูลที่ยังไม่ได้อัปเกรดจะไม่มีคีย์นี้
  // จึงต้องอ่านแบบ optional ไม่ใช่บังคับ ไม่งั้นหน้าจอ SOS พังทั้งจอเพราะคอลัมน์เดียว
  acknowledged_at?: string | null;
  acknowledged_by?: string | null;
};

function rowToAlert(r: SosRow): SosAlert {
  return {
    id: r.id,
    createdAt: r.created_at,
    place: { th: r.place_th, en: r.place_en || r.place_th },
    status: r.status,
    name: r.name || undefined,
    outcome: r.outcome ?? undefined,
    acknowledgedAt: r.acknowledged_at ?? undefined,
    acknowledgedBy: r.acknowledged_by ?? undefined,
  };
}

/** ดึงเหตุทั้งหมดที่ผู้ใช้ปัจจุบันมีสิทธิ์เห็น (RLS ตัดสิน ไม่ใช่โค้ดนี้) */
export async function fetchSos(): Promise<SosAlert[] | null> {
  const db = getClient();
  if (!db) return null;
  const { data, error } = await db
    .from("sos_alerts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("[sos] fetch failed:", error.message);
    return null;
  }
  return (data as SosRow[]).map(rowToAlert);
}

export async function insertSos(a: SosAlert): Promise<boolean> {
  const db = getClient();
  if (!db) return false;
  const { data: auth } = await db.auth.getUser();
  const { error } = await db.from("sos_alerts").insert({
    id: a.id,
    reporter: auth.user?.id ?? null,
    created_at: a.createdAt,
    place_th: a.place.th,
    place_en: a.place.en,
    status: a.status,
    name: a.name ?? "",
  });
  if (error) {
    console.warn("[sos] insert failed:", error.message);
    return false;
  }
  return true;
}

export async function patchSos(
  id: string,
  patch: Partial<{
    status: SosStatus;
    outcome: SosOutcome | null;
    place_th: string;
    place_en: string;
    acknowledged_at: string;
    acknowledged_by: string;
  }>,
): Promise<boolean> {
  const db = getClient();
  if (!db) return false;
  const { error } = await db.from("sos_alerts").update(patch).eq("id", id);
  if (error) {
    console.warn("[sos] update failed:", error.message);
    return false;
  }
  return true;
}
