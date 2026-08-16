"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Ban,
  Check,
  ChevronDown,
  Copy,
  Eye,
  HeartHandshake,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Siren,
} from "lucide-react";

/**
 * คู่มือการสื่อสารและจัดการการกลั่นแกล้งในโรงเรียน
 *
 * ออกแบบให้กวาดตาหาได้เร็ว ไม่ใช่ให้อ่านเรียงบรรทัด เพราะครูเปิดคู่มือนี้ตอนที่มีเด็ก
 * ยืนรออยู่ตรงหน้า ไม่ใช่ตอนนั่งว่าง ๆ
 *
 * รหัสสีที่ใช้ทั้งหน้า
 *   แดง      ภาวะวิกฤตและสิ่งที่ห้ามทำ
 *   เขียว/ฟ้า ฝั่งผู้ถูกกระทำ ประโยคแนะนำ และสิ่งที่ควรทำ
 *   อำพัน/เทา ฝั่งผู้กระทำ และผู้ที่เป็นทั้งสองอย่าง
 *
 * ปุ่มคัดลอกทุกประโยคมีเหตุผลของมัน ครูที่กำลังจะเดินไปคุยมักเปิดคู่มือบนคอมพิวเตอร์
 * แล้วต้องจำประโยคไปพูด การคัดลอกไปวางในโน้ตของตัวเองก่อนเดินไป ใช้ได้จริงกว่า
 */

/* ═══════════════════════════════════════ ๑ ภาวะวิกฤต */

const RED_FLAGS = [
  "ทำร้ายร่างกายจนบาดเจ็บ",
  "มีอาวุธ หรือข่มขู่รุนแรง",
  "ขู่กรรโชกทรัพย์",
  "คุกคามทางเพศ",
  "เด็กมีสัญญาณซึมเศร้ารุนแรง หรือทำร้ายตนเอง",
];

const SAFETY_PROTOCOL = [
  "แยกพื้นที่ทางกายภาพทันที ไม่ให้อยู่ในรัศมีที่เข้าถึงกันได้",
  "กำหนด Safe Person (ครูที่ไว้ใจ) และ Safe Zone (ห้องพักปลอดภัย)",
  "ปรับเปลี่ยนตารางเวลาและเส้นทางเดิน เพื่อลดการเผชิญหน้า",
  "กรณีกลั่นแกล้งออนไลน์ ให้แคปหลักฐาน บล็อกบัญชี และไม่ตอบโต้",
  "ส่งต่อนักจิตวิทยาหรือแพทย์ทันที พร้อมแจ้งผู้ปกครอง",
];

/* ═══════════════════════════════════════ ๒ ควรทำ / ไม่ควรทำ */

const DOS: { text: string; why: string }[] = [
  { text: "คุยเป็นส่วนตัวเสมอ", why: "การถูกเรียกคุยต่อหน้าห้องทำให้เด็กเข้าสู่โหมดปกป้องตัวเอง และปิดโอกาสที่จะได้ความจริง" },
  { text: "ให้ผู้ถูกกระทำเล่าก่อนอย่างอิสระ", why: "การเล่าได้จบด้วยจังหวะของตัวเอง คือจุดที่เด็กเริ่มรู้สึกว่าเรื่องนี้ยังเป็นของเขา" },
  { text: "ระบุพฤติกรรมเป็นรูปธรรม (De-labeling)", why: "พูดถึงสิ่งที่ทำ ไม่ใช่ตีตราตัวคน เด็กที่ถูกตัดสินว่าเลวไปแล้ว ไม่มีแรงจูงใจจะเปลี่ยน" },
  { text: "กำหนดผลลัพธ์ที่คาดเดาได้ล่วงหน้า", why: "ผลที่รู้ล่วงหน้าและใช้กับทุกคนเหมือนกัน เปลี่ยนพฤติกรรมได้มากกว่าผลที่ขึ้นกับอารมณ์ครูวันนั้น" },
  { text: "สอนทักษะทดแทน (Replacement Behaviors)", why: "การห้ามอย่างเดียวทิ้งช่องว่างไว้ เด็กต้องรู้ว่าครั้งหน้าให้ทำอะไรแทน" },
  { text: "นัดติดตามผลโดยระบุวันชัดเจน", why: "การคุยครั้งเดียวแล้วเงียบ ส่งสัญญาณว่าเรื่องจบแล้ว ทั้งที่ยังไม่จบ" },
];

const DONTS: { text: string; why: string }[] = [
  { text: "ห้ามจับคู่กรณีมาไกล่เกลี่ยร่วมกัน", why: "การกลั่นแกล้งมีอำนาจไม่เท่ากันอยู่ในตัวมันเอง การให้เผชิญหน้าเสี่ยงต่อการซ้ำเติมบาดแผล (Re-traumatization)" },
  { text: "ห้ามบังคับขอโทษต่อหน้าสาธารณะ", why: "ได้คำขอโทษที่ไม่ได้มาจากความเข้าใจ และทำให้ผู้ถูกกระทำตกเป็นจุดสนใจซ้ำอีกรอบ" },
  { text: "ไม่ใช้การพักการเรียนหรือไล่ออกเป็นทางออกหลัก", why: "ไม่ได้ลดพฤติกรรม และทำให้ทั้งนักเรียนและครูไม่กล้ารายงาน เพราะกลัวผลที่รุนแรงเกินเหตุ" },
  { text: "ไม่รวมกลุ่มเด็กที่แกล้งคนอื่นไว้ด้วยกัน", why: "สมาชิกในกลุ่มมีแนวโน้มเสริมพฤติกรรมของกันและกัน (Peer Contagion)" },
  { text: "หลีกเลี่ยงคำพูดตัดสินตัวตน", why: "“ครูผิดหวังในตัวเธอ” ตัดสินตัวคน และไม่ได้บอกว่าต้องทำอะไรต่อ" },
];

/* ═══════════════════════════════════════ ๓ บทสนทนา */

type Line = { tag: string; say: string };
type Role = {
  id: string;
  label: string;
  sub: string;
  Icon: typeof ShieldCheck;
  /** โทนสีของบทบาทนั้น ตามรหัสสีของทั้งหน้า */
  chip: string;
  card: string;
  /** กติกาที่ต้องรู้ก่อนเปิดปาก ไม่ใช่ประโยคที่พูด */
  note?: { title: string; body: string };
  lines: Line[];
};

const ROLES: Role[] = [
  {
    id: "target",
    label: "ผู้ถูกกระทำ",
    sub: "Target",
    Icon: ShieldCheck,
    chip: "data-[on=true]:bg-emerald-600",
    card: "bg-emerald-50/70 ring-emerald-200",
    lines: [
      {
        tag: "สร้างความปลอดภัย",
        say: "ครูสังเกตเห็นว่าช่วงนี้หนูดูไม่ค่อยสบายใจ ครูอยากให้หนูรู้ว่าห้องนี้เป็นพื้นที่ปลอดภัย หนูอยากเล่าอะไรให้ครูฟังไหม หรืออยากนั่งพักตรงนี้ก่อนก็ได้นะ",
      },
      {
        tag: "ยืนยันความรู้สึก",
        say: "ขอบคุณมากที่หนูกล้าเล่าเรื่องนี้ให้ครูฟัง การต้องเก็บเรื่องแบบนี้ไว้คนเดียวมันคงเหนื่อยและหนักมากสำหรับหนู",
      },
      {
        tag: "ปลดเปลื้องความผิด",
        say: "ไม่ว่าอะไรจะเกิดขึ้น สิ่งที่หนูต้องเจอไม่ใช่ความผิดของหนูเลย ไม่มีใครสมควรถูกปฏิบัติแบบนี้",
      },
      {
        tag: "เมื่อกลัวโดนเอาคืน",
        say: "ครูเข้าใจดีเลยว่าทำไมหนูถึงกังวลเรื่องนี้ ครูจะไม่เดินไปบอกเขาตรง ๆ ว่าหนูมาฟ้อง แต่หน้าที่ของครูคือต้องทำให้พื้นที่ตรงนี้ปลอดภัยสำหรับหนู เรามาช่วยกันวางแผนนะว่าครูจะช่วยอย่างไรได้บ้างโดยที่หนูไม่ต้องตกเป็นเป้า",
      },
    ],
  },
  {
    id: "aggressor",
    label: "ผู้กระทำ",
    sub: "Aggressor",
    Icon: ShieldAlert,
    chip: "data-[on=true]:bg-amber-600",
    card: "bg-amber-50/70 ring-amber-200",
    lines: [
      {
        tag: "เปิดบทสนทนา",
        say: "ครูอยากคุยเรื่องที่เกิดขึ้นตรงสนามเด็กเล่นเมื่อตอนกลางวัน เล่าในมุมของเธอให้ครูฟังหน่อยว่าเกิดอะไรขึ้น",
      },
      {
        tag: "ตัดวงจรข้ออ้าง",
        say: "การล้อเล่นจะเกิดขึ้นได้ก็ต่อเมื่อทั้งสองฝ่ายสนุกด้วยกัน แต่เมื่อไหร่ที่มีคนหนึ่งอึดอัด กลัว หรือเจ็บปวด สิ่งนั้นจะไม่ใช่การเล่น แต่เป็นการทำร้ายความรู้สึก ซึ่งโรงเรียนเรายอมรับสิ่งนี้ไม่ได้",
      },
      {
        tag: "ตัดวงจรข้ออ้าง",
        say: "ครูรับรู้ว่าเธอรู้สึกหงุดหงิดกับการกระทำของเขา แต่การตอบโต้ด้วยการข่มขู่หรือชวนเพื่อนมารุมแบน เป็นทางเลือกที่ผิด และเราต้องคุยกันเรื่องการตัดสินใจของเธอตรงนี้",
      },
      {
        tag: "แยกตัวตนจากพฤติกรรม",
        say: "ครูไม่ได้มองว่าเธอเป็นคนไม่ดี แต่การกระทำนี้ส่งผลกระทบต่อเพื่อน และพฤติกรรมนี้ต้องหยุดลงทันที",
      },
      {
        tag: "ตั้งขอบเขต",
        say: "ตั้งแต่วันนี้ ห้ามพูดจาล้อเลียนเรื่องรูปร่างหรือส่งข้อความหาเพื่อนอีก หากเกิดขึ้นอีก จะมีมาตรการ… ตามที่โรงเรียนกำหนดไว้สำหรับทุกคน",
      },
    ],
  },
  {
    id: "bully-victim",
    label: "เป็นทั้งสองอย่าง",
    sub: "Bully-Victim",
    Icon: Scale,
    chip: "data-[on=true]:bg-slate-600",
    card: "bg-slate-50 ring-slate-300",
    note: {
      title: "คัดกรองทุกครั้งที่เจอผู้กระทำ ว่าเขาเองกำลังถูกกระทำอยู่ด้วยหรือไม่",
      body:
        "เด็กกลุ่มนี้เสี่ยงด้านสุขภาพจิตสูงที่สุด และมักถูกมองข้ามเพราะถูกจัดเป็น “เด็กมีปัญหา” ไปแล้ว " +
        "ห้ามใช้เรื่องที่เขาถูกกระทำเป็นคำต่อว่า — “เธอก็เคยโดน ทำไมยังไปทำเขาอีก” เป็นการประจานความเจ็บของเขา " +
        "และปิดประตูไม่ให้เล่าอะไรอีก ขณะเดียวกันก็ห้ามใช้เป็นข้อลดหย่อนจนไม่ต้องรับผิดชอบ ขอบเขตยังต้องอยู่",
    },
    lines: [
      {
        tag: "เข้าใจแต่ไม่ยอมรับพฤติกรรม",
        say: "ครูเข้าใจดีว่าเธอโกรธและเจ็บปวดมากที่ถูกเพื่อนล้อเรื่องนั้น ความรู้สึกโกรธเข้าใจได้ แต่การปาสิ่งของใส่เขาเป็นสิ่งที่ยอมรับไม่ได้",
      },
      {
        tag: "แยกความรับผิดชอบ",
        say: "เราจะจัดการเรื่องที่เพื่อนทำกับเธอแน่นอน แต่ตอนนี้เราต้องจัดการเรื่องการตอบโต้ของเธอก่อน เพราะสองเรื่องนี้ต้องแยกกันรับผิดชอบ",
      },
      {
        tag: "สอนทักษะทดแทน",
        say: "คราวหน้าถ้าเธอเริ่มรู้สึกว่าตัวร้อน มือสั่น หรือความโกรธพุ่งขึ้นมา แทนที่จะลงมือทำร้ายสิ่งของ เธอมีวิธีไหนที่จะเดินออกจากตรงนั้นแล้วมาหาครูได้ทันทีบ้าง",
      },
      {
        // ใช้ก่อนที่เรื่องของเขาจะถูกรับฟังจริง ประโยคนี้จะกลายเป็นการต่อว่าทันที
        tag: "สะพานสู่ความเข้าใจ · ใช้ได้ต่อเมื่อรับฟังเรื่องของเขาไปแล้ว",
        say: "ตอนที่เขาทำกับเธอ เธอรู้สึกยังไง… ครูคิดว่าตอนนี้เพื่อนคนนั้นน่าจะรู้สึกใกล้ ๆ กัน",
      },
    ],
  },
  {
    id: "bystander",
    label: "พยานรู้เห็น",
    sub: "Bystanders",
    Icon: Eye,
    chip: "data-[on=true]:bg-sky-600",
    card: "bg-sky-50/70 ring-sky-200",
    lines: [
      {
        tag: "ชื่นชมความกล้าหาญ",
        say: "การที่เธอเดินมาบอกครูไม่ใช่การขี้ฟ้อง แต่มันคือการปกป้องเพื่อนและช่วยให้ห้องเรียนของเราปลอดภัย ครูภูมิใจในความกล้าหาญของเธอมาก",
      },
      {
        tag: "ทางเลือกการช่วยเหลือ",
        say: "ถ้าเห็นเพื่อนโดนแกล้ง สิ่งที่ทำได้ทันที คือ หนึ่ง ชวนเพื่อนเดินเลี่ยงออกมา สอง ไม่ร่วมหัวเราะ สาม รีบเดินมาบอกครู",
      },
    ],
  },
];

/* ═══════════════════════════════════════ ๔ แหล่งอ้างอิง */

const SOURCES = [
  { badge: "StopBullying.gov", org: "U.S. Department of Health and Human Services", url: "https://www.stopbullying.gov/" },
  { badge: "Safe to Learn", org: "UNESCO · WHO และภาคี — กรอบการป้องกันความรุนแรงในโรงเรียน", url: "https://www.end-violence.org/safe-to-learn" },
  { badge: "Center on PBIS", org: "Positive Behavioral Interventions & Supports", url: "https://www.pbis.org/" },
  { badge: "IIRP", org: "International Institute for Restorative Practices", url: "https://www.iirp.edu/" },
];

/* ═══════════════════════════════════════ ตัวหน้าจอ */

function CopyLine({ line, card }: { line: Line; card: string }) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(line.say);
      setDone(true);
      window.setTimeout(() => setDone(false), 1800);
    } catch {
      // เบราว์เซอร์ที่ไม่อนุญาตคลิปบอร์ด — ไม่ต้องแจ้ง error ให้ครูตกใจ
      // ข้อความยังเลือกคัดลอกเองได้อยู่แล้ว
    }
  }

  return (
    <li className={`rounded-2xl p-4 ring-1 ${card}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span className="rounded-full bg-white/80 px-2.5 py-1 text-[0.7rem] font-bold text-ink-soft ring-1 ring-black/5">
          {line.tag}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-full bg-white px-3 text-[0.74rem] font-semibold text-ink-soft ring-1 ring-black/10 transition hover:text-ink active:scale-95 print:hidden"
        >
          {done ? <Check className="size-3.5 text-emerald-600" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
          {done ? "คัดลอกแล้ว" : "คัดลอก"}
        </button>
      </div>
      <p className="mt-2.5 text-[0.94rem] leading-[1.95] text-ink">“{line.say}”</p>
    </li>
  );
}

function RoleNote({ note }: { note: NonNullable<Role["note"]> }) {
  return (
    <div className="mt-3 flex gap-2.5 rounded-2xl bg-slate-100 p-4 ring-1 ring-slate-300">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-slate-600" aria-hidden="true" />
      <div>
        <p className="text-[0.88rem] font-bold leading-snug text-ink">{note.title}</p>
        <p className="mt-1 text-[0.82rem] leading-[1.9] text-ink-soft">{note.body}</p>
      </div>
    </div>
  );
}

export function TalkGuide() {
  const [roleId, setRoleId] = useState(ROLES[0].id);
  const [openTriage, setOpenTriage] = useState(true);
  const role = ROLES.find((r) => r.id === roleId) ?? ROLES[0];

  return (
    <>
      <h2 className="flex items-center gap-2 text-[1.05rem] font-bold text-ink">
        <HeartHandshake className="size-5 text-rose-500" aria-hidden="true" />
        คู่มือการสื่อสารและจัดการการกลั่นแกล้ง
      </h2>
      <p className="mt-1 text-[0.82rem] text-ink-soft">
        สี่บทบาทนี้ใช้วิธีคุยคนละแบบ — ชุดของการรับฟังใช้กับคนที่ไปแกล้งคนอื่นไม่ได้
      </p>

      {/* ── ภาวะวิกฤต วางบนสุด กดดูได้ในเสี้ยววินาที ───────────────────── */}
      <section className="mt-4 overflow-hidden rounded-2xl bg-rose-50 ring-1 ring-rose-300">
        <button
          type="button"
          onClick={() => setOpenTriage((v) => !v)}
          aria-expanded={openTriage}
          className="flex w-full items-center gap-2.5 px-4 py-3 text-left"
        >
          <Siren className="size-5 shrink-0 text-rose-600" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block text-[0.95rem] font-bold text-rose-900">
              สัญญาณอันตรายระดับวิกฤต — ทำทันที
            </span>
            <span className="mt-0.5 block text-[0.78rem] text-rose-800/80">
              ถ้าเข้าข่ายข้อใดข้อหนึ่ง ให้ข้ามขั้นตอนการพูดคุยไปที่แผนความปลอดภัยก่อน
            </span>
          </span>
          <ChevronDown
            className={`size-5 shrink-0 text-rose-600 transition-transform print:hidden ${openTriage ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>

        <div className={`${openTriage ? "block" : "hidden"} print:block`}>
          <div className="grid gap-3 border-t border-rose-200 p-4 md:grid-cols-2">
            <div>
              <p className="flex items-center gap-1.5 text-[0.84rem] font-bold text-rose-900">
                <AlertTriangle className="size-4" aria-hidden="true" />
                สัญญาณอันตราย (Red Flags)
              </p>
              <ul className="mt-2 space-y-1.5">
                {RED_FLAGS.map((f) => (
                  <li key={f} className="flex gap-2 text-[0.86rem] leading-[1.85] text-rose-900/90">
                    <span className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-rose-500" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[0.84rem] font-bold text-rose-900">
                <ShieldCheck className="size-4" aria-hidden="true" />
                แผนคุ้มครองความปลอดภัยทันที
              </p>
              <ol className="mt-2 space-y-1.5">
                {SAFETY_PROTOCOL.map((p, i) => (
                  <li key={p} className="flex gap-2 text-[0.86rem] leading-[1.85] text-rose-900/90">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-rose-600 text-[0.68rem] font-bold text-white">
                      {i + 1}
                    </span>
                    {p}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ── เลือกบทบาท ────────────────────────────────────────────────── */}
      <div className="mt-5 flex flex-wrap gap-1.5 rounded-2xl bg-neutral-100 p-1.5 print:hidden" role="tablist">
        {ROLES.map((r) => {
          const on = r.id === roleId;
          return (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={on}
              data-on={on}
              onClick={() => setRoleId(r.id)}
              className={`inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl px-3 text-[0.84rem] font-semibold transition ${r.chip} ${
                on ? "text-white shadow-sm" : "text-ink-soft hover:bg-white hover:text-ink"
              }`}
            >
              <r.Icon className="size-4" aria-hidden="true" />
              <span className="flex flex-col items-start leading-tight">
                {r.label}
                <span className="text-[0.62rem] font-medium opacity-70">{r.sub}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="print:hidden">
        {role.note ? <RoleNote note={role.note} /> : null}
        <ul className="mt-3 space-y-2.5">
          {role.lines.map((l) => (
            <CopyLine key={l.say} line={l} card={role.card} />
          ))}
        </ul>
      </div>

      {/* ฉบับพิมพ์ได้ครบทุกบทบาท ครูที่ถือกระดาษไปคุยไม่ได้กดแท็บ */}
      <div className="hidden print:block">
        {ROLES.map((r) => (
          <div key={r.id} className="mt-4">
            <p className="text-[0.92rem] font-bold text-ink">
              {r.label} ({r.sub})
            </p>
            {r.note ? <RoleNote note={r.note} /> : null}
            <ul className="mt-2 space-y-2.5">
              {r.lines.map((l) => (
                <CopyLine key={l.say} line={l} card={r.card} />
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── ควรทำ / ไม่ควรทำ ──────────────────────────────────────────── */}
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <section className="rounded-2xl bg-emerald-50/70 p-4 ring-1 ring-emerald-200">
          <h3 className="flex items-center gap-1.5 text-[0.92rem] font-bold text-emerald-900">
            <Check className="size-4" aria-hidden="true" />
            สิ่งที่ควรทำ
          </h3>
          <ul className="mt-2.5 space-y-2.5">
            {DOS.map((d) => (
              <li key={d.text}>
                <p className="text-[0.88rem] font-semibold leading-snug text-ink">{d.text}</p>
                <p className="mt-0.5 text-[0.8rem] leading-[1.85] text-ink-mute">{d.why}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-rose-50/70 p-4 ring-1 ring-rose-200">
          <h3 className="flex items-center gap-1.5 text-[0.92rem] font-bold text-rose-900">
            <Ban className="size-4" aria-hidden="true" />
            สิ่งที่ไม่ควรทำ
          </h3>
          <ul className="mt-2.5 space-y-2.5">
            {DONTS.map((d) => (
              <li key={d.text}>
                <p className="text-[0.88rem] font-semibold leading-snug text-ink">{d.text}</p>
                <p className="mt-0.5 text-[0.8rem] leading-[1.85] text-ink-mute">{d.why}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ── แหล่งอ้างอิง ───────────────────────────────────────────────── */}
      <section className="mt-6 border-t border-line pt-4">
        <h3 className="text-[0.86rem] font-bold text-ink">แหล่งอ้างอิงมาตรฐานสากล</h3>
        {/* ชื่อหน่วยงานภาษาไทยยาวกว่าความกว้างจอมือถือ ถ้าเรียงเป็นชิปลอย ๆ จะดันหน้าให้เลื่อนแนวนอน
            จึงให้แต่ละแหล่งกินเต็มแถวบนจอแคบ แล้วค่อยแบ่งสองคอลัมน์เมื่อมีที่พอ */}
        <ul className="mt-2.5 grid gap-2 sm:grid-cols-2">
          {SOURCES.map((s) => (
            <li key={s.badge}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-white px-3 py-2 ring-1 ring-neutral-200 transition hover:ring-neutral-300"
              >
                <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[0.72rem] font-bold text-ink">
                  {s.badge}
                </span>
                <span className="min-w-0 flex-1 text-[0.76rem] leading-snug text-ink-mute">{s.org}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[0.74rem] leading-relaxed text-ink-mute">
          ใช้เป็นแนวปฏิบัติเบื้องต้นในโรงเรียน ไม่ทดแทนการอบรมจากผู้เชี่ยวชาญ
          และควรทบทวนร่วมกับนักจิตวิทยาของโรงเรียนอย่างน้อยปีละครั้ง
        </p>
      </section>
    </>
  );
}

export default TalkGuide;
