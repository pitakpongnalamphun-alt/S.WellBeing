/**
 * Cozy Shop — decorations bought directly with Star Coins (never gacha, so there's
 * no random frustration). Each friend has three slots: a hat, a face piece, and
 * something to hold.
 */

export type DecoSlot = "hat" | "face" | "hold";

export type Decoration = {
  id: string;
  name: string;
  emoji: string;
  slot: DecoSlot;
  price: number;
};

export const DECO_SLOTS: { slot: DecoSlot; label: string; emoji: string }[] = [
  { slot: "hat", label: "หมวก", emoji: "🎩" },
  { slot: "face", label: "ใบหน้า", emoji: "👓" },
  { slot: "hold", label: "ของถือ", emoji: "🧸" },
];

export const DECORATIONS: Decoration[] = [
  // Hats
  { id: "hat-knit", name: "หมวกไหมพรม", emoji: "🧶", slot: "hat", price: 40 },
  { id: "hat-straw", name: "หมวกฟาง", emoji: "👒", slot: "hat", price: 40 },
  { id: "hat-flower", name: "มงกุฎดอกไม้", emoji: "🌸", slot: "hat", price: 80 },
  { id: "hat-detective", name: "หมวกนักสืบ", emoji: "🕵️", slot: "hat", price: 60 },
  { id: "hat-octopus", name: "น้องหมึกเกาะหัว", emoji: "🐙", slot: "hat", price: 120 },

  // Face
  { id: "face-round", name: "แว่นตาทรงกลม", emoji: "👓", slot: "face", price: 30 },
  { id: "face-shades", name: "แว่นกันแดดฮาวาย", emoji: "🕶️", slot: "face", price: 50 },
  { id: "face-plaster", name: "พลาสเตอร์ติดแก้ม", emoji: "🩹", slot: "face", price: 30 },
  { id: "face-sparkle", name: "ตาประกายดาว", emoji: "✨", slot: "face", price: 70 },

  // Hold
  { id: "hold-cocoa", name: "แก้วโกโก้ร้อน", emoji: "☕", slot: "hold", price: 40 },
  { id: "hold-teddy", name: "ตุ๊กตาหมีเน่า", emoji: "🧸", slot: "hold", price: 50 },
  { id: "hold-umbrella", name: "ร่มใส", emoji: "☂️", slot: "hold", price: 40 },
  { id: "hold-diary", name: "สมุดไดอารี่", emoji: "📔", slot: "hold", price: 60 },
];

export const DECO_BY_ID: Record<string, Decoration> = Object.fromEntries(
  DECORATIONS.map((d) => [d.id, d]),
);
