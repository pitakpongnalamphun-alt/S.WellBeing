/**
 * A curated deck of ideas from well-known psychologists — each with a Thai
 * rendering of the quote, a small "try this" application, a category, a soft
 * theme, and a stylised (non-photographic) avatar spec.
 *
 * The quotes are Thai renderings of widely-attributed ideas; wording and
 * attribution should be double-checked before any public release, since these
 * are often misquoted online. Avatars are friendly illustrations, not likenesses.
 */

export type WisdomCategory =
  | "meaning"
  | "acceptance"
  | "self"
  | "growth"
  | "stress"
  | "courage"
  | "hope";

export const CATEGORY_META: Record<WisdomCategory, { label: string }> = {
  meaning: { label: "ความหมายชีวิต" },
  acceptance: { label: "ยอมรับตัวเอง" },
  self: { label: "รู้จักตัวเอง" },
  growth: { label: "การเติบโต" },
  stress: { label: "รับมือความเครียด" },
  courage: { label: "ความกล้า" },
  hope: { label: "ความหวัง" },
};

export const CATEGORY_ORDER: WisdomCategory[] = [
  "meaning",
  "acceptance",
  "self",
  "growth",
  "stress",
  "courage",
  "hope",
];

/** Soft pastel skin per category — the card background + accent ink. */
export type WisdomTheme = { gradient: string; ink: string; chip: string; chipInk: string };

export const THEMES: Record<WisdomCategory, WisdomTheme> = {
  meaning: { gradient: "linear-gradient(160deg,#efe8fb,#e8ecfb)", ink: "#5b4a9e", chip: "#e5dcf7", chipInk: "#5b4a9e" },
  acceptance: { gradient: "linear-gradient(160deg,#ffe9ef,#fdeef4)", ink: "#a24d6e", chip: "#fbdce7", chipInk: "#a24d6e" },
  self: { gradient: "linear-gradient(160deg,#e7f0fb,#eef4fc)", ink: "#3f6aa3", chip: "#dbe8f8", chipInk: "#3f6aa3" },
  growth: { gradient: "linear-gradient(160deg,#e8f5e4,#eef7e9)", ink: "#4d7a3a", chip: "#dcefd3", chipInk: "#4d7a3a" },
  stress: { gradient: "linear-gradient(160deg,#e4f4f0,#edf7f4)", ink: "#3a8272", chip: "#d3ece5", chipInk: "#3a8272" },
  courage: { gradient: "linear-gradient(160deg,#ffece2,#fff0e8)", ink: "#b3623a", chip: "#fbd9c8", chipInk: "#b3623a" },
  hope: { gradient: "linear-gradient(160deg,#fdf0d9,#fdf4e3)", ink: "#a5751f", chip: "#f8e6c2", chipInk: "#a5751f" },
};

export type AvatarSpec = {
  skin: string;
  hair: string;
  /** Silhouette that most helps tell each figure apart. */
  hairStyle: "full" | "sides" | "receding" | "bob";
  beard?: "full" | "mustache";
  glasses?: "round" | "square";
};

/**
 * การ์ดในสำรับมีสองชนิด
 *
 * quote — คำพูดของนักจิตวิทยา (ของเดิม)
 * practice — วิธีที่ลองทำได้จริงในแอปนี้ ไม่มีการอ้างคำพูดของใคร
 *
 * ที่เพิ่มชนิดที่สองแทนการหาคำคมมาใส่เพิ่ม เพราะคำคมที่แพร่บนอินเทอร์เน็ตถูกใส่ชื่อ
 * ผิดคนบ่อยมาก (ไฟล์นี้เตือนไว้เองตั้งแต่บรรทัดแรก) การเติมของที่ตรวจสอบไม่ได้เข้าไป
 * อีกสิบใบ คือการเพิ่มความเสี่ยงให้แอปที่เด็กใช้ ส่วนวิธีปฏิบัติเป็นสิ่งที่พิสูจน์ได้จาก
 * การลองทำ ไม่ต้องอ้างใคร และพาไปทำต่อในแอปได้ทันที
 */
export type WisdomKind = "quote" | "practice";

export type Wisdom = {
  id: string;
  kind: WisdomKind;
  quote: string;
  application: string;
  category: WisdomCategory;

  /** เฉพาะการ์ดคำพูด */
  name?: string;
  nameEn?: string;
  field?: string;
  era?: string;
  avatar?: AvatarSpec;

  /** เฉพาะการ์ดวิธีทำ */
  title?: string;
  emoji?: string;
  /** พาไปทำจริงในแอป — ปุ่มนี้คือความต่างระหว่าง "อ่านแล้วรู้สึกดี" กับ "ได้ลองจริง" */
  action?: { label: string; href: string };
};

const GRAY = "#c2bcb0";
const WHITE = "#e8e3d8";
const DARK = "#4a3b30";
const BROWN = "#8a6a4a";
const BLONDE = "#caa86a";
const SKIN = "#f1c9a5";

export const WISDOMS: Wisdom[] = [
  {
    kind: "quote",
    id: "frankl",
    name: "วิกเตอร์ แฟรงเคิล",
    nameEn: "Viktor Frankl",
    field: "จิตแพทย์ · แนวคิด Logotherapy",
    era: "1905–1997",
    quote: "เมื่อเราเปลี่ยนสถานการณ์ไม่ได้ เราก็ถูกท้าทายให้เปลี่ยนตัวเราเอง",
    application: "วันที่อะไรไม่เป็นใจ ลองถามตัวเองว่า “เราเลือกรับมือกับมันยังไงได้บ้าง”",
    category: "meaning",
    avatar: { skin: SKIN, hair: GRAY, hairStyle: "sides", glasses: "square" },
  },
  {
    kind: "quote",
    id: "rogers",
    name: "คาร์ล โรเจอร์ส",
    nameEn: "Carl Rogers",
    field: "นักจิตวิทยาสายมนุษยนิยม",
    era: "1902–1987",
    quote: "เรื่องแปลกก็คือ พอเรายอมรับตัวเองอย่างที่เป็น เราจึงเปลี่ยนแปลงได้",
    application: "ลองพูดกับตัวเองดี ๆ เหมือนที่พูดกับเพื่อนสนิทสักคน",
    category: "acceptance",
    avatar: { skin: SKIN, hair: WHITE, hairStyle: "full", glasses: "round" },
  },
  {
    kind: "quote",
    id: "jung",
    name: "คาร์ล ยุง",
    nameEn: "Carl Jung",
    field: "จิตแพทย์ · จิตวิทยาวิเคราะห์",
    era: "1875–1961",
    quote: "คนที่มองออกไปข้างนอกคือฝัน ส่วนคนที่มองเข้าไปข้างในคือตื่น",
    application: "วันนี้ลองสังเกตความรู้สึกข้างในสัก 1 อย่าง โดยไม่ตัดสินมัน",
    category: "self",
    avatar: { skin: SKIN, hair: GRAY, hairStyle: "receding", glasses: "round", beard: "mustache" },
  },
  {
    kind: "quote",
    id: "maslow",
    name: "อับราฮัม มาสโลว์",
    nameEn: "Abraham Maslow",
    field: "นักจิตวิทยา · ทฤษฎีลำดับขั้นความต้องการ",
    era: "1908–1970",
    quote: "สิ่งที่คนเราเป็นได้ เขาก็ควรจะได้เป็น",
    application: "ลงมือทำสิ่งเล็ก ๆ ที่ทำให้รู้สึกเป็นตัวเองสัก 1 อย่างวันนี้",
    category: "growth",
    avatar: { skin: SKIN, hair: DARK, hairStyle: "full", beard: "mustache" },
  },
  {
    kind: "quote",
    id: "james",
    name: "วิลเลียม เจมส์",
    nameEn: "William James",
    field: "นักจิตวิทยา · นักปรัชญา",
    era: "1842–1910",
    quote: "อาวุธที่ทรงพลังที่สุดต่อความเครียด คือการเลือกความคิดหนึ่งเหนืออีกความคิด",
    application: "เครียดเมื่อไร ลองมองเรื่องเดิมในอีกมุมสัก 1 มุม",
    category: "stress",
    avatar: { skin: SKIN, hair: GRAY, hairStyle: "sides", beard: "full" },
  },
  {
    kind: "quote",
    id: "brown",
    name: "บรีเน บราวน์",
    nameEn: "Brené Brown",
    field: "นักวิจัย · ศาสตราจารย์ด้านสังคมสงเคราะห์",
    era: "เกิด 1965",
    quote: "ความเปราะบางไม่ใช่ความอ่อนแอ แต่คือจุดเริ่มต้นของความกล้าหาญ",
    application: "ลองกล้าบอกความรู้สึกจริง ๆ กับคนที่เราไว้ใจสัก 1 คน",
    category: "courage",
    avatar: { skin: SKIN, hair: BLONDE, hairStyle: "bob" },
  },
  {
    kind: "quote",
    id: "erikson",
    name: "เอริก อีริกสัน",
    nameEn: "Erik Erikson",
    field: "นักจิตวิทยาพัฒนาการ",
    era: "1902–1994",
    quote: "ความหวังคือศรัทธาแรกที่ติดตัวเรามา และหล่อเลี้ยงเราไปตลอดชีวิต",
    application: "นึกถึงสิ่งเล็ก ๆ ที่ยังทำให้พรุ่งนี้น่ารอคอยสัก 1 อย่าง",
    category: "hope",
    avatar: { skin: SKIN, hair: WHITE, hairStyle: "full", beard: "mustache" },
  },
  {
    kind: "quote",
    id: "winnicott",
    name: "โดนัลด์ วินนิคอตต์",
    nameEn: "Donald Winnicott",
    field: "กุมารแพทย์ · จิตวิเคราะห์",
    era: "1896–1971",
    quote: "เราไม่ต้องสมบูรณ์แบบ แค่ “ดีพอ” ก็มากพอแล้ว",
    application: "วันนี้ทำได้แค่ไหนก็พอแล้ว ไม่ต้องเต็ม 100 ทุกวันก็ได้",
    category: "acceptance",
    avatar: { skin: SKIN, hair: GRAY, hairStyle: "sides", glasses: "round" },
  },
  // ---------------------------------------------------------------- วิธีที่ลองทำได้จริง
  {
    kind: "practice",
    id: "name-it",
    title: "เรียกชื่อความรู้สึกให้ถูก",
    emoji: "🎯",
    quote: "ความรู้สึกที่ยังไม่มีชื่อ มักใหญ่กว่าความจริงเสมอ",
    application: "แทนที่จะบอกว่า “แย่” ลองหาคำที่ตรงกว่านั้น — น้อยใจ? อาย? กลัว? พอเรียกถูกชื่อ มันจะเล็กลงเอง",
    category: "self",
    action: { label: "ไปบันทึกอารมณ์", href: "/mood" },
  },
  {
    kind: "practice",
    id: "breathe-4",
    title: "หายใจให้ร่างกายรู้ว่าปลอดภัย",
    emoji: "🌬️",
    quote: "ใจสั่งร่างกายไม่ได้ตอนตกใจ แต่ร่างกายสั่งใจได้",
    application: "หายใจออกให้ยาวกว่าหายใจเข้า สัก 6 รอบ — ระบบประสาทจะเริ่มถอยจากโหมดตื่นตัวเอง",
    category: "stress",
    action: { label: "ไปฝึกหายใจ", href: "/breathing" },
  },
  {
    kind: "practice",
    id: "catch-thought",
    title: "จับความคิดที่หลอกเรา",
    emoji: "🪤",
    quote: "ความคิดไม่ใช่ข้อเท็จจริง แม้มันจะดังมากก็ตาม",
    application: "เวลาคิดว่า “ทุกคนเกลียดเรา” ลองถามว่ามีหลักฐานอะไรบ้าง และมีหลักฐานอะไรที่ค้านมัน",
    category: "self",
    action: { label: "ไปเล่นเกมจับความคิด", href: "/games" },
  },
  {
    kind: "practice",
    id: "friend-voice",
    title: "พูดกับตัวเองเหมือนพูดกับเพื่อน",
    emoji: "💌",
    quote: "เราไม่เคยพูดกับเพื่อนแบบที่พูดกับตัวเองเลยสักครั้ง",
    application: "เขียนสิ่งที่กำลังด่าตัวเองลงไป แล้วเขียนใหม่ด้วยประโยคที่จะพูดกับเพื่อนที่เจอเรื่องเดียวกัน",
    category: "acceptance",
    action: { label: "ไปเขียนไดอารี่", href: "/mood" },
  },
  {
    kind: "practice",
    id: "ten-minutes",
    title: "กฎสิบนาทีแรก",
    emoji: "⏱️",
    quote: "งานที่ไม่อยากเริ่ม มักไม่ได้หนักเท่ากับการเริ่ม",
    application: "ตั้งเวลา 10 นาที แล้วทำแบบห่วย ๆ ก็ได้ ครบแล้วจะหยุดก็ได้ — ส่วนใหญ่จะไม่หยุด",
    category: "growth",
  },
  {
    kind: "practice",
    id: "let-go-cloud",
    title: "วางเรื่องที่แบกไว้ให้คนอื่นช่วยถือ",
    emoji: "☁️",
    quote: "เรื่องที่พูดออกมาแล้ว หนักน้อยกว่าเรื่องที่เก็บไว้เสมอ",
    application: "ปล่อยความรู้สึกวันนี้เป็นก้อนเมฆหนึ่งก้อน แล้วดูว่ามีใครแวะมาส่งกอดให้บ้าง",
    category: "hope",
    action: { label: "ไปกาแล็กซีแห่งการโอบกอด", href: "/galaxy" },
  },
  {
    kind: "practice",
    id: "ask-for-help",
    title: "ขอความช่วยเหลือให้เป็น",
    emoji: "🤝",
    quote: "การขอความช่วยเหลือคือทักษะ ไม่ใช่ความอ่อนแอ",
    application: "ไม่ต้องเล่าทั้งหมดก็ได้ เริ่มจากประโยคเดียว — “ช่วงนี้หนูไม่ค่อยไหว อยากคุยด้วยได้ไหม”",
    category: "courage",
    action: { label: "ไปนัดคุยกับครู", href: "/appointments" },
  },
  {
    kind: "practice",
    id: "one-small-step",
    title: "ก้าวแรกที่เล็กพอจะก้าวได้จริง",
    emoji: "🐾",
    quote: "แผนที่ทำไม่ได้ ไม่ใช่แผน",
    application: "แทนที่จะตั้งเป้าว่า “จะอ่านหนังสือให้ทัน” ลองตั้งว่า “คืนนี้เปิดสมุดหน้าแรก”",
    category: "growth",
  },
  {
    kind: "practice",
    id: "feed-break",
    title: "พักสายตาจากชีวิตคนอื่น",
    emoji: "📵",
    quote: "ฟีดคือหน้าที่ดีที่สุดของคนอื่น ไม่ใช่ทั้งชีวิตของเขา",
    application: "คืนไหนที่เลื่อนฟีดแล้วรู้สึกแย่ลง ให้วางมือถือแล้วทำอย่างอื่น 20 นาที ก่อนกลับมาดูใหม่",
    category: "stress",
  },
  {
    kind: "practice",
    id: "talk-to-puy",
    title: "เล่าให้ใครสักคนฟังก่อนนอน",
    emoji: "🩷",
    quote: "เรื่องที่วนอยู่ในหัวทั้งคืน มักหยุดวนเมื่อถูกเล่าออกไป",
    application: "ถ้ายังไม่พร้อมเล่าให้คนจริงฟัง เล่าให้ปุยฟังก่อนก็ได้ ไม่มีใครอ่านนอกจากเครื่องนี้",
    category: "hope",
    action: { label: "ไปคุยกับน้องปุย", href: "/chatbot" },
  },
];

/**
 * อารมณ์ที่นักเรียนเลือกวันนี้ → หมวดแง่คิดที่น่าหยิบมาอ่านที่สุด
 *
 * ไม่ได้พยายามจับคู่ให้ตรงเป๊ะ เพราะไม่มีคำคมไหนแก้ความรู้สึกใครได้ แต่การหยิบใบที่
 * "พูดถึงเรื่องที่เขากำลังเจอ" ขึ้นมาก่อน ดีกว่าสุ่มใบไหนก็ได้ในวันที่เขาไม่ไหว
 */
export const MOOD_TO_CATEGORY: Record<string, WisdomCategory> = {
  yellow: "growth", // สุข — ต่อยอดวันดีให้ไปต่อ
  purple: "self", // ประหลาดใจ
  green: "stress", // ทุกข์/กังวล
  orange: "courage", // กลัว
  red: "acceptance", // โกรธ
  gray: "acceptance", // รังเกียจ
  blue: "hope", // เสียใจ
};

export const WISDOM_BY_ID: Record<string, Wisdom> = Object.fromEntries(
  WISDOMS.map((w) => [w.id, w]),
);
