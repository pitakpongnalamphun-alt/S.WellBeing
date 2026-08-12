import { getClient } from "@/lib/supabase/client";
import type {
  Appointment,
  AppointmentFormat,
  AppointmentStatus,
} from "@/lib/store/useAppointmentStore";

/**
 * ชั้นแปลงข้อมูลนัดพูดคุยระหว่าง Supabase (snake_case) กับแอป (camelCase) —
 * แบบแผนเดียวกับ casesRepo/sosRepo: คืน null/false เมื่อฐานข้อมูลยังไม่พร้อม
 * เพื่อให้ store ถอยไปทำงานแบบเก็บในเครื่องได้เสมอ
 *
 * ก่อนมีไฟล์นี้ นัดที่นักเรียนจองอยู่แค่ใน localStorage ของเครื่องตัวเอง —
 * ครูที่เปิดแดชบอร์ดคนละเครื่องจึงไม่เห็นคิวของตัวเองเลยแม้แต่รายการเดียว
 */

type AppointmentRow = {
  id: string;
  code: string;
  counselor_id: string;
  date: string;
  time: string;
  format: AppointmentFormat;
  topic: string;
  name: string;
  room: string;
  status: AppointmentStatus;
  created_at: string;
};

function rowToAppointment(r: AppointmentRow): Appointment {
  return {
    id: r.id,
    code: r.code,
    counselorId: r.counselor_id,
    date: r.date,
    time: r.time,
    format: r.format,
    topic: r.topic ?? "",
    name: r.name ?? "",
    room: r.room ?? "",
    status: r.status,
    // เก็บเป็นวันตามปฏิทินท้องถิ่นเหมือนที่ store ใช้ (created_at เป็น timestamptz เต็ม)
    createdAt: (r.created_at ?? "").slice(0, 10),
  };
}

/** นัดทั้งหมดที่ผู้ใช้ปัจจุบันมีสิทธิ์เห็น (RLS ตัดสิน: ของตัวเอง หรือทุกใบถ้าเป็นครู) */
export async function fetchAppointments(): Promise<Appointment[] | null> {
  const db = getClient();
  if (!db) return null;
  const { data, error } = await db
    .from("appointments")
    .select("*")
    .order("date", { ascending: false });
  if (error) {
    console.warn("[appointments] fetch failed:", error.message);
    return null;
  }
  return (data as AppointmentRow[]).map(rowToAppointment);
}

export async function insertAppointment(a: Appointment): Promise<boolean> {
  const db = getClient();
  if (!db) return false;
  const { data: auth } = await db.auth.getUser();
  const { error } = await db.from("appointments").insert({
    id: a.id,
    reporter: auth.user?.id ?? null,
    code: a.code,
    counselor_id: a.counselorId,
    date: a.date,
    time: a.time,
    format: a.format,
    topic: a.topic,
    name: a.name,
    room: a.room,
    status: a.status,
  });
  if (error) {
    console.warn("[appointments] insert failed:", error.message);
    return false;
  }
  return true;
}

export async function patchAppointment(
  id: string,
  patch: Partial<{
    status: AppointmentStatus;
    date: string;
    time: string;
  }>,
): Promise<boolean> {
  const db = getClient();
  if (!db) return false;
  const { error } = await db.from("appointments").update(patch).eq("id", id);
  if (error) {
    console.warn("[appointments] update failed:", error.message);
    return false;
  }
  return true;
}
