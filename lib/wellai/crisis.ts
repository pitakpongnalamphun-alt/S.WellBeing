/**
 * Deterministic crisis detection for Well.AI.
 *
 * This is the safety-critical path and it must NOT depend on the language model.
 * An LLM can miss a euphemism, be jailbroken, or drift; a student in crisis
 * cannot afford any of those. So a plain keyword check runs first — on the
 * client (instant, works even if the network or API is down) and again on the
 * server (in case the client is bypassed). Only if it finds nothing does a
 * message reach the model, which carries the same emergency protocol as a
 * second layer.
 *
 * ⚠️ This keyword list is a STARTING POINT, not a finished safety system. It
 * must be reviewed by mental-health professionals and tuned against real
 * (anonymised) data before this handles real students. It deliberately errs
 * toward showing help — a false positive shows a hotline unnecessarily, which
 * is far less costly than a missed crisis — but too many false positives erode
 * trust, so the phrases are kept specific rather than matching bare words like
 * "ตาย" (which appears in harmless idioms such as "เบื่อจะตาย").
 */

/**
 * ข้อความฉุกเฉินตามสเปก — โครงสร้างและใจความคงไว้ทุกตัวอักษร ห้ามเรียบเรียงใหม่
 *
 * ที่แก้จากต้นฉบับมีอย่างเดียวคือชื่อผู้พูด: "Well.AI" → "อุ่น" เพราะนักเรียนคุยกับ
 * น้องอุ่นมาทั้งบทสนทนา ถ้าถึงวินาทีที่เปราะบางที่สุดแล้วมีชื่อแปลกหน้าโผล่ขึ้นมาแทน
 * มันจะอ่านเหมือนถูกส่งต่อให้ระบบอื่นในจังหวะที่ต้องการความต่อเนื่องมากที่สุด
 *
 * "Well.AI" ยังเป็นชื่อระบบในโค้ดและ API เหมือนเดิม — เปลี่ยนเฉพาะสิ่งที่นักเรียนอ่าน
 */
export const CRISIS_MESSAGE =
  "อุ่นสัมผัสได้ว่าตอนนี้คุณกำลังเจ็บปวดและแบกรับเรื่องหนักหนามาก อุ่นเป็นห่วงคุณมากๆ นะ 💙 เนื่องจากอุ่นเป็นเพียงระบบ AI จึงอาจช่วยคุณได้ไม่เต็มที่ อุ่นอยากให้คุณได้คุยกับผู้เชี่ยวชาญที่พร้อมรับฟังและช่วยคุณได้ทันที ลองโทรไปที่นี่นะ:\n\n📞 สายด่วนสุขภาพจิต: 1323\n📞 สมาคมสะมาริตันส์: 02-113-6789\n\nมีคนที่พร้อมจะกอดและรับฟังคุณอยู่นะ";

/** Emergency contacts, structured so the UI can render them as tappable calls. */
export const CRISIS_HOTLINES = [
  { label: "สายด่วนสุขภาพจิต", number: "1323", tel: "1323" },
  { label: "สมาคมสะมาริตันส์", number: "02-113-6789", tel: "021136789" },
] as const;

/**
 * The high-risk phrases. Both the API route and the client's instant check
 * import this one list, so LAYER 1 can never drift between them.
 *
 * Every entry is a CONTIGUOUS phrase, matched as a substring after spaces are
 * stripped. Bare "ตาย" was deliberately removed: on its own it matches harmless
 * Thai hyperbole ("หิวจะตาย" = starving, "เบื่อจะตาย" = bored to death, "อยากกิน
 * จะตาย" = dying to eat), because those idioms slot a word BETWEEN the feeling
 * and "ตาย". Requiring "ตาย" to sit directly against an intent word — อยากตาย,
 * ตายดีกว่า, ฆ่าตัวตาย — keeps the real crises and drops the idioms, since the
 * idiom's inserted word breaks the contiguous match.
 *
 * This remains a first-pass list that mental-health professionals must review
 * and tune against real (anonymised) data before it handles real students.
 */
const CRISIS_PHRASES = [
  // Suicidal intent — "ตาย" only where it sits against intent
  "อยากตาย",
  "อยากจะตาย",
  "ฆ่าตัวตาย",
  "จบชีวิต",
  "ตายดีกว่า",
  "ตายไปซะ",
  "ไม่อยากมีชีวิต",
  "ไม่อยากอยู่",
  // Distress / farewell
  "ไม่ไหวแล้ว",
  "ลาก่อน",
  // Self-harm
  "ทำร้ายตัวเอง",
] as const;

/** Collapse spacing/punctuation and lowercase so spacing quirks don't hide a match. */
function normalize(text: string): string {
  return text.toLowerCase().replace(/[\s\-_'".,!?]/g, "");
}

const NORMALIZED_PHRASES = CRISIS_PHRASES.map(normalize);

/** True when a message trips the crisis check. Runs identically on client and server. */
export function detectCrisis(text: string): boolean {
  const haystack = normalize(text);
  if (!haystack) return false;
  return NORMALIZED_PHRASES.some((phrase) => haystack.includes(phrase));
}
