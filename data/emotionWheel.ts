/**
 * The shared 3-layer emotion wheel (Plutchik / Junto-style, teen-friendly wording):
 * 7 core colours → secondary feelings → their tertiary "root" feelings.
 * Both the daily mood pet and the monthly sticker book read from this one source.
 */

import type { FluffyExpression } from "@/components/FluffyBuddy";

export type CoreKey = "yellow" | "purple" | "green" | "orange" | "red" | "gray" | "blue";

export type SecondaryEmotion = {
  label: string;
  /** One or two tertiary (root) feelings under this secondary. */
  tertiaries: string[];
};

export type CoreEmotion = {
  key: CoreKey;
  /** Thai name of the core feeling, e.g. "สุข". */
  label: string;
  emoji: string;
  /** Solid swatch for the round color button / calendar sticker. */
  swatch: string;
  /** Soft tint for card backgrounds. */
  soft: string;
  /** Recolour props passed straight to <FluffyBuddy />. */
  gradient: string;
  ink: string;
  glow: string;
  /** The buddy's facial expression for this core feeling. */
  face: FluffyExpression;
  secondaries: SecondaryEmotion[];
};

export const EMOTION_WHEEL: CoreEmotion[] = [
  {
    key: "yellow",
    label: "สุข",
    emoji: "💛",
    swatch: "#fcd34d",
    soft: "#fffbeb",
    gradient: "linear-gradient(to bottom right, #fde68a, #fcd34d, #fde047)",
    ink: "#78350f",
    glow: "rgba(251,191,36,0.42)",
    face: "happy",
    secondaries: [
      { label: "มองโลกในแง่ดี", tertiaries: ["แรงบันดาลใจ", "มีความหวัง"] },
      { label: "เชื่อใจ", tertiaries: ["ใกล้ชิด/สนิทสนม", "อ่อนไหว/อ่อนโยน"] },
      { label: "สงบ", tertiaries: ["ขอบคุณ", "รู้สึกรัก"] },
      { label: "มีพลัง", tertiaries: ["สร้างสรรค์", "กล้าหาญ"] },
      { label: "ถูกยอมรับ", tertiaries: ["มีคุณค่า", "นับถือ/เคารพ"] },
      { label: "ภูมิใจ", tertiaries: ["มีความมั่นใจ", "รู้สึกสำเร็จ/ชนะ"] },
      { label: "สนใจ", tertiaries: ["สอดรู้สอดเห็น", "อยากรู้อยากเห็น"] },
      { label: "พอใจ", tertiaries: ["ปลื้มปิติ", "เป็นอิสระ"] },
      { label: "สนุกสนาน", tertiaries: ["ทะลึ่ง/ทะเล้น", "มีแรงกระตุ้น"] },
    ],
  },
  {
    key: "purple",
    label: "ประหลาดใจ",
    emoji: "💜",
    swatch: "#c4b5fd",
    soft: "#f5f3ff",
    gradient: "linear-gradient(to bottom right, #ddd6fe, #c4b5fd, #d8b4fe)",
    ink: "#4c1d95",
    glow: "rgba(167,139,250,0.42)",
    face: "surprised",
    secondaries: [
      { label: "ตื่นเต้น", tertiaries: ["เปี่ยมพลัง", "กระตือรือร้น"] },
      { label: "ตะลึง", tertiaries: ["เกรง", "อัศจรรย์"] },
      { label: "สับสน", tertiaries: ["งงงวย/หลง", "ท้อแท้/ท้อถอย"] },
      { label: "ตกใจ", tertiaries: ["ใจหาย", "ตะลึงพรึงเพริด/ชะงัก"] },
    ],
  },
  {
    key: "green",
    label: "ทุกข์",
    emoji: "💚",
    swatch: "#6ee7b7",
    soft: "#ecfdf5",
    gradient: "linear-gradient(to bottom right, #a7f3d0, #6ee7b7, #5eead4)",
    ink: "#065f46",
    glow: "rgba(52,211,153,0.42)",
    face: "weary",
    secondaries: [
      { label: "เหนื่อยล้า", tertiaries: ["ควบคุมไม่ได้", "ถูกครอบงำ/จมอยู่กับปัญหา/ตกอยู่ในสภาวะที่รับไม่ไหว (ท่วมท้น)"] },
      { label: "เครียด", tertiaries: ["รีบร้อน", "กดดัน"] },
      { label: "เบื่อหน่าย", tertiaries: ["ไม่แยแส", "เฉยเมย"] },
    ],
  },
  {
    key: "orange",
    label: "กลัว",
    emoji: "🧡",
    swatch: "#fdba74",
    soft: "#fff7ed",
    gradient: "linear-gradient(to bottom right, #fed7aa, #fdba74, #fcd34d)",
    ink: "#7c2d12",
    glow: "rgba(251,146,60,0.42)",
    face: "fearful",
    secondaries: [
      { label: "ใจฝ่อ/ใจเสีย", tertiaries: ["ลนลาน/ทำอะไรไม่ถูก", "สยอง/เสียขวัญ"] },
      { label: "กังวล", tertiaries: ["ถูกครอบงำ/จมอยู่กับความกังวล/ตกอยู่ในความกลัว (ท่วมท้น)", "ระทมทุกข์/วิตกจริต"] },
      { label: "ไม่ปลอดภัย", tertiaries: ["ขาดแคลน/ไม่ดีพอ", "ด้อยค่า/มีปม"] },
      { label: "อ่อนแอ", tertiaries: ["ไร้ค่า/ไร้ประโยชน์", "ไม่มีความหมาย/ไม่สำคัญ"] },
      { label: "ถูกปฏิเสธ", tertiaries: ["กันออก/กีดกัน", "ถูกข่มเหง/ถูกแกล้ง"] },
      { label: "ถูกคุกคาม", tertiaries: ["กระสับกระส่าย/ร้อนรน", "เลิกลั่ก/ไม่มั่นคง"] },
    ],
  },
  {
    key: "red",
    label: "โกรธ",
    emoji: "❤️",
    swatch: "#fca5a5",
    soft: "#fef2f2",
    gradient: "linear-gradient(to bottom right, #fecaca, #fca5a5, #fda4af)",
    ink: "#7f1d1d",
    glow: "rgba(248,113,113,0.42)",
    face: "angry",
    secondaries: [
      { label: "หมดศรัทธา/ผิดหวัง", tertiaries: ["รู้สึกถูกทรยศ", "ไม่พึงพอใจผล"] },
      { label: "ขายหน้า", tertiaries: ["ถูกหมิ่น/ไม่ให้เกียรติ", "รู้สึกเป็นตัวตลก"] },
      { label: "ขมขื่น", tertiaries: ["ขุ่นเคือง/ไม่พอใจ", "ขัดขืน/ฝ่าฝืน"] },
      { label: "เดือดดาล", tertiaries: ["โกรธแค้น/เกรี้ยวกราด", "ริษยา/อาฆาต"] },
      { label: "ก้าวร้าว", tertiaries: ["รู้สึกถูกยั่วยุ/ถูกปลุกปั่น", "มุ่งร้าย/เป็นศัตรู"] },
      { label: "ข้องใจ", tertiaries: ["โมโห", "หงุดหงิด/รำคาญใจ"] },
      { label: "หนีหน้า/สร้างระยะ", tertiaries: ["เก็บตัว/ถอนตัว", "เฉยชา"] },
      { label: "วิพากษ์/จับผิด", tertiaries: ["ระแวง/กังขา", "ไม่ให้ราคา/เมิน"] },
    ],
  },
  {
    key: "gray",
    label: "รังเกียจ",
    emoji: "🤍",
    swatch: "#cbd5e1",
    soft: "#f8fafc",
    gradient: "linear-gradient(to bottom right, #e2e8f0, #cbd5e1, #d1d5db)",
    ink: "#334155",
    glow: "rgba(148,163,184,0.42)",
    face: "disgusted",
    secondaries: [
      { label: "ไม่ยอมรับ", tertiaries: ["ตัดสิน", "อับอาย/เก้อเขิน"] },
      { label: "ผิดหวัง/พลาดหวัง", tertiaries: ["ขยะแขยง/คลื่นไส้", "ต่อต้าน"] },
      { label: "น่ากลัว", tertiaries: ["รังเกียจเดียดฉันท์", "หวาดผวา"] },
      { label: "ผลักไส", tertiaries: ["ลังเล/อึกอัก"] },
    ],
  },
  {
    key: "blue",
    label: "เสียใจ",
    emoji: "💙",
    swatch: "#7dd3fc",
    soft: "#f0f9ff",
    gradient: "linear-gradient(to bottom right, #bae6fd, #7dd3fc, #93c5fd)",
    ink: "#0c4a6e",
    glow: "rgba(56,189,248,0.42)",
    face: "sad",
    secondaries: [
      { label: "เจ็บใจ/ชอกช้ำ", tertiaries: ["ผิดหวัง/พลาดหวัง", "อับอาย/เก้อเขิน"] },
      { label: "ซึมเศร้า", tertiaries: ["ว่างเปล่า", "ด้อยค่า/มีปม"] },
      { label: "รู้สึกผิด", tertiaries: ["สำนึกผิด/ผิดบาป", "ละอายใจ"] },
      { label: "สิ้นหวัง", tertiaries: ["หมดแรง", "โศกศัลย์/อาลัย"] },
      { label: "อ่อนแอ", tertiaries: ["แตกสลาย/บอบบาง", "ตกเป็นเหยื่อ/ถูกกระทำ"] },
      { label: "เหงา", tertiaries: ["ถูกทอดทิ้ง", "โดดเดี่ยว/แปลกแยก"] },
    ],
  },
];

/** Quick lookup by core key. */
export const CORE_BY_KEY: Record<CoreKey, CoreEmotion> = Object.fromEntries(
  EMOTION_WHEEL.map((c) => [c.key, c]),
) as Record<CoreKey, CoreEmotion>;
