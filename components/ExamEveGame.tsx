"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MoonStar, RotateCcw, Sparkles } from "lucide-react";

import { FluffyBuddy, type FluffyExpression } from "@/components/FluffyBuddy";
import { cn } from "@/lib/utils";

/* ============================================================================
   คืนก่อนสอบ — the Academics island's exam-eve simulator.

   One night, four decision points. Three voices compete at each: อัดจนพัง
   (cram past breaking), หนีความจริง (escape into the phone), and พอดีมีแผน
   (the plan that trusts sleep). The core lesson is counterintuitive for teens:
   sleep is when the brain SAVES the file — an all-nighter is studying hard and
   then pulling the plug before hitting save.
   ========================================================================== */

type StyleKind = "cram" | "escape" | "plan";

const STYLE_META: Record<StyleKind, { label: string; note: string; tint: string }> = {
  cram: {
    label: "อัดจนพัง",
    note: "ได้ปริมาณแต่เสียคุณภาพ — สมองที่ไม่ได้นอนจะจำสิ่งที่อ่านคืนนี้ได้แค่เศษเสี้ยว แถมพังตอนทำข้อสอบ",
    tint: "bg-rose-50 text-rose-600 ring-rose-200",
  },
  escape: {
    label: "หนีความจริง",
    note: "ความกังวลไม่หายไปตอนไถฟีด มันแค่รอเราอยู่ที่เดิมพร้อมเวลาที่เหลือน้อยลง",
    tint: "bg-slate-100 text-slate-600 ring-slate-200",
  },
  plan: {
    label: "พอดีมีแผน",
    note: "เลือกเป้าที่คุ้ม ทำเท่าที่ไหว แล้วไว้ใจการนอน — สมองบันทึกความรู้ตอนหลับ นี่คือข้อสอบที่เตรียมตัวถูกวิธี",
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
    id: "plan-evening",
    scene: "1 ทุ่ม คืนก่อนสอบวิชาใหญ่ — ยังเหลือเนื้อหาอีก 6 บท เธอจะวางแผนคืนนี้ยังไง?",
    options: [
      { text: "อ่านให้ครบทั้ง 6 บทรวดเดียว ไม่นอนก็ยอม", kind: "cram" },
      { text: "เล่นมือถือก่อนละกัน เดี๋ยวตอนดึก ๆ สมองค่อยแล่น", kind: "escape" },
      {
        text: "เลือก 3 บทที่ออกชัวร์และยังไม่แม่น อ่านถึง 4 ทุ่มครึ่ง แล้วนอนให้พอ",
        kind: "plan",
      },
    ],
  },
  {
    id: "sleepy",
    scene: "4 ทุ่ม อ่านมาได้ครึ่งทาง ตาเริ่มปิด หัวเริ่มพยักหน้าใส่หนังสือ",
    options: [
      {
        text: "งีบ 20 นาทีแบบตั้งปลุก แล้วกลับมาสรุปโน้ตสั้น ๆ ปิดท้าย",
        kind: "plan",
      },
      { text: "ชงกาแฟแก้วที่สาม ฝืนต่อให้จบทุกหน้า", kind: "cram" },
      { text: "“พัก 5 นาที” กับมือถือ… ที่กลายเป็นชั่วโมงครึ่ง", kind: "escape" },
    ],
  },
  {
    id: "cant-sleep",
    scene: "เที่ยงคืน ปิดไฟแล้วแต่นอนไม่หลับ — ในหัววนแต่ 'พรุ่งนี้จะทำได้ไหม'",
    options: [
      { text: "หยิบมือถือมาไถให้หายกังวล รู้ตัวอีกทีตี 2", kind: "escape" },
      {
        text: "วางมือถือไกลเตียง หายใจช้า ๆ แล้วเขียนเรื่องที่กังวลลงกระดาษ — ให้มันรอพรุ่งนี้",
        kind: "plan",
      },
      { text: "ลุกมาเปิดหนังสืออ่านต่อทั้งคืน ถือว่านอนไม่หลับก็อ่านเลย", kind: "cram" },
    ],
  },
  {
    id: "exam-morning",
    scene: "เช้าวันสอบ เพื่อนหน้าห้องกำลังไล่ถามกันด้วยเนื้อหาที่เธอไม่คุ้นเลย",
    options: [
      { text: "รีบเปิดบทใหม่ที่ไม่เคยอ่านมาก่อน อ่านหน้าห้องสอบเดี๋ยวนั้น", kind: "cram" },
      {
        text: "เดินออกมาทวนสรุปโน้ตสั้นของตัวเอง กินน้ำ แล้วบอกตัวเองว่า “เราเตรียมมาพอแล้ว”",
        kind: "plan",
      },
      { text: "ยืนฟังเพื่อนถามกันจนใจสั่น แล้วเดินเข้าห้องสอบทั้งแพนิค", kind: "escape" },
    ],
  },
];

function scoreTitle(score: number): { title: string; sub: string } {
  if (score >= 4)
    return { title: "เจ้าของคืนก่อนสอบ 🌙", sub: "เธอผ่านคืนที่ยากที่สุดของนักเรียนแบบมีแผนครบทุกจุด — วิธีนี้ใช้ได้ตลอดชีวิตการเรียนเลยนะ" };
  if (score >= 2)
    return { title: "เริ่มคุมคืนนี้ได้แล้ว ✨", sub: "เลือกทางที่มีแผนได้เกินครึ่ง! จุดที่พลาดคือจุดที่ทุกคนพลาด — ความง่วงกับความกังวลหลอกเก่งที่สุดตอนดึก" };
  return { title: "วันนี้ได้แผนที่ของคืนก่อนสอบ 🌱", sub: "ไม่เป็นไร — แค่รู้ว่า “อัดทั้งคืน” กับ “หนีลงจอ” พาไปที่เดียวกัน (ห้องสอบที่สมองไม่ตื่น) ก็ชนะไปครึ่งทางแล้ว" };
}

const slide = {
  initial: { opacity: 0, x: 44 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -44, pointerEvents: "none" as const },
};

export type ExamEveGameProps = {
  onComplete?: (score: number) => void;
  className?: string;
};

export function ExamEveGame({ onComplete, className }: ExamEveGameProps) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<StyleKind | null>(null);
  const [done, setDone] = useState(false);
  const judgedRef = useRef(false);

  const round = ROUNDS[index];
  const isLast = index === ROUNDS.length - 1;
  const planLine = round.options.find((o) => o.kind === "plan")?.text ?? "";

  function pick(kind: StyleKind) {
    if (judgedRef.current) return;
    judgedRef.current = true;
    if (kind === "plan") setScore((s) => s + 1);
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
            <p className="text-[0.78rem] font-semibold text-sky-700">
              เลือกทางที่มีแผนได้ {score} จาก {ROUNDS.length} จุดตัดสินใจ
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
              <MoonStar className="size-4" aria-hidden="true" />
              ความลับของคืนก่อนสอบ
            </p>
            <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink-soft">
              สมอง “บันทึกไฟล์” ความรู้ตอนหลับ — การโต้รุ่งคืออ่านมาทั้งคืนแล้วถอดปลั๊กก่อนกดเซฟ
              สูตรที่เวิร์กจริง: เลือกเป้าที่คุ้ม → สรุปโน้ตสั้น → นอนให้พอ → ทวนโน้ตตอนเช้า
            </p>
          </div>

          <div className="rounded-2xl bg-lavender-50 p-4 text-left ring-1 ring-lavender-200/70">
            <p className="text-[0.8rem] leading-relaxed text-ink-soft">
              ถ้าความกังวลเรื่องสอบหนักจนนอนไม่หลับติดกันหลายคืน —
              มาฝึกหายใจที่{" "}
              <Link href="/breathing" className="font-semibold text-lavender-700 underline">
                พื้นที่หายใจ
              </Link>{" "}
              หรือเล่าให้{" "}
              <Link href="/chatbot" className="font-semibold text-lavender-700 underline">
                Well.AI
              </Link>{" "}
              ฟังก่อนนอนก็ได้นะ
            </p>
          </div>

          <button
            type="button"
            onClick={replay}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-neutral-300 px-5 py-3 text-[0.88rem] font-medium text-ink-soft transition hover:border-neutral-400 hover:text-ink"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            ลองอีกคืน
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
          🌙 คืนก่อนสอบ
        </h1>
        <span className="shrink-0 rounded-full bg-sky-50 px-3 py-1 text-[0.74rem] font-bold text-sky-700 ring-1 ring-sky-200">
          จุดที่ {index + 1}/{ROUNDS.length}
        </span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-sky-400 transition-all duration-500"
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
              <p className="text-[0.85rem] font-medium text-ink">เธอจะทำยังไง?</p>
              {round.options.map((o) => (
                <button
                  key={o.text}
                  type="button"
                  onClick={() => pick(o.kind)}
                  className="block w-full rounded-2xl bg-white p-3.5 text-left text-[0.85rem] leading-relaxed text-ink ring-1 ring-neutral-200 transition hover:ring-sky-300 active:scale-[0.99]"
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
                  picked === "plan" ? "bg-mint-50 ring-mint-200" : "bg-amber-50 ring-amber-200",
                )}
              >
                <div className="flex items-start gap-3">
                  <FluffyBuddy
                    expression={(picked === "plan" ? "happy" : "surprised") as FluffyExpression}
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
                    {picked !== "plan" && (
                      <p className="mt-2 rounded-xl bg-white/70 p-2.5 text-[0.8rem] leading-relaxed text-mint-700">
                        <span className="font-semibold">ทางที่มีแผนคือ:</span> {planLine}
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
                    ดูผลคืนนี้
                    <Sparkles className="size-4" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    จุดถัดไป
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

export default ExamEveGame;
