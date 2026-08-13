import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * ผู้ให้บริการโมเดลของแอป — Google Gemini
 *
 * เดิมยิงผ่าน OpenRouter เพื่อใช้โมเดลฟรี แต่แคตตาล็อกฟรีของ OpenRouter หมุนเวียน
 * และล้มเองได้ (ตัวที่ตั้งไว้ถูกผู้ให้บริการปิดจนแชตล่มทั้งระบบมาแล้ว) ตอนนี้ย้ายมา
 * ใช้คีย์ Gemini ตรง ๆ
 *
 * รับชื่อ env ได้สองแบบ: GEMINI_API_KEY (ชื่อที่ใช้ในเอกสารของโปรเจกต์นี้) และ
 * GOOGLE_GENERATIVE_AI_API_KEY (ชื่อที่ AI SDK อ่านเองโดยปริยาย) — คนที่ตั้งค่าตาม
 * เอกสารของ Google จะไม่ต้องมาเดาว่าทำไมคีย์ที่ใส่แล้วไม่ทำงาน
 */

export function aiKey(): string | undefined {
  return (
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    undefined
  );
}

export function hasAiKey(): boolean {
  return !!aiKey();
}

/** ตัวสร้างโมเดล — เรียกใหม่ทุกครั้งเพื่อให้ env ที่เปลี่ยนระหว่างรันมีผลจริง */
export function gemini() {
  return createGoogleGenerativeAI({ apiKey: aiKey() });
}

/**
 * ตัวกรองเนื้อหาของ Gemini
 *
 * ค่าตั้งต้นของ Google บล็อก "สิ่งที่แอปนี้มีไว้เพื่อรับฟัง" — วัดจริงแล้วแค่นักเรียน
 * เขียนว่า "เหมือนผีเปรตรวมตัวกัน 34 คน" ตอนระบายเรื่องเพื่อนร่วมชั้น โมเดลก็คืน
 * finishReason "other" พร้อมข้อความเปล่า ทั้งตัวหลักและตัวสำรอง ผลคือเด็กที่กล้า
 * พิมพ์เรื่องจริงออกมาได้รับ "ตอนนี้เชื่อมต่อไม่ได้" กลับไป ซึ่งอ่านเหมือนถูกปิดประตูใส่
 *
 * จึงผ่อนเป็น BLOCK_ONLY_HIGH สำหรับหมวดที่ทับกับการระบายตามปกติ (ด่าคน โกรธ
 * สิ้นหวัง) — ยังบล็อกของที่รุนแรงจริง ๆ อยู่ ไม่ได้ปิดตัวกรองทิ้ง
 *
 * ที่ผ่อนตรงนี้ช่วยได้เฉพาะหมวดที่ Google เปิดให้ปรับ — ยังมีตัวกรองอีกชั้นที่ปรับไม่ได้
 * (ทดสอบแล้วว่าตั้ง OFF ทุกหมวดก็ยังถูกปฏิเสธ) เส้นทางนั้นจัดการที่ฝั่งเราแทน ดู
 * BLOCKED_MESSAGE ใน app/api/chat/route.ts
 *
 * สองอย่างที่ไม่ผ่อน:
 *   - เนื้อหาทางเพศ ยังคง BLOCK_MEDIUM_AND_ABOVE เพราะผู้ใช้คือเด็กมัธยม
 *   - ด่านฉุกเฉินของเราเอง (คีย์เวิร์ดใน crisis.ts) ยังทำงานก่อนถึงโมเดลเสมอ
 *     การผ่อนตรงนี้ไม่ได้ทำให้ข้อความเสี่ยงหลุดไปหาโมเดลเพิ่มขึ้นแม้แต่ข้อความเดียว
 */
export const SAFETY_SETTINGS = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
] as const;
