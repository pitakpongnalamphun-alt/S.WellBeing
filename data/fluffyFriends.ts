/**
 * "เพื่อนปุย" (Fluffy Friends) — the 15 gacha characters, the แก๊งผู้พิทักษ์ใจ.
 * Cute, warm, never scary. Rarity only adds a little sparkle of surprise; the
 * pity/shard system (see the store) makes sure a duplicate never feels like a loss.
 */

export type Rarity = "common" | "rare" | "superRare";

/**
 * จุดวางของตกแต่งบนตัวละคร หน่วยเดียวกับ viewBox ของสไปรต์ (0–100)
 *
 * ก่อนหน้านี้ทุกตัวใช้ตำแหน่งชุดเดียวกันหมด ซึ่งตั้งมาจากตัวกลม ๆ อย่างน้องหมี พอเอา
 * ไปใส่ยูนิคอร์นที่มีเขา มังกรที่หัวอยู่สูงกว่า หรือวาฬที่เป็นภาพด้านข้างตาเดียว หมวก
 * กับแว่นก็ไปผิดที่หมด
 *
 * ค่า face มาจากพิกัดตาจริงในไฟล์สไปรต์ (อ่านจากซอร์สโดยตรง ไม่ได้กะเอา)
 * ส่วน hat/hold คำนวณจากตำแหน่งตาแล้วปรับรายตัวสำหรับตัวที่รูปทรงไม่เหมือนใคร
 */
export type DecoAnchor = {
  /** จุดกึ่งกลางของชิ้นส่วน (x, y) ในพิกัด 0–100 */
  at: [number, number];
  /** ขนาดเทียบกับความกว้างตัวละคร (1 = เต็มความกว้าง) */
  scale?: number;
};

export type FriendAnchors = {
  hat: DecoAnchor;
  face: DecoAnchor;
  hold: DecoAnchor;
};

export type FluffyFriend = {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  rarity: Rarity;
  /** #15 is the mascot's golden form — the crown jewel of the collection. */
  goldenFluffy?: boolean;
  anchors?: FriendAnchors;
};

/**
 * น้องปุยในห้องแชท — แต่งตัวได้เหมือนเพื่อนตัวอื่น แต่ไม่ได้อยู่ในกาชา
 *
 * จงใจไม่ใส่ไว้ใน FLUFFY_FRIENDS เพราะนั่นคือพูลของกาชา (ตัวนับ x/15 อัตราออก
 * และระบบเศษดาวอ้างอิงจากรายการนั้น) และที่สำคัญกว่านั้นคือ ปุยต้องแต่งได้ตั้งแต่
 * วันแรกโดยไม่ต้องสุ่มให้ได้ก่อน — ตัวที่นักเรียนคุยด้วยทุกวันไม่ควรถูกล็อกไว้หลัง
 * การสุ่ม 10%
 */
export const PUY_FRIEND: FluffyFriend = {
  id: "puy",
  name: "น้องอุ่น",
  emoji: "🩷",
  desc: "น้องอุ่น เพื่อนที่คุยด้วยในห้องแชท — แต่งตัวให้ได้เลย ไม่ต้องสุ่ม",
  rarity: "common",
};

/** ใช้เมื่อยังไม่ได้ตั้งค่าให้ตัวนั้น — ตำแหน่งกลาง ๆ ของตัวกลมทั่วไป */
export const DEFAULT_ANCHORS: FriendAnchors = {
  hat: { at: [50, 16], scale: 0.42 },
  face: { at: [50, 38], scale: 0.34 },
  hold: { at: [74, 76], scale: 0.32 },
};

/**
 * ตารางจุดยึดรายตัว — แก้ที่นี่ที่เดียวเมื่ออยากขยับของตกแต่งให้เข้าที่ขึ้น
 *
 * y ของ face = พิกัดตาที่ดึงมาจาก FriendSprite.tsx ตรง ๆ
 * y ของ hat  = เหนือตาขึ้นไปประมาณหนึ่งรัศมีหัว ยกเว้นตัวที่มีเขา/ใบไม้/ปีกบังอยู่
 */
export const FRIEND_ANCHORS: Record<string, FriendAnchors> = {
  bear: { hat: { at: [50, 14], scale: 0.44 }, face: { at: [50, 35.4], scale: 0.36 }, hold: { at: [74, 76], scale: 0.32 } },
  rabbit: { hat: { at: [50, 26], scale: 0.4 }, face: { at: [50, 45], scale: 0.36 }, hold: { at: [74, 78], scale: 0.32 } },
  cat: { hat: { at: [50, 15], scale: 0.42 }, face: { at: [50, 35], scale: 0.36 }, hold: { at: [74, 74], scale: 0.32 } },
  dog: { hat: { at: [50, 18], scale: 0.42 }, face: { at: [50, 38.5], scale: 0.36 }, hold: { at: [75, 76], scale: 0.32 } },
  sloth: { hat: { at: [50, 31], scale: 0.4 }, face: { at: [50, 51], scale: 0.34 }, hold: { at: [74, 80], scale: 0.3 } },
  owl: { hat: { at: [50, 22], scale: 0.42 }, face: { at: [50, 43], scale: 0.4 }, hold: { at: [74, 78], scale: 0.3 } },
  // ก้อนเมฆไม่มีหัวชัด ๆ — วางหมวกบนสันบนของก้อน
  cloud: { hat: { at: [50, 34], scale: 0.38 }, face: { at: [50, 56.5], scale: 0.34 }, hold: { at: [76, 72], scale: 0.28 } },
  // ดาวหันหน้าเอียงไปทางขวา จุดกึ่งกลางใบหน้าจึงไม่ใช่ 50
  star: { hat: { at: [56, 22], scale: 0.36 }, face: { at: [56, 43], scale: 0.32 }, hold: { at: [76, 74], scale: 0.28 } },
  // ต้นอ่อนมีใบอยู่บนสุด หมวกจึงไปเกาะที่ใบ ไม่ใช่ที่หน้าในกระถาง
  sprout: { hat: { at: [50, 24], scale: 0.36 }, face: { at: [50, 70.5], scale: 0.3 }, hold: { at: [76, 82], scale: 0.28 } },
  fox: { hat: { at: [50, 12], scale: 0.42 }, face: { at: [50, 32.5], scale: 0.36 }, hold: { at: [75, 74], scale: 0.32 } },
  butterfly: { hat: { at: [50, 14], scale: 0.36 }, face: { at: [50, 33], scale: 0.3 }, hold: { at: [74, 70], scale: 0.28 } },
  // วาฬเป็นภาพด้านข้าง มีตาข้างเดียวอยู่ค่อนไปทางซ้าย
  whale: { hat: { at: [36, 28], scale: 0.36 }, face: { at: [31.5, 49.5], scale: 0.3 }, hold: { at: [74, 74], scale: 0.28 } },
  dragon: { hat: { at: [50, 9], scale: 0.4 }, face: { at: [50, 28.5], scale: 0.34 }, hold: { at: [76, 72], scale: 0.3 } },
  // ยูนิคอร์นมีเขาตรงกลาง หมวกจึงเลื่อนลงมาเกาะที่หน้าผาก/แผงคอ
  unicorn: { hat: { at: [50, 25], scale: 0.38 }, face: { at: [50, 40.5], scale: 0.36 }, hold: { at: [75, 76], scale: 0.3 } },
  "golden-fluffy": { hat: { at: [50, 33], scale: 0.42 }, face: { at: [50, 53], scale: 0.36 }, hold: { at: [76, 80], scale: 0.32 } },
  // ปุยมีกรอบ 200×214 — ค่าที่นี่แปลงเป็นเปอร์เซ็นต์แล้ว (ตาอยู่ y 118/214 = 55%)
  puy: { hat: { at: [51, 16], scale: 0.46 }, face: { at: [50, 55], scale: 0.78 }, hold: { at: [84, 79], scale: 0.36 } },
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
  // รวมปุยเข้ามาด้วย เพื่อให้แผงแต่งตัวเปิดได้ — แต่ยังไม่อยู่ใน FLUFFY_FRIENDS
  // ตัวนับ x/15 กับอัตราออกของกาชาจึงไม่ขยับ
  [...FLUFFY_FRIENDS, PUY_FRIEND].map((f) => [f.id, f]),
);

/** Shards handed back for a duplicate, by rarity — the higher the rarity, the more. */
export const DUPLICATE_SHARDS: Record<Rarity, number> = {
  common: 5,
  rare: 15,
  superRare: 40,
};
