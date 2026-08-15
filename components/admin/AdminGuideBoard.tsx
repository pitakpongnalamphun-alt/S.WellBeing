"use client";

import { useState } from "react";

import {
  ArrowDown,
  CheckCircle2,
  ClipboardCheck,
  HeartHandshake,
  MessageCircleHeart,
  Phone,
  Printer,
  ShieldAlert,
  UserCheck,
  XCircle,
  MessagesSquare,
  Siren,
  GraduationCap,
  BookOpen,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { BullyingProtocol } from "@/components/admin/BullyingProtocol";
import { STAFF_ROLE_META } from "@/data/staff";
import { SLA_HOURS } from "@/lib/store/useCasesStore";

/**
 * คู่มือการดูแล — หน้าเดียวที่ตอบว่า "ระบบตรวจพบแล้ว ยังไงต่อ?"
 *
 * ครอบคลุม: ผังการไหลของเคสตั้งแต่รับแจ้งถึงปิดเคส (ตรงกับสถานะจริงในระบบ),
 * บทบาทของแต่ละตำแหน่ง (ตรงกับสิทธิ์ RBAC จริง), แนวทางการคุยกับนักเรียน
 * แบบ ควรทำ/ไม่ควรทำ, เกณฑ์ความเร่งด่วน และช่องทางส่งต่อภายนอก
 *
 * ตัวเลข SLA ดึงจาก store จริง — เอกสารจะไม่มีวันเล่าคนละเรื่องกับระบบ
 */

const HOTLINES = [
  { label: "สายด่วนสุขภาพจิต", number: "1323", note: "ตลอด 24 ชม. ฟรี" },
  { label: "การแพทย์ฉุกเฉิน", number: "1669", note: "เมื่อมีอันตรายต่อร่างกาย" },
  { label: "เหตุด่วนเหตุร้าย", number: "191", note: "เมื่อมีเหตุอันตรายเฉพาะหน้า" },
  { label: "สมาคมสะมาริตันส์", number: "02-113-6789", note: "รับฟังผู้มีความคิดฆ่าตัวตาย" },
];

const FLOW_STEPS = [
  {
    title: "นักเรียนส่งเรื่องเข้ามา",
    detail:
      "จากหน้าแจ้งเหตุ, ปุ่ม SOS, หรือการยินยอมส่งผลประเมินใจ — ระบบออกรหัสติดตาม (SWB-XXXXXX) ให้นักเรียนทุกครั้ง",
  },
  {
    title: `รับเรื่อง (สถานะ "รอรับเรื่อง" → "กำลังดูแล")`,
    detail: `กรอบเวลารับเรื่อง: เรื่องด่วน ${SLA_HOURS.urgent} ชั่วโมง · เรื่องขอเวลาเตรียมใจ ${SLA_HOURS.prepare} ชั่วโมง — แดชบอร์ดจะเตือนเมื่อใกล้/เกินกำหนด การกดรับเรื่องคือคำสัญญาว่า "มีคนเห็นแล้วนะ"`,
  },
  {
    title: "มอบหมายผู้รับผิดชอบ",
    detail:
      "เลือกครูที่เหมาะกับเรื่อง (ดูตารางบทบาทด้านล่าง) — คะแนนความเร่งด่วนในหน้าจัดการเคสช่วยจัดลำดับว่าควรดูเคสไหนก่อน",
  },
  {
    title: "พูดคุยและช่วยเหลือ",
    detail:
      "เปิดดูข้อมูลติดต่อเฉพาะเมื่อจำเป็น (ระบบบันทึกการเปิดดูทุกครั้ง) นัดหมายผ่านระบบนัดพูดคุย และจดบันทึกติดตามไว้ในเคสเสมอ",
  },
  {
    title: `ปิดเคส (สถานะ "คลี่คลายแล้ว" หรือ "ติดตามผลระยะยาว")`,
    detail:
      "เรื่องที่จบแล้วปิดเป็น “คลี่คลายแล้ว” — เรื่องที่ต้องเฝ้าดูต่อ (เช่น ซึมเศร้า การกลั่นแกล้งซ้ำ) ใช้ “ติดตามผลระยะยาว” พร้อมนัดติดตามเป็นระยะ",
  },
];

const ROLE_DUTIES: {
  role: keyof typeof STAFF_ROLE_META;
  duties: string;
  handles: string;
}[] = [
  {
    role: "counselor",
    duties: "ด่านแรกของเคสทั่วไป การเรียน ครอบครัว ความสัมพันธ์ และเคสยินยอมส่งผลประเมินใจ",
    handles: "จัดการเคส · นัดพูดคุย · เฝ้าระวัง SOS",
  },
  {
    role: "psychologist",
    duties: "เคสอ่อนไหว ซึมเศร้า/วิตกกังวลระดับควรดูแลขึ้นไป การประเมินเชิงลึก และรับส่งต่อจากครูแนะแนว",
    handles: "จัดการเคส · นัดพูดคุย · เฝ้าระวัง SOS",
  },
  {
    role: "admin",
    duties:
      "ดูแลบัญชี สิทธิ์ และสุขภาพของระบบ เห็นเฉพาะสถิติภาพรวม — ระบบออกแบบไม่ให้เห็นข้อมูลเคสรายบุคคล (PDPA)",
    handles: "บัญชีเจ้าหน้าที่ · บันทึกการเข้าถึง · สถิติรวม",
  },
];

const TALK_DO = [
  "ฟังให้จบก่อน — ให้เด็กเล่าด้วยจังหวะของเขา ไม่ขัด ไม่รีบสรุป",
  "ขอบคุณที่กล้าบอก — “ขอบคุณนะที่ไว้ใจครู เรื่องนี้ไม่ง่ายเลยที่จะพูด”",
  "ถามความต้องการ — “อยากให้ครูช่วยยังไงดี” ให้เด็กมีส่วนเลือกทางแก้",
  "บอกขอบเขตความลับตรง ๆ — เก็บเป็นความลับได้ ยกเว้นเมื่อมีอันตรายต่อชีวิต ซึ่งครูจะบอกก่อนว่าจะเล่าให้ใครฟัง เพื่ออะไร",
  "ถามเรื่องการทำร้ายตัวเองได้ตรง ๆ — “มีช่วงไหนที่คิดอยากทำร้ายตัวเองไหม” แนวทางสากลยืนยันว่าการถามไม่ได้กระตุ้น แต่เปิดประตูให้ช่วยได้ทัน",
  "นัดติดตามเสมอ — จบการคุยด้วยวันเวลาที่จะเจอกันครั้งถัดไป ไม่ปล่อยให้เรื่องหายเงียบ",
];

const TALK_DONT = [
  "ไม่โทษเด็ก — ห้ามพูด “ทำไมไม่บอกตั้งแต่แรก” “เธอก็มีส่วนนะ” ไม่ว่ากรณีใด",
  "ไม่สอบสวนเหมือนคดี — การไล่ถามหาหลักฐานทำให้เด็กปิดปากถาวร",
  "ไม่สัญญาว่าจะลับ 100% — สัญญาที่รักษาไม่ได้ทำลายความไว้ใจมากกว่าบอกความจริงแต่แรก",
  "ไม่เล่าต่อในวงที่ไม่เกี่ยวข้อง — แชร์เฉพาะผู้ที่มีหน้าที่ช่วยเหลือโดยตรงเท่านั้น",
  "ไม่ด่วนสั่งสอนหรือเทียบ “สมัยครู...” — เด็กต้องการคนฟัง ไม่ใช่บทเรียนซ้ำ",
  "ไม่ปล่อยเด็กที่มีความคิดทำร้ายตัวเองอยู่คนเดียว — แม้เด็กจะบอกว่า “ไม่เป็นไรแล้ว”",
];

/**
 * คู่มือรายหมวด — id/label/อีโมจิ ตรงกับหมวดจริงในหน้าแจ้งเหตุ + เคสยินยอมส่งผลประเมิน
 * แต่ละหมวดมีธรรมชาติของบทสนทนาไม่เหมือนกัน: ประโยคเปิด สิ่งที่ต้องจับ และกับดักที่ห้ามเหยียบ
 */
const CATEGORY_TALKS: {
  emoji: string;
  label: string;
  open: string;
  keys: string[];
  avoid: string[];
  refer: string;
}[] = [
  {
    emoji: "💬",
    label: "โดนกลั่นแกล้ง / ไซเบอร์บูลลี่",
    open: "“ขอบคุณที่บอกครูนะ สิ่งที่เกิดขึ้นไม่ใช่ความผิดของเธอ เล่าให้ครูฟังได้เต็มที่เลย”",
    keys: [
      "เชื่อก่อนสงสัย — ประโยค “เรื่องแค่นี้เอง” ปิดปากเด็กถาวร",
      "ถามความถี่ ระยะเวลา และช่องทาง (ต่อหน้า/ออนไลน์) เพื่อประเมินความรุนแรง",
      "ไซเบอร์: ชวนเก็บภาพหน้าจอไว้เป็นหลักฐาน แต่อย่าให้เด็กกลับไปตอบโต้",
      "วางแผนความปลอดภัยรายวัน — จุดเสี่ยง เวลาเสี่ยง และเพื่อน/ครูที่อยู่ใกล้ได้",
    ],
    avoid: [
      "อย่าจับสองฝ่ายมา “เคลียร์กัน” ทันที — เสี่ยงถูกแก้แค้นและมักทำให้แย่ลง",
      "อย่าจบเรื่องด้วยคำสั่ง “อยู่ห่าง ๆ เขาไว้” โดยไม่มีแผนอะไรรองรับ",
    ],
    refer:
      "ประสานฝ่ายปกครองเรื่องพฤติกรรมผู้กระทำ ควบคู่การดูแลใจผู้ถูกกระทำ และนัดติดตามใน 1–2 สัปดาห์ — การกลั่นแกล้งมักเกิดซ้ำ",
  },
  {
    emoji: "📚",
    label: "เครียดเรื่องเรียน / สอบ",
    open: "“ช่วงนี้เรียนหนักมากเลยใช่ไหม — ตอนนี้อะไรหนักที่สุด”",
    keys: [
      "คำว่า “เครียดสอบ” มักมีของจริงซ่อนอยู่ใต้ — ความคาดหวังของบ้าน การถูกเปรียบเทียบ เรื่องเพื่อน ฟังให้ลึกกว่าเกรด",
      "ช่วยย่อยปัญหาใหญ่เป็นก้าวเล็กที่ทำได้จริงในสัปดาห์นี้ ไม่ใช่แผนสมบูรณ์แบบ",
      "เช็คการนอนและเวลาหน้าจอ — ความเครียดเรียนกับการอดนอนมักมาคู่กัน",
    ],
    avoid: [
      "ห้าม “แค่ตั้งใจอีกนิดก็ทำได้แล้ว” หรือเทียบกับพี่/เพื่อน — เป็นการเพิ่มน้ำหนักบนบ่าเด็ก",
    ],
    refer:
      "พบสัญญาณซึมเศร้าหรือนอนไม่หลับต่อเนื่อง → ชวนทำแบบประเมินใจในแอป และปรึกษานักจิตวิทยา",
  },
  {
    emoji: "🏠",
    label: "ปัญหาที่บ้าน / ครอบครัว",
    open: "“เรื่องที่บ้านเป็นเรื่องที่เล่ายากที่สุดแหละ ขอบคุณที่ไว้ใจครูนะ”",
    keys: [
      "แยกให้ออกระหว่างความขัดแย้งทั่วไป กับความรุนแรง/การทอดทิ้ง — สองอย่างนี้เดินคนละเส้นทาง",
      "เด็กต้องกลับบ้านหลังนั้นทุกวัน — ทุกการกระทำของครูต้องไม่ทำให้เด็กเสี่ยงขึ้นเมื่อถึงบ้าน",
      "ให้เด็กมีส่วนตัดสินใจทุกขั้น: จะติดต่อใคร บอกแค่ไหน เมื่อไหร่",
    ],
    avoid: [
      "อย่าโทรหาผู้ปกครองทันทีโดยไม่ประเมินและไม่บอกเด็กก่อน — ถ้าต้นเหตุคือความรุนแรงในบ้าน การโทรคือการส่งเด็กกลับไปรับผลนั้นเอง",
    ],
    refer:
      "เสี่ยงความรุนแรงหรือถูกทอดทิ้ง → ปรึกษานักจิตวิทยาและผู้บริหารก่อนติดต่อครอบครัวเสมอ",
  },
  {
    emoji: "⚠️",
    label: "รู้สึกไม่ปลอดภัย",
    open: "“ตอนนี้ปลอดภัยดีไหม — มีใครหรืออะไรที่ทำให้กลัวอยู่หรือเปล่า”",
    keys: [
      "เช็คอันตรายเฉพาะหน้าก่อนเรื่องอื่นทั้งหมด ถ้ามี = เกณฑ์เร่งด่วนทันทีด้านล่าง",
      "ระบุบุคคล จุด และช่วงเวลาเสี่ยงให้ชัด แล้ววางแผนหลบเลี่ยง + คนที่อยู่ด้วยได้",
      "มีการข่มขู่ → บันทึกคำพูด วันเวลา และพยานไว้ในเคสทันที",
    ],
    avoid: [
      "อย่าตัดสินคำขู่ว่า “แค่พูดเล่น” ด้วยตัวเอง — ส่งให้ฝ่ายปกครองตรวจสอบทุกครั้ง",
    ],
    refer:
      "อันตรายเฉพาะหน้า → 191/1669 + แจ้งผู้บริหารตามระเบียบ (ดูเกณฑ์เร่งด่วนทันที)",
  },
  {
    emoji: "✋",
    label: "คุกคามทางเพศ",
    open: "“ขอบคุณที่กล้าบอกครู สิ่งที่เกิดขึ้นไม่ใช่ความผิดของเธอเลย แม้แต่นิดเดียว”",
    keys: [
      "เชื่อเด็กเสมอ — งานของครูคือรับฟังและคุ้มครอง ไม่ใช่พิสูจน์ความจริงแทนตำรวจ",
      "ให้เล่ารายละเอียดเพียงครั้งเดียว จดไว้ให้ครบ — การต้องเล่าซ้ำกับหลายคนคือการเปิดแผลซ้ำ",
      "ถามว่าอยากให้ครูเพศไหนร่วมรับฟัง และบอกเด็กทุกขั้นว่าข้อมูลจะถึงใคร เพื่ออะไร",
    ],
    avoid: [
      "ห้ามทุกคำถามเชิงตำหนิ — การแต่งกาย เวลา สถานที่ “ทำไมไม่ขัดขืน/ไม่หนี” ล้วนต้องห้าม",
      "อย่าจัดให้เผชิญหน้ากับผู้ถูกกล่าวหา ไม่ว่ากรณีใด",
    ],
    refer:
      "เข้าข่ายผิดกฎหมาย → ผู้บริหารตามระเบียบ + นักจิตวิทยาดูแลใจ · ผู้กระทำเป็นคนในบ้าน → ประสานหน่วยงานคุ้มครองเด็ก (สายด่วน 1300) ก่อนติดต่อครอบครัว",
  },
  {
    emoji: "☁️",
    label: "เรื่องอื่น ๆ ที่อึดอัดใจ",
    open: "“เล่าได้ทุกเรื่องเลยนะ ไม่มีเรื่องไหนเล็กเกินไปสำหรับครู”",
    keys: [
      "หมวดนี้มักเป็นเรื่องที่เด็กยังไม่กล้าตั้งชื่อ — ความสัมพันธ์ อกหัก ตัวตน เพศ ฟังกว้าง ๆ อย่าเพิ่งจัดหมวดแทนเขา",
      "เรื่องตัวตนและเพศ: รับฟังโดยไม่ตัดสิน และห้ามเปิดเผยต่อใครโดยเด็กไม่ยินยอมเด็ดขาด",
    ],
    avoid: [
      "อย่ารีบสรุปว่า “ไม่มีอะไร” — เด็กที่เลือกหมวดนี้จำนวนมากกำลังหยั่งเชิงก่อนเล่าเรื่องจริง",
    ],
    refer: "เมื่อเรื่องจริงค่อย ๆ เผยออกมา กลับมาใช้แนวทางของหมวดที่ตรงในคู่มือนี้",
  },
  {
    emoji: "💚",
    label: "ขอรับการดูแล (ผลประเมินใจ)",
    open: "“ครูเห็นผลที่ส่งมาแล้วนะ ขอบคุณที่กล้ากดส่งมาหาครู — ช่วงนี้ใจหนักมาสักพักแล้วใช่ไหม”",
    keys: [
      "การกดยินยอมส่งผลคือก้าวที่กล้าหาญที่สุดของเด็กที่ไม่กล้าพูดต่อหน้า — เริ่มจากความรู้สึก ไม่ใช่ตัวเลข",
      "ดู “เส้นทางประเมิน” ในเคสประกอบเสมอ เช่น 9Q รุนแรงแม้ 8Q จะเป็นศูนย์",
      "เช็คการนอน การกิน และความคิดทำร้ายตัวเองอย่างนุ่มนวลทุกครั้ง แม้ผลหลักจะเป็นความเครียด",
    ],
    avoid: [
      "อย่าเปิดด้วย “ทำไมคะแนนเยอะจัง” — ผลประเมินคือประตูเข้าสู่บทสนทนา ไม่ใช่คำพิพากษา",
    ],
    refer: "ระดับควรดูแลขึ้นไป → นักจิตวิทยาร่วมดูแลตั้งแต่ต้น และนัดติดตามต่อเนื่อง",
  },
];

const SEVERITY_TIERS = [
  {
    tone: "border-l-rose-500",
    chip: "bg-rose-50 text-rose-700 ring-rose-200",
    title: "เร่งด่วนทันที — ทำเดี๋ยวนี้",
    when: "SOS · มีความคิด/แผนทำร้ายตัวเอง (8Q ระดับปานกลางขึ้นไป หรือมีแผนชัด) · ถูกทำร้ายร่างกาย/คุกคามทางเพศ · อยู่ในอันตรายเฉพาะหน้า",
    actions: [
      "อยู่กับนักเรียน อย่าปล่อยให้อยู่คนเดียวแม้แต่ช่วงสั้น ๆ",
      "โทร 1323 คู่สายกับนักเรียน หรือ 1669 เมื่อมีอันตรายต่อร่างกาย",
      "แจ้งผู้บริหารและผู้ปกครองตามระเบียบโรงเรียน (บอกนักเรียนก่อนว่าจะแจ้งใคร เพื่ออะไร)",
      "บันทึกเหตุการณ์ลงเคสทันทีที่สถานการณ์ปลอดภัย",
    ],
  },
  {
    tone: "border-l-amber-500",
    chip: "bg-amber-50 text-amber-700 ring-amber-200",
    title: `ควรดูแลเร็ว — ภายใน ${SLA_HOURS.prepare} ชั่วโมง`,
    when: "เคสเร่งด่วนจากหน้าแจ้งเหตุ · ผลประเมินระดับ “ควรดูแล” (ซึมเศร้า/เครียด/วิตกกังวลสูง) · เคสยินยอมส่งผลประเมินใจ",
    actions: [
      "รับเรื่องในระบบก่อน แล้วนัดคุยรายบุคคลโดยเร็ว",
      "เคสซึมเศร้า/อ่อนไหว ปรึกษานักจิตวิทยาร่วมดูแลตั้งแต่ต้น",
      "เช็คสัญญาณการทำร้ายตัวเองทุกครั้ง แม้เรื่องที่แจ้งดูเป็นเรื่องอื่น",
    ],
  },
  {
    tone: "border-l-mint-500",
    chip: "bg-mint-50 text-mint-700 ring-mint-200",
    title: "เฝ้าระวังต่อเนื่อง",
    when: "ผลประเมินระดับเฝ้าระวัง · เคสคลี่คลายแล้วแต่เพิ่งผ่านเรื่องหนัก · อารมณ์ภาพรวมของห้อง/ชั้นเรียนมีแนวโน้มลง",
    actions: [
      "นัดติดตามเป็นระยะ และใช้สถานะ “ติดตามผลระยะยาว” ในระบบ",
      "ชวนใช้เครื่องมือในแอป — เช็คอินอารมณ์ ฝึกหายใจ เกมฝึกทักษะใจ",
      "ดูสถิติแนวโน้มรายเดือนประกอบ เพื่อวางแผนกิจกรรมป้องกันทั้งระดับชั้น",
    ],
  },
];

const ONBOARD_CHECKLIST = [
  "อ่านคู่มือหน้านี้จนจบ และทดลองเดินเรื่องจริง 1 รอบ: แจ้งเหตุ (ฝั่งนักเรียน) → รับเรื่อง → มอบหมาย → บันทึก → ปิดเคส",
  "ท่องเกณฑ์ “เร่งด่วนทันที” ให้ขึ้นใจ — โดยเฉพาะกติกาไม่ปล่อยเด็กอยู่คนเดียว และเบอร์ 1323 / 1669",
  "เข้าใจหลัก PDPA ของระบบ: เปิดดูข้อมูลติดต่อเฉพาะเมื่อจำเป็น ทุกการเปิดดูถูกบันทึก และสถิติทั้งหมดไม่ระบุตัวตน",
  "ฝึกประโยคเปิดบทสนทนา ควรทำ/ไม่ควรทำ กับเพื่อนครูก่อนคุยเคสจริงครั้งแรก",
];

const TOC = [
  { id: "flow", label: "เส้นทางของเคส", Icon: ClipboardCheck },
  { id: "roles", label: "ใครรับผิดชอบอะไร", Icon: UserCheck },
  { id: "talk", label: "วิธีคุยกับนักเรียน", Icon: HeartHandshake },
  { id: "category", label: "คุยตามหมวดปัญหา", Icon: MessagesSquare },
  { id: "bullying", label: "การกลั่นแกล้ง", Icon: BookOpen },
  { id: "severity", label: "ความเร่งด่วน · ส่งต่อ", Icon: Siren },
  { id: "onboard", label: "เตรียมครูใหม่", Icon: GraduationCap },
] as const;

type TabId = (typeof TOC)[number]["id"];

export function AdminGuideBoard() {
  const [tab, setTab] = useState<TabId>("flow");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display th:leading-snug text-[1.6rem] font-bold text-ink">
            คู่มือการดูแล
          </h1>
          <p className="mt-1 text-[0.88rem] text-ink-soft">
            ระบบตรวจพบแล้ว — ต่อจากนี้คือหน้าที่ของคน: ใครทำอะไร เมื่อไหร่ และคุยกับนักเรียนอย่างไร
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[0.82rem] font-medium text-ink-soft ring-1 ring-neutral-200 transition hover:text-ink hover:ring-neutral-300 print:hidden"
        >
          <Printer className="size-3.5" aria-hidden="true" />
          พิมพ์ / บันทึก PDF
        </button>
      </header>

      <Card className="flex items-start gap-3 border-l-4 border-l-lavender-400 p-4">
        <HeartHandshake className="mt-0.5 size-5 shrink-0 text-lavender-500" aria-hidden="true" />
        <p className="text-[0.86rem] leading-relaxed text-ink">
          <span className="font-semibold">ครูคือด่านแรก ไม่ใช่นักบำบัด</span> — หน้าที่ของเราคือรับฟัง
          ประคอง และเชื่อมนักเรียนไปถึงความช่วยเหลือที่ถูกต้องให้เร็วที่สุด
          ไม่ใช่รักษาเองทั้งหมด การส่งต่อคือความเป็นมืออาชีพ ไม่ใช่ความล้มเหลว
        </p>
      </Card>

      {/* สารบัญ — ครูที่เปิดมาเพราะมีคำถามเดียว ต้องเห็นตั้งแต่แรกว่าคู่มือมีอะไรบ้าง
          และกดไปที่หมวดนั้นได้เลย ไม่ใช่เลื่อนหาเอง */}
      <nav className="sticky top-2 z-10 -mx-1 overflow-x-auto rounded-2xl bg-white/95 p-1.5 shadow-sm ring-1 ring-neutral-200 backdrop-blur print:hidden">
        <ul className="flex gap-1">
          {TOC.map(({ id, label, Icon }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => setTab(id)}
                aria-current={tab === id ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 text-[0.82rem] font-semibold transition",
                  tab === id
                    ? "bg-mint-600 text-white shadow-sm"
                    : "text-ink-soft hover:bg-neutral-100 hover:text-ink",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* หมวด: flow */}
      <div className={cn(tab === "flow" ? "block" : "hidden", "print:block")}>
        {/* ── ④ ผังการไหลของเคส ─────────────────────────────────────────── */}
        <Card className="p-5">
          <h2 className="flex items-center gap-2 text-[0.95rem] font-semibold text-ink">
            <ClipboardCheck className="size-4 text-mint-600" aria-hidden="true" />
            เส้นทางของหนึ่งเคส — ตั้งแต่รับแจ้งจนปิดเรื่อง
          </h2>
          <ol className="mt-4 space-y-1">
            {FLOW_STEPS.map((s, i) => (
              <li key={s.title}>
                <div className="flex gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-mint-100 text-[0.78rem] font-bold text-mint-700">
                    {i + 1}
                  </span>
                  <div className="min-w-0 pb-1">
                    <p className="text-[0.88rem] font-semibold text-ink">{s.title}</p>
                    <p className="mt-0.5 text-[0.8rem] leading-relaxed text-ink-soft">{s.detail}</p>
                  </div>
                </div>
                {i < FLOW_STEPS.length - 1 && (
                  <ArrowDown className="ml-1.5 my-1 size-3.5 text-neutral-300" aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {/* หมวด: roles */}
      <div className={cn(tab === "roles" ? "block" : "hidden", "print:block")}>
        {/* ── ④ ใครรับผิดชอบอะไร ────────────────────────────────────────── */}
        <Card className="p-5">
          <h2 className="flex items-center gap-2 text-[0.95rem] font-semibold text-ink">
            <UserCheck className="size-4 text-sky-600" aria-hidden="true" />
            ใครรับผิดชอบอะไร
          </h2>
          <p className="mt-0.5 text-[0.76rem] text-ink-soft">
            ตรงกับสิทธิ์การเข้าถึงจริงของระบบ — แต่ละบทบาทเห็นเท่าที่งานของตัวเองจำเป็น
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {ROLE_DUTIES.map(({ role, duties, handles }) => {
              const meta = STAFF_ROLE_META[role];
              return (
                <div key={role} className="rounded-2xl bg-neutral-50 p-4 ring-1 ring-neutral-200">
                  <span className={`rounded-full px-2.5 py-1 text-[0.72rem] font-semibold ${meta.tint}`}>
                    {meta.label}
                  </span>
                  <p className="mt-2.5 text-[0.8rem] leading-relaxed text-ink">{duties}</p>
                  <p className="mt-2 text-[0.7rem] text-ink-mute">เมนูที่ใช้: {handles}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[0.76rem] leading-relaxed text-ink-mute">
            เคสส่งต่อกันได้เสมอผ่านช่อง “มอบหมาย” ในหน้าจัดการเคส — เรื่องความปลอดภัย
            (กลั่นแกล้ง คุกคาม เหตุ SOS) ประสานครูฝ่ายปกครองตามระเบียบโรงเรียนควบคู่กับการดูแลใจเสมอ
          </p>
        </Card>
      </div>

      {/* หมวด: talk */}
      <div className={cn(tab === "talk" ? "block" : "hidden", "print:block")}>
        {/* ── ③ แนวทางการคุยกับนักเรียน ─────────────────────────────────── */}
        <Card className="p-5">
          <h2 className="flex items-center gap-2 text-[0.95rem] font-semibold text-ink">
            <MessageCircleHeart className="size-4 text-rose-500" aria-hidden="true" />
            คุยกับนักเรียนอย่างไรให้เขากล้าเล่าต่อ
          </h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-emerald-50/60 p-4 ring-1 ring-emerald-200">
              <p className="flex items-center gap-1.5 text-[0.84rem] font-bold text-emerald-800">
                <CheckCircle2 className="size-4" aria-hidden="true" /> ควรทำ
              </p>
              <ul className="mt-2.5 space-y-2">
                {TALK_DO.map((t) => (
                  <li key={t} className="flex gap-2 text-[0.8rem] leading-relaxed text-ink">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-400" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-rose-50/60 p-4 ring-1 ring-rose-200">
              <p className="flex items-center gap-1.5 text-[0.84rem] font-bold text-rose-800">
                <XCircle className="size-4" aria-hidden="true" /> ไม่ควรทำ
              </p>
              <ul className="mt-2.5 space-y-2">
                {TALK_DONT.map((t) => (
                  <li key={t} className="flex gap-2 text-[0.8rem] leading-relaxed text-ink">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-rose-400" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* หมวด: category */}
      <div className={cn(tab === "category" ? "block" : "hidden", "print:block")}>
        {/* ── ③ วิธีคุยแยกตามหมวดปัญหา ──────────────────────────────────── */}
        <Card className="p-5">
          <h2 className="flex items-center gap-2 text-[0.95rem] font-semibold text-ink">
            <MessageCircleHeart className="size-4 text-lavender-500" aria-hidden="true" />
            คุยแต่ละเรื่องอย่างไร — แยกตามหมวดปัญหา
          </h2>
          <p className="mt-0.5 text-[0.76rem] text-ink-soft">
            หมวดตรงกับหน้าแจ้งเหตุของนักเรียน — แต่ละเรื่องมีประโยคเปิด จุดที่ต้องจับ และกับดักที่ต่างกัน
          </p>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {CATEGORY_TALKS.map((c) => (
              <div key={c.label} className="rounded-2xl bg-neutral-50 p-4 ring-1 ring-neutral-200">
                <p className="text-[0.86rem] font-bold text-ink">
                  <span aria-hidden="true">{c.emoji}</span> {c.label}
                </p>
                <p className="mt-2 rounded-xl bg-white p-2.5 text-[0.78rem] italic leading-relaxed text-ink-soft ring-1 ring-neutral-200">
                  เปิดบทสนทนา: {c.open}
                </p>
                <ul className="mt-2.5 space-y-1.5">
                  {c.keys.map((k) => (
                    <li key={k} className="flex gap-2 text-[0.78rem] leading-relaxed text-ink">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-mint-400" />
                      {k}
                    </li>
                  ))}
                  {c.avoid.map((a) => (
                    <li key={a} className="flex gap-2 text-[0.78rem] leading-relaxed text-rose-800">
                      <XCircle className="mt-0.5 size-3.5 shrink-0 text-rose-400" aria-hidden="true" />
                      {a}
                    </li>
                  ))}
                </ul>
                <p className="mt-2.5 border-t border-neutral-200 pt-2 text-[0.74rem] leading-relaxed text-ink-mute">
                  <span className="font-semibold text-ink-soft">ส่งต่อ:</span> {c.refer}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* หมวด: bullying */}
      <div className={cn(tab === "bullying" ? "block" : "hidden", "print:block")}>
        {/* ── ③ แนวทางดูแลการกลั่นแกล้งสองฝั่ง ───────────────────────────── */}
        <BullyingProtocol />
      </div>

      {/* หมวด: severity */}
      <div className={cn(tab === "severity" ? "block" : "hidden", "print:block")}>
        {/* ── ③ เกณฑ์ความเร่งด่วน + ส่งต่อภายนอก ────────────────────────── */}
        <Card className="p-5">
          <h2 className="flex items-center gap-2 text-[0.95rem] font-semibold text-ink">
            <ShieldAlert className="size-4 text-rose-600" aria-hidden="true" />
            เร่งด่วนแค่ไหน ทำอะไรก่อน
          </h2>
          <div className="mt-3 space-y-3">
            {SEVERITY_TIERS.map((tier) => (
              <div key={tier.title} className={`rounded-2xl border-l-4 ${tier.tone} bg-neutral-50 p-4 ring-1 ring-neutral-200`}>
                <span className={`rounded-full px-2.5 py-1 text-[0.72rem] font-semibold ring-1 ${tier.chip}`}>
                  {tier.title}
                </span>
                <p className="mt-2 text-[0.76rem] leading-relaxed text-ink-mute">
                  <span className="font-semibold text-ink-soft">เมื่อไหร่:</span> {tier.when}
                </p>
                <ul className="mt-1.5 space-y-1">
                  {tier.actions.map((a) => (
                    <li key={a} className="flex gap-2 text-[0.8rem] leading-relaxed text-ink">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-neutral-400" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
  
          <div className="mt-4 rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-200">
            <p className="flex items-center gap-1.5 text-[0.82rem] font-bold text-rose-800">
              <Phone className="size-4" aria-hidden="true" /> สายด่วนที่ต้องมีติดโต๊ะ
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {HOTLINES.map((h) => (
                <p key={h.number} className="text-[0.8rem] text-ink">
                  <span className="font-mono font-bold text-rose-700">{h.number}</span>{" "}
                  {h.label} <span className="text-ink-mute">— {h.note}</span>
                </p>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* หมวด: onboard */}
      <div className={cn(tab === "onboard" ? "block" : "hidden", "print:block")}>
        {/* ── ③ เตรียมครูใหม่ ───────────────────────────────────────────── */}
        <Card className="p-5">
          <h2 className="text-[0.95rem] font-semibold text-ink">เช็คลิสต์เตรียมครูใหม่ก่อนรับเคสจริง</h2>
          <ul className="mt-3 space-y-2">
            {ONBOARD_CHECKLIST.map((c, i) => (
              <li key={c} className="flex gap-2.5 text-[0.82rem] leading-relaxed text-ink">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-[0.7rem] font-bold text-ink-soft ring-1 ring-neutral-200">
                  {i + 1}
                </span>
                {c}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <p className="text-[0.72rem] leading-relaxed text-ink-mute">
        แนวทางนี้เรียบเรียงตามกรอบระบบดูแลช่วยเหลือนักเรียน (สพฐ.) และแนวทางการดูแลสุขภาพจิตวัยรุ่นของกรมสุขภาพจิต
        กระทรวงสาธารณสุข — ใช้เป็นแนวปฏิบัติเบื้องต้นในโรงเรียน ไม่ทดแทนการอบรมจากผู้เชี่ยวชาญ
        และควรทบทวนร่วมกับนักจิตวิทยาของโรงเรียนอย่างน้อยปีละครั้ง
      </p>
    </div>
  );
}

export default AdminGuideBoard;
