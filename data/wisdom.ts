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
  hairStyle: "full" | "sides" | "receding" | "bob" | "swept" | "wild" | "long";
  beard?: "full" | "mustache" | "goatee";
  glasses?: "round" | "square" | "halfmoon";
  /**
   * โครงหน้า — ตัวแยกที่แรงที่สุด เพราะสายตาจับรูปหน้าก่อนจับทรงผม
   * ต้องมีเพราะมี 22 คนแต่ชุดตัวเลือกเดิมสร้างหน้าที่ต่างกันได้ไม่พอ
   */
  face?: "oval" | "round" | "long" | "square";
  /** หูกระต่าย — เครื่องหมายประจำตัวของแอรอน เบ็ค */
  bowtie?: boolean;
  /**
   * คุมร่องแก้มและร่องรอยของวัยในภาพวาด ค่าเริ่มต้นคือ senior เพราะเจ็ดในแปดคน
   * เป็นภาพจำจากช่วงบั้นปลายของชีวิต ส่วน adult ใช้กับคนที่ยังไม่ถึงวัยนั้น
   */
  age?: "adult" | "senior";
  /**
   * ทรงคอเสื้อ ค่าเริ่มต้นคือ suit (สูทปกแหลม) ซึ่งตรงกับภาพจำของคนยุค 1900–1970
   * ส่วน plain ใช้กับคนร่วมสมัย เพราะใส่สูทปกแหลมทรงยุค 1950 แล้วดูผิดยุคทันที
   */
  collar?: "suit" | "plain";
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

  /**
   * true (ค่าเริ่มต้น) = ข้อความในช่อง quote คือคำพูดของเขา แสดงในเครื่องหมายคำพูด
   * false = เป็นการสรุปแนวคิดของเขาด้วยคำของเรา ไม่ใช่คำพูดโดยตรง
   *
   * มีฟิลด์นี้เพราะไฟล์นี้เตือนตัวเองไว้ตั้งแต่บรรทัดแรกว่าคำคมบนอินเทอร์เน็ตถูกใส่ชื่อ
   * ผิดคนบ่อยมาก การใส่เครื่องหมายคำพูดคือการรับรองว่า "เขาพูดประโยคนี้จริง" ซึ่ง
   * รับรองไม่ได้สำหรับหลายคน แต่ "แนวคิดหลักของเขาคืออะไร" ตรวจสอบได้จากผลงานตีพิมพ์
   */
  verbatim?: boolean;

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
const SILVER = "#d6d2c8";
const SANDY = "#a98b62";
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
    avatar: { skin: SKIN, hair: GRAY, hairStyle: "sides", glasses: "square", face: "long" },
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
    avatar: { skin: SKIN, hair: WHITE, hairStyle: "full", glasses: "round", face: "oval" },
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
    avatar: { skin: SKIN, hair: GRAY, hairStyle: "receding", glasses: "round", beard: "mustache", face: "square" },
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
    avatar: { skin: SKIN, hair: DARK, hairStyle: "full", beard: "mustache", age: "adult", face: "oval" },
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
    avatar: { skin: SKIN, hair: GRAY, hairStyle: "sides", beard: "full", face: "round" },
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
    avatar: { skin: SKIN, hair: BLONDE, hairStyle: "bob", age: "adult", collar: "plain", face: "round" },
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
    avatar: { skin: SKIN, hair: WHITE, hairStyle: "swept", beard: "mustache", face: "long" },
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
    avatar: { skin: SKIN, hair: GRAY, hairStyle: "sides", glasses: "round", face: "oval" },
  },
  // ══════════ สรุปแนวคิด ไม่ใช่คำพูดโดยตรง (verbatim: false) ══════════
  {
    kind: "quote",
    verbatim: false,
    id: "freud",
    name: "ซิกมันด์ ฟรอยด์",
    nameEn: "Sigmund Freud",
    field: "ผู้ก่อตั้งจิตวิเคราะห์",
    era: "1856–1939",
    quote: "สิ่งที่เราไม่รู้ตัวว่าคิด ก็ยังออกแรงกับชีวิตเราอยู่ดี",
    application: "เวลาหงุดหงิดโดยไม่รู้สาเหตุ ลองย้อนดูว่าก่อนหน้านั้นเกิดอะไรขึ้นบ้าง",
    category: "self",
    avatar: { skin: SKIN, hair: WHITE, hairStyle: "receding", beard: "full", glasses: "round", face: "long" },
  },
  {
    kind: "quote",
    verbatim: false,
    id: "adler",
    name: "อัลเฟรด แอดเลอร์",
    nameEn: "Alfred Adler",
    field: "จิตวิทยาปัจเจกบุคคล",
    era: "1870–1937",
    quote: "ความรู้สึกว่าตัวเองด้อยกว่าคนอื่น ไม่ใช่จุดจบ แต่เป็นแรงที่ผลักให้เราโตขึ้นได้",
    application: "แทนที่จะเทียบกับคนอื่น ลองเทียบกับตัวเองเมื่อเดือนที่แล้ว",
    category: "courage",
    avatar: { skin: SKIN, hair: GRAY, hairStyle: "receding", glasses: "halfmoon", face: "round" },
  },
  {
    kind: "quote",
    verbatim: false,
    id: "piaget",
    name: "ฌ็อง ปิอาเช่",
    nameEn: "Jean Piaget",
    field: "จิตวิทยาพัฒนาการทางความคิด",
    era: "1896–1980",
    quote: "เด็กไม่ได้คิดผิด แต่คิดด้วยเครื่องมือที่ยังไม่ครบ แล้วค่อย ๆ สร้างมันขึ้นเอง",
    application: "เรื่องที่เมื่อก่อนงงมาก วันนี้อาจเข้าใจแล้ว ลองย้อนไปอ่านใหม่ดู",
    category: "growth",
    avatar: { skin: SKIN, hair: WHITE, hairStyle: "wild", glasses: "round", face: "square" },
  },
  {
    kind: "quote",
    verbatim: false,
    id: "vygotsky",
    name: "เลฟ วีก็อตสกี",
    nameEn: "Lev Vygotsky",
    field: "จิตวิทยาสังคม-วัฒนธรรม",
    era: "1896–1934",
    quote: "สิ่งที่วันนี้ยังทำเองไม่ได้ แต่ทำได้เมื่อมีคนช่วย คือสิ่งที่พรุ่งนี้จะทำเองได้",
    application: "ติดตรงไหนแล้วขอให้เพื่อนหรือครูช่วยดู ไม่ใช่การโกง แต่คือวิธีที่เราโต",
    category: "growth",
    avatar: { skin: SKIN, hair: DARK, hairStyle: "swept", age: "adult", face: "long" },
  },
  {
    kind: "quote",
    verbatim: false,
    id: "bandura",
    name: "อัลเบิร์ต แบนดูรา",
    nameEn: "Albert Bandura",
    field: "ทฤษฎีการเรียนรู้ทางสังคม",
    era: "1925–2021",
    quote: "ความเชื่อว่าเราทำได้ เปลี่ยนผลลัพธ์จริง เพราะมันเปลี่ยนว่าเราจะลองนานแค่ไหน",
    application: "นึกถึงเรื่องหนึ่งที่เคยคิดว่าทำไม่ได้ แล้วสุดท้ายก็ทำได้ เก็บไว้เตือนตัวเอง",
    category: "courage",
    avatar: { skin: SKIN, hair: SILVER, hairStyle: "sides", glasses: "square", face: "square" },
  },
  {
    kind: "quote",
    verbatim: false,
    id: "skinner",
    name: "บี. เอฟ. สกินเนอร์",
    nameEn: "B. F. Skinner",
    field: "พฤติกรรมนิยม",
    era: "1904–1990",
    quote: "พฤติกรรมที่ได้ผลตอบกลับที่ดี มักถูกทำซ้ำ นิสัยจึงสร้างได้ด้วยการออกแบบ",
    application: "อยากติดนิสัยใหม่ ให้ทำต่อจากสิ่งที่ทำอยู่แล้วทุกวัน เช่น อ่านหลังแปรงฟัน",
    category: "growth",
    avatar: { skin: SKIN, hair: WHITE, hairStyle: "sides", glasses: "square", face: "oval" },
  },
  {
    kind: "quote",
    verbatim: false,
    id: "beck",
    name: "แอรอน เบ็ค",
    nameEn: "Aaron Beck",
    field: "ผู้ก่อตั้งการบำบัดความคิดและพฤติกรรม (CBT)",
    era: "1921–2021",
    quote: "ไม่ใช่เหตุการณ์ที่ทำให้เราทุกข์ แต่เป็นสิ่งที่เราคิดเกี่ยวกับเหตุการณ์นั้น",
    application: "จดความคิดที่แวบเข้ามาตอนรู้สึกแย่ แล้วถามว่ามีหลักฐานอะไรค้านมันบ้าง",
    category: "self",
    avatar: { skin: SKIN, hair: WHITE, hairStyle: "full", glasses: "square", bowtie: true, face: "oval" },
  },
  {
    kind: "quote",
    verbatim: false,
    id: "bowlby",
    name: "จอห์น โบลบี",
    nameEn: "John Bowlby",
    field: "ทฤษฎีความผูกพัน",
    era: "1907–1990",
    quote: "คนเราออกไปเจอโลกได้ไกลขึ้น เมื่อรู้ว่ามีที่ให้กลับมา",
    application: "นึกถึงคนหนึ่งคนที่เรากลับไปหาได้เสมอ แล้วทักเขาสักข้อความ",
    category: "hope",
    avatar: { skin: SKIN, hair: GRAY, hairStyle: "receding", glasses: "round", face: "long" },
  },
  {
    kind: "quote",
    verbatim: false,
    id: "seligman",
    name: "มาร์ติน เซลิกแมน",
    nameEn: "Martin Seligman",
    field: "จิตวิทยาเชิงบวก",
    era: "เกิด 1942",
    quote: "ความสิ้นหวังเป็นสิ่งที่เรียนรู้มาได้ และการมองโลกอีกแบบก็เรียนรู้ได้เหมือนกัน",
    application: "เจอเรื่องแย่ ลองถามว่ามันจริงกับทุกเรื่องในชีวิตเราไหม หรือแค่เรื่องนี้",
    category: "hope",
    avatar: { skin: SKIN, hair: SILVER, hairStyle: "receding", glasses: "square", face: "square" },
  },
  {
    kind: "quote",
    verbatim: false,
    id: "csikszentmihalyi",
    name: "มิฮาย ชิกเซนต์มิฮายี",
    nameEn: "Mihaly Csikszentmihalyi",
    field: "ผู้เสนอแนวคิดภาวะลื่นไหล (Flow)",
    era: "1934–2021",
    quote: "เรามีความสุขที่สุดตอนจมอยู่กับสิ่งที่ยากพอดี ไม่ง่ายจนเบื่อ ไม่ยากจนท้อ",
    application: "งานที่เบื่อ ลองเพิ่มความท้าทายนิดหนึ่ง งานที่ท้อ ลองซอยให้เล็กลง",
    category: "growth",
    avatar: { skin: SKIN, hair: WHITE, hairStyle: "sides", beard: "goatee", glasses: "square", face: "round" },
  },
  {
    kind: "quote",
    verbatim: false,
    id: "dweck",
    name: "แคโรล ดเว็ค",
    nameEn: "Carol Dweck",
    field: "ผู้เสนอแนวคิดกรอบคิดแบบเติบโต",
    era: "เกิด 1946",
    quote: "คำว่า ยังทำไม่ได้ ต่างจาก ทำไม่ได้ แค่คำเดียว แต่เปลี่ยนทั้งเส้นทาง",
    application: "เวลาจะพูดว่าเราทำไม่ได้ ให้เติมคำว่า ยัง ลงไปข้างหน้า",
    category: "growth",
    avatar: { skin: SKIN, hair: DARK, hairStyle: "bob", collar: "plain", face: "oval" },
  },
  {
    kind: "quote",
    verbatim: false,
    id: "neff",
    name: "คริสติน เนฟฟ์",
    nameEn: "Kristin Neff",
    field: "นักวิจัยด้านความเมตตาต่อตนเอง",
    era: "เกิด 1966",
    quote: "การใจดีกับตัวเองไม่ได้ทำให้เราอ่อนแอลง แต่ทำให้เราลุกได้เร็วขึ้น",
    application: "ตอนทำพลาด ลองพูดกับตัวเองแบบที่จะพูดกับเพื่อนที่ทำพลาดเรื่องเดียวกัน",
    category: "acceptance",
    avatar: { skin: SKIN, hair: SANDY, hairStyle: "long", age: "adult", collar: "plain", face: "long" },
  },
  {
    kind: "quote",
    verbatim: false,
    id: "linehan",
    name: "มาร์ชา ลิเนฮาน",
    nameEn: "Marsha Linehan",
    field: "ผู้พัฒนาการบำบัดแบบ DBT",
    era: "เกิด 1943",
    quote: "ยอมรับตัวเองอย่างที่เป็น กับพยายามเปลี่ยนแปลง เป็นสองอย่างที่ทำพร้อมกันได้",
    application: "ไม่ต้องเลือกระหว่าง ฉันโอเคแล้ว กับ ฉันอยากดีขึ้น จริงได้ทั้งคู่",
    category: "acceptance",
    avatar: { skin: SKIN, hair: SILVER, hairStyle: "bob", glasses: "square", collar: "plain", face: "square" },
  },
  {
    kind: "quote",
    verbatim: false,
    id: "kabat-zinn",
    name: "จอน คาบัต-ซินน์",
    nameEn: "Jon Kabat-Zinn",
    field: "ผู้ก่อตั้งโปรแกรมเจริญสติลดความเครียด (MBSR)",
    era: "เกิด 1944",
    quote: "การมีสติคือการตั้งใจอยู่กับปัจจุบัน โดยไม่รีบตัดสินว่ามันดีหรือไม่ดี",
    application: "หายใจเข้าออกสามรอบ แล้วสังเกตว่าตอนนี้ร่างกายรู้สึกยังไง โดยไม่ต้องรีบแก้",
    category: "stress",
    avatar: { skin: SKIN, hair: GRAY, hairStyle: "sides", beard: "goatee", glasses: "round", face: "long" },
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
    application: "ถ้ายังไม่พร้อมเล่าให้คนจริงฟัง เล่าให้อุ่นฟังก่อนก็ได้ ไม่มีใครอ่านนอกจากเครื่องนี้",
    category: "hope",
    action: { label: "ไปคุยกับน้องอุ่น", href: "/chatbot" },
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
