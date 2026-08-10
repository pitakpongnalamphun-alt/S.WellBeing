"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Languages, MessageCircleHeart, RotateCcw, Sparkles } from "lucide-react";

import { FluffyBuddy, type FluffyExpression } from "@/components/FluffyBuddy";
import { cn } from "@/lib/utils";

/* ============================================================================
   แปลภาษาใจพ่อแม่ — the Family island's translator game.

   A harsh parent phrase appears; the player picks which "translation" is
   closest to what's underneath, then gets a reply script (the actual skill).
   Two hard-won design rules for a mental-health app:

   1. Translating is NOT excusing — the reveal never says the words were okay,
      only what fear/care may be hiding under them. Hurt stays valid.
   2. One round deliberately BREAKS the pattern: some words are not clumsy love,
      they are harm — and the right "translation" is to seek a trusted adult.
      Without that card, this game would teach kids to romanticize abuse.
   ========================================================================== */

type Option = {
  text: string;
  correct: boolean;
  /** Why this reading fits / misses — shown on reveal. */
  note: string;
};

type Round = {
  id: string;
  scene: string;
  phrase: string;
  options: Option[];
  /** The reply script — the takeaway skill, shown after judging. */
  reply: string;
};

const ROUNDS: Round[] = [
  {
    id: "compare-grades",
    scene: "คะแนนสอบเพิ่งออก",
    phrase: "“ทำไมได้แค่นี้ ลูกบ้านอื่นเขาได้ที่หนึ่งกันแล้ว”",
    options: [
      {
        text: "แปลว่า: เราไม่มีวันเก่งพอสำหรับแม่",
        correct: false,
        note: "นี่คือเสียงที่ “ความเจ็บ” แปลให้เรา — เจ็บได้จริง แต่มันมักไม่ใช่ประโยคที่อยู่ในใจแม่จริง ๆ",
      },
      {
        text: "แปลว่า: แม่กลัวเราลำบากในวันหน้า แต่ไม่รู้วิธีพูดให้เป็นกำลังใจ",
        correct: true,
        note: "ผู้ใหญ่หลายคนโตมากับการถูกเปรียบเทียบ เลยส่งความห่วงต่อด้วยภาษาเดียวที่เคยได้ยิน — ห่วงจริง แต่แปลออกมาเพี้ยน",
      },
      {
        text: "แปลว่า: แม่แค่อยากอวดลูกกับคนอื่น ไม่ได้สนใจเรา",
        correct: false,
        note: "การปัดว่า “ไม่สนใจเราหรอก” ตัดสะพานก่อนได้ลองข้าม — ส่วนใหญ่ใต้คำเปรียบเทียบมีความกลัวมากกว่าความอยากอวด",
      },
    ],
    reply: "“หนูก็เสียใจกับคะแนนรอบนี้เหมือนกัน กำลังหาวิธีอ่านใหม่อยู่ — ถ้าแม่เชียร์หนู หนูมีแรงขึ้นเยอะเลยนะ”",
  },
  {
    id: "phone",
    scene: "กำลังพักเล่นมือถือหลังทำการบ้านเสร็จ",
    phrase: "“เล่นมือถืออีกแล้ว วัน ๆ ไม่เห็นทำอะไรเลย”",
    options: [
      {
        text: "แปลว่า: พ่อไม่เห็นความพยายามของเราเลยสักนิด",
        correct: false,
        note: "พ่ออาจ “มองไม่เห็น” จริง ๆ ว่าเราทำอะไรไปแล้วบ้าง — ไม่เห็น กับ ไม่เห็นค่า ไม่เหมือนกัน และอันแรกแก้ได้ด้วยการเล่า",
      },
      {
        text: "แปลว่า: จอมือถือคือกำแพงที่พ่อมองไม่เห็นว่าข้างในคืออะไร เลยกังวลไปก่อน",
        correct: true,
        note: "ในสายตาผู้ใหญ่ จอเดียวกันอาจแปลว่า “เสียเวลา” เพราะเขาไม่รู้ว่าเรากำลังพัก คุยงานกลุ่ม หรือดูอะไรอยู่",
      },
      {
        text: "แปลว่า: พ่อแค่หาเรื่องบ่นไปวัน ๆ",
        correct: false,
        note: "ถ้าแปลทุกคำบ่นว่า “หาเรื่อง” เราจะเลิกฟังกันทั้งบ้าน — คำบ่นส่วนใหญ่มีความกังวลปนอยู่ แม้จะออกมาน่าหงุดหงิดก็ตาม",
      },
    ],
    reply: "“หนูเพิ่งทำการบ้านเสร็จ กำลังพักแป๊บนึง — เดี๋ยวหนูตั้งเวลาเล่นไม่เกินสามทุ่มนะ”",
  },
  {
    id: "future",
    scene: "นั่งดูซีรีส์ตอนหัวค่ำ",
    phrase: "“โตขึ้นจะเอาอะไรกิน ถ้าไม่ตั้งใจเรียน”",
    options: [
      {
        text: "แปลว่า: ในหัวแม่มีภาพความลำบากที่แม่เคยเจอ และแม่กลัวภาพนั้นจะเกิดกับเรา",
        correct: true,
        note: "ประโยคขู่เรื่องอนาคตมักเป็น “บาดแผลเก่าของผู้ใหญ่” ที่ฉายมาที่ลูก — มันคือความกลัวของเขา ไม่ใช่คำพยากรณ์ชีวิตเรา",
      },
      {
        text: "แปลว่า: แม่มั่นใจว่าเราจะล้มเหลวแน่นอน",
        correct: false,
        note: "ถ้าแม่มั่นใจว่าเราจะแย่จริง แม่คงไม่เหนื่อยพูด — คนเราไม่ลงทุนบ่นกับสิ่งที่หมดหวังไปแล้ว",
      },
      {
        text: "แปลว่า: แค่คำพูดติดปาก ไม่ได้มีความหมายอะไร",
        correct: false,
        note: "บางทีก็ติดปากจริง แต่ข้างใต้คำติดปากมักมีเรื่องราว — ลองถามแม่ว่าสมัยแม่เรียนเป็นยังไง อาจได้ยินคำตอบที่ทำให้เข้าใจ",
      },
    ],
    reply: "“แม่เคยลำบากเรื่องนี้เหรอ เล่าให้หนูฟังหน่อยสิ” — คำถามเดียว เปลี่ยนการขู่ให้กลายเป็นบทสนทนา",
  },
  {
    id: "no-argue",
    scene: "พยายามอธิบายเหตุผลของตัวเอง",
    phrase: "“อย่ามาเถียง!”",
    options: [
      {
        text: "แปลว่า: ความเห็นของเราไม่มีค่าในบ้านนี้",
        correct: false,
        note: "เจ็บแบบนี้สมเหตุสมผลมาก — แต่ประโยคนี้มักพูดถึง “จังหวะ” มากกว่า “คุณค่า”: ตอนอารมณ์ร้อน ไม่มีใครได้ยินใคร",
      },
      {
        text: "แปลว่า: พ่อแม่โตมากับบ้านที่ “เด็กห้ามเถียง” เลยรู้สึกว่าการอธิบายคือการท้าทาย",
        correct: true,
        note: "หลายบ้านส่งต่อกติกานี้มาหลายรุ่น — เขาไม่ได้เกลียดเหตุผลของเรา เขาแค่ไม่เคยเห็นบ้านที่เด็กอธิบายได้",
      },
      {
        text: "แปลว่า: เราควรเลิกอธิบายอะไรไปตลอด",
        correct: false,
        note: "เงียบตลอดไปไม่ใช่ทางออก — แค่ย้ายการอธิบายไปไว้ตอนที่ทุกคนใจเย็น โอกาสถูกได้ยินจะต่างกันมาก",
      },
    ],
    reply: "รอหลังพายุสงบ แล้วเริ่มว่า “หนูไม่ได้จะเถียงนะ หนูอยากเล่าให้ฟังว่าหนูคิดยังไง” — เปลี่ยนป้ายจาก “เถียง” เป็น “เล่า”",
  },
  {
    id: "tired",
    scene: "แม่กลับจากทำงานด้วยสีหน้าเหนื่อยล้า",
    phrase: "“แม่ทำงานเหนื่อยแทบตาย เพื่อใครไม่รู้!”",
    options: [
      {
        text: "แปลว่า: แม่เสียดายที่มีเรา",
        correct: false,
        note: "คำพูดตอนหมดแรงมักแรงเกินใจจริง — สิ่งที่ล้นออกมาคือความเหนื่อย ไม่ใช่ความเสียดาย",
      },
      {
        text: "แปลว่า: แม่กำลังจะขอโทษที่บ่น",
        correct: false,
        note: "ยังไม่ใช่จังหวะนั้น — ตอนนี้แม่ยังอยู่กลางความเหนื่อย สิ่งที่แม่ต้องการมาก่อนคำขอโทษคือมีคนมองเห็น",
      },
      {
        text: "แปลว่า: แม่เหนื่อยจริง ๆ และอยากมีใครสักคนเห็นความพยายามของแม่บ้าง",
        correct: true,
        note: "ประโยคนี้คือการ “ขอกำลังใจ” ที่พูดไม่เป็น — ผู้ใหญ่จำนวนมากไม่เคยถูกสอนวิธีพูดว่า “ชมฉันหน่อย กอดฉันหน่อย”",
      },
    ],
    reply: "“วันนี้แม่เหนื่อยมากเลยใช่ไหม เดี๋ยวหนูล้างจานเอง” — การถูกมองเห็นเล็ก ๆ ละลายความเหนื่อยได้มากกว่าที่คิด",
  },
  {
    id: "real-harm",
    scene: "⚠️ บานพิเศษ — เพราะไม่ใช่ทุกคำพูดจะแปลเป็นความห่วงได้",
    phrase: "ถูกด่าด้วยคำรุนแรงซ้ำ ๆ ทุกวัน ด้อยค่า ขู่ ทำให้กลัวจนไม่อยากกลับบ้าน",
    options: [
      {
        text: "แปลว่า: ลึก ๆ คือความรักแหละ อดทนไว้เดี๋ยวก็ชิน",
        correct: false,
        note: "อันตรายที่สุดคือคำแปลนี้ — ความรักไม่ทำให้ใครกลัวจนไม่อยากกลับบ้าน การทนจนชินไม่ใช่ทางออก",
      },
      {
        text: "แปลว่า: เราคงทำตัวไม่ดีเอง สมควรโดนแล้ว",
        correct: false,
        note: "ไม่มีใคร “สมควร” ถูกทำร้ายด้วยคำพูดซ้ำ ๆ — ความผิดอยู่ที่พฤติกรรมของผู้พูด ไม่ใช่ตัวเรา",
      },
      {
        text: "แปลว่า: นี่เกินคำว่าห่วงไปแล้ว — มันคือคำพูดที่ทำร้าย และเราควรมีผู้ใหญ่ที่ไว้ใจช่วย",
        correct: true,
        note: "เครื่องแปลที่ดีต้องรู้ขีดจำกัดของตัวเอง: บางคำพูดไม่มีความห่วงซ่อนอยู่ และการขอความช่วยเหลือคือความกล้า ไม่ใช่การทรยศครอบครัว",
      },
    ],
    reply: "เรื่องแบบนี้ไม่ต้องแบกคนเดียวเลย — เล่าให้ครูแนะแนว ผู้ใหญ่ที่ไว้ใจ หรือแจ้งผ่าน Safe-Ticket ในแอปนี้ได้เสมอ",
  },
];

function scoreTitle(score: number): { title: string; sub: string } {
  if (score >= 5)
    return { title: "ล่ามภาษาใจตัวจริง 🏅", sub: "เธอได้ยินความกลัวและความห่วงที่ซ่อนใต้คำพูดแรง ๆ ได้เกือบหมด — ทักษะนี้จะเปลี่ยนหลายสงครามในบ้านให้เป็นบทสนทนา" };
  if (score >= 3)
    return { title: "เริ่มได้ยินเสียงใต้คำพูดแล้ว ✨", sub: "แปลถูกเกินครึ่ง! ภาษาใจพ่อแม่เป็นภาษาที่ไม่มีสอนในโรงเรียน — เธอกำลังเรียนได้เร็วมาก" };
  return { title: "วันนี้ได้พจนานุกรมเล่มใหม่ 🌱", sub: "ไม่เป็นไรเลย — ภาษานี้ยากเพราะเราได้ยินมันตอนใจกำลังเจ็บ การเริ่มสงสัยว่า “ข้างใต้คืออะไร” ก็เปลี่ยนบ้านได้แล้ว" };
}

/** Exiting trees must be unclickable — a stale "next" click from an exiting
 *  round advances the index past the end (that closure's isLast is outdated). */
const slide = {
  initial: { opacity: 0, x: 44 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -44, pointerEvents: "none" as const },
};

export type ParentTranslatorGameProps = {
  onComplete?: (score: number) => void;
  className?: string;
};

export function ParentTranslatorGame({ onComplete, className }: ParentTranslatorGameProps) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<Option | null>(null);
  const [done, setDone] = useState(false);

  const round = ROUNDS[index];
  const isLast = index === ROUNDS.length - 1;
  const correctOption = round.options.find((o) => o.correct);

  // Sync mirror of "this round is judged" — state alone can't stop a double-tap
  // that lands before React flushes (it would score/advance twice).
  const judgedRef = useRef(false);

  function pick(o: Option) {
    if (judgedRef.current) return;
    judgedRef.current = true;
    if (o.correct) setScore((s) => s + 1);
    setPicked(o);
  }

  function next() {
    if (!picked) return;
    if (isLast) {
      setDone(true);
      onComplete?.(score);
      return;
    }
    // From-token advance: a stale or doubled click becomes a no-op, never i+2.
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
          <FluffyBuddy expression={score >= 3 ? "happy" : "content"} size={110} className="mx-auto" />
          <div>
            <p className="text-[0.78rem] font-semibold text-amber-700">
              แปลใกล้ใจจริง {score} จาก {ROUNDS.length} ประโยค
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
              <Languages className="size-4" aria-hidden="true" />
              กติกาของเครื่องแปลใจ
            </p>
            <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink-soft">
              การแปลไม่ได้แปลว่าคำพูดแรง ๆ เป็นเรื่องโอเค —
              <span className="font-semibold text-ink"> ความรู้สึกเจ็บของเธอจริงเสมอ</span>{" "}
              การแปลแค่ช่วยให้เราเลือกตอบจาก “ความเข้าใจ” แทน “แผลสด”
              ซึ่งมักได้ผลลัพธ์ที่ใจดีกับเราเองกว่า
            </p>
          </div>

          <div className="rounded-2xl bg-rose-50 p-4 text-left ring-1 ring-rose-200/70">
            <p className="text-[0.8rem] leading-relaxed text-ink-soft">
              และถ้าคำพูดหรือการกระทำที่บ้านรุนแรงจนเธอรู้สึกไม่ปลอดภัย —
              <span className="font-semibold text-ink"> นั่นไม่ใช่หน้าที่ของเธอที่ต้องแปลหรือทน</span>{" "}
              บอกเราได้ที่{" "}
              <Link href="/report" className="font-semibold text-rose-600 underline">
                Safe-Ticket
              </Link>{" "}
              หรือ{" "}
              <Link href="/appointments" className="font-semibold text-rose-600 underline">
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
            แปลอีกรอบ
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
          🗣️ แปลภาษาใจพ่อแม่
        </h1>
        <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-[0.74rem] font-bold text-amber-700 ring-1 ring-amber-200">
          ประโยคที่ {index + 1}/{ROUNDS.length}
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
          <p className="text-[0.8rem] text-ink-mute">{round.scene}</p>

          <div className="mt-2 rounded-3xl rounded-bl-md bg-amber-100/70 p-4 ring-1 ring-amber-200">
            <p className="text-[0.95rem] leading-relaxed text-ink">{round.phrase}</p>
          </div>

          {picked === null ? (
            <div className="mt-4 space-y-2.5">
              <p className="text-[0.85rem] font-medium text-ink">
                เครื่องแปลใจว่า… ข้างใต้ประโยคนี้คืออะไร?
              </p>
              {round.options.map((o) => (
                <button
                  key={o.text}
                  type="button"
                  onClick={() => pick(o)}
                  className="block w-full rounded-2xl bg-white p-3.5 text-left text-[0.86rem] leading-relaxed text-ink ring-1 ring-neutral-200 transition hover:ring-amber-300 active:scale-[0.99]"
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
                  picked.correct ? "bg-mint-50 ring-mint-200" : "bg-amber-50 ring-amber-200",
                )}
              >
                <div className="flex items-start gap-3">
                  <FluffyBuddy
                    expression={(picked.correct ? "happy" : "surprised") as FluffyExpression}
                    size={64}
                    className="shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-[0.9rem] font-bold",
                        picked.correct ? "text-mint-700" : "text-amber-700",
                      )}
                    >
                      {picked.correct ? "แปลได้ใกล้ใจจริงมาก!" : "คำแปลนี้ยังไม่ตรงใจจริง"}
                    </p>
                    <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ink-soft">
                      {picked.note}
                    </p>
                    {!picked.correct && correctOption && (
                      <p className="mt-2 rounded-xl bg-white/70 p-2.5 text-[0.8rem] leading-relaxed text-ink-soft">
                        <span className="font-semibold text-ink">คำแปลที่ใกล้ใจจริง:</span>{" "}
                        {correctOption.text.replace(/^แปลว่า: /, "")}
                      </p>
                    )}
                    <p className="mt-2 rounded-xl bg-mint-50 p-2.5 text-[0.8rem] leading-relaxed text-mint-700 ring-1 ring-mint-200/60">
                      <MessageCircleHeart className="mr-1 inline size-3.5" aria-hidden="true" />
                      <span className="font-semibold">ลองแบบนี้:</span> {round.reply}
                    </p>
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
                    ดูผลการแปล
                    <Sparkles className="size-4" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    ประโยคถัดไป
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

export default ParentTranslatorGame;
