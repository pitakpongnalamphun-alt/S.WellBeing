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
