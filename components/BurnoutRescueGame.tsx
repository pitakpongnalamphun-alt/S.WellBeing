"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BatteryLow, Flame, RotateCcw, Sparkles } from "lucide-react";

import { FluffyBuddy, type FluffyExpression } from "@/components/FluffyBuddy";
import { cn } from "@/lib/utils";

/* ============================================================================
   กู้ไฟหมดใจ — the Academics island's burnout-signal game.

   Sort each situation: ordinary tiredness (rest fixes it) vs a fading-flame
   signal (rest stops working, joy goes numb, output drops while effort rises).
   Knowing the difference is the skill — burnout creeps in wearing "ขี้เกียจ"
   as a disguise, and teens blame themselves for what is actually an empty tank.
   ========================================================================== */

type FlameCard = {
  id: string;
  text: string;
  /** true = fading-flame signal, false = ordinary tiredness. */
  isBurnout: boolean;
  tag: string;
  why: string;
  /** Cards past the seek-help threshold nudge INLINE — a player who quits
   *  mid-game must not miss the escalation that only lives on the summary. */
  urgent?: string;
};

const CARDS: FlameCard[] = [
  {
    id: "recharge-works",
    text: "เหนื่อยมากหลังอ่านหนังสือทั้งวัน แต่พอได้นอนเต็มอิ่มก็กลับมาสดใสเหมือนเดิม",
    isBurnout: false,
    tag: "ชาร์จติด",
    why: "เหนื่อยแล้ว “ชาร์จกลับมาติด” คือความเหนื่อยธรรมดาของคนที่กำลังพยายาม — พักให้พอแล้วไปต่อได้เลย",
  },
  {
    id: "recharge-broken",
    text: "พักเท่าไหร่ก็ไม่หายเพลีย ตื่นมาก็เหนื่อยเหมือนไม่ได้นอน ติดต่อกันหลายสัปดาห์",
    isBurnout: true,
    tag: "ชาร์จไม่เข้า",
    why: "พักแล้วไม่ฟื้นคือสัญญาณคลาสสิกของไฟใกล้มอด — ปัญหาไม่ใช่ขี้เกียจ แต่คือแบตที่ถูกใช้เกินมานาน",
    urgent:
      "ถ้าอาการแบบนี้อยู่กับเธอนานหลายสัปดาห์แล้ว ไม่ต้องรอเล่นเกมจบ — เล่าให้ครูแนะแนวหรือ Well.AI ฟังได้เลยนะ นี่เกินคำว่าเหนื่อยธรรมดาแล้ว",
  },
  {
    id: "numb-favorite",
    text: "วิชาที่เคยชอบที่สุด ตอนนี้เปิดหนังสือแล้วรู้สึกเฉยชา ไม่รู้สึกอะไรเลย",
    isBurnout: true,
    tag: "สิ่งที่รักกลายเป็นชา",
    why: "ความเฉยชากับสิ่งที่เคยรักไม่ใช่ “หมดความสามารถ” แต่เป็นใจที่กำลังประหยัดพลังงานขั้นสุดท้าย — สัญญาณเด่นของ burnout",
  },
  {
    id: "exam-nerves",
    text: "ใจเต้นแรง กังวลมากช่วงก่อนสอบใหญ่ แต่พอสอบเสร็จก็กลับมาร่าเริงปกติ",
    isBurnout: false,
    tag: "ตื่นเต้นตามเหตุการณ์",
    why: "ความเครียดที่มากับเหตุการณ์และจากไปพร้อมเหตุการณ์ คือระบบเตือนภัยปกติของร่างกาย ไม่ใช่ไฟมอด",
  },
  {
    id: "short-fuse",
    text: "ช่วงนี้หงุดหงิดใส่ทุกคนง่ายมากทั้งที่เมื่อก่อนใจเย็น แล้วก็มานั่งรู้สึกผิดทีหลังทุกครั้ง",
    isBurnout: true,
    tag: "ฟิวส์สั้นผิดปกติ",
    why: "อารมณ์ที่สั้นลงเรื่อย ๆ มักเป็นพลังงานใจที่เหลือน้อยจนไม่พอกรองอารมณ์ — ตัวเราไม่ได้นิสัยแย่ลง แค่ถังใกล้หมด",
  },
  {
    id: "chosen-rest",
    text: "คืนวันศุกร์ตั้งใจนอนดึกดูซีรีส์ เพราะรู้ว่าพรุ่งนี้ตื่นสายได้",
    isBurnout: false,
    tag: "พักที่เลือกเอง",
    why: "การพักที่เรา “เลือกเองและวางแผนได้” คือการเติมเชื้อเพลิง ไม่ใช่สัญญาณอันตราย — อย่ารู้สึกผิดกับมัน",
  },
  {
    id: "cant-start",
    text: "เริ่มเลื่อนทุกอย่างออกไป ไม่ใช่เพราะขี้เกียจ แต่รู้สึก “ไม่ไหวจะเริ่ม” แม้แต่งานง่าย ๆ",
    isBurnout: true,
    tag: "สตาร์ทไม่ติด",
    why: "อาการ “ไม่ไหวจะเริ่ม” ทั้งที่งานง่าย คือเครื่องที่น้ำมันหมด ไม่ใช่คนขับที่ขี้เกียจ — ยิ่งด่าตัวเองยิ่งสตาร์ทยาก",
  },
  {
    id: "effort-up-result-down",
    text: "ใช้เวลาอ่านหนังสือมากขึ้นกว่าเดิม แต่คะแนนกลับแย่ลงเรื่อย ๆ",
    isBurnout: true,
    tag: "ยิ่งเร่งยิ่งถอย",
    why: "ความพยายามเพิ่มแต่ผลลดลง คือสมองที่ทำงานเกินขีดจนประสิทธิภาพตก — ทางแก้คือพักและลดภาระ ไม่ใช่เร่งเพิ่ม",
  },
];

function scoreTitle(score: number): { title: string; sub: string } {
  if (score >= 7)
    return { title: "ผู้เชี่ยวชาญเกจไฟ 🔥", sub: "เธออ่านสัญญาณไฟได้แม่นมาก — ทั้งของตัวเองและของเพื่อนที่นั่งข้าง ๆ" };
  if (score >= 4)
    return { title: "เริ่มอ่านเกจไฟออกแล้ว ✨", sub: "แยกได้เกินครึ่ง! สัญญาณที่หลอกเก่งที่สุดคือพวกที่ปลอมตัวเป็น “ขี้เกียจ” — เจอบ่อยขึ้นจะยิ่งไว" };
  return { title: "วันนี้ได้รู้จักเกจไฟของใจ 🌱", sub: "ไม่เป็นไรเลย — สัญญาณพวกนี้ถูกออกแบบมาให้มองข้าม การเริ่มสังเกตคือการดูแลตัวเองขั้นแรกแล้ว" };
}

const slide = {
  initial: { opacity: 0, x: 44 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -44, pointerEvents: "none" as const },
};

export type BurnoutRescueGameProps = {
  onComplete?: (score: number) => void;
  className?: string;
};

export function BurnoutRescueGame({ onComplete, className }: BurnoutRescueGameProps) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [judged, setJudged] = useState<null | { correct: boolean }>(null);
  const [done, setDone] = useState(false);
  const judgedRef = useRef(false);

  const card = CARDS[index];
  const isLast = index === CARDS.length - 1;

  function judge(saidBurnout: boolean) {
    if (judgedRef.current) return;
    judgedRef.current = true;
    const correct = saidBurnout === card.isBurnout;
    if (correct) setScore((s) => s + 1);
    setJudged({ correct });
  }

  function next() {
    if (!judged) return;
    if (isLast) {
      setDone(true);
      onComplete?.(score);
      return;
    }
    const from = index;
    judgedRef.current = false;
    setIndex((i) => (i === from ? i + 1 : i));
    setJudged(null);
  }

  function replay() {
    judgedRef.current = false;
    setIndex(0);
    setScore(0);
    setJudged(null);
    setDone(false);
  }

  if (done) {
    const t = scoreTitle(score);
    return (
      <div className={cn("mx-auto w-full max-w-md", className)}>
        <div className="space-y-4 text-center" role="status" aria-live="polite">
          <FluffyBuddy expression={score >= 4 ? "happy" : "content"} size={110} className="mx-auto" />
          <div>
            <p className="text-[0.78rem] font-semibold text-sky-700">
              อ่านเกจไฟถูก {score} จาก {CARDS.length} สถานการณ์
            </p>
            <h2 className="font-display th:leading-snug mt-1 text-[1.3rem] font-bold text-ink">
              {t.title}
            </h2>
            <p className="mx-auto mt-1.5 max-w-sm text-[0.84rem] leading-relaxed text-ink-soft">
              {t.sub}
            </p>
          </div>

          <div className="rounded-2xl bg-sky-50 p-4 text-left ring-1 ring-sky-200/70">
            <p className="flex items-center gap-1.5 text-[0.82rem] font-bold text-sky-700">
              <Flame className="size-4" aria-hidden="true" />
              กฎกู้ไฟ 3 ข้อ
            </p>
            <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink-soft">
              1) พัก “ก่อน” ไฟหมด ไม่ใช่หลังหมด — ตารางพักคือส่วนหนึ่งของตารางอ่าน ·
              2) ไฟมอดแก้ด้วยการลดภาระและขอตัวช่วย ไม่ใช่ฝืนเร่งให้หนักขึ้น ·
              3) เติมเชื้อเพลิงที่ใช่: นอนพอ กินข้าว เจอเพื่อน และทำสิ่งที่ชอบโดยไม่รู้สึกผิด
            </p>
          </div>

          <div className="rounded-2xl bg-lavender-50 p-4 text-left ring-1 ring-lavender-200/70">
            <p className="text-[0.8rem] leading-relaxed text-ink-soft">
              ถ้าสัญญาณไฟมอดอยู่กับเธอนานเกิน 2 สัปดาห์และไม่ดีขึ้น —
              นั่นไม่ใช่เรื่องต้องอดทนคนเดียว ลองเล่าให้{" "}
              <Link href="/chatbot" className="font-semibold text-lavender-700 underline">
                Well.AI
              </Link>{" "}
              ฟัง หรือ{" "}
              <Link href="/appointments" className="font-semibold text-lavender-700 underline">
                นัดคุยกับครู
              </Link>{" "}
              ได้เสมอ
            </p>
          </div>

          <button
            type="button"
            onClick={replay}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-neutral-300 px-5 py-3 text-[0.88rem] font-medium text-ink-soft transition hover:border-neutral-400 hover:text-ink"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            เช็คอีกรอบ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("mx-auto w-full max-w-md", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h1 className="font-display th:leading-snug text-[1.15rem] font-bold text-ink">
          🔥 กู้ไฟหมดใจ
        </h1>
        <span className="shrink-0 rounded-full bg-sky-50 px-3 py-1 text-[0.74rem] font-bold text-sky-700 ring-1 ring-sky-200">
          ข้อ {index + 1}/{CARDS.length}
        </span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-sky-400 transition-all duration-500"
          style={{ width: `${((index + (judged ? 1 : 0)) / CARDS.length) * 100}%` }}
        />
      </div>
      <p className="mb-3 text-[0.8rem] text-ink-soft">
        อาการแบบนี้คือเหนื่อยธรรมดา หรือสัญญาณว่าไฟใกล้มอด?
      </p>

      <AnimatePresence initial={false}>
        <motion.div key={card.id} {...(reduce ? {} : slide)}>
          <div className="rounded-3xl bg-white p-4.5 ring-1 ring-neutral-200">
            <p className="p-1 text-[0.95rem] leading-relaxed text-ink">{card.text}</p>
          </div>

          {judged === null ? (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => judge(false)}
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-sky-600 text-[0.92rem] font-bold text-white shadow-[0_10px_24px_-14px_rgba(2,132,199,0.8)] transition hover:bg-sky-500 active:scale-[0.98]"
              >
                🔋 เหนื่อยธรรมดา
              </button>
              <button
                type="button"
                onClick={() => judge(true)}
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-amber-500 text-[0.92rem] font-bold text-white shadow-[0_10px_24px_-14px_rgba(217,119,6,0.8)] transition hover:bg-amber-600 active:scale-[0.98]"
              >
                <BatteryLow className="size-4.5" aria-hidden="true" />
                ไฟใกล้มอด
              </button>
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
                  judged.correct ? "bg-mint-50 ring-mint-200" : "bg-amber-50 ring-amber-200",
                )}
              >
                <div className="flex items-start gap-3">
                  <FluffyBuddy
                    expression={(judged.correct ? "happy" : "surprised") as FluffyExpression}
                    size={64}
                    className="shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-[0.9rem] font-bold",
                        judged.correct ? "text-mint-700" : "text-amber-700",
                      )}
                    >
                      {judged.correct ? "อ่านเกจแม่นมาก!" : "ข้อนี้เนียน — ดูเฉลยกัน"}
                    </p>
                    <span
                      className={cn(
                        "mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold ring-1",
                        card.isBurnout
                          ? "bg-amber-50 text-amber-700 ring-amber-200"
                          : "bg-sky-50 text-sky-700 ring-sky-200",
                      )}
                    >
                      {card.isBurnout ? "🪫" : "🔋"} {card.tag}
                    </span>
                    <p className="mt-2 text-[0.82rem] leading-relaxed text-ink-soft">{card.why}</p>
                    {card.urgent && (
                      <p className="mt-2 rounded-xl bg-white/70 p-2.5 text-[0.8rem] font-medium leading-relaxed text-rose-600">
                        {card.urgent}
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
                    ดูผลเช็คไฟ
                    <Sparkles className="size-4" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    ข้อถัดไป
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

export default BurnoutRescueGame;
