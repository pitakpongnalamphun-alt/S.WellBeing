/**
 * Plutchik's eight primary emotions, each on a three-step intensity scale.
 *
 * The wheel is used here because it separates *which* feeling from *how
 * strong* — a student who is "annoyed" and one who is "enraged" pick the same
 * sector at different rings, and the admin side can act on the difference.
 * A five-face scale cannot express that.
 *
 * `angle` is degrees clockwise from the top, so the eight sectors are drawn
 * straight from this table rather than positioned by hand.
 */

export type EmotionKey =
  | "joy"
  | "trust"
  | "fear"
  | "surprise"
  | "sadness"
  | "disgust"
  | "anger"
  | "anticipation";

export type Intensity = 1 | 2 | 3;

export type EmotionSector = {
  key: EmotionKey;
  angle: number;
  /** Ring labels, mild → intense. */
  labels: [string, string, string];
  hue: string;
};

export const SECTORS: EmotionSector[] = [
  { key: "joy", angle: 0, labels: ["สงบใจ", "ดีใจ", "ปลื้มปีติ"], hue: "#F5C518" },
  { key: "trust", angle: 45, labels: ["ยอมรับได้", "ไว้ใจ", "ศรัทธา"], hue: "#8CC63F" },
  { key: "fear", angle: 90, labels: ["กังวล", "กลัว", "หวาดกลัวมาก"], hue: "#3FA95C" },
  { key: "surprise", angle: 135, labels: ["สนใจ", "ประหลาดใจ", "ตกตะลึง"], hue: "#39B6C8" },
  { key: "sadness", angle: 180, labels: ["เหงา", "เศร้า", "โศกเศร้า"], hue: "#5B8DD9" },
  { key: "disgust", angle: 225, labels: ["เบื่อ", "รังเกียจ", "ชิงชัง"], hue: "#9B7ACB" },
  { key: "anger", angle: 270, labels: ["หงุดหงิด", "โกรธ", "โกรธจัด"], hue: "#E8615A" },
  { key: "anticipation", angle: 315, labels: ["สนใจ", "คาดหวัง", "ตื่นตัวมาก"], hue: "#F09A3E" },
];

export type MoodEntry = {
  emotion: EmotionKey;
  intensity: Intensity;
  note?: string;
  /** ISO 8601, UTC. */
  at: string;
};

/**
 * Which entries warrant a look from a counsellor.
 *
 * This is a triage hint for the student's own view, not a diagnosis and not an
 * alert. Anything that acts on it — notifying staff, opening a case — belongs
 * server-side with a human in the loop.
 */
export function riskTier(entry: MoodEntry): "low" | "medium" | "high" {
  const heavy: EmotionKey[] = ["sadness", "fear", "anger", "disgust"];
  if (!heavy.includes(entry.emotion)) return "low";
  return entry.intensity === 3 ? "high" : entry.intensity === 2 ? "medium" : "low";
}
