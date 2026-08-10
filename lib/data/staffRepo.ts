import { getClient } from "@/lib/supabase/client";
import type { StaffRole } from "@/data/staff";

/**
 * ทะเบียนเจ้าหน้าที่ฝั่งเซิร์ฟเวอร์ — ตัวตนของครูผูกกับ "อีเมล Google" ไม่ใช่รหัสผ่าน
 * ที่เก็บไว้ในเครื่องอีกต่อไป กฎ RLS ทุกข้อในฐานข้อมูลตัดสินจากอีเมลนี้
 */

export type ServerStaff = {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  title: string;
  emoji: string;
  active: boolean;
};

/** ทะเบียนครูทั้งหมด (ต้องล็อกอินก่อน ตาม RLS) */
export async function fetchStaffRoster(): Promise<ServerStaff[] | null> {
  const db = getClient();
  if (!db) return null;
  const { data, error } = await db.from("staff").select("*").order("name");
  if (error) {
    console.warn("[staff] fetch failed:", error.message);
    return null;
  }
  return data as ServerStaff[];
}

/**
 * หาว่าอีเมลที่เพิ่งล็อกอินเป็นเจ้าหน้าที่คนไหน
 * คืน null = ล็อกอิน Google สำเร็จ แต่ยังไม่ได้รับสิทธิ์เจ้าหน้าที่
 */
export async function findStaffByEmail(email: string): Promise<ServerStaff | null> {
  const db = getClient();
  if (!db) return null;
  const { data, error } = await db
    .from("staff")
    .select("*")
    .ilike("email", email)
    .eq("active", true)
    .maybeSingle();
  if (error) {
    console.warn("[staff] lookup failed:", error.message);
    return null;
  }
  return (data as ServerStaff | null) ?? null;
}
