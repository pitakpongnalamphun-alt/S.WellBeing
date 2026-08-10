/**
 * "เพื่อนปุย" (Fluffy Friends) — the 15 gacha characters, the แก๊งผู้พิทักษ์ใจ.
 * Cute, warm, never scary. Rarity only adds a little sparkle of surprise; the
 * pity/shard system (see the store) makes sure a duplicate never feels like a loss.
 */

export type Rarity = "common" | "rare" | "superRare";

export type FluffyFriend = {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  rarity: Rarity;
  /** #15 is the mascot in gold — rendered as a <FluffyBuddy> instead of an emoji. */
  goldenFluffy?: boolean;
};

export const RARITY_META: Record<
  Rarity,
  { label: string; weight: number; text: string; ring: string; chip: string; glow: string; sparkles: number }
> = {
  common: {
    label: "Common",
    weight: 60,
    text: "text-emerald-600",
    ring: "ring-emerald-200",
    chip: "bg-emerald-100 text-emerald-700",
    glow: "rgba(52,211,153,0.35)",
    sparkles: 0,
  },
  rare: {
    label: "Rare",
    weight: 30,
    text: "text-sky-600",
    ring: "ring-sky-200",
    chip: "bg-sky-100 text-sky-700",
    glow: "rgba(56,189,248,0.45)",
    sparkles: 4,
  },
  superRare: {
    label: "Super Rare",
    weight: 10,
    text: "text-amber-600",
    ring: "ring-amber-200",
    chip: "bg-amber-100 text-amber-700",
    glow: "rgba(251,191,36,0.6)",
    sparkles: 8,
  },
};

export const FLUFFY_FRIENDS: FluffyFriend[] = [
  // 🟢 Common (60%) — everyday comfort
  { id: "bear", name: "น้องหมีง่วง", emoji: "🐻", desc: "กอดหมอนเน่าเสมอ — ตัวแทนของการพักผ่อน", rarity: "common" },
  { id: "rabbit", name: "น้องกระต่ายนักฟัง", emoji: "🐰", desc: "หูยาวเป็นพิเศษ — ตัวแทนของการรับฟัง", rarity: "common" },
  { id: "cat", name: "น้องแมวกล่อง", emoji: "🐱", desc: "ชอบซ่อนในกล่อง — ตัวแทนของพื้นที่ปลอดภัย", rarity: "common" },
  { id: "dog", name: "น้องหมาใจดี", emoji: "🐶", desc: "ยิ้มแฉ่งตลอดเวลา — ตัวแทนของพลังบวก", rarity: "common" },
  { id: "sloth", name: "น้องสลอธชิล ๆ", emoji: "🦥", desc: "เคลื่อนไหวช้า ๆ — ตัวแทนของการไม่เร่งรีบ", rarity: "common" },
  { id: "owl", name: "น้องนกฮูกนักปราชญ์", emoji: "🦉", desc: "ใส่แว่นหนาเตอะ — ตัวแทนของสติปัญญา", rarity: "common" },

  // 🔵 Rare (30%) — a little imagination
  { id: "cloud", name: "น้องก้อนเมฆนุ่มนิ่ม", emoji: "☁️", desc: "ลอยไปมา เปลี่ยนสีตามเวลา", rarity: "rare" },
  { id: "star", name: "น้องดาวตกขอพร", emoji: "🌠", desc: "มีหางเป็นประกายวิบวับ", rarity: "rare" },
  { id: "sprout", name: "น้องต้นอ่อนนักสู้", emoji: "🌱", desc: "ต้นไม้เล็ก ๆ ในกระถาง — ตัวแทนของการเติบโต", rarity: "rare" },
  { id: "fox", name: "น้องจิ้งจอกสายรุ้ง", emoji: "🦊", desc: "หางฟูเป็นสีพาสเทล", rarity: "rare" },
  { id: "butterfly", name: "น้องผีเสื้อนักเดินทาง", emoji: "🦋", desc: "ปีกโปร่งแสงระยิบระยับ", rarity: "rare" },

  // 🟡 Super Rare (10%) — peak heart-power
  { id: "whale", name: "วาฬสีน้ำเงินท่องนภา", emoji: "🐋", desc: "ลอยบนฟ้า พ่นน้ำเป็นละอองดาว", rarity: "superRare" },
  { id: "dragon", name: "มังกรขนปุย", emoji: "🐉", desc: "มังกรอ้วนกลม พ่นไฟเป็นรูปหัวใจ", rarity: "superRare" },
  { id: "unicorn", name: "ยูนิคอร์นแห่งความฝัน", emoji: "🦄", desc: "มีออร่าสีรุ้งรอบตัว", rarity: "superRare" },
  { id: "golden-fluffy", name: "น้องปุยร่างทองคำ", emoji: "✨", desc: "มาสคอตหลักเวอร์ชันพิเศษที่ส่องแสงได้", rarity: "superRare", goldenFluffy: true },
];

export const FRIEND_BY_ID: Record<string, FluffyFriend> = Object.fromEntries(
  FLUFFY_FRIENDS.map((f) => [f.id, f]),
);

/** Shards handed back for a duplicate, by rarity — the higher the rarity, the more. */
export const DUPLICATE_SHARDS: Record<Rarity, number> = {
  common: 5,
  rare: 15,
  superRare: 40,
};

/** The golden mascot renders as a real FluffyBuddy — these are its recolour props. */
export const GOLDEN_FLUFFY = {
  gradient: "linear-gradient(to bottom right, #fef3c7, #fcd34d, #f59e0b)",
  ink: "#78350f",
  glow: "rgba(251,191,36,0.7)",
};
