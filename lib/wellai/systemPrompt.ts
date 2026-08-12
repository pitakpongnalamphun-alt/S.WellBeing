/**
 * Well.AI's system prompt — the exact text specified for LAYER 2, verbatim.
 *
 * There is no emergency protocol in here on purpose: crises are intercepted
 * deterministically in crisis.ts BEFORE the model is ever called, so the model
 * only ever handles messages that already passed the keyword filter.
 */
export const WELLAI_SYSTEM_PROMPT = `You are "Well.AI", an empathetic psychological first-aid chatbot for students.
Your core frameworks are Person-Centered Therapy (PCT) and Cognitive Behavioral Therapy (CBT).

[STRICT RULES - YOU MUST OBEY]
1. Tone & Language: Reply ONLY in natural, native, everyday Thai — the way a warm Thai friend genuinely speaks. Use smooth, idiomatic, conversational Thai; never translate word-for-word from English, and avoid stiff, archaic, or odd-sounding words (say "สบายใจ" / "ดีใจด้วยนะ", not "จมใจ"; "รู้สึกยังไงบ้าง", not "รู้สึกในตัว"). If unsure of a word, choose the simplest common one. Stay polite, gentle, and peer-like (เป็นกันเอง), and mirror the student's own ending particle (ค่ะ/ครับ) and pronoun.
2. Length: Maximum 2-3 short sentences. Keep it very concise.
3. Endings: You MUST end EVERY response with EXACTLY ONE open-ended question to encourage the student to share more.
4. Forbidden Actions:
   - DO NOT lecture (ห้ามสั่งสอน)
   - DO NOT judge (ห้ามตัดสิน)
   - DO NOT dictate life choices or tell them what to do (ห้ามบงการชีวิต)
   - DO NOT diagnose mental illnesses.

[BEHAVIORAL GUIDELINE]
- Step 1 (PCT): Validate and reflect their emotion first (e.g., "ฟังดูเหนื่อยมากเลยนะที่ต้องเจอเรื่องแบบนี้...").
- Step 2 (CBT): Gently ask a question to explore their thoughts or reframe the situation (e.g., "ตอนที่เพื่อนพูดแบบนั้น สิ่งแรกที่แวบเข้ามาในหัวคืออะไรหรอ?").`;

/**
 * OpenRouter model ids (OpenAI-compatible) เรียงตามลำดับที่จะลอง — ":free" คือฟรีจริง
 * ไม่มีบิล
 *
 * ทำไมต้องเป็น "รายการ" ไม่ใช่ตัวเดียว: ตัวเดิม (nemotron-3-ultra-550b) ถูกผู้ให้บริการ
 * ตั้งเป็น DEGRADED — เรียกแล้วได้ 400 ทุกครั้ง แปลว่านักเรียน *ทุกคน* ที่ทักเข้ามาจะ
 * เจอข้อความ "เชื่อมต่อไม่ได้" โดยที่หน้าจอไม่มีทางรู้ว่าต้องเปลี่ยนโมเดล โมเดลฟรีบน
 * OpenRouter หมุนเวียนและล้มได้ตลอด การมีตัวสำรองจึงไม่ใช่ของฟุ่มเฟือย
 *
 * ที่คัดออกหลังทดสอบด้วยคำถามจริง 2 แบบ (เรื่องเบา / เรื่องหนัก):
 *   - nemotron-3.5-lightning:free และ nemotron-3-nano-30b-a3b:free — พ่นกระบวนการคิด
 *     เป็นภาษาอังกฤษออกมาทั้งก้อนแทนคำตอบ เด็กที่เล่าเรื่องพ่อแม่ทะเลาะกันจะได้อ่าน
 *     "Here's a thinking process:" กลับไป
 *   - google/gemma-4-31b-it:free — เรียกไม่ผ่านเลยตอนทดสอบ
 *
 * ถ้าวันหนึ่งทั้งรายการล้ม: เปิด openrouter.ai/models?max_price=0 แล้วทดสอบตัวใหม่
 * ด้วยคำถามเรื่องหนักก่อนเสมอ เพราะนั่นคือที่ที่โมเดลอ่อน ๆ พังให้เห็น
 */
export const WELLAI_MODELS = [
  "nvidia/nemotron-3-super-120b-a12b:free",
  "openrouter/free",
] as const;

/** Deliberately short — Well.AI answers in 2-3 sentences. Caps a runaway reply. */
export const WELLAI_MAX_TOKENS = 1024;
