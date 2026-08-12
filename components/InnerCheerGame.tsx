"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Megaphone, RotateCcw, Sparkles } from "lucide-react";

import { FluffyBuddy, type FluffyExpression } from "@/components/FluffyBuddy";
import { cn } from "@/lib/utils";

/* ============================================================================
   เสียงเชียร์ในหัว — self-talk retuning game for the Self island.

   Each round: a harsh inner-critic thought appears; the player picks which of
   three replacement voices to answer it with. The lesson is the taxonomy —
   เสียงซ้ำเติม (pile-on), เสียงกลบ (toxic-positive mask, which LOOKS kind but
   silences the feeling), and เสียงโค้ช (kind AND honest: feel it, then reframe).
   Learning that "positive" ≠ "kind" is the whole point of the game.
   ========================================================================== */

type VoiceKind = "pile" | "mask" | "coach";

const VOICE_META: Record<VoiceKind, { label: string; note: string; tint: string }> = {
  pile: {
    label: "เสียงซ้ำเติม",
    note: "เตะซ้ำตอนล้ม — ยิ่งฟังยิ่งจม และไม่เคยช่วยให้ลุกได้เลย",
    tint: "bg-rose-50 text-rose-600 ring-rose-200",
  },
  mask: {
    label: "เสียงกลบ",
    note: "ฟังดูบวก แต่จริง ๆ คือสั่งให้ความรู้สึกเงียบ — ความรู้สึกที่โดนกลบไม่หายไป แค่รอวันล้น",
    tint: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  coach: {
    label: "เสียงโค้ช",
    note: "ยอมรับความรู้สึกตามจริง แล้วชวนมองไปข้างหน้า — ใจดีและตรงไปตรงมาพร้อมกันได้",
    tint: "bg-mint-50 text-mint-700 ring-mint-200",
  },
};

type Round = {
  id: string;
  scene: string;
  critic: string;
  /** Exactly one option is the coach voice; positions vary round to round. */
  options: { text: string; kind: VoiceKind }[];
};

const ROUNDS: Round[] = [
  {
    id: "exam",
    scene: "คะแนนสอบออกมาแย่กว่าที่หวังไว้เยอะ",
    critic: "“ฉันมันโง่จริง ๆ ตั้งใจแค่ไหนก็ไม่มีทางเก่ง”",
    options: [
      { text: "“ใช่ ฉันไม่เก่งเอง สมควรแล้ว”", kind: "pile" },
      { text: "“ช่างมันเถอะ คะแนนไม่ได้สำคัญอะไรเลย”", kind: "mask" },
      { text: "“เสียใจได้เลย แต่คะแนนรอบนี้บอกแค่ว่าวิธีอ่านยังไม่เวิร์ก — ปรับใหม่ได้”", kind: "coach" },
    ],
  },
  {
    id: "present",
    scene: "ออกไปพูดหน้าห้องแล้วลืมบท ยืนเงียบไปหลายวินาที",
    critic: "“ทุกคนต้องจำภาพนี้แล้วขำฉันไปตลอดแน่”",
    options: [
      { text: "“เขินได้แป๊บนึง คนอื่นลืมเร็วกว่าที่เราคิดเยอะ — ที่กล้าออกไปยืนคือเก่งแล้ว”", kind: "coach" },
      { text: "“อายที่สุดในชีวิต ไม่ขอพูดหน้าห้องอีกเลย”", kind: "pile" },
      { text: "“ห้ามอาย! คนเข้มแข็งไม่รู้สึกแบบนี้”", kind: "mask" },
    ],
  },
  {
    id: "feed",
    scene: "ไถฟีดแล้วเจอเพื่อนไปเที่ยว ของใหม่ ชีวิตดูดีไปหมด",
    critic: "“ชีวิตฉันมันน่าเบื่อ ไม่มีอะไรดีสักอย่าง”",
    options: [
      { text: "“จริง ชีวิตฉันแพ้เขาทุกทาง”", kind: "pile" },
      { text: "“ฟีดคือไฮไลต์ที่เขาเลือกโพสต์ ไม่ใช่ทั้งชีวิต — ของดีของเราก็มี แค่ไม่ได้ลงจอ”", kind: "coach" },
      { text: "“ไม่อิจฉาเลยสักนิด ฉันไม่แคร์อยู่แล้ว”", kind: "mask" },
    ],
  },
  {
    id: "group",
    scene: "ทำไฟล์งานกลุ่มพังก่อนส่ง เพื่อนต้องมาช่วยกันแก้กลางดึก",
    critic: "“ฉันเป็นตัวถ่วงของกลุ่ม ไม่น่ามีฉันอยู่เลย”",
    options: [
      { text: "“ก็จริงนะ ไม่มีฉันทุกคนคงสบายกว่านี้”", kind: "pile" },
      { text: "“ไม่ใช่ความผิดฉันสักหน่อย ใคร ๆ ก็พลาดกันได้ จบ”", kind: "mask" },
      { text: "“พลาดหนึ่งครั้งไม่ได้นิยามตัวเรา — ขอโทษ ช่วยกันแก้ แล้วเดี๋ยวมันจะเป็นแค่เรื่องเล่า”", kind: "coach" },
    ],
  },
  {
    id: "compare",
    scene: "โดนผู้ใหญ่เปรียบเทียบกับญาติที่เรียนเก่งอีกแล้ว",
    critic: "“ฉันไม่มีวันดีพอในสายตาใครหรอก”",
    options: [
      { text: "“เราไม่ได้เกิดมาเพื่อเป็นเขา — เทียบกับตัวเองเมื่อวานก็พอ แล้ววันนี้เราขยับมาแล้วนิดนึง”", kind: "coach" },
      { text: "“ใช่ ฉันคือตัวน่าผิดหวังประจำบ้าน”", kind: "pile" },
      { text: "“ไม่ต้องไปฟัง ผู้ใหญ่พูดอะไรก็ไม่มีความหมาย”", kind: "mask" },
    ],
  },
  {
    id: "newthing",
    scene: "อยากลองสมัครชมรมใหม่ที่ไม่เคยทำมาก่อน",
    critic: "“อย่าเลย เดี๋ยวก็ทำได้ไม่ดี อายเขาเปล่า ๆ”",
    options: [
      { text: "“จริง อยู่เฉย ๆ ปลอดภัยกว่า”", kind: "pile" },
      { text: "“ยังไม่รู้ผลหรอก แต่ทุกคนที่เก่งวันนี้ เคยเป็นมือใหม่ที่เงอะงะมาก่อนทั้งนั้น”", kind: "coach" },
      { text: "“ฉันต้องทำได้ดีที่สุดในชมรมแน่นอน 100%!”", kind: "mask" },
    ],
  },
];

function scoreTitle(score: number): { title: string; sub: string } {
  if (score >= 5)
    return { title: "โค้ชประจำใจตัวเอง 📣", sub: "เธอแยกเสียงโค้ชออกจากเสียงซ้ำเติมและเสียงกลบได้แม่นมาก — เสียงแบบนี้แหละที่พาคนไปได้ไกล" };
  if (score >= 3)
    return { title: "หูเริ่มแยกเสียงออกแล้ว ✨", sub: "จับเสียงโค้ชได้เกินครึ่ง! ข้อที่พลาดส่วนใหญ่คือเสียงกลบที่ปลอมตัวเป็นความบวก — เจอบ่อยขึ้นจะยิ่งจับไว" };
  return { title: "วันนี้ได้รู้จักเสียงทั้งสามแล้ว 🌱", sub: "เสียงกลบหลอกคนเก่ง ๆ มาเยอะ เพราะมันฟังดูใจดี — แค่รู้ว่ามันมีอยู่ ก็เริ่มได้ยินมันชัดขึ้นแล้ว" };
}

/** Exiting trees must be unclickable — a stale "next" click from an exiting
 *  round advances the index past the end (that closure's isLast is outdated). */
const slide = {
  initial: { opacity: 0, x: 44 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -44, pointerEvents: "none" as const },
};

export type InnerCheerGameProps = {
  onComplete?: (score: number) => void;
  className?: string;
};

export function InnerCheerGame({ onComplete, className }: InnerCheerGameProps) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<VoiceKind | null>(null);
  const [done, setDone] = useState(false);

  const round = ROUNDS[index];
  const isLast = index === ROUNDS.length - 1;
  const coachLine = round.options.find((o) => o.kind === "coach")?.text ?? "";

  // Sync mirror of "this round is judged" — state alone can't stop a double-tap
  // that lands before React flushes (it would score/advance twice).
  const judgedRef = useRef(false);

  function pick(kind: VoiceKind) {
    if (judgedRef.current) return;
    judgedRef.current = true;
    if (kind === "coach") setScore((s) => s + 1);
    setPicked(kind);
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
            <p className="text-[0.78rem] font-semibold text-mint-700">
              เจอเสียงโค้ช {score} จาก {ROUNDS.length} รอบ
            </p>
            <h2 className="font-display th:leading-snug mt-1 text-[1.3rem] font-bold text-ink">
              {t.title}
            </h2>
            <p className="mx-auto mt-1.5 max-w-sm text-[0.84rem] leading-relaxed text-ink-soft">
              {t.sub}
            </p>
          </div>

          <div className="rounded-2xl bg-mint-50 p-4 text-left ring-1 ring-mint-200/70">
            <p className="flex items-center gap-1.5 text-[0.82rem] font-bold text-mint-700">
              <Megaphone className="size-4" aria-hidden="true" />
              สูตรเสียงโค้ช
            </p>
            <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink-soft">
              1) ยอมรับความรู้สึกก่อน (“เสียใจได้”) · 2) มองเหตุการณ์ตามจริง ไม่ขยายไม่ย่อ ·
              3) ชี้ก้าวเล็ก ๆ ที่ไปต่อได้ — เสียงในหัวคือ “นิสัย” ยิ่งฝึกพูดแบบโค้ช สมองยิ่งพูดแบบนี้เองบ่อยขึ้น
            </p>
          </div>

          <div className="rounded-2xl bg-lavender-50 p-4 text-left ring-1 ring-lavender-200/70">
            <p className="text-[0.8rem] leading-relaxed text-ink-soft">
              ถ้าเสียงตำหนิในหัวดังจนเหนื่อย และไล่ยังไงก็ไม่ไป —
              ไม่ต้องสู้กับมันคนเดียวนะ ลองเล่าให้{" "}
              <Link href="/chatbot" className="font-semibold text-lavender-700 underline">
                น้องปุย
              </Link>{" "}
              ฟัง หรือ{" "}
              <Link href="/appointments" className="font-semibold text-lavender-700 underline">
                นัดคุยกับครู
              </Link>{" "}
              ก็ได้เสมอ
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
  const pickedMeta = picked ? VOICE_META[picked] : null;

  return (
    <div className={cn("mx-auto w-full max-w-md", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h1 className="font-display th:leading-snug text-[1.15rem] font-bold text-ink">
          📣 เสียงเชียร์ในหัว
        </h1>
        <span className="shrink-0 rounded-full bg-mint-50 px-3 py-1 text-[0.74rem] font-bold text-mint-700 ring-1 ring-mint-200">
          รอบ {index + 1}/{ROUNDS.length}
        </span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-mint-500 transition-all duration-500"
          style={{ width: `${((index + (picked ? 1 : 0)) / ROUNDS.length) * 100}%` }}
        />
      </div>

      <AnimatePresence initial={false}>
        <motion.div key={round.id} {...(reduce ? {} : slide)}>
          <p className="text-[0.8rem] text-ink-mute">{round.scene}</p>

          {/* the critic bubble — deliberately dark */}
          <div className="mt-2 rounded-3xl rounded-bl-md bg-slate-800 p-4">
            <p className="text-[0.78rem] font-medium text-slate-400">เสียงในหัวโผล่มาว่า…</p>
            <p className="mt-1 text-[0.95rem] leading-relaxed text-white">{round.critic}</p>
          </div>

          {picked === null ? (
            <div className="mt-4 space-y-2.5">
              <p className="text-[0.85rem] font-medium text-ink">เธอจะตอบกลับด้วยเสียงไหน?</p>
              {round.options.map((o) => (
                <button
                  key={o.text}
                  type="button"
                  onClick={() => pick(o.kind)}
                  className="block w-full rounded-2xl bg-white p-3.5 text-left text-[0.86rem] leading-relaxed text-ink ring-1 ring-neutral-200 transition hover:ring-mint-300 active:scale-[0.99]"
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
                  picked === "coach" ? "bg-mint-50 ring-mint-200" : "bg-amber-50 ring-amber-200",
                )}
              >
                <div className="flex items-start gap-3">
                  <FluffyBuddy
                    expression={(picked === "coach" ? "happy" : "surprised") as FluffyExpression}
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
                    {picked !== "coach" && (
                      <p className="mt-2 rounded-xl bg-white/70 p-2.5 text-[0.8rem] leading-relaxed text-mint-700">
                        <span className="font-semibold">เสียงโค้ชจะพูดว่า:</span> {coachLine}
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
                    รอบถัดไป
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

export default InnerCheerGame;
