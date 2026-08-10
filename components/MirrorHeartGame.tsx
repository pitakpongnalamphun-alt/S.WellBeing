"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Gem, Heart, RotateCcw, Sparkles } from "lucide-react";

import { FluffyBuddy, type FluffyExpression } from "@/components/FluffyBuddy";
import { cn } from "@/lib/utils";

/* ============================================================================
   กระจกใจ — body-image game for the Self island.

   The metaphor: some "mirrors" reflect the truth, others are funhouse mirrors
   bent by ads, feeds, and careless comments. The player sorts belief cards into
   กระจกจริง 💎 vs กระจกบิดเบี้ยว 🌀 and learns WHY each bend exists.

   Written with care for a sensitive topic: no numbers, no named body parts, no
   "fix yourself" framing — the game questions the MIRROR, never the body. The
   summary carries a gentle signpost for when body worries start to bite into
   eating/sleep/school, because for some players this is not hypothetical.
   ========================================================================== */

type MirrorCard = {
  id: string;
  text: string;
  /** true = an honest mirror (กระจกจริง), false = a bent one (บิดเบี้ยว). */
  isTrue: boolean;
  tag: string;
  why: string;
};

const CARDS: MirrorCard[] = [
  {
    id: "curated-feed",
    text: "รูปในฟีดคือรูปที่ถูกคัดมาแล้วจากเป็นร้อยช็อต ผ่านมุมกล้อง แสง และฟิลเตอร์",
    isTrue: true,
    tag: "รู้ทันหน้าจอ",
    why: "จริงเลย — เรากำลังเทียบ “ตัวเราเวอร์ชันธรรมดาวันนี้” กับ “ไฮไลต์ที่ถูกจัดฉากของคนอื่น” ซึ่งไม่แฟร์กับตัวเองตั้งแต่ต้น",
  },
  {
    id: "one-standard",
    text: "ถ้าหน้าตารูปร่างไม่เหมือนไอดอลในจอ แปลว่าเราไม่น่ารัก",
    isTrue: false,
    tag: "มาตรฐานเดียวลวงโลก",
    why: "กระจกบานนี้บิดเบี้ยว — “ความสวยความหล่อมาตรฐานเดียว” เปลี่ยนไปทุกยุคทุกประเทศ ความน่ารักมีเป็นล้านแบบ และแบบของเธอก็เป็นหนึ่งในนั้น",
  },
  {
    id: "body-is-home",
    text: "ร่างกายเราคือบ้านที่พาเราวิ่งเล่น หัวเราะ กอดเพื่อน — ไม่ใช่ของตั้งโชว์ให้ใครให้คะแนน",
    isTrue: true,
    tag: "ร่างกายคือบ้าน",
    why: "กระจกจริงสะท้อนว่า “ร่างกายมีไว้ใช้ชีวิต ไม่ได้มีไว้สอบผ่านสายตาใคร” — ขอบคุณมันที่พาเราไปทุกที่ดีกว่าจับผิดมัน",
  },
  {
    id: "spotlight",
    text: "คนรอบตัวคอยจ้องมองจุดที่เราไม่มั่นใจอยู่ตลอดเวลา",
    isTrue: false,
    tag: "ไฟฉายในหัวตัวเอง",
    why: "บิดเบี้ยว — จริง ๆ แล้วแต่ละคนยุ่งอยู่กับการกังวลเรื่องของตัวเองพอ ๆ กับเรา จุดที่เราเพ่งในกระจกนาน ๆ คนอื่นแทบไม่ทันสังเกตด้วยซ้ำ",
  },
  {
    id: "numbers",
    text: "น้ำหนักและส่วนสูงเป็นแค่ข้อมูลของร่างกาย ไม่ใช่คะแนนคุณค่าความเป็นคน",
    isTrue: true,
    tag: "ตัวเลข ≠ คุณค่า",
    why: "จริง — ตัวเลขพวกนี้มีไว้ให้หมอดูแลสุขภาพเรา ไม่ได้มีไว้ตัดเกรดว่าใครน่ารักหรือใครสำคัญ",
  },
  {
    id: "comment-boundary",
    text: "ถ้ามีคนทักหรือคอมเมนต์รูปร่างเรา เราต้องเก็บมาแก้ไขตัวเองเสมอ",
    isTrue: false,
    tag: "คอมเมนต์ที่ไม่ได้ขอ",
    why: "บิดเบี้ยว — คำวิจารณ์รูปร่างที่ไม่มีใครขอ สะท้อนมารยาทของคนพูดมากกว่าตัวเรา เรามีสิทธิ์บอกว่า “เรื่องนี้ไม่รับฟีดแบ็กจ้า” ได้เต็มที่",
  },
  {
    id: "teen-change",
    text: "ร่างกายช่วงวัยรุ่นกำลังเปลี่ยนแปลงครั้งใหญ่ และแต่ละคนเปลี่ยนไม่พร้อมกัน — เป็นเรื่องปกติมาก",
    isTrue: true,
    tag: "ต่างจังหวะ ไม่ใช่ผิดปกติ",
    why: "จริง — ช่วงนี้ร่างกายทุกคนกำลัง “ก่อสร้าง” กันคนละเฟส เทียบกันตอนนี้เหมือนเทียบเค้กที่ยังอบไม่เสร็จกับเค้กที่แต่งหน้าแล้ว",
  },
  {
    id: "wait-perfect",
    text: "ต้องรอให้รูปร่าง “เพอร์เฟกต์” ก่อน ถึงค่อยใส่ชุดที่ชอบ ไปทะเล หรือถ่ายรูปกับเพื่อน",
    isTrue: false,
    tag: "ชีวิตไม่ต้องรอใบอนุญาต",
    why: "บิดเบี้ยวสุด ๆ — ความสุขไม่มีเงื่อนไขรูปร่างแนบท้าย ชุดที่ชอบ ทะเล และรูปกับเพื่อน เป็นของเธอได้ตั้งแต่วันนี้เลย",
  },
];

function scoreTitle(score: number): { title: string; sub: string } {
  if (score >= 7)
    return { title: "ตาแยกกระจกระดับเซียน 💎", sub: "เธอมองทะลุกระจกบิดเบี้ยวได้เกือบหมด — สายตาแบบนี้จะช่วยทั้งตัวเธอและเพื่อนที่กำลังเทียบตัวเองกับหน้าจอ" };
  if (score >= 4)
    return { title: "เริ่มจับเงาบิดเบี้ยวได้แล้ว ✨", sub: "แยกได้เกินครึ่ง! กระจกบิดเบี้ยวหลายบานแนบเนียนเพราะเราได้ยินมันมาตั้งแต่เด็ก — เจอบ่อยขึ้นจะยิ่งไวขึ้น" };
  return { title: "วันนี้ได้ส่องกระจกครบทุกบาน 🌱", sub: "ไม่แปลกเลยที่แยกยาก — กระจกบิดเบี้ยวพวกนี้ถูกฉายใส่เราทุกวันจนดูเหมือนความจริง การได้ตั้งคำถามกับมันคือก้าวแรกที่ใหญ่มาก" };
}

/** Exiting trees must be unclickable — a stale "next" click from an exiting
 *  card advances the index past the end (that closure's isLast is outdated). */
const slide = {
  initial: { opacity: 0, x: 44 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -44, pointerEvents: "none" as const },
};

export type MirrorHeartGameProps = {
  onComplete?: (score: number) => void;
  className?: string;
};

export function MirrorHeartGame({ onComplete, className }: MirrorHeartGameProps) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [judged, setJudged] = useState<null | { saidTrue: boolean; correct: boolean }>(null);
  const [done, setDone] = useState(false);

  const card = CARDS[index];
  const isLast = index === CARDS.length - 1;

  // Sync mirror of "this card is judged" — state alone can't stop a double-tap
  // that lands before React flushes (it would score/advance twice).
  const judgedRef = useRef(false);

  function judge(saidTrue: boolean) {
    if (judgedRef.current) return;
    judgedRef.current = true;
    const correct = saidTrue === card.isTrue;
    if (correct) setScore((s) => s + 1);
    setJudged({ saidTrue, correct });
  }

  function next() {
    if (!judged) return;
    if (isLast) {
      setDone(true);
      onComplete?.(score);
      return;
    }
    // From-token advance: a stale or doubled click becomes a no-op, never i+2.
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

  /* ------------------------------------------------------------- summary */
  if (done) {
    const t = scoreTitle(score);
    return (
      <div className={cn("mx-auto w-full max-w-md", className)}>
        <div className="space-y-4 text-center" role="status" aria-live="polite">
          <FluffyBuddy expression={score >= 4 ? "happy" : "content"} size={110} className="mx-auto" />
          <div>
            <p className="text-[0.78rem] font-semibold text-lavender-700">
              แยกถูก {score} จาก {CARDS.length} บาน
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
              <Heart className="size-4" aria-hidden="true" />
              เรื่องจริงที่อยากให้จำ
            </p>
            <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink-soft">
              กระจกบิดเบี้ยวเกือบทุกบานถูกส่งมาจากข้างนอก — โฆษณา ฟีด และคำพูดที่ไม่ได้คิดก่อนพูด
              มันไม่ได้เกิดจากร่างกายของเธอเลย ปัญหาอยู่ที่กระจก ไม่ใช่คนที่ยืนอยู่หน้ามัน
            </p>
          </div>

          <div className="rounded-2xl bg-rose-50 p-4 text-left ring-1 ring-rose-200/70">
            <p className="text-[0.8rem] leading-relaxed text-ink-soft">
              ถ้าความกังวลเรื่องรูปร่างเริ่มหนักจนกระทบการกิน การนอน หรือทำให้ไม่อยากเจอใคร —
              <span className="font-semibold text-ink"> นั่นคือใจกำลังส่งสัญญาณขอตัวช่วย</span>{" "}
              มาคุยกันได้เสมอที่{" "}
              <Link href="/appointments" className="font-semibold text-rose-600 underline">
                นัดพูดคุยกับครู
              </Link>{" "}
              หรือเริ่มจากระบายกับ{" "}
              <Link href="/chatbot" className="font-semibold text-rose-600 underline">
                Well.AI
              </Link>{" "}
              ก่อนก็ได้
            </p>
          </div>

          <button
            type="button"
            onClick={replay}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-neutral-300 px-5 py-3 text-[0.88rem] font-medium text-ink-soft transition hover:border-neutral-400 hover:text-ink"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            ส่องอีกรอบ
          </button>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------- playing */
  return (
    <div className={cn("mx-auto w-full max-w-md", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h1 className="font-display th:leading-snug text-[1.15rem] font-bold text-ink">
          🪞 กระจกใจ
        </h1>
        <span className="shrink-0 rounded-full bg-lavender-50 px-3 py-1 text-[0.74rem] font-bold text-lavender-700 ring-1 ring-lavender-200">
          บานที่ {index + 1}/{CARDS.length}
        </span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-lavender-400 transition-all duration-500"
          style={{ width: `${((index + (judged ? 1 : 0)) / CARDS.length) * 100}%` }}
        />
      </div>
      <p className="mb-3 text-[0.8rem] text-ink-soft">
        กระจกบานนี้สะท้อนความจริง หรือเป็นกระจกบิดเบี้ยวที่ใครบางคนยื่นให้เรา?
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
                onClick={() => judge(true)}
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-lavender-600 text-[0.95rem] font-bold text-white shadow-[0_10px_24px_-14px_rgba(91,63,176,0.8)] transition hover:bg-lavender-700 active:scale-[0.98]"
              >
                <Gem className="size-4.5" aria-hidden="true" />
                กระจกจริง
              </button>
              <button
                type="button"
                onClick={() => judge(false)}
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-slate-600 text-[0.95rem] font-bold text-white shadow-[0_10px_24px_-14px_rgba(51,65,85,0.8)] transition hover:bg-slate-500 active:scale-[0.98]"
              >
                🌀 บิดเบี้ยว
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
                      {judged.correct ? "ตาแหลมมาก!" : "บานนี้เนียนจริง — มาดูกัน"}
                    </p>
                    <span
                      className={cn(
                        "mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold ring-1",
                        card.isTrue
                          ? "bg-lavender-50 text-lavender-700 ring-lavender-200"
                          : "bg-slate-100 text-slate-600 ring-slate-200",
                      )}
                    >
                      {card.isTrue ? "💎" : "🌀"} {card.tag}
                    </span>
                    <p className="mt-2 text-[0.82rem] leading-relaxed text-ink-soft">{card.why}</p>
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
                    ดูผลการส่อง
                    <Sparkles className="size-4" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    บานถัดไป
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

export default MirrorHeartGame;
