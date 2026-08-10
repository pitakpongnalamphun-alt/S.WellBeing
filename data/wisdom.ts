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

export type Wisdom = {
  id: string;
  name: string;
  nameEn: string;
  field: string;
  era: string;
  quote: string;
  application: string;
  category: WisdomCategory;
  avatar: AvatarSpec;
};

const GRAY = "#c2bcb0";
const WHITE = "#e8e3d8";
const DARK = "#4a3b30";
const BROWN = "#8a6a4a";
const BLONDE = "#caa86a";
const SKIN = "#f1c9a5";

export const WISDOMS: Wisdom[] = [
  {
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
];

export const WISDOM_BY_ID: Record<string, Wisdom> = Object.fromEntries(
  WISDOMS.map((w) => [w.id, w]),
);
