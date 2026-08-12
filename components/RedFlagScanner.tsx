"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Flag, Heart, RotateCcw, Sparkles } from "lucide-react";

import { FluffyBuddy, type FluffyExpression } from "@/components/FluffyBuddy";
import { cn } from "@/lib/utils";

/* ============================================================================
   สแกนเนอร์ Red Flag — spot-the-signal game for the Romance island.

   One situation card at a time; the player judges 🚩 ธงแดง or 💚 โอเคอยู่ and
   immediately learns WHY — the explanation is the real lesson, the score is
   just the sugar. Every ending is framed as growth (a teenager who missed
   flags just LEARNED them — never shame), and the summary points at real help
   because some players aren't playing hypothetically.
   ========================================================================== */

type FlagCard = {
  id: string;
  /** The situation, written like a story beat. */
  text: string;
  isRed: boolean;
  /** Signal name shown as a chip on the reveal. */
  tag: string;
  /** The WHY — the sentence we actually want remembered. */
  why: string;
  /** Extra-serious cards get an extra line in stronger ink. */
  urgent?: string;
};

const CARDS: FlagCard[] = [
  {
    id: "password",
    text: "เขาขอรหัสผ่านมือถือของเธอ แล้วบอกว่า “คนรักกันต้องไม่มีความลับต่อกันสิ”",
    isRed: true,
    tag: "การควบคุม",
    why: "ความไว้ใจไม่ได้แปลว่าต้องยกความเป็นส่วนตัวให้หมด — การขอสิทธิ์เข้าถึง “ทุกอย่าง” คือการควบคุม ไม่ใช่ความรัก",
  },
  {
    id: "study-day",
    text: "เธอไปติวกับกลุ่มเพื่อนทั้งวัน เขาทักมาแค่ว่า “ติวให้สนุกนะ เสร็จแล้วเล่าให้ฟังบ้าง”",
    isRed: false,
    tag: "เคารพพื้นที่",
    why: "คนที่รักแบบสุขภาพดีเคารพเวลาและโลกส่วนตัวของเรา ไม่งอน ไม่จับผิด ไม่ต้องรายงานตัว",
  },
  {
    id: "only-me",
    text: "เขาไม่ชอบให้เธอไปไหนกับเพื่อน ชอบพูดว่า “มีเราคนเดียวก็พอแล้วนี่”",
    isRed: true,
    tag: "แยกเธอจากคนรอบตัว",
    why: "การค่อย ๆ ตัดเราออกจากเพื่อนและครอบครัวจนเหลือแค่เขา คือสัญญาณอันตรายที่มักมาในห่อหวาน ๆ",
  },
  {
    id: "prove-it",
    text: "เวลาอยากให้เธอทำสิ่งที่เธอไม่สบายใจ เขาจะพูดว่า “ถ้ารักกันจริง ต้องพิสูจน์สิ”",
    isRed: true,
    tag: "กดดันด้วยคำว่ารัก",
    why: "ความรักไม่ต้องพิสูจน์ด้วยการฝืนใจ — การเอาคำว่า “รัก” มาบีบให้ยอม คือการบังคับ และเธอมีสิทธิ์ปฏิเสธเสมอ",
  },
  {
    id: "cool-down",
    text: "ทะเลาะกัน เขาขอเวลาใจเย็นก่อน แล้วกลับมาคุยดี ๆ พร้อมขอโทษในส่วนที่ตัวเองผิด",
    isRed: false,
    tag: "สื่อสารสุขภาพดี",
    why: "เห็นต่างได้ โกรธได้ — แต่กลับมาคุยด้วยเหตุผล รับผิดชอบคำพูดตัวเอง และปรับจริง นี่คือธงเขียวชัด ๆ",
  },
  {
    id: "explode-sweet",
    text: "เวลาโกรธเขาด่าแรงมาก แต่ไม่นานก็กลับมาหวาน ซื้อของมาง้อ แล้วก็วนแบบเดิมซ้ำ ๆ",
    isRed: true,
    tag: "วงจรระเบิด-ง้อหวาน",
    why: "วงจร “ทำร้าย → ง้อหวาน → ทำร้ายอีก” ไม่ใช่ความรักที่เร่าร้อน แต่เป็นรูปแบบที่มักรุนแรงขึ้นเรื่อย ๆ",
  },
  {
    id: "just-joking",
    text: "เขาชอบแซะเธอต่อหน้าเพื่อน พอเธอบอกว่าไม่โอเค เขาว่า “แค่ล้อเล่น อย่าคิดมากน่า”",
    isRed: true,
    tag: "ด้อยค่าแล้วโทษว่าคิดมาก",
    why: "การด้อยค่าซ้ำ ๆ แล้วปัดว่าเรา “คิดมาก” ทำให้เราเริ่มไม่เชื่อความรู้สึกตัวเอง — ความรู้สึกของเธอเชื่อถือได้เสมอ",
  },
  {
    id: "cheer",
    text: "เธอได้รางวัลที่ตั้งใจมานาน เขาดีใจยิ่งกว่าเธออีก แล้วชวนไปฉลองด้วยกัน",
    isRed: false,
    tag: "สนับสนุนกัน",
    why: "คนที่รักเราจะดีใจเมื่อเราเติบโตและไปได้ไกล ไม่รู้สึกถูกแย่งซีน ไม่ดึงเราให้เล็กลง",
  },
  {
    id: "threat",
    text: "พอเธอบอกว่าอยากพักความสัมพันธ์ เขาขู่ว่า “ถ้าเธอไป เดี๋ยวทำร้ายตัวเองแน่”",
    isRed: true,
    tag: "ขู่ให้กลัวเพื่อมัดใจ",
    why: "การขู่แบบนี้คือการมัดใจด้วยความกลัว ไม่ใช่ความรัก และเธอไม่ต้องรับผิดชอบชีวิตใครด้วยการฝืนอยู่ต่อ",
    urgent: "เรื่องนี้ใหญ่เกินกว่าจะแบกคนเดียว — บอกผู้ใหญ่ที่ไว้ใจหรือครูทันที เพื่อให้เขาได้รับความช่วยเหลือที่ถูกทางด้วย",
  },
];

/** Positive framing at every score — missing flags = just learned them. */
function scoreTitle(score: number): { title: string; sub: string } {
  if (score >= 8)
    return { title: "ตาสแกนเนอร์ระดับโปร 🕵️", sub: "เธอจับสัญญาณได้ไวมาก — ตาคู่นี้จะช่วยปกป้องทั้งเธอและเพื่อน" };
  if (score >= 5)
    return { title: "ตาเริ่มไวแล้ว ✨", sub: "จับได้เกินครึ่ง! สัญญาณที่พลาดไปวันนี้ คือสัญญาณที่เธอจะไม่พลาดอีก" };
  return { title: "วันนี้ได้เห็นสัญญาณครบเลย 🌱", sub: "ไม่เป็นไรเลย — ธงแดงหลายอันถูกออกแบบมาให้ดูเหมือนความรัก การได้รู้จักมันคือชัยชนะแล้ว" };
}

/** Exiting trees must be unclickable — a stale "next" click from an exiting
 *  card advances the index past the end (that closure's isLast is outdated). */
const slide = {
  initial: { opacity: 0, x: 44 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -44, pointerEvents: "none" as const },
};

export type RedFlagScannerProps = {
  /** Fired once when the last card is judged (e.g. to award coins). */
  onComplete?: (score: number) => void;
  className?: string;
};

export function RedFlagScanner({ onComplete, className }: RedFlagScannerProps) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [judged, setJudged] = useState<null | { saidRed: boolean; correct: boolean }>(null);
  const [done, setDone] = useState(false);

  const card = CARDS[index];
  const isLast = index === CARDS.length - 1;

  // Sync mirror of "this card is judged" — state alone can't stop a double-tap
  // that lands before React flushes (it would score/advance twice).
  const judgedRef = useRef(false);

  function judge(saidRed: boolean) {
    if (judgedRef.current) return;
    judgedRef.current = true;
    const correct = saidRed === card.isRed;
    if (correct) setScore((s) => s + 1);
    setJudged({ saidRed, correct });
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
          <FluffyBuddy expression={score >= 5 ? "happy" : "content"} size={110} className="mx-auto" />
          <div>
            <p className="text-[0.78rem] font-semibold text-rose-500">
              จับได้ {score} จาก {CARDS.length} สัญญาณ
            </p>
            <h2 className="font-display th:leading-snug mt-1 text-[1.3rem] font-bold text-ink">
              {t.title}
            </h2>
            <p className="mx-auto mt-1.5 max-w-sm text-[0.84rem] leading-relaxed text-ink-soft">
              {t.sub}
            </p>
          </div>

          <div className="rounded-2xl bg-rose-50 p-4 text-left ring-1 ring-rose-200/70">
            <p className="flex items-center gap-1.5 text-[0.82rem] font-bold text-rose-600">
              <Heart className="size-4" aria-hidden="true" />
              หัวใจของความรักที่ดี
            </p>
            <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink-soft">
              เคารพกัน · ไว้ใจกันโดยไม่ต้องควบคุม · และเป็นตัวเองได้เต็มที่เมื่ออยู่ด้วยกัน —
              ความสัมพันธ์ที่ทำให้เธอ “เล็กลง” ไม่ใช่ความรักที่เธอสมควรได้รับ
            </p>
          </div>

          <div className="rounded-2xl bg-lavender-50 p-4 text-left ring-1 ring-lavender-200/70">
            <p className="text-[0.8rem] leading-relaxed text-ink-soft">
              ถ้าสัญญาณในเกมนี้คล้ายเรื่องจริงของเธอหรือเพื่อน —
              <span className="font-semibold text-ink"> นั่นไม่ใช่ความผิดของเธอเลย</span>{" "}
              และเธอไม่ต้องคิดคนเดียว มาเล่าให้คนที่พร้อมฟังได้เสมอ:{" "}
              <Link href="/appointments" className="font-semibold text-lavender-700 underline">
                นัดพูดคุยกับครู
              </Link>{" "}
              หรือระบายกับ{" "}
              <Link href="/chatbot" className="font-semibold text-lavender-700 underline">
                น้องปุย
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
            สแกนอีกรอบ
          </button>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------- playing */
  return (
    <div className={cn("mx-auto w-full max-w-md", className)}>
      {/* header + progress */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <h1 className="font-display th:leading-snug text-[1.15rem] font-bold text-ink">
          🚩 สแกนเนอร์ Red Flag
        </h1>
        <span className="shrink-0 rounded-full bg-rose-50 px-3 py-1 text-[0.74rem] font-bold text-rose-500 ring-1 ring-rose-200">
          ใบที่ {index + 1}/{CARDS.length}
        </span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-rose-400 transition-all duration-500"
          style={{ width: `${((index + (judged ? 1 : 0)) / CARDS.length) * 100}%` }}
        />
      </div>
      <p className="mb-3 text-[0.8rem] text-ink-soft">
        อ่านสถานการณ์แล้วช่วยดูหน่อย — อันนี้คือสัญญาณอันตราย หรือโอเคอยู่?
      </p>

      <AnimatePresence initial={false}>
        <motion.div key={card.id} {...(reduce ? {} : slide)}>
          {/* situation card — a chat-bubble vibe */}
          <div className="rounded-3xl rounded-bl-md bg-white p-4.5 ring-1 ring-neutral-200">
            <p className="p-1 text-[0.95rem] leading-relaxed text-ink">{card.text}</p>
          </div>

          {judged === null ? (
            /* judgement buttons */
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => judge(true)}
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-rose-500 text-[0.95rem] font-bold text-white shadow-[0_10px_24px_-14px_rgba(190,18,60,0.8)] transition hover:bg-rose-600 active:scale-[0.98]"
              >
                <Flag className="size-4.5" aria-hidden="true" />
                ธงแดง!
              </button>
              <button
                type="button"
                onClick={() => judge(false)}
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-mint-600 text-[0.95rem] font-bold text-white shadow-[0_10px_24px_-14px_rgba(12,92,63,0.8)] transition hover:bg-mint-500 active:scale-[0.98]"
              >
                💚 โอเคอยู่
              </button>
            </div>
          ) : (
            /* reveal — the WHY is the lesson */
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
                      {judged.correct ? "จับได้แม่นมาก!" : "ใบนี้หลอกเก่ง — ดูเฉลยกัน"}
                    </p>
                    <span
                      className={cn(
                        "mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold ring-1",
                        card.isRed
                          ? "bg-rose-50 text-rose-600 ring-rose-200"
                          : "bg-mint-100 text-mint-700 ring-mint-300",
                      )}
                    >
                      {card.isRed ? "🚩" : "💚"} {card.tag}
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
                    ดูผลสแกน
                    <Sparkles className="size-4" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    ใบถัดไป
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

export default RedFlagScanner;
