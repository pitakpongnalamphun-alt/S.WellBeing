import { generateText } from "ai";
import type { NextRequest } from "next/server";

import { CRISIS_MESSAGE, detectCrisis } from "@/lib/wellai/crisis";
import { SAFETY_SETTINGS, gemini, hasAiKey } from "@/lib/wellai/provider";
import { WELLAI_MODELS } from "@/lib/wellai/systemPrompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * สะท้อนคำตอบที่นักเรียนเขียนเองท้ายตอนของเกมฝึกทักษะ
 *
 * ทำไมต้องเป็นเส้นทางแยกจาก /api/chat
 * ที่นี่ไม่ได้ต้องการบทสนทนา แต่ต้องการ "ผลลัพธ์ที่มีโครงสร้าง" ให้เกมเอาไปคิดพลังใจ
 * ต่อได้ — ถ้าใช้ห้องแชทเดิม เราจะได้ข้อความยาว ๆ ที่เกมแปลไม่ได้ และเสี่ยงที่โมเดล
 * จะเผลอสวมบทครูตรวจข้อสอบ ซึ่งเป็นสิ่งเดียวที่ฟีเจอร์นี้รับไม่ได้
 *
 * สิ่งที่เหมือนห้องแชททุกประการคือด่านความปลอดภัย
 *
 *   🔴 ด่าน 1  ตัวกรองคำเสี่ยงแบบตายตัว รันก่อนเรียกโมเดลเสมอ เจอปุ๊บคืนข้อความ
 *             ฉุกเฉินและไม่ไปต่อ — ช่องพิมพ์อิสระในแอปสุขภาพจิตของเด็กคือช่องที่
 *             เด็กจะพิมพ์เรื่องหนักที่สุดลงไป ไม่ว่าเราจะตั้งใจให้มันเป็นช่องตอบเกมแค่ไหน
 *   🟢 ด่าน 2  โมเดล เข้าถึงได้เฉพาะข้อความที่ผ่านด่าน 1 มาแล้ว
 *
 * โมเดลไม่ได้เป็นคนให้คะแนน มันได้แค่ติดป้าย (`kind`) แล้วฝั่งเกมแปลงเป็นพลังใจ
 * ตามตารางตายตัว เหตุผลอยู่ในคอมเมนต์ของ ENERGY_BY_KIND ใน LifeSkillGame.tsx
 */

/** ป้ายที่โมเดลติดได้ — ฝั่งเกมเป็นคนกำหนดว่าป้ายไหนแปลว่าพลังใจเท่าไหร่ */
const KINDS = [
  "cares-for-self",
  "cares-for-others",
  "avoids",
  "escalates",
  "unsafe",
] as const;
type Kind = (typeof KINDS)[number];

export type Reflection = {
  strength: string;
  outcome: string;
  tryNext: string;
  kind: Kind;
};

const MAX_ANSWER = 1200;

const SYSTEM = `คุณกำลังช่วยสะท้อนคำตอบของนักเรียนมัธยมไทยในเกมฝึกทักษะชีวิต
นักเรียนอ่านสถานการณ์สมมติจบแล้วเขียนด้วยคำของตัวเองว่าถ้าเป็นเขาจะทำยังไง

หน้าที่ของคุณคือสะท้อน ไม่ใช่ตรวจข้อสอบ ห้ามให้คะแนน ห้ามบอกว่าถูกหรือผิด
ห้ามขึ้นต้นด้วยคำชมลอย ๆ อย่าง "ดีมาก" หรือ "เยี่ยม" โดยไม่บอกว่าดีตรงไหน

ตอบเป็น JSON อย่างเดียว ไม่ต้องมีข้อความอื่นหรือรั้วโค้ด รูปแบบ:
{"strength":"...","outcome":"...","tryNext":"...","kind":"..."}

strength — สิ่งที่นักเรียนทำได้ดีในคำตอบนี้ ต้องมีเสมอและต้องเจาะจง
  ให้ชี้ที่การกระทำหรือความตั้งใจในคำตอบ ไม่ใช่ชมตัวคน 1 ประโยค
outcome — ผลที่น่าจะตามมาจริงถ้าทำแบบนั้น เล่าเป็นเรื่องเล่า ไม่ใช่คำเตือน
  ถ้าวิธีนั้นเสี่ยง ให้เห็นผลของมันเอง ห้ามสั่งสอนหรือห้ามปราม 1-2 ประโยค
tryNext — สิ่งที่ลองเพิ่มได้ในครั้งหน้า เป็นข้อเสนอ ไม่ใช่คำสั่ง
  ขึ้นต้นด้วย "ลอง" หรือ "ถ้า" 1 ประโยค
kind — เลือกหนึ่งค่า:
  cares-for-self   ดูแลใจหรือขอบเขตของตัวเอง
  cares-for-others ห่วงความรู้สึกของคนอื่นด้วย
  avoids           หลบเลี่ยง เก็บไว้คนเดียว หรือปล่อยผ่าน
  escalates        ตอบโต้แรงขึ้น ประจาน หรือทำให้เรื่องบานปลาย
  unsafe           มีความเสี่ยงต่อความปลอดภัยของร่างกายหรือตัวตน

ใช้ภาษาไทยที่วัยรุ่นอ่านแล้วไม่รู้สึกว่าโดนผู้ใหญ่สอน เรียกนักเรียนว่า "เธอ"`;

/**
 * ใช้เมื่อเรียกโมเดลไม่ได้หรือคืนของที่อ่านไม่ออก
 *
 * ต้องไม่ใช่หน้าจอตัน — เด็กเพิ่งเขียนความรู้สึกของตัวเองออกมา สิ่งที่แย่ที่สุดคือ
 * ได้ error กลับไป มันอ่านว่า "เขียนแล้วไม่มีใครอ่าน" ซึ่งเป็นบทเรียนที่ตรงข้ามกับ
 * ทั้งแอป จึงยอมรับคำตอบไว้ก่อนเสมอ และไม่แตะพลังใจ (kind ที่ให้ 0)
 */
const FALLBACK: Reflection = {
  strength: "เธอหยุดคิดกับเรื่องนี้จริง ๆ แล้วเขียนออกมาเป็นคำของตัวเอง ซึ่งไม่ใช่เรื่องง่ายเลย",
  outcome:
    "ตอนนี้ระบบอ่านคำตอบของเธอแบบละเอียดไม่ได้ชั่วคราว แต่สิ่งที่เธอเขียนไม่ได้หายไปไหน",
  tryNext: "ลองอ่านสิ่งที่ตัวเองเขียนอีกรอบ แล้วถามตัวเองว่าตอนนั้นเราต้องการอะไรมากที่สุด",
  kind: "avoids",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

/** โมเดลชอบห่อ JSON ด้วยรั้วโค้ดหรือมีคำนำหน้า — ดึงเฉพาะก้อนวงเล็บปีกกาออกมา */
function parseReflection(raw: string): Reflection | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const o = JSON.parse(raw.slice(start, end + 1)) as Partial<Reflection>;
    const kind = KINDS.includes(o.kind as Kind) ? (o.kind as Kind) : "avoids";
    // ทุกช่องต้องมีข้อความจริง ถ้าขาดช่องใดช่องหนึ่งถือว่าใช้ไม่ได้ทั้งก้อน —
    // การ์ดที่มีหัวข้อว่างอ่านเหมือนหน้าจอพัง
    if (!o.strength?.trim() || !o.outcome?.trim() || !o.tryNext?.trim()) return null;
    return {
      strength: o.strength.trim(),
      outcome: o.outcome.trim(),
      tryNext: o.tryNext.trim(),
      kind,
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  let situation = "";
  let answer = "";
  try {
    const body = (await req.json()) as { situation?: string; answer?: string };
    situation = typeof body.situation === "string" ? body.situation : "";
    answer = typeof body.answer === "string" ? body.answer.slice(0, MAX_ANSWER) : "";
  } catch {
    return new Response("bad request", { status: 400 });
  }

  if (!answer.trim()) return new Response("bad request", { status: 400 });

  // 🔴 ด่าน 1 — ตายตัว ไม่พึ่งโมเดล และมาก่อนทุกอย่าง
  if (detectCrisis(answer)) {
    return json({ type: "crisis", message: CRISIS_MESSAGE });
  }

  if (!hasAiKey()) return json({ type: "ok", reflection: FALLBACK });

  // 🟢 ด่าน 2 — โมเดล ถึงตรงนี้ได้เฉพาะข้อความที่ผ่านด่าน 1 แล้วเท่านั้น
  const google = gemini();
  for (const { id: model } of WELLAI_MODELS) {
    try {
      const { text } = await generateText({
        model: google(model),
        system: SYSTEM,
        maxOutputTokens: 700,
        maxRetries: 1,
        temperature: 0.5,
        providerOptions: {
          google: { safetySettings: SAFETY_SETTINGS.map((s) => ({ ...s })) },
        },
        prompt: `สถานการณ์ในเกม:\n${situation}\n\nสิ่งที่นักเรียนเขียน:\n${answer}`,
      });
      const parsed = parseReflection(text ?? "");
      if (parsed) return json({ type: "ok", reflection: parsed });
      console.warn(`[game-reflect] อ่าน JSON จาก ${model} ไม่ได้:`, text?.slice(0, 200));
    } catch (error) {
      console.error(`[game-reflect] เรียกโมเดลไม่สำเร็จ (${model}):`, error);
    }
  }

  return json({ type: "ok", reflection: FALLBACK });
}
