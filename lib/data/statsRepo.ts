import { getClient } from "@/lib/supabase/client";
import type { AssessAction, AssessRecord } from "@/lib/store/useAssessmentStore";
import type { MoodRecord } from "@/lib/store/useMoodStatsStore";

/**
 * สถิตินิรนามสองชุด: ผลประเมินใจ และอารมณ์ประจำวัน
 *
 * ทิศทางข้อมูลเป็น "ทางเดียว" โดยตั้งใจ — เครื่องนักเรียนส่งขึ้นอย่างเดียว
 * (ไม่มีสิทธิ์อ่านกลับตาม RLS) ส่วนแดชบอร์ดครูดึงลงมาแสดงผลรวม ตารางปลายทาง
 * ไม่มีคอลัมน์ผู้ส่ง จึงไม่มีอะไรให้สาวกลับว่าใครทำแบบประเมินหรือใครรู้สึกอะไร
 */

type AssessRow = {
  id: string;
  at: string;
  assessment_id: string;
  score: number;
  action: AssessAction;
};

type MoodRow = {
  id: string;
  at: string;
  core: string;
  tertiary: string;
};

/* ---------------------------------------------------------- ผลประเมินใจ */

export async function fetchAssessStats(): Promise<AssessRecord[] | null> {
  const db = getClient();
  if (!db) return null;
  const { data, error } = await db
    .from("assessment_stats")
    .select("*")
    .order("at", { ascending: false });
  if (error) {
    console.warn("[assess-stats] fetch failed:", error.message);
    return null;
  }
  return (data as AssessRow[]).map((r) => ({
    id: r.id,
    at: r.at,
    assessmentId: r.assessment_id,
    score: r.score,
    action: r.action,
  }));
}

export async function insertAssessStat(r: AssessRecord): Promise<boolean> {
  const db = getClient();
  if (!db) return false;
  const { error } = await db.from("assessment_stats").insert({
    id: r.id,
    at: r.at,
    assessment_id: r.assessmentId,
    score: r.score,
    action: r.action,
  });
  if (error) {
    console.warn("[assess-stats] insert failed:", error.message);
    return false;
  }
  return true;
}

/* ------------------------------------------------------ อารมณ์ประจำวัน */

export async function fetchMoodStats(): Promise<MoodRecord[] | null> {
  const db = getClient();
  if (!db) return null;
  const { data, error } = await db
    .from("mood_stats")
    .select("*")
    .order("at", { ascending: false });
  if (error) {
    console.warn("[mood-stats] fetch failed:", error.message);
    return null;
  }
  return (data as MoodRow[]).map((r) => ({
    id: r.id,
    at: r.at,
    core: r.core,
    tertiary: r.tertiary,
  }));
}

export async function insertMoodStat(r: MoodRecord): Promise<boolean> {
  const db = getClient();
  if (!db) return false;
  const { error } = await db.from("mood_stats").insert({
    id: r.id,
    at: r.at,
    core: r.core,
    tertiary: r.tertiary,
  });
  if (error) {
    console.warn("[mood-stats] insert failed:", error.message);
    return false;
  }
  return true;
}
