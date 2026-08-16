import { isOpenStatus, slaState, type SafeCase } from "@/lib/store/useCasesStore";
import { subtopicLabels, subtopicWeight } from "@/data/reportTopics";

/**
 * Rule-based triage score for one case — which open case deserves eyes first.
 * Deliberately NOT an LLM: the incident text is sensitive, identifiable student
 * data and never leaves the device. Every point is a named, explainable factor,
 * so a counsellor can see exactly why a case ranks where it does.
 */

export type TriageBand = "high" | "medium" | "low";

export type Triage = {
  score: number; // 0–100
  band: TriageBand;
  factors: string[];
};

export const TRIAGE_BAND_META: Record<TriageBand, { label: string; tint: string }> = {
  high: { label: "ควรดูก่อน", tint: "bg-rose-50 text-rose-600 ring-rose-200" },
  medium: { label: "รองลงมา", tint: "bg-amber-50 text-amber-700 ring-amber-200" },
  low: { label: "ทั่วไป", tint: "bg-slate-100 text-slate-500 ring-slate-200" },
};

/** Category weights — proximity to safety-of-person first. */
const CATEGORY_WEIGHT: Record<string, number> = {
  harassment: 20,
  unsafe: 15,
  bully: 15,
  // นักเรียนยินยอมส่งผลประเมินใจมาเอง — การขอความช่วยเหลือด้วยตัวเองมีน้ำหนักสูง
  "self-assessment": 12,
  family: 8,
  academic: 5,
  other: 3,
};

export function triageScore(c: SafeCase, now: number): Triage {
  let score = 0;
  const factors: string[] = [];
  const add = (n: number, label: string) => {
    score += n;
    factors.push(`${label} +${n}`);
  };

  if (c.expectation === "urgent") add(40, "นักเรียนขอความช่วยเหลือด่วน");
  if (c.status === "pending" && slaState(c, now).state === "overdue") add(25, "เกิน SLA ยังไม่รับเรื่อง");
  if (c.sensitive) add(15, "เรื่องอ่อนไหว");
  if (isOpenStatus(c.status) && !c.assignedTo) add(10, "ยังไม่มีผู้รับผิดชอบ");
  const catW = CATEGORY_WEIGHT[c.categoryId] ?? 3;
  add(catW, `หมวด: ${c.categoryLabel}`);

  // หัวข้อย่อยที่แตะความปลอดภัยของร่างกาย (ถูกทำร้าย/ข่มขู่/รีดไถ) ต้องดันคิวขึ้น —
  // "โดนล้อ" กับ "โดนดักตี" อยู่ในหมวดกลั่นแกล้งเหมือนกัน แต่รอได้ไม่เท่ากัน
  // ใช้ค่าที่หนักที่สุดข้อเดียว ไม่บวกรวม เลือกหลายข้อไม่ได้แปลว่าเร่งเป็นเท่าตัว
  const subW = subtopicWeight(c.subCategories);
  if (subW > 0) add(subW, `ลักษณะ: ${subtopicLabels(c.subCategories).join(" · ")}`);

  score = Math.min(100, score);
  const band: TriageBand = score >= 70 ? "high" : score >= 40 ? "medium" : "low";
  return { score, band, factors };
}
