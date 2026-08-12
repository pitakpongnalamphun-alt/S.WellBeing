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

/** ทะเบียนฉบับเปิดเผยได้ — ไม่มีอีเมล ใช้โชว์ในหน้าล็อกอินตอนที่ยังไม่ล็อกอิน */
export type PublicStaff = Pick<ServerStaff, "id" | "name" | "role" | "title" | "emoji">;

/**
 * รายชื่อเจ้าหน้าที่สำหรับหน้าล็อกอิน (อ่านได้โดยไม่ต้องล็อกอิน)
 *
 * อ่านจาก view `staff_public` ไม่ใช่ตาราง `staff` — view ฉายเฉพาะ ชื่อ/บทบาท/ตำแหน่ง
 * ส่วนอีเมลซึ่งเป็นกุญแจล็อกอินไม่ถูกฉายออกมา เห็นรายชื่อจึงไม่ได้แปลว่าเข้าระบบได้
 */
export async function fetchPublicRoster(): Promise<PublicStaff[] | null> {
  const db = getClient();
  if (!db) return null;
  const { data, error } = await db.from("staff_public").select("*").order("name");
  if (error) {
    console.warn("[staff] public roster failed:", error.message);
    return null;
  }
  return data as PublicStaff[];
}

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
 * เพิ่ม/แก้ทะเบียนครูบนเซิร์ฟเวอร์ (RLS: เฉพาะผู้ดูแลระบบเท่านั้นที่ผ่าน)
 *
 * ต้องมีอีเมลเสมอ เพราะอีเมลคือกุญแจที่ RLS ใช้ตัดสินสิทธิ์ — บัญชีไม่มีอีเมล
 * เป็นบัญชีสาธิตในเครื่องล้วน ๆ ไม่มีอะไรให้ผูกกับเซิร์ฟเวอร์
 */
export async function upsertStaff(s: ServerStaff): Promise<boolean> {
  const db = getClient();
  if (!db || !s.email) return false;
  const { error } = await db.from("staff").upsert(
    {
      id: s.id,
      email: s.email.trim().toLowerCase(),
      name: s.name,
      role: s.role,
      title: s.title,
      emoji: s.emoji,
      active: s.active,
    },
    { onConflict: "id" },
  );
  if (error) {
    console.warn("[staff] upsert failed:", error.message);
    return false;
  }
  return true;
}

/** ถอนสิทธิ์ออกจากทะเบียนกลาง — เคสที่มอบหมายไว้จะกลายเป็น "ยังไม่มีผู้รับผิดชอบ" (on delete set null) */
export async function deleteStaff(id: string): Promise<boolean> {
  const db = getClient();
  if (!db) return false;
  const { error } = await db.from("staff").delete().eq("id", id);
  if (error) {
    console.warn("[staff] delete failed:", error.message);
    return false;
  }
  return true;
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
