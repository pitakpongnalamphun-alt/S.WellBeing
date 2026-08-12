/**
 * พิสูจน์ว่า RLS กันจริง — ยิงคำสั่งด้วยคีย์สาธารณะแบบ "ยังไม่ล็อกอิน"
 * ทุกอย่างต้องถูกปฏิเสธ ถ้ามีข้อไหนอ่านได้/เขียนได้ = ช่องโหว่
 *
 *   node supabase/verify-rls.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);

const db = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

let failures = 0;
const check = (label, ok, detail = "") => {
  console.log(`${ok ? "  ผ่าน  " : "  ตก    "} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures += 1;
};

console.log("\nตรวจ RLS ในสถานะ 'ยังไม่ล็อกอิน' (ทุกข้อต้องถูกปฏิเสธ)\n");

// ---- อ่านไม่ได้ ----
for (const table of [
  "cases",
  "profiles",
  "anon_reports",
  "audit_log",
  "staff",
  "sos_alerts",
  "appointments",
  "assessment_stats",
  "mood_stats",
  "mood_clouds",
]) {
  const { data, error } = await db.from(table).select("*").limit(1);
  const blocked = error !== null || (Array.isArray(data) && data.length === 0);
  check(`อ่าน ${table} ไม่ได้`, blocked, error ? error.code : `คืน ${data?.length ?? 0} แถว`);
}

// ---- เขียนไม่ได้ ----
{
  const { error } = await db.from("cases").insert({
    id: "SWB-RLSTST",
    category_id: "other",
    category_label: "ทดสอบ",
    expectation: "prepare",
  });
  check("เปิดเคสใหม่ไม่ได้", error !== null, error?.code ?? "เขียนสำเร็จ (อันตราย!)");
}
{
  const { error } = await db.from("anon_reports").insert({
    category_id: "other",
    category_label: "ทดสอบ",
  });
  check("ส่งรายงานนิรนามไม่ได้", error !== null, error?.code ?? "เขียนสำเร็จ (อันตราย!)");
}
{
  const { error } = await db.from("audit_log").insert({
    actor: "attacker",
    action: "view_contact",
    target_type: "เคส",
    target_id: "SWB-XXXXXX",
  });
  check("เขียนบันทึกการเข้าถึงไม่ได้", error !== null, error?.code ?? "เขียนสำเร็จ (อันตราย!)");
}
// DELETE/UPDATE ที่ถูก RLS ปฏิเสธจะ "ไม่ error" แต่กระทบ 0 แถว (ต่างจาก INSERT ที่โยน 42501)
// จึงต้องพ่วง .select() เพื่อนับแถวที่ถูกกระทำจริง — ดูแค่ error จะอ่านผลผิด
{
  const { data, error } = await db.from("audit_log").delete().neq("actor", "").select();
  const n = data?.length ?? 0;
  check("ลบบันทึกการเข้าถึงไม่ได้", error !== null || n === 0, error?.code ?? `ลบไปจริง ${n} แถว`);
}
{
  const { data, error } = await db.from("staff").update({ role: "admin" }).neq("id", "").select();
  const n = data?.length ?? 0;
  check("เลื่อนตัวเองเป็นผู้ดูแลระบบไม่ได้", error !== null || n === 0, error?.code ?? `แก้ไปจริง ${n} แถว`);
}
{
  const { error } = await db.from("sos_alerts").insert({
    id: "sos-rls-attack",
    place_th: "ทดสอบ",
    status: "active",
  });
  check("เปิดเหตุ SOS ปลอมไม่ได้", error !== null, error?.code ?? "เขียนสำเร็จ (อันตราย!)");
}
{
  const { data, error } = await db
    .from("sos_alerts")
    .update({ status: "cancelled" })
    .neq("id", "")
    .select();
  const n = data?.length ?? 0;
  check("ปิดเหตุ SOS ของคนอื่นไม่ได้", error !== null || n === 0, error?.code ?? `แก้ไปจริง ${n} แถว`);
}

{
  const { error } = await db.from("appointments").insert({
    id: "apt-rls-attack",
    code: "APT-XXXX",
    date: "2026-01-01",
    time: "12:15",
    format: "onsite",
  });
  check("จองนัดปลอมไม่ได้", error !== null, error?.code ?? "เขียนสำเร็จ (อันตราย!)");
}
{
  const { data, error } = await db
    .from("appointments")
    .update({ status: "cancelled" })
    .neq("id", "")
    .select();
  const n = data?.length ?? 0;
  check("ยกเลิกนัดของคนอื่นไม่ได้", error !== null || n === 0, error?.code ?? `แก้ไปจริง ${n} แถว`);
}
{
  const { error } = await db.from("profiles").insert({
    user_id: "00000000-0000-0000-0000-000000000001",
    username: "attacker",
    student_id: "99999",
  });
  check("สร้างโปรไฟล์ให้คนอื่นไม่ได้", error !== null, error?.code ?? "เขียนสำเร็จ (อันตราย!)");
}
{
  const { error } = await db.from("assessment_stats").insert({
    id: "as-rls-attack",
    assessment_id: "9Q",
    score: 99,
    action: "emergency",
  });
  check("ยัดสถิติประเมินใจไม่ได้", error !== null, error?.code ?? "เขียนสำเร็จ (อันตราย!)");
}
{
  const { error } = await db.from("mood_clouds").insert({
    id: "cloud-rls-attack",
    month: "2026-08",
    emotion: "โดดเดี่ยว",
    core: "blue",
  });
  check("ปล่อยเมฆปลอมไม่ได้", error !== null, error?.code ?? "เขียนสำเร็จ (อันตราย!)");
}
{
  const { error } = await db.rpc("hug_cloud", { cloud_id: "seed-1" });
  check("เรียก hug_cloud() ไม่ได้", error !== null, error?.code ?? "เรียกสำเร็จ (อันตราย!)");
}
{
  const { data, error } = await db.from("mood_clouds").update({ hugs: 9999 }).neq("id", "").select();
  const n = data?.length ?? 0;
  check("ตั้งจำนวนกอดเองไม่ได้", error !== null || n === 0, error?.code ?? `แก้ไปจริง ${n} แถว`);
}
{
  const { error } = await db.from("mood_stats").insert({
    id: "md-rls-attack",
    core: "red",
    tertiary: "โกรธ",
  });
  check("ยัดสถิติอารมณ์ไม่ได้", error !== null, error?.code ?? "เขียนสำเร็จ (อันตราย!)");
}

// view สาธารณะ: ต้องอ่านได้ "โดยไม่ล็อกอิน" แต่ต้องไม่มีอีเมลติดมาด้วย
{
  const { data, error } = await db.from("staff_public").select("*").limit(50);
  const rows = data ?? [];
  check("อ่านทะเบียนสาธารณะได้ (ตั้งใจให้อ่านได้)", error === null, error?.code ?? `คืน ${rows.length} แถว`);
  const leaked = rows.some((r) => "email" in r);
  check("ทะเบียนสาธารณะไม่มีอีเมลหลุด", !leaked, leaked ? "พบคอลัมน์ email (อันตราย!)" : "ไม่มีคอลัมน์ email");
}
{
  const { data, error } = await db.from("staff_public").update({ name: "hacked" }).neq("id", "").select();
  const n = data?.length ?? 0;
  check("แก้ทะเบียนผ่าน view ไม่ได้", error !== null || n === 0, error?.code ?? `แก้ไปจริง ${n} แถว`);
}

console.log(
  failures === 0
    ? "\nRLS ปิดสนิททุกช่องทาง ✓\n"
    : `\nมี ${failures} ช่องที่ยังเปิดอยู่ — ต้องแก้ก่อนใช้งานจริง\n`,
);
process.exit(failures === 0 ? 0 : 1);
