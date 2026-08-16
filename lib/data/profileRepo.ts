import { getClient } from "@/lib/supabase/client";
import type { SchoolProfile } from "@/lib/store/useUserStore";

/**
 * โปรไฟล์นักเรียนฝั่งเซิร์ฟเวอร์ — สะพานเชื่อม "บัญชี Google" กับ "ข้อมูลโรงเรียน"
 *
 * RLS ของตาราง profiles คือ `user_id = auth.uid()` ล้วน ๆ: เจ้าของเท่านั้นที่อ่าน
 * และเขียนแถวตัวเองได้ ครูและผู้ดูแลระบบไม่มี policy ให้อ่านเลยแม้แต่แถวเดียว
 * (ชื่อที่ครูเห็นมาจากสิ่งที่นักเรียนกรอกในใบแจ้งเหตุ/ใบนัด ไม่ใช่จากตารางนี้)
 *
 * ประโยชน์: นักเรียนที่เปลี่ยนเครื่องหรือล้างเบราว์เซอร์ไม่ต้องกรอกชื่อ-รหัสใหม่
 * และรหัสนักเรียนที่เก็บไว้คือกุญแจให้ใบนัดที่ครูสร้างให้ เดินทางกลับไปถึงเจ้าตัวได้
 */

type ProfileRow = {
  user_id: string;
  username: string;
  student_id: string;
};

/** โปรไฟล์ของคนที่ล็อกอินอยู่ (null = ยังไม่ได้ล็อกอิน / ยังไม่เคยบันทึก / ต่อไม่ติด) */
export async function fetchMyProfile(): Promise<SchoolProfile | null> {
  const db = getClient();
  if (!db) return null;
  const { data: auth } = await db.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return null;
  const { data, error } = await db
    .from("profiles")
    .select("*")
    .eq("user_id", uid)
    .maybeSingle();
  if (error) {
    console.warn("[profile] fetch failed:", error.message);
    return null;
  }
  const row = data as ProfileRow | null;
  if (!row) return null;
  return { username: row.username ?? "", studentId: row.student_id ?? "" };
}

/**
 * ลบแถวโปรไฟล์ของตัวเองออกจากเซิร์ฟเวอร์ — ใช้ตอนถอนความยินยอม
 *
 * ต้องมีจริง ไม่ใช่แค่ลบในเครื่องแล้วบอกว่าลบแล้ว ถ้าแถวยังอยู่บนเซิร์ฟเวอร์ หน้าจอ
 * ที่บอกว่า "ลบชื่อและรหัสนักเรียนแล้ว" ก็เป็นคำโกหก และคนที่ล็อกอินกลับเข้ามาใหม่
 * จะเจอ syncFromServer ดึงชื่อเดิมกลับมาให้เอง ทั้งที่เพิ่งกดลบไป
 *
 * คืน false เมื่อยังไม่ได้ต่อฐานข้อมูลหรือลบไม่สำเร็จ — ผู้เรียกต้องบอกผู้ใช้ตามจริง
 */
export async function deleteMyProfile(): Promise<boolean> {
  const db = getClient();
  if (!db) return false;
  const { data: auth } = await db.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return false;
  const { error } = await db.from("profiles").delete().eq("user_id", uid);
  if (error) {
    console.warn("[profile] delete failed:", error.message);
    return false;
  }
  return true;
}

export async function upsertMyProfile(p: SchoolProfile): Promise<boolean> {
  const db = getClient();
  if (!db) return false;
  const { data: auth } = await db.auth.getUser();
  const uid = auth.user?.id;
  // ยังไม่ล็อกอิน = ไม่มีแถวให้เขียน (RLS จะปฏิเสธอยู่ดี) — เงียบ ๆ แล้วใช้ในเครื่องต่อ
  if (!uid) return false;
  const { error } = await db.from("profiles").upsert(
    {
      user_id: uid,
      username: p.username,
      student_id: p.studentId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) {
    console.warn("[profile] upsert failed:", error.message);
    return false;
  }
  return true;
}
