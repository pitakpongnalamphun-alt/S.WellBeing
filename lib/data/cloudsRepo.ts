import { getClient } from "@/lib/supabase/client";
import type { CoreColor, MoodCloud } from "@/data/cloudHugs";

/**
 * กาแล็กซีแห่งการโอบกอดฝั่งเซิร์ฟเวอร์ — จุดเดียวในแอปที่นักเรียน "เห็นข้อมูลของ
 * นักเรียนคนอื่น" ได้ จึงจงใจให้เห็นได้แค่สองอย่างเท่านั้น: คำความรู้สึกจากวงล้อ
 * (ไม่ใช่ข้อความอิสระ จึงไม่มีทางมีชื่อคนหรือคำหยาบ) กับจำนวนกอด
 *
 * ตารางไม่มีคอลัมน์ผู้ส่งเลย ความนิรนามจึงมาจากโครงสร้าง ไม่ใช่สัญญาว่าจะไม่ดู
 * ส่วน "เมฆของฉัน" เก็บ id ไว้ในเครื่องของเจ้าตัวเอง เซิร์ฟเวอร์ไม่รู้ว่าใครปล่อยก้อนไหน
 */

type CloudRow = {
  id: string;
  month: string;
  emotion: string;
  core: CoreColor;
  hugs: number;
};

/** เมฆทั้งหมดของเดือนนั้น ใหม่สุดก่อน (mine เติมทีหลังจากรายการในเครื่อง) */
export async function fetchClouds(month: string): Promise<MoodCloud[] | null> {
  const db = getClient();
  if (!db) return null;
  const { data, error } = await db
    .from("mood_clouds")
    .select("*")
    .eq("month", month)
    .order("created_at", { ascending: false })
    .limit(200); // เพดานกันจอแตกตอนทั้งโรงเรียนปล่อยกันทั้งเดือน
  if (error) {
    console.warn("[clouds] fetch failed:", error.message);
    return null;
  }
  return (data as CloudRow[]).map((r) => ({
    id: r.id,
    tertiaryEmotion: r.emotion,
    coreColor: r.core,
    hugsReceived: r.hugs,
  }));
}

export async function insertCloud(cloud: MoodCloud, month: string): Promise<boolean> {
  const db = getClient();
  if (!db) return false;
  const { error } = await db.from("mood_clouds").insert({
    id: cloud.id,
    month,
    emotion: cloud.tertiaryEmotion,
    core: cloud.coreColor,
  });
  if (error) {
    console.warn("[clouds] insert failed:", error.message);
    return false;
  }
  return true;
}

/**
 * ส่งกอด — ผ่านฟังก์ชัน hug_cloud() เท่านั้น ไม่ได้ UPDATE ตรง ๆ
 * (ตารางไม่มี policy สำหรับ update ฝั่งแอปจึงตั้งจำนวนกอดเองไม่ได้)
 */
export async function hugCloud(id: string): Promise<boolean> {
  const db = getClient();
  if (!db) return false;
  const { error } = await db.rpc("hug_cloud", { cloud_id: id });
  if (error) {
    console.warn("[clouds] hug failed:", error.message);
    return false;
  }
  return true;
}
