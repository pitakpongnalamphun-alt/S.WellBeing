"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Anchor, ArrowRight, RotateCcw, Sparkles } from "lucide-react";

import { FluffyBuddy, type FluffyExpression } from "@/components/FluffyBuddy";
import { cn } from "@/lib/utils";

/* ============================================================================
   ความคาดหวังที่หนักเกินไป — the Family island's boundary game.

   Heavy expectations land; the player chooses how to answer. Three styles:
   เก็บเงียบ (swallow — keeps the peace today, compounds inside), ชนเปรี้ยง
   (explode — the message is right but nobody hears it through the bang), and
   ขอบเขตนุ่มนวล (the soft boundary: receive the care → say your truth → offer
   a path you can live with). The formula is the takeaway; the summary is
   honest that some homes don't bend on the first try — that's what the
   counsellor bridge is for, and a boundary is love that can breathe.
   ========================================================================== */

type StyleKind = "swallow" | "explode" | "boundary";

const STYLE_META: Record<StyleKind, { label: string; note: string; tint: string }> = {
  swallow: {
    label: "เก็บเงียบ",
    note: "บ้านสงบวันนี้ แต่ความอึดอัดไม่หาย มันแค่ย้ายเข้าไปกองในใจ — และดอกเบี้ยแพงขึ้นทุกวัน",
    tint: "bg-slate-100 text-slate-600 ring-slate-200",
  },
  explode: {
    label: "ชนเปรี้ยง",
    note: "เนื้อหาที่อยากบอกอาจถูกต้อง แต่พอมาพร้อมเสียงระเบิด อีกฝ่ายจะได้ยินแค่เสียง ไม่ได้ยินเนื้อหา",
    tint: "bg-rose-50 text-rose-600 ring-rose-200",
  },
  boundary: {
    label: "ขอบเขตนุ่มนวล",
    note: "รับความหวังดีไว้ → บอกความจริงของเรา → เสนอทางที่เราไหว — ชัดเจนโดยไม่ต้องทำร้ายใคร รวมถึงตัวเอง",
    tint: "bg-mint-50 text-mint-700 ring-mint-200",
  },
};

type Round = {
  id: string;
  scene: string;
  options: { text: string; kind: StyleKind }[];
};

const ROUNDS: Round[] = [
  {
    id: "doctor-dream",
    scene: "พ่ออยากให้เป็นหมอมาตลอด แต่เรารักศิลปะ และเพิ่งได้รางวัลวาดภาพมา — พ่อบอกว่า “เลิกวาดเล่นได้แล้ว ไปติววิทย์”",
    options: [
      { text: "“ครับ/ค่ะ…” แล้วเก็บสีลงกล่อง ไปนั่งติววิทย์ทั้งที่ใจไม่อยู่", kind: "swallow" },
      {
        text: "“หนูรู้ว่าพ่ออยากให้หนูมั่นคง — หนูขอทำให้ดูว่าศิลปะไปได้ไกลแค่ไหน แล้วเทอมนี้หนูจะไม่ทิ้งเกรดวิทย์เลย”",
        kind: "boundary",
      },
      { text: "“พ่อไม่เคยเข้าใจหนูเลย! ชีวิตหนู หนูเลือกเอง!” แล้วเดินกระแทกประตู", kind: "explode" },
    ],
  },
  {
    id: "no-rest-tutor",
    scene: "แม่สมัครติวให้เต็มเสาร์-อาทิตย์ทุกช่อง จนไม่เหลือวันพักแม้แต่ครึ่งวัน",
    options: [
      {
        text: "“หนูขอบคุณที่แม่ลงทุนกับหนูขนาดนี้ — แต่สมองหนูเริ่มรับไม่ไหวแล้ว ขอเสาร์บ่ายเป็นเวลาพัก แล้วหนูจะเต็มที่กับที่เหลือ”",
        kind: "boundary",
      },
      { text: "แกล้งปวดหัวทุกเสาร์ เพื่อให้ได้พักโดยไม่ต้องพูด", kind: "swallow" },
      { text: "“ไม่ไปแล้ว! ติวอะไรเยอะแยะ แม่จะบ้าเหรอ!”", kind: "explode" },
    ],
  },
  {
    id: "sibling-care",
    scene: "ถูกคาดหวังให้ดูแลน้อง ทำงานบ้าน และดูแลทุกอย่างจนแทบไม่มีเวลาอ่านหนังสือของตัวเอง",
    options: [
      { text: "ทำต่อไปเงียบ ๆ แล้วไปอ่านหนังสือตอนตีหนึ่งทุกคืน", kind: "swallow" },
      { text: "วันหนึ่งระเบิดกลางบ้านว่า “หนูไม่ใช่แม่คนที่สองนะ!”", kind: "explode" },
      {
        text: "“หนูช่วยดูแลน้องได้และเต็มใจด้วย — แต่ช่วงใกล้สอบ หนูขอเวลาอ่านหนังสือหลังสามทุ่ม ให้พี่ป้อนข้าวน้องรอบเย็นแทนได้ไหม”",
        kind: "boundary",
      },
    ],
  },
  {
    id: "relative-ranking",
    scene: "ญาติถามอันดับสอบทุกครั้งที่เจอ แล้วเอาไปเทียบกับลูกหลานบ้านอื่นกลางวงข้าว",
    options: [
      { text: "ยิ้มแห้ง ๆ แล้วรีบกินข้าวให้เสร็จ กลับไปรู้สึกแย่คนเดียวในห้อง", kind: "swallow" },
      {
        text: "“หลานกำลังพยายามในแบบของหลานอยู่ค่ะ เดี๋ยวผลออกมาแล้วจะเล่าให้ฟังนะคะ” แล้วเปลี่ยนเรื่องอย่างสุภาพ",
        kind: "boundary",
      },
      { text: "“แล้วลูกป้าล่ะ ได้ที่เท่าไหร่!” สวนกลับกลางโต๊ะ", kind: "explode" },
    ],
  },
  {
    id: "study-plan",
    scene: "ที่บ้านอยากให้เลือกแผนการเรียนที่เราไม่ถนัดเลย เพราะ “อนาคตดีกว่า” — ใกล้ถึงวันต้องยื่นเลือกแล้ว",
    options: [
      { text: "ยื่นตามที่บ้านบอก แล้วบอกตัวเองว่า “คงชินไปเอง”", kind: "swallow" },
      { text: "ยื่นแผนที่ตัวเองอยากเรียนไปเงียบ ๆ โดยไม่บอกใคร รอบ้านรู้ทีหลัง", kind: "explode" },
      {
        text: "ขอเวลาบ้าน 20 นาที เปิดข้อมูลเส้นทางอาชีพของแผนที่เราถนัดให้ดู พร้อมบอกว่า “หนูตั้งใจกับทางนี้จริง ๆ และนี่คือแผนของหนู”",
        kind: "boundary",
      },
    ],
  },
];

function scoreTitle(score: number): { title: string; sub: string } {
  if (score >= 4)
    return { title: "นักตั้งขอบเขตมือทอง ⚓", sub: "เธอบอกความจริงของตัวเองได้โดยไม่ทิ้งความสัมพันธ์ — ทักษะที่ผู้ใหญ่หลายคนยังทำไม่ได้เลยนะ" };
  if (score >= 2)
    return { title: "เริ่มยืนได้มั่นขึ้นแล้ว ✨", sub: "เจอขอบเขตนุ่มนวลเกินครึ่ง! ที่เหลือคือการฝึกพูดมันออกเสียงจริง ๆ — เริ่มจากเรื่องเล็กสุดก่อนก็ได้" };
  return { title: "วันนี้ได้เห็นทางเลือกที่สามแล้ว 🌱", sub: "หลายคนโตมากับแค่สองทาง: ทนเงียบ หรือระเบิด — แค่รู้ว่ามีทางที่สาม บ้านก็เริ่มเปลี่ยนได้แล้ว" };
}

/** Exiting trees must be unclickable — a stale "next" click from an exiting
 *  round advances the index past the end (that closure's isLast is outdated). */
const slide = {
  initial: { opacity: 0, x: 44 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -44, pointerEvents: "none" as const },
};

export type HeavyHopesGameProps = {
  onComplete?: (score: number) => void;
  className?: string;
};

export function HeavyHopesGame({ onComplete, className }: HeavyHopesGameProps) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<StyleKind | null>(null);
  const [done, setDone] = useState(false);

  const round = ROUNDS[index];
  const isLast = index === ROUNDS.length - 1;
  const boundaryLine = round.options.find((o) => o.kind === "boundary")?.text ?? "";
  // Sync mirror of "this round is judged" — state alone can't stop a double-tap
  // that lands before React flushes (it would score/advance twice).
  const judgedRef = useRef(false);

  function pick(kind: StyleKind) {
    if (judgedRef.current) return;
    judgedRef.current = true;
    if (kind === "boundary") setScore((s) => s + 1);
    setPicked(kind);
  }

  function next() {
    if (!picked) return;
    if (isLast) {
      setDone(true);
      onComplete?.(score);
      return;
    }
    // From-token advance: only move if we're still on the round this handler
    // was rendered for — a stale or doubled click becomes a no-op, never i+2.
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

  /* ------------------------------------------------------------- summary */
  if (done) {
    const t = scoreTitle(score);
    return (
      <div className={cn("mx-auto w-full max-w-md", className)}>
        <div className="space-y-4 text-center" role="status" aria-live="polite">
          <FluffyBuddy expression={score >= 2 ? "happy" : "content"} size={110} className="mx-auto" />
          <div>
            <p className="text-[0.78rem] font-semibold text-amber-700">
              เลือกขอบเขตนุ่มนวลได้ {score} จาก {ROUNDS.length} สถานการณ์
            </p>
            <h2 className="font-display th:leading-snug mt-1 text-[1.3rem] font-bold text-ink">
              {t.title}
            </h2>
            <p className="mx-auto mt-1.5 max-w-sm text-[0.84rem] leading-relaxed text-ink-soft">
              {t.sub}
            </p>
          </div>

          <div className="rounded-2xl bg-amber-50 p-4 text-left ring-1 ring-amber-200/70">
            <p className="flex items-center gap-1.5 text-[0.82rem] font-bold text-amber-700">
              <Anchor className="size-4" aria-hidden="true" />
              สูตรขอบเขตนุ่มนวล 3 ขั้น
            </p>
            <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink-soft">
              1) รับความหวังดีไว้ก่อน (“หนูรู้ว่าแม่ห่วง”) · 2) บอกความจริง/ข้อจำกัดของเรา ·
              3) เสนอทางที่เราไหวจริง — ขอบเขตไม่ใช่การไม่รักพ่อแม่
              <span className="font-semibold text-ink"> มันคือการรักกันในแบบที่เราหายใจได้</span>
            </p>
          </div>

          <div className="rounded-2xl bg-lavender-50 p-4 text-left ring-1 ring-lavender-200/70">
            <p className="text-[0.8rem] leading-relaxed text-ink-soft">
              พูดตรง ๆ นะ: บางบ้านไม่เปลี่ยนตั้งแต่ครั้งแรกที่เราลองพูด — ไม่ได้แปลว่าเธอพูดผิดหรือไม่ควรพูด
              ถ้าคุยเองแล้วชนกำแพง{" "}
              <Link href="/appointments" className="font-semibold text-lavender-700 underline">
                ครูแนะแนวช่วยเป็นตัวกลาง
              </Link>{" "}
              ได้ หรือมาซ้อมบทพูดกับ{" "}
              <Link href="/chatbot" className="font-semibold text-lavender-700 underline">
                Well.AI
              </Link>{" "}
              ก่อนก็ได้เสมอ
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

  /* ------------------------------------------------------------- playing */
  const pickedMeta = picked ? STYLE_META[picked] : null;

  return (
    <div className={cn("mx-auto w-full max-w-md", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h1 className="font-display th:leading-snug text-[1.15rem] font-bold text-ink">
          ⚖️ ความคาดหวังที่หนักเกินไป
        </h1>
        <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-[0.74rem] font-bold text-amber-700 ring-1 ring-amber-200">
          ฉากที่ {index + 1}/{ROUNDS.length}
        </span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-500"
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
              <p className="text-[0.85rem] font-medium text-ink">เธอจะรับมือยังไง?</p>
              {round.options.map((o) => (
                <button
                  key={o.text}
                  type="button"
                  onClick={() => pick(o.kind)}
                  className="block w-full rounded-2xl bg-white p-3.5 text-left text-[0.85rem] leading-relaxed text-ink ring-1 ring-neutral-200 transition hover:ring-amber-300 active:scale-[0.99]"
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
                  picked === "boundary" ? "bg-mint-50 ring-mint-200" : "bg-amber-50 ring-amber-200",
                )}
              >
                <div className="flex items-start gap-3">
                  <FluffyBuddy
                    expression={(picked === "boundary" ? "happy" : "surprised") as FluffyExpression}
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
                      {pickedMeta!.note}
                    </p>
                    {picked !== "boundary" && (
                      <p className="mt-2 rounded-xl bg-white/70 p-2.5 text-[0.8rem] leading-relaxed text-mint-700">
                        <span className="font-semibold">ขอบเขตนุ่มนวลหน้าตาแบบนี้:</span>{" "}
                        {boundaryLine}
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

export default HeavyHopesGame;
