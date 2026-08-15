"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Ban,
  BookOpen,
  Check,
  Clock3,
  MessageSquareQuote,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

import { Card } from "@/components/ui/Card";

/**
 * คู่มือดูแลการกลั่นแกล้ง — สองฝั่ง
 *
 * โครงของหน้า: พื้นฐานที่ใช้ร่วมกัน → เลือกฝั่ง → เนื้อหาของฝั่งนั้น → แหล่งอ้างอิง
 *
 * ทำไมต้องมีฝั่งผู้กระทำ
 * การดูแลเฉพาะคนที่ถูกแกล้งช่วยคนที่เจ็บได้ แต่ไม่ได้หยุดต้นทาง เด็กที่แกล้งคนอื่น
 * ยังอยู่ในโรงเรียนเดิมและจะทำกับคนถัดไป
 *
 * ทำไมต้องอ้างอิงรายหัวข้อ ไม่ใช่กองรวมท้ายหน้า
 * ครูที่เอาคู่มือไปใช้จะถูกถามว่า "เอามาจากไหน" โดยเฉพาะข้อที่ขัดกับสิ่งที่โรงเรียน
 * ทำกันมา เช่น การห้ามไกล่เกลี่ยและการห้ามใช้การพักการเรียนเป็นคำตอบ ถ้าอ้างอิง
 * กองอยู่ท้ายหน้า ครูจะชี้ไม่ได้ว่าข้อไหนมาจากแหล่งไหน เลขอ้างอิงจึงติดอยู่กับ
 * ทุกหัวข้อ และหัวข้อไหนไม่มีเลข แปลว่าเป็นแนวปฏิบัติของโรงเรียนเอง ไม่ใช่ข้อสรุป
 * จากงานวิจัย — ความต่างนี้ต้องเห็นได้จากหน้าจอ ไม่ใช่ต้องเดา
 *
 * กติกาของไฟล์นี้: ใส่ได้เฉพาะแหล่งที่ตรวจแล้วว่ามีอยู่จริงและอ่านเนื้อหาแล้ว
 * สิ่งที่ตั้งใจไม่ใส่คือสถิติ "ไทยกลั่นแกล้งสูงอันดับสองของโลก" ซึ่งถูกอ้างซ้ำมากในสื่อไทย
 * แต่ตามหาต้นทางที่ตรวจสอบได้ไม่เจอ
 */

/* ════════════════════════════════════════════════ แหล่งอ้างอิง */

type Source = { n: number; label: string; org: string; url: string };

const SOURCES: Source[] = [
  {
    n: 1,
    org: "กระทรวงสาธารณสุขสหรัฐอเมริกา",
    label: "StopBullying.gov — Support the Kids Involved · Misdirections in Bullying Prevention",
    url: "https://www.stopbullying.gov/prevention/support-kids-involved",
  },
  {
    n: 2,
    org: "องค์การอนามัยโลก (WHO) และภาคี",
    label: "INSPIRE: Seven Strategies for Ending Violence Against Children",
    url: "https://inspire-strategies.org/inspire-seven-strategies-ending-violence-against-children",
  },
  {
    n: 3,
    org: "UNICEF · WHO · UNESCO",
    label: "School-based violence prevention: a practical handbook",
    url: "https://www.unicef.org/media/58081/file/UNICEF-WHO-UNESCO-handbook-school-based-violence.pdf",
  },
  {
    n: 4,
    org: "UNESCO (2019)",
    label: "Behind the numbers: ending school violence and bullying",
    url: "https://unesdoc.unesco.org/ark:/48223/pf0000366483",
  },
  {
    n: 5,
    org: "กรมสุขภาพจิต กระทรวงสาธารณสุข",
    label: "สายด่วนสุขภาพจิต 1323 (ให้คำปรึกษาฟรี ตลอด 24 ชั่วโมง)",
    url: "https://dmh.go.th/",
  },
];

/** เลขอ้างอิงติดหัวข้อ กดแล้วเลื่อนไปที่รายการท้ายหน้า */
function Cite({ ns }: { ns?: number[] }) {
  if (!ns?.length) return null;
  return (
    <span className="ml-1.5 inline-flex gap-1 align-middle">
      {ns.map((n) => (
        <a
          key={n}
          href={`#swb-src-${n}`}
          className="rounded bg-white/80 px-1.5 text-[0.68rem] font-bold text-ink-mute ring-1 ring-neutral-300 transition hover:text-ink"
          title={SOURCES.find((s) => s.n === n)?.label}
        >
          {n}
        </a>
      ))}
    </span>
  );
}

/* ════════════════════════════════════════════════ ชนิดเนื้อหา */

type Block =
  | { kind: "list"; title: string; tone: "do" | "dont" | "warn"; sources?: number[]; items: string[] }
  | { kind: "timeline"; title: string; sources?: number[]; rows: { when: string; what: string[] }[] }
  | { kind: "script"; title: string; sources?: number[]; lines: { say: string; why: string }[] };

/* ───────────────────────────────── พื้นฐานที่ใช้ร่วมกันทั้งสองฝั่ง */

const BASICS: Block[] = [
  {
    kind: "list",
    title: "อะไรนับว่าเป็นการกลั่นแกล้ง — ต้องครบสามอย่าง",
    tone: "do",
    sources: [1, 4],
    items: [
      "เจตนาทำให้อีกฝ่ายเจ็บ ไม่ว่าจะทางกาย ทางใจ หรือทางสังคม",
      "เกิดซ้ำ ๆ หรือมีแนวโน้มจะเกิดซ้ำ ไม่ใช่เหตุการณ์เดี่ยว ๆ ครั้งเดียว",
      "อำนาจของสองฝ่ายไม่เท่ากัน — กำลัง จำนวนพวก สถานะในห้อง หรือการรู้ความลับของอีกฝ่าย",
      "ถ้าไม่ครบสามข้อ อาจเป็นความขัดแย้งระหว่างเพื่อน ซึ่งใช้วิธีจัดการคนละแบบ การแยกให้ออกตั้งแต่ต้นสำคัญ เพราะการไกล่เกลี่ยใช้ได้กับความขัดแย้ง แต่ใช้กับการกลั่นแกล้งไม่ได้",
    ],
  },
  {
    kind: "list",
    title: "สามกลุ่มที่ต้องแยกให้ออก",
    tone: "warn",
    sources: [1],
    items: [
      "ผู้ถูกกระทำ — ต้องได้ความปลอดภัยและการรับฟังก่อนสิ่งอื่น",
      "ผู้กระทำ — ต้องได้ขอบเขตที่ชัดเจน ผลที่คาดเดาได้ และการสอนทักษะ ไม่ใช่การลงโทษอย่างเดียว",
      "ผู้ที่เป็นทั้งสองอย่าง — เด็กที่ถูกกระทำแล้วไปกระทำต่อ เป็นกลุ่มที่มีความเสี่ยงด้านสุขภาพจิตสูงที่สุด และมักถูกมองข้ามเพราะถูกจัดเป็น “เด็กมีปัญหา” ไปแล้ว ทุกครั้งที่พบผู้กระทำ ต้องคัดกรองว่าเขาเองกำลังถูกกระทำอยู่ด้วยหรือไม่",
      "คนที่เห็นเหตุการณ์ — ไม่ใช่หนึ่งในสามกลุ่ม แต่เป็นกลุ่มที่เปลี่ยนสถานการณ์ได้มากที่สุด และควรถูกนับรวมในแผนของโรงเรียน",
    ],
  },
];

/* ───────────────────────────────────────────── ฝั่งผู้ถูกกระทำ */

const VICTIM: Block[] = [
  {
    kind: "timeline",
    title: "ลำดับเวลา ตั้งแต่รู้เรื่องจนปิดเคส",
    sources: [1, 3],
    rows: [
      {
        when: "ภายในวันเดียวกัน",
        what: [
          "แยกคุยเป็นส่วนตัว ไม่เรียกคุยต่อหน้าเพื่อนหรือหน้าห้อง",
          "ประเมินความปลอดภัยเฉพาะหน้า มีการทำร้ายร่างกายไหม มีการขู่ไหม วันนี้กลับบ้านปลอดภัยไหม",
          "ถามเรื่องการทำร้ายตัวเองตรง ๆ ถ้ามีสัญญาณ และไม่ปล่อยให้อยู่คนเดียวถ้ามีความคิดนั้น",
          "จดบันทึกเป็นข้อเท็จจริง วันเวลา สถานที่ ใครอยู่ตรงนั้น แยกจากความเห็นของครู",
        ],
      },
      {
        when: "ภายใน 3 วัน",
        what: [
          "ทำแผนความปลอดภัยร่วมกับเด็ก ระบุจุดเสี่ยงและเวลาเสี่ยง แล้วจัดครูเวรหรือเปลี่ยนเส้นทาง",
          "ให้ชื่อผู้ใหญ่ที่ไปหาได้ทันทีอย่างน้อยสองคน พร้อมบอกว่าอยู่ตรงไหนเวลาไหน",
          "แจ้งผู้ปกครองของผู้ถูกกระทำ โดยถามเด็กก่อนว่าอยากให้เล่าแค่ไหน",
        ],
      },
      {
        when: "1 สัปดาห์",
        what: [
          "นัดเจอตามวันที่ระบุไว้ ไม่ใช่ “ไว้มาคุยกันใหม่”",
          "ถามด้วยคำถามรูปธรรม “อาทิตย์นี้ยังเจอเหตุการณ์แบบเดิมอีกกี่ครั้ง”",
        ],
      },
      {
        when: "1 เดือน",
        what: [
          "ประเมินซ้ำว่าหยุดจริงหรือแค่เปลี่ยนรูปแบบ เช่น จากล้อต่อหน้าเป็นกันออกจากกลุ่ม",
          "ถ้ายังไม่หยุด ยกระดับตามระเบียบและพิจารณาส่งต่อผู้เชี่ยวชาญ",
        ],
      },
    ],
  },
  {
    kind: "script",
    title: "ประโยคที่ใช้ได้จริงตอนเปิดบทสนทนา",
    lines: [
      {
        say: "“ขอบคุณที่บอกครูนะ เรื่องนี้ไม่ง่ายเลยที่จะพูด”",
        why: "ประโยคแรกต้องเป็นการรับ ไม่ใช่การตรวจสอบ เด็กที่เจอคำถามว่า “แน่ใจหรือเปล่า” ตั้งแต่ต้นมักไม่เล่าต่อ",
      },
      {
        say: "“เล่าให้ครูฟังได้เลย ครูจะฟังจนจบก่อน”",
        why: "บอกล่วงหน้าว่าจะไม่ขัด ทำให้เด็กเล่าได้ครบในรอบเดียว ไม่ต้องเล่าซ้ำหลายรอบ",
      },
      {
        say: "“ครูเก็บเป็นความลับได้ ยกเว้นถ้ามีเรื่องอันตรายถึงชีวิต ครูจะบอกหนูก่อนว่าจะเล่าให้ใครฟัง เพื่ออะไร”",
        why: "บอกขอบเขตความลับตั้งแต่ต้น ดีกว่าสัญญาแล้วผิดสัญญาทีหลัง",
      },
      {
        say: "“อยากให้ครูช่วยยังไงดี”",
        why: "ให้เด็กมีส่วนเลือก การถูกจัดการโดยไม่ได้ถามคือสาเหตุที่เด็กหลายคนเสียใจกว่าเดิมหลังบอกครู",
      },
    ],
  },
  {
    kind: "list",
    title: "ห้ามทำกับผู้ถูกกระทำ",
    tone: "dont",
    sources: [1],
    items: [
      "ห้ามจับคู่ไกล่เกลี่ยหรือให้เผชิญหน้ากับผู้กระทำ — การกลั่นแกล้งไม่ใช่ความขัดแย้งของคนที่มีอำนาจเท่ากันและมีส่วนผิดพอกัน การให้เผชิญหน้าซ้ำเติมคนที่ถูกกระทำ",
      "ห้ามให้ “อย่าไปสนใจเขาสิ” เป็นทางออกเดียว การเพิกเฉยอย่างเดียวไม่พอถ้าไม่มีผู้ใหญ่เข้าไปจัดการด้วย",
      "ห้ามให้เล่าซ้ำหลายรอบต่อหน้าหลายคน",
      "ห้ามพูดว่า “เธอก็มีส่วนนะ” หรือให้เปลี่ยนตัวเองเพื่อไม่ให้ถูกแกล้ง",
      "ห้ามสัญญาว่าจะเก็บเป็นความลับทั้งหมด",
    ],
  },
];

/* ─────────────────────────────────────────────── ฝั่งผู้กระทำ */

const OFFENDER: Block[] = [
  {
    kind: "list",
    title: "ตั้งเป้าให้ถูกก่อนเริ่ม",
    tone: "do",
    items: [
      "เป้าหมายคือหยุดพฤติกรรม ไม่ใช่ลงโทษให้สาสม สองอย่างนี้ใช้วิธีต่างกันและพาไปคนละที่",
      "แยกตัวพฤติกรรมออกจากตัวเด็ก พูดถึงสิ่งที่เขาทำ ไม่ตีตราว่าเขาเป็นคนแบบไหน",
      "เด็กที่กลั่นแกล้งคนอื่นยังเป็นเด็กที่โรงเรียนมีหน้าที่ดูแล ไม่ใช่คดีที่หาผู้ผิดได้แล้วจบ",
      "บอกความคาดหวังเป็นรูปธรรม “ตั้งแต่วันนี้ ห้ามพูดถึงรูปร่างของเขาอีก” ใช้ได้จริงกว่า “ปรับปรุงตัวด้วย”",
    ],
  },
  {
    kind: "list",
    title: "สี่วิธีที่หลักฐานบอกว่าไม่ได้ผล",
    tone: "warn",
    sources: [1],
    items: [
      "นโยบายไม่ยอมรับเด็ดขาด (zero tolerance) และการพักการเรียนหรือไล่ออก — ไม่ได้ลดพฤติกรรมกลั่นแกล้ง และยังทำให้ทั้งนักเรียนและครูไม่กล้ารายงาน เพราะกลัวผลที่รุนแรงเกินเหตุ",
      "การไกล่เกลี่ยหรือให้เพื่อนเป็นคนกลาง — ใช้ได้กับความขัดแย้งที่สองฝ่ายมีอำนาจเท่ากันเท่านั้น",
      "การบำบัดเป็นกลุ่มที่รวมเฉพาะเด็กที่กลั่นแกล้งคนอื่น — สมาชิกในกลุ่มมีแนวโน้มเสริมพฤติกรรมของกันและกัน",
      "การบังคับให้ขอโทษต่อหน้าห้อง — ได้คำขอโทษที่ไม่ได้มาจากความเข้าใจ และทำให้ผู้ถูกกระทำตกเป็นจุดสนใจซ้ำอีกรอบ",
    ],
  },
  {
    kind: "list",
    title: "คัดกรองสิ่งที่อยู่ข้างหลังพฤติกรรม",
    tone: "do",
    sources: [1, 2],
    items: [
      "ถามว่าเขาเองกำลังถูกกระทำอยู่หรือเปล่า ทั้งที่โรงเรียนและที่บ้าน — เด็กที่เป็นทั้งผู้กระทำและผู้ถูกกระทำเป็นกลุ่มเสี่ยงสูงที่สุด",
      "ถามถึงความรุนแรงในครอบครัวและการถูกลงโทษด้วยความรุนแรงที่บ้าน อย่างระมัดระวังและเป็นส่วนตัว",
      "ดูเรื่องการเรียน การนอน และการใช้สื่อ พฤติกรรมก้าวร้าวมักมาพร้อมเรื่องอื่นที่ยังไม่มีใครเห็น",
      "ถ้าพบว่าเขาถูกกระทำอยู่ด้วย ให้เปิดการดูแลอีกเคสหนึ่งในฐานะผู้ถูกกระทำ ควบคู่ไปกับการจัดการพฤติกรรม",
    ],
  },
  {
    kind: "script",
    title: "บทสนทนา 1:1 กับผู้กระทำ — ห้าขั้น",
    lines: [
      {
        say: "“ครูอยากคุยเรื่องที่เกิดขึ้นเมื่อวาน เล่าให้ครูฟังหน่อยว่าเกิดอะไรขึ้น”",
        why: "ขั้นที่ 1 เปิดโดยไม่กล่าวหา แม้จะรู้ข้อเท็จจริงมาแล้วก็ตาม",
      },
      {
        say: "(ฟังจนจบโดยไม่ขัด)",
        why: "ขั้นที่ 2 เด็กที่ถูกตัดบทตั้งแต่ประโยคแรกจะเข้าสู่โหมดแก้ตัว และเลิกฟังสิ่งที่ครูจะพูดต่อ",
      },
      {
        say: "“สิ่งที่เกิดขึ้นคือเขาไม่กล้าเข้าห้องน้ำมาสามวันแล้ว”",
        why: "ขั้นที่ 3 ระบุพฤติกรรมและผลที่เกิดขึ้นเป็นรูปธรรม ไม่ใช่ตัดสินว่าเขาเป็นเด็กแบบไหน",
      },
      {
        say: "“สิ่งที่จะตามมาคือ… ซึ่งใช้กับทุกคนเหมือนกัน”",
        why: "ขั้นที่ 4 ผลที่ตามมาต้องกำหนดไว้ล่วงหน้าและคาดเดาได้ ไม่ใช่คิดขึ้นตอนนั้นตามอารมณ์ครู",
      },
      {
        say: "“อาทิตย์หน้าวันอังคาร ครูจะมาคุยกับหนูอีกรอบ”",
        why: "ขั้นที่ 5 นัดติดตามก่อนจบการคุยเสมอ การคุยครั้งเดียวแล้วเงียบเท่ากับไม่ได้ทำอะไร",
      },
    ],
  },
  {
    kind: "list",
    title: "คุยกับผู้ปกครองของผู้กระทำ",
    tone: "do",
    sources: [2, 3],
    items: [
      "บอกวัตถุประสงค์ตั้งแต่ประโยคแรกว่าโทรมาเพื่อร่วมกันหยุดพฤติกรรม ไม่ใช่มาฟ้องหรือขอให้ลงโทษ",
      "พูดถึงพฤติกรรมที่สังเกตได้พร้อมวันเวลา ไม่ใช่คำตัดสินว่าลูกเขาเป็นเด็กแบบไหน",
      "ย้ำตรง ๆ ว่าอย่าลงโทษด้วยการตีหรือใช้ความรุนแรง การลดความรุนแรงในบ้านและการสนับสนุนผู้ปกครองเป็นหนึ่งในยุทธศาสตร์หลักของแนวทางระดับสากล และการเพิ่มความรุนแรงที่บ้านมักทำให้พฤติกรรมที่โรงเรียนแย่ลง",
      "ถามว่าที่บ้านมีอะไรเปลี่ยนไปหรือเปล่า ช่วงที่พฤติกรรมเปลี่ยนมักตรงกับเหตุการณ์ในบ้าน",
      "บันทึกสิ่งที่ตกลงกันเป็นลายลักษณ์อักษร และนัดคุยรอบถัดไป",
    ],
  },
  {
    kind: "timeline",
    title: "ติดตามผล และเกณฑ์ส่งต่อ",
    sources: [5],
    rows: [
      {
        when: "1 สัปดาห์",
        what: [
          "ถามทั้งสองฝั่ง — ถามผู้ถูกกระทำด้วยว่าหยุดจริงไหม ไม่ใช่ถามเฉพาะผู้กระทำว่าเลิกแล้วหรือยัง",
        ],
      },
      {
        when: "1 เดือน",
        what: [
          "ดูว่าพฤติกรรมเปลี่ยนรูปแบบหรือเปล่า เช่น เลิกล้อต่อหน้าแต่ไปกันออกจากกลุ่มแทน",
          "ถ้ายังเกิดซ้ำหลังจัดการแล้ว ให้ยกระดับและพิจารณาส่งต่อ",
        ],
      },
      {
        when: "ส่งต่อทันทีเมื่อ",
        what: [
          "มีความรุนแรงต่อร่างกายคนหรือสัตว์",
          "พบสัญญาณว่าผู้กระทำเองกำลังถูกทำร้าย",
          "มีการใช้สารเสพติด หรือมีสัญญาณด้านสุขภาพจิตอื่น",
          "ปรึกษาสายด่วนสุขภาพจิต 1323 ได้ทั้งกรณีผู้ถูกกระทำและผู้กระทำ",
        ],
      },
    ],
  },
];

/* ════════════════════════════════════════════════ ตัวเรนเดอร์ */

const TONE = {
  do: { ring: "ring-mint-200", bg: "bg-mint-50/60", ink: "text-mint-800", Icon: Check },
  dont: { ring: "ring-rose-200", bg: "bg-rose-50/60", ink: "text-rose-800", Icon: Ban },
  warn: { ring: "ring-amber-200", bg: "bg-amber-50/60", ink: "text-amber-900", Icon: AlertTriangle },
} as const;

function BlockView({ block }: { block: Block }) {
  if (block.kind === "list") {
    const t = TONE[block.tone];
    return (
      <section className={`rounded-2xl ${t.bg} p-4 ring-1 ${t.ring}`}>
        <h4 className={`text-[0.94rem] font-bold ${t.ink}`}>
          <t.Icon className="mr-1.5 inline size-4 align-[-2px]" aria-hidden="true" />
          {block.title}
          <Cite ns={block.sources} />
        </h4>
        <ul className="mt-2.5 space-y-2">
          {block.items.map((it) => (
            <li key={it} className="flex gap-2 text-[0.88rem] leading-[1.95] text-ink-soft">
              <span className="mt-[0.75em] size-1 shrink-0 rounded-full bg-current opacity-40" aria-hidden="true" />
              {it}
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (block.kind === "timeline") {
    return (
      <section className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
        <h4 className="text-[0.94rem] font-bold text-ink">
          <Clock3 className="mr-1.5 inline size-4 align-[-2px] text-sky-600" aria-hidden="true" />
          {block.title}
          <Cite ns={block.sources} />
        </h4>
        <ol className="mt-3 space-y-3">
          {block.rows.map((r) => (
            <li key={r.when} className="grid gap-1.5 sm:grid-cols-[9rem_1fr] sm:gap-3">
              <span className="inline-flex h-fit items-center rounded-full bg-sky-50 px-3 py-1 text-[0.78rem] font-bold text-sky-800 ring-1 ring-sky-200">
                {r.when}
              </span>
              <ul className="space-y-1.5">
                {r.what.map((w) => (
                  <li key={w} className="flex gap-2 text-[0.88rem] leading-[1.95] text-ink-soft">
                    <span className="mt-[0.75em] size-1 shrink-0 rounded-full bg-current opacity-40" aria-hidden="true" />
                    {w}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
      <h4 className="text-[0.94rem] font-bold text-ink">
        <MessageSquareQuote className="mr-1.5 inline size-4 align-[-2px] text-lavender-500" aria-hidden="true" />
        {block.title}
        <Cite ns={block.sources} />
      </h4>
      <ul className="mt-3 space-y-2.5">
        {block.lines.map((l) => (
          <li key={l.say} className="rounded-xl bg-lavender-50/70 p-3">
            <p className="text-[0.92rem] font-semibold leading-[1.85] text-ink">{l.say}</p>
            <p className="mt-1 text-[0.82rem] leading-[1.85] text-ink-mute">{l.why}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function BullyingProtocol() {
  const [side, setSide] = useState<"victim" | "offender">("victim");
  const blocks = side === "victim" ? VICTIM : OFFENDER;

  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-2 text-[1.1rem] font-bold text-ink">
        <BookOpen className="size-5 text-sky-600" aria-hidden="true" />
        คู่มือดูแลการกลั่นแกล้ง — สองฝั่ง
      </h2>
      <p className="mt-1 text-[0.86rem] leading-relaxed text-ink-soft">
        การดูแลเฉพาะคนที่ถูกแกล้งช่วยคนที่เจ็บได้ แต่ไม่ได้หยุดต้นทาง
        เด็กที่แกล้งคนอื่นยังอยู่ในโรงเรียนเดิมและจะทำกับคนถัดไป
        <br />
        เลขตัวเล็กท้ายหัวข้อคือแหล่งอ้างอิงท้ายหน้า หัวข้อที่ไม่มีเลข
        เป็นแนวปฏิบัติของโรงเรียนเอง ไม่ใช่ข้อสรุปจากงานวิจัย
      </p>

      {/* พื้นฐานที่ใช้ร่วมกัน — อยู่เหนือตัวสลับ เพราะทั้งสองฝั่งต้องอ่านเหมือนกัน */}
      <div className="mt-4 space-y-3">
        <p className="flex items-center gap-1.5 text-[0.8rem] font-bold uppercase tracking-wide text-ink-mute">
          <Users className="size-3.5" aria-hidden="true" />
          พื้นฐานที่ใช้ร่วมกันทั้งสองฝั่ง
        </p>
        {BASICS.map((b) => (
          <BlockView key={b.title} block={b} />
        ))}
      </div>

      <div className="mt-5 inline-flex rounded-full bg-panel/60 p-1 print:hidden" role="tablist">
        {(
          [
            ["victim", "ฝั่งคนที่ถูกแกล้ง", ShieldCheck],
            ["offender", "ฝั่งคนที่เป็นผู้กระทำ", UserCog],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={side === key}
            onClick={() => setSide(key)}
            className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-[0.88rem] font-semibold transition ${
              side === key ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"
            }`}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-3 print:hidden">
        {blocks.map((b) => (
          <BlockView key={b.title} block={b} />
        ))}
      </div>

      {/* ฉบับพิมพ์ต้องได้ทั้งสองฝั่ง คู่มือที่พิมพ์ออกมาแล้วได้ครึ่งเดียวไม่มีประโยชน์ */}
      <div className="mt-4 hidden space-y-3 print:block">
        <p className="text-[1rem] font-bold text-ink">ฝั่งคนที่ถูกแกล้ง</p>
        {VICTIM.map((b) => (
          <BlockView key={b.title} block={b} />
        ))}
        <p className="pt-2 text-[1rem] font-bold text-ink">ฝั่งคนที่เป็นผู้กระทำ</p>
        {OFFENDER.map((b) => (
          <BlockView key={b.title} block={b} />
        ))}
      </div>

      {/* ─────────────────────────────── แหล่งอ้างอิง */}
      <section className="mt-6 border-t border-line pt-4">
        <h3 className="text-[0.9rem] font-bold text-ink">แหล่งอ้างอิง</h3>
        <ol className="mt-2 space-y-2">
          {SOURCES.map((s) => (
            <li
              key={s.n}
              id={`swb-src-${s.n}`}
              className="flex gap-2.5 scroll-mt-24 text-[0.8rem] leading-relaxed text-ink-mute"
            >
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded bg-panel/70 text-[0.68rem] font-bold text-ink-soft">
                {s.n}
              </span>
              <span>
                <span className="font-semibold text-ink-soft">{s.org}</span>
                <br />
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-dotted underline-offset-2"
                >
                  {s.label}
                </a>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-[0.76rem] leading-relaxed text-ink-mute">
          คู่มือฉบับนี้ใส่เฉพาะข้อมูลที่ตรวจแหล่งแล้วว่ามีอยู่จริงและอ่านเนื้อหาแล้ว
          สถิติที่ระบุว่าประเทศไทยมีการกลั่นแกล้งสูงเป็นอันดับสองของโลก
          ถูกอ้างซ้ำกันมากในสื่อ แต่ตามหาต้นทางที่ตรวจสอบได้ไม่พบ จึงไม่นำมาใส่
        </p>
      </section>
    </Card>
  );
}

export default BullyingProtocol;
