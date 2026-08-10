"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MessageSquareOff, RotateCcw, Sparkles } from "lucide-react";

import { FluffyBuddy, type FluffyExpression } from "@/components/FluffyBuddy";
import { cn } from "@/lib/utils";

/* ============================================================================
   กล้าพูดว่า "ไม่" — the Social island's refusal-skills game.

   Peer pressure, three answers each time: จำยอม (swallow the no), หักหน้า
   (a no that burns the bridge with it), and ตรงและเคารพ (short, clear, no
   over-apologising — plus an alternative when the friendship deserves one).
   The golden rule gets its own round: when the ask is dangerous or wrong,
   "ไม่" is a complete sentence — no softening owed, and a trusted adult gets
   told. A game about saying no must never teach kids to cushion predators.
   ========================================================================== */

type StyleKind = "cave" | "blast" | "firm";

const STYLE_META: Record<StyleKind, { label: string; note: string; tint: string }> = {
  cave: {
    label: "จำยอม",
    note: "ได้รักษาบรรยากาศไว้หนึ่งวัน แลกกับการสอนทุกคนว่าขอเราได้เสมอ — ราคาที่แพงขึ้นทุกครั้งที่จ่าย",
    tint: "bg-slate-100 text-slate-600 ring-slate-200",
  },
  blast: {
    label: "หักหน้า",
    note: "ปฏิเสธสำเร็จ แต่เผาสะพานไปพร้อมกัน — เนื้อหาที่ถูกต้องถูกกลบด้วยวิธีพูดที่ทำร้าย",
    tint: "bg-rose-50 text-rose-600 ring-rose-200",
  },
  firm: {
    label: "ตรงและเคารพ",
    note: "สั้น ชัด ไม่ขอโทษพร่ำเพรื่อ และเสนอทางเลือกเมื่อมิตรภาพสมควรได้ — ขอบเขตที่รักษาทั้งเราและเพื่อน",
    tint: "bg-mint-50 text-mint-700 ring-mint-200",
  },
};

type Round = {
  id: string;
  scene: string;
  options: { text: string; kind: StyleKind }[];
  /** The golden-rule round gets an extra serious line on reveal. */
  urgent?: string;
  /**
   * Per-round overrides for the reveal notes. The shared STYLE_META copy was
   * written for ordinary friend-pressure — on the grooming round it would
   * blame the victim ("you taught them they can ask") or scold the angry
   * response for hurting the solicitor's feelings. This round speaks for itself.
   */
  noteOverrides?: Partial<Record<StyleKind, string>>;
};

const ROUNDS: Round[] = [
  {
    id: "homework",
    scene: "เพื่อนสนิทขอลอกการบ้านทุกวัน — ส่วนเราต้องนอนดึกทำมันทุกคืน",
    options: [
      { text: "ส่งให้ทุกครั้ง เพราะกลัวเสียเพื่อน", kind: "cave" },
      {
        text: "“เราให้ลอกทุกวันไม่ได้นะ แต่ตรงไหนไม่เข้าใจ เดี๋ยวติวให้หลังเลิกเรียน”",
        kind: "firm",
      },
      { text: "ประกาศกลางห้อง “ขี้เกียจก็หัดทำเองบ้างสิ”", kind: "blast" },
    ],
  },
  {
    id: "skip-class",
    scene: "แก๊งเพื่อนชวนโดดคาบบ่ายไปคาเฟ่ “ใคร ๆ เขาก็โดดกัน”",
    options: [
      {
        text: "“คาบนี้เราไม่โดดนะ เราตามไม่ทันอยู่ — เลิกเรียนแล้วไปกันเลยไหม เราเลี้ยงขนม”",
        kind: "firm",
      },
      { text: "ไปด้วยทั้งที่ใจเต้นกลัวโดนเช็คชื่อทั้งบ่าย", kind: "cave" },
      { text: "“พวกแกเนี่ยตัวถ่วงอนาคตชะมัด” แล้วเดินหนี", kind: "blast" },
    ],
  },
  {
    id: "bully-pressure",
    scene: "กลุ่มกดดันให้ร่วมแกล้งเพื่อนอีกคน “ไม่เอาด้วยก็ไม่ใช่พวกเรา”",
    options: [
      { text: "ร่วมแกล้งไปด้วยทั้งที่ไม่โอเค เพราะกลัวโดนเทเป็นคนต่อไป", kind: "cave" },
      {
        text: "“เรื่องนี้เราไม่เอาด้วยนะ” แล้วถอยออกมา — และถ้าการแกล้งหนักขึ้น แจ้งครูผ่าน Safe-Ticket",
        kind: "firm",
      },
      { text: "ด่ากลับทั้งกลุ่มจนกลายเป็นสงครามใหม่ของห้อง", kind: "blast" },
    ],
  },
  {
    id: "photo-pressure",
    scene: "⚠️ คนที่คุย ๆ กันอยู่กดดันขอรูปส่วนตัว “ถ้าไว้ใจกันจริงต้องส่งมาสิ”",
    options: [
      { text: "ส่งไปเพราะกลัวเขาหายไป", kind: "cave" },
      {
        text: "“ไม่” — คำเดียวจบ ไม่ต้องอธิบาย ไม่ต้องรักษาน้ำใจ บล็อกได้ทันที และเก็บหลักฐานไว้บอกผู้ใหญ่ที่ไว้ใจ",
        kind: "firm",
      },
      { text: "แคปไปประจานทั่วโรงเรียนด้วยความโมโห", kind: "blast" },
    ],
    urgent:
      "กติกาทอง: คำขอที่อันตราย ผิด หรือทำให้เราไม่ปลอดภัย — “ไม่” คือประโยคที่สมบูรณ์แล้ว ใครที่โกรธเพราะเราปฏิเสธเรื่องแบบนี้ กำลังบอกตัวตนของเขา ไม่ใช่ของเรา และเรื่องนี้ควรถึงหูผู้ใหญ่เสมอ",
    noteOverrides: {
      cave: "ถ้าเผลอส่งไปแล้ว — นี่ไม่ใช่ความผิดของเธอ คนผิดคือคนที่กดดัน อย่าเพิ่งลบแชทหรือหลักฐาน และบอกผู้ใหญ่ที่ไว้ใจทันที ยิ่งเร็วยิ่งช่วยหยุดความเสียหายได้",
      blast: "ความโกรธเข้าใจได้เต็มที่ — แต่การประจานอาจทำให้เรื่องบานปลายและภาพ/แชทยิ่งแพร่กว้าง หลักฐานควรไปถึงผู้ใหญ่ที่ช่วยได้จริง ไม่ใช่ทั้งโรงเรียน",
    },
  },
  {
    id: "money",
    scene: "เพื่อนขอยืมเงินอีกแล้ว — รอบก่อน ๆ ยังไม่เคยคืนเลย และเงินกินข้าวเราก็เริ่มไม่พอ",
    options: [
      { text: "ให้ยืมอีก แล้วไปกินมาม่าเงียบ ๆ ทั้งสัปดาห์", kind: "cave" },
      { text: "ทวงลงสตอรี่ให้ทั้งโลกเห็น", kind: "blast" },
      {
        text: "“รอบนี้เราให้ยืมไม่ได้นะ จนกว่ารอบก่อนจะคืนก่อน” — อึดอัดแป๊บเดียว ดีกว่าอึดอัดทุกวัน",
        kind: "firm",
      },
    ],
  },
];

function scoreTitle(score: number): { title: string; sub: string } {
  if (score >= 4)
    return { title: "เจ้าของขอบเขตตัวจริง 🛡️", sub: "เธอปฏิเสธได้โดยไม่ทำร้ายใครและไม่ทิ้งตัวเอง — คนที่ทำแบบนี้ได้ มิตรภาพรอบตัวจะยิ่งแข็งแรง" };
  if (score >= 2)
    return { title: "เสียง “ไม่” เริ่มมั่นคงแล้ว ✨", sub: "เกินครึ่งแล้ว! ที่เหลือคือฝึกพูดออกเสียงจริง — เริ่มจากเรื่องเล็กที่เสี่ยงน้อยสุดก่อนก็ได้" };
  return { title: "วันนี้ได้เห็นทางที่สาม 🌱", sub: "หลายคนโตมากับสองทาง: ยอม หรือระเบิด — แค่รู้ว่ามี “ตรงและเคารพ” อยู่ตรงกลาง ก็เปลี่ยนทุกความสัมพันธ์ได้แล้ว" };
}

const slide = {
  initial: { opacity: 0, x: 44 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -44, pointerEvents: "none" as const },
};

export type DareToSayNoGameProps = {
  onComplete?: (score: number) => void;
  className?: string;
};

export function DareToSayNoGame({ onComplete, className }: DareToSayNoGameProps) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<StyleKind | null>(null);
  const [done, setDone] = useState(false);
  const judgedRef = useRef(false);

  const round = ROUNDS[index];
  const isLast = index === ROUNDS.length - 1;
  const firmLine = round.options.find((o) => o.kind === "firm")?.text ?? "";

  function pick(kind: StyleKind) {
    if (judgedRef.current) return;
    judgedRef.current = true;
    if (kind === "firm") setScore((s) => s + 1);
    setPicked(kind);
  }

  function next() {
    if (!picked) return;
    if (isLast) {
      setDone(true);
      onComplete?.(score);
      return;
    }
    const from = index;
    judgedRef.current = false;
    setIndex((i) => (i === from ? i + 1 : i));
    setPicked(null);
  }

  function replay() {
    judgedRef.current = false;
    setIndex(0);
    setScore(0);
    setPicked(null);
    setDone(false);
  }

  if (done) {
    const t = scoreTitle(score);
    return (
      <div className={cn("mx-auto w-full max-w-md", className)}>
        <div className="space-y-4 text-center" role="status" aria-live="polite">
          <FluffyBuddy expression={score >= 2 ? "happy" : "content"} size={110} className="mx-auto" />
          <div>
            <p className="text-[0.78rem] font-semibold text-lavender-700">
              ปฏิเสธแบบตรงและเคารพได้ {score} จาก {ROUNDS.length} สถานการณ์
            </p>
            <h2 className="font-display th:leading-snug mt-1 text-[1.3rem] font-bold text-ink">
              {t.title}
            </h2>
            <p className="mx-auto mt-1.5 max-w-sm text-[0.84rem] leading-relaxed text-ink-soft">
              {t.sub}
            </p>
          </div>

          <div className="rounded-2xl bg-lavender-50 p-4 text-left ring-1 ring-lavender-200/70">
            <p className="flex items-center gap-1.5 text-[0.82rem] font-bold text-lavender-700">
              <MessageSquareOff className="size-4" aria-hidden="true" />
              สูตรปฏิเสธที่เวิร์กจริง
            </p>
            <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink-soft">
              สั้นและชัด · ไม่ต้องขอโทษพร่ำเพรื่อ · เสนอทางเลือกเมื่อมิตรภาพสมควรได้ —
              และกติกาทอง: <span className="font-semibold text-ink">เรื่องที่อันตรายหรือผิด “ไม่” คือประโยคสมบูรณ์</span>{" "}
              ไม่ติดหนี้คำอธิบายใคร · คนที่โกรธเพราะเราตั้งขอบเขต
              มักคือคนที่เคยได้ประโยชน์จากการที่เราไม่มีขอบเขต
            </p>
          </div>

          <div className="rounded-2xl bg-rose-50 p-4 text-left ring-1 ring-rose-200/70">
            <p className="text-[0.8rem] leading-relaxed text-ink-soft">
              ถ้ามีใครกดดันเธอเรื่องที่ทำให้ไม่ปลอดภัย (รูปส่วนตัว เรื่องเสี่ยง การแกล้งคนอื่น)
              และการปฏิเสธคนเดียวเริ่มไม่พอ — แจ้งผ่าน{" "}
              <Link href="/report" className="font-semibold text-rose-600 underline">
                Safe-Ticket
              </Link>{" "}
              หรือ{" "}
              <Link href="/appointments" className="font-semibold text-rose-600 underline">
                นัดคุยกับครู
              </Link>{" "}
              ได้เสมอ — การขอกำลังเสริมไม่ใช่ความอ่อนแอ
            </p>
          </div>

          <button
            type="button"
            onClick={replay}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-neutral-300 px-5 py-3 text-[0.88rem] font-medium text-ink-soft transition hover:border-neutral-400 hover:text-ink"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            ฝึกอีกรอบ
          </button>
        </div>
      </div>
    );
  }

  const pickedMeta = picked ? STYLE_META[picked] : null;

  return (
    <div className={cn("mx-auto w-full max-w-md", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h1 className="font-display th:leading-snug text-[1.15rem] font-bold text-ink">
          🛡️ กล้าพูดว่า “ไม่”
        </h1>
        <span className="shrink-0 rounded-full bg-lavender-50 px-3 py-1 text-[0.74rem] font-bold text-lavender-700 ring-1 ring-lavender-200">
          ฉากที่ {index + 1}/{ROUNDS.length}
        </span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-lavender-400 transition-all duration-500"
          style={{ width: `${((index + (picked ? 1 : 0)) / ROUNDS.length) * 100}%` }}
        />
      </div>

      <AnimatePresence initial={false}>
        <motion.div key={round.id} {...(reduce ? {} : slide)}>
          <div className="rounded-3xl bg-white p-4.5 ring-1 ring-neutral-200">
            <p className="p-1 text-[0.92rem] leading-relaxed text-ink">{round.scene}</p>
          </div>

          {picked === null ? (
            <div className="mt-4 space-y-2.5">
              <p className="text-[0.85rem] font-medium text-ink">เธอจะตอบยังไง?</p>
              {round.options.map((o) => (
                <button
                  key={o.text}
                  type="button"
                  onClick={() => pick(o.kind)}
                  className="block w-full rounded-2xl bg-white p-3.5 text-left text-[0.85rem] leading-relaxed text-ink ring-1 ring-neutral-200 transition hover:ring-lavender-200 active:scale-[0.99]"
                >
                  {o.text}
                </button>
              ))}
            </div>
          ) : (
            <motion.div
              initial={reduce ? undefined : { opacity: 0, y: 14 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              className="mt-4"
            >
              <div
                className={cn(
                  "rounded-3xl p-4 ring-1",
                  picked === "firm" ? "bg-mint-50 ring-mint-200" : "bg-amber-50 ring-amber-200",
                )}
              >
                <div className="flex items-start gap-3">
                  <FluffyBuddy
                    expression={(picked === "firm" ? "happy" : "surprised") as FluffyExpression}
                    size={64}
                    className="shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold ring-1",
                        pickedMeta!.tint,
                      )}
                    >
                      {pickedMeta!.label}
                    </span>
                    <p className="mt-2 text-[0.82rem] leading-relaxed text-ink-soft">
                      {(picked && round.noteOverrides?.[picked]) ?? pickedMeta!.note}
                    </p>
                    {picked !== "firm" && (
                      <p className="mt-2 rounded-xl bg-white/70 p-2.5 text-[0.8rem] leading-relaxed text-mint-700">
                        <span className="font-semibold">แบบตรงและเคารพคือ:</span> {firmLine}
                      </p>
                    )}
                    {round.urgent && (
                      <p className="mt-2 rounded-xl bg-white/70 p-2.5 text-[0.8rem] font-medium leading-relaxed text-rose-600">
                        {round.urgent}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={next}
                className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-[0.9rem] font-medium text-white transition hover:opacity-90 active:scale-[0.99]"
              >
                {isLast ? (
                  <>
                    ดูผลการฝึก
                    <Sparkles className="size-4" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    ฉากถัดไป
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default DareToSayNoGame;
