/**
 * Shared shape + seed data for the Cloud Hugs galaxy. Kept apart from the
 * component so both the mood tracker (which *releases* a cloud) and the galaxy
 * (which *shows + hugs* clouds) speak the same language.
 */

/**
 * ครอบคลุมคีย์สีของ EMOTION_WHEEL ครบทั้ง 7 กลุ่ม
 *
 * เดิมมีเพียง 5 สีแล้วฝั่งเรียกใช้ยัดด้วย `as CoreColor` จึงไม่มีใครเห็นว่าเมฆ
 * สีเขียว (ทุกข์) ไม่มีที่อยู่ในจานสี — ทำให้ถ้าปล่อยเมฆนั้นจริงจะไม่มีสีให้วาด
 * ครบทั้ง 7 แล้วไม่ต้องมีการยัดชนิดข้อมูลอีก และไม่มีสีใดหลุดตะแกรงได้
 */
export type CoreColor =
  | "yellow"
  | "purple"
  | "green"
  | "orange"
  | "red"
  | "gray"
  | "blue";

export type MoodCloud = {
  id: string;
  tertiaryEmotion: string;
  coreColor: CoreColor;
  hugsReceived: number;
  /** true for a cloud this student released themselves. */
  mine?: boolean;
};

/** Mirrors the mood tracker's core-emotion palette. */
export const CLOUD_COLORS: Record<CoreColor, { glow: string; text: string }> = {
  blue: { glow: "rgba(96,165,250,0.55)", text: "#bfdbfe" },
  orange: { glow: "rgba(251,146,60,0.55)", text: "#fed7aa" },
  red: { glow: "rgba(248,113,113,0.55)", text: "#fecaca" },
  purple: { glow: "rgba(192,132,252,0.55)", text: "#e9d5ff" },
  gray: { glow: "rgba(203,213,225,0.5)", text: "#e2e8f0" },
  green: { glow: "rgba(52,211,153,0.5)", text: "#a7f3d0" },
  yellow: { glow: "rgba(250,204,21,0.5)", text: "#fef08a" },
};

/**
 * อารมณ์ที่ "หนักพอ" จะเสนอให้ปล่อยเป็นก้อนเมฆ
 *
 * ยึดตามความหมายของอารมณ์ใน EMOTION_WHEEL ไม่ใช่ชื่อสี — ในวงล้อนี้
 * green = ทุกข์ และ purple = ประหลาดใจ ซึ่งตรงข้ามกับที่ชื่อสีชวนให้เข้าใจ
 * (เคยตั้งผิดจนคนที่เลือก "ทุกข์" ไม่เห็นปุ่มปล่อยเมฆเลย ทั้งที่เป็นกลุ่มที่ต้องการที่สุด)
 *
 *   green ทุกข์ · orange กลัว · red โกรธ · gray รังเกียจ · blue เสียใจ
 *   ไม่รวม: yellow สุข (ไม่ใช่ความรู้สึกหนัก) · purple ประหลาดใจ (เป็นกลาง)
 */
export const NEGATIVE_CORES = new Set<string>(["green", "orange", "red", "gray", "blue"]);

export const INITIAL_CLOUDS: MoodCloud[] = [
  { id: "seed-1", tertiaryEmotion: "ถูกทอดทิ้ง", coreColor: "blue", hugsReceived: 4 },
  { id: "seed-2", tertiaryEmotion: "ตกอยู่ในความกลัว", coreColor: "orange", hugsReceived: 12 },
  { id: "seed-3", tertiaryEmotion: "โดดเดี่ยว", coreColor: "blue", hugsReceived: 7 },
  { id: "seed-4", tertiaryEmotion: "โกรธจนตัวสั่น", coreColor: "red", hugsReceived: 2 },
  { id: "seed-5", tertiaryEmotion: "อับอายจนอยากหาย", coreColor: "red", hugsReceived: 9 },
  { id: "seed-6", tertiaryEmotion: "เหนื่อยล้าหมดไฟ", coreColor: "gray", hugsReceived: 15 },
  { id: "seed-7", tertiaryEmotion: "กังวลไปหมดทุกอย่าง", coreColor: "orange", hugsReceived: 5 },
  // "รู้สึกไร้ค่า" อยู่ในกลุ่มทุกข์ (green) ไม่ใช่ประหลาดใจ (purple) ตามวงล้ออารมณ์
  { id: "seed-8", tertiaryEmotion: "รู้สึกไร้ค่า", coreColor: "green", hugsReceived: 3 },
];
