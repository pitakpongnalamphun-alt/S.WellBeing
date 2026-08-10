"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, HeartHandshake, RotateCcw, Sparkles } from "lucide-react";

import { FluffyBuddy, type FluffyExpression } from "@/components/FluffyBuddy";
import { cn } from "@/lib/utils";

/* ============================================================================
   ใจสลายไม่สลายใจ — the Romance island's heartbreak first-aid game.

   Four moments across the first weeks after a breakup; three voices at each:
   จมดิ่ง (dig the wound deeper), กลบ (numb it / fake fine), and ดูแลใจ (first
   aid: feel it, protect it, keep living). The summary is honest that grief has
   no deadline — and carries a serious signpost, because heartbreak in teens
   sometimes slides somewhere darker and that moment must not be met with a
   game's silence.
   ========================================================================== */

type StyleKind = "sink" | "numb" | "care";

const STYLE_META: Record<StyleKind, { label: string; note: string; tint: string }> = {
  sink: {
    label: "จมดิ่ง",
    note: "การแกะแผลซ้ำ ๆ ไม่ได้ทำให้หายไว — มันแค่ทำให้แผลใหม่กว่าเดิมทุกวัน",
    tint: "bg-rose-50 text-rose-600 ring-rose-200",
  },
  numb: {
    label: "กลบ/แกล้งลืม",
    note: "การแกล้งไม่รู้สึกไม่ได้ลบความเศร้า มันแค่เลื่อนนัดกับความเศร้าออกไป — พร้อมดอกเบี้ย",
    tint: "bg-slate-100 text-slate-600 ring-slate-200",
  },
  care: {
    label: "ดูแลใจ",
    note: "รู้สึกได้เต็มที่ ป้องกันแผลไม่ให้โดนสะกิด และใช้ชีวิตต่อทีละนิด — นี่คือการปฐมพยาบาลใจที่ถูกวิธี",
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
    id: "first-night",
    scene: "คืนแรกหลังเลิกกัน — มือถืออยู่ในมือ และนิ้วกำลังจะพิมพ์หาเขา",
    options: [
      { text: "ส่งข้อความยาวเหยียดระบายทุกความรู้สึกตอนตี 2", kind: "sink" },
      {
        text: "พิมพ์ทุกอย่างที่อยากบอกลงโน้ตส่วนตัวแทน แล้วอนุญาตให้ตัวเองร้องไห้คืนนี้",
        kind: "care",
      },
      { text: "โพสต์สตอรี่ว่า “โคตรโล่ง ดีใจที่จบสักที” ทั้งที่ใจสลาย", kind: "numb" },
    ],
  },
  {
    id: "their-story",
    scene: "สามวันต่อมา — เผลอเห็นสตอรี่ของเขากำลังหัวเราะสนุกกับเพื่อน",
    options: [
      { text: "ไล่ดูย้อนหลังทุกโพสต์ทุกรูปเก่า จนเจ็บหนักกว่าเดิม", kind: "sink" },
      {
        text: "กดซ่อน/เลิกติดตามชั่วคราว — ไม่ใช่ความใจร้าย แต่คือการพันแผลไม่ให้โดนสะกิด",
        kind: "care",
      },
      { text: "เปิดดูซ้ำ ๆ แล้วยืนยันกับทุกคนว่า “ไม่รู้สึกอะไรแล้ว”", kind: "numb" },
    ],
  },
  {
    id: "friends-invite",
    scene: "หนึ่งสัปดาห์ผ่านไป — เพื่อนสนิทชวนออกไปกินของอร่อยกัน",
    options: [
      {
        text: "ไป และบอกเพื่อนตรง ๆ ว่า “วันนี้เราอาจไม่ร่าเริงนะ” — เพื่อนที่ดีต้องการแค่เรา ไม่ได้ต้องการโชว์",
        kind: "care",
      },
      { text: "ปฏิเสธทุกนัด ขอขังตัวเองในห้องต่อไปเรื่อย ๆ", kind: "sink" },
      { text: "ไปแบบฝืนสุดตัว แกล้งร่าเริงทั้งวันจนกลับบ้านมาเหนื่อยกว่าเดิม", kind: "numb" },
    ],
  },
  {
    id: "worth-voice",
    scene: "สองสัปดาห์ผ่านไป — ความคิดหนึ่งโผล่มา: “เราคงไม่มีใครรักอีกแล้วล่ะ”",
    options: [
      { text: "เชื่อมันเต็มหัวใจ และเริ่มลิสต์ข้อเสียของตัวเอง", kind: "sink" },
      { text: "รีบเปิดแอปหาคนคุยใหม่ทันที เพื่อพิสูจน์ว่าไม่จริง", kind: "numb" },
      {
        text: "จับได้ว่านี่คือ “เสียงของแผล” ไม่ใช่ความจริง — ความรักหนึ่งครั้งที่จบ ไม่ได้แปลว่าคุณค่าของเราจบ",
        kind: "care",
      },
    ],
  },
];

function scoreTitle(score: number): { title: string; sub: string } {
  if (score >= 4)
    return { title: "หมอปฐมพยาบาลใจ 💗", sub: "เธอดูแลแผลใจได้ครบทุกจังหวะ — ทักษะนี้จะอยู่กับเธอทุกครั้งที่ใจใครสักคน (รวมถึงเพื่อน) แตกสลาย" };
  if (score >= 2)
    return { title: "มือพันแผลเริ่มนิ่งแล้ว ✨", sub: "เลือกทางดูแลใจได้เกินครึ่ง! ทางที่พลาดคือทางที่ใคร ๆ ก็เผลอเดิน — จมกับกลบมันมาพร้อมกันเสมอ" };
  return { title: "วันนี้ได้กล่องปฐมพยาบาลใจ 🌱", sub: "ไม่เป็นไรเลย — ตอนใจสลายจริง ไม่มีใครเลือกทางถูกทุกครั้ง แค่รู้ว่ามีทาง “ดูแลใจ” อยู่ ก็พอแล้วสำหรับวันนี้" };
}

const slide = {
  initial: { opacity: 0, x: 44 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -44, pointerEvents: "none" as const },
};

export type HeartbreakCareGameProps = {
  onComplete?: (score: number) => void;
  className?: string;
};

export function HeartbreakCareGame({ onComplete, className }: HeartbreakCareGameProps) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<StyleKind | null>(null);
  const [done, setDone] = useState(false);
  const judgedRef = useRef(false);

  const round = ROUNDS[index];
  const isLast = index === ROUNDS.length - 1;
  const careLine = round.options.find((o) => o.kind === "care")?.text ?? "";

  function pick(kind: StyleKind) {
    if (judgedRef.current) return;
    judgedRef.current = true;
    if (kind === "care") setScore((s) => s + 1);
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
            <p className="text-[0.78rem] font-semibold text-rose-500">
              เลือกทางดูแลใจได้ {score} จาก {ROUNDS.length} จังหวะ
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
              <HeartHandshake className="size-4" aria-hidden="true" />
              กฎพันแผลใจ 3 ข้อ
            </p>
            <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink-soft">
              1) ใจสลายคือแผลจริง มันหายตามจังหวะของมัน ไม่มีเดดไลน์ว่า “ต้องหายภายในกี่วัน” ·
              2) ระยะห่าง (ซ่อนโพสต์ เลิกส่อง) ไม่ใช่ความใจร้าย แต่คือผ้าพันแผล ·
              3) ห้ามตัดสินใจเรื่องใหญ่ของชีวิตตอนใจกำลังพัง — และเศร้าได้ แต่อย่าเศร้าคนเดียว
            </p>
          </div>

          <div className="rounded-2xl bg-lavender-50 p-4 text-left ring-1 ring-lavender-200/70">
            <p className="text-[0.8rem] leading-relaxed text-ink-soft">
              และเรื่องสำคัญที่สุด: ถ้าความเศร้าหนักจนกินไม่ได้ นอนไม่หลับ
              หรือ<span className="font-semibold text-ink">เริ่มมีความคิดทำร้ายตัวเอง</span> —
              นั่นเกินขอบเขตของแผลอกหักแล้ว โทร{" "}
              <a href="tel:1323" className="font-semibold text-lavender-700 underline">
                1323
              </a>{" "}
              ได้ตลอด 24 ชม. · กดขอความช่วยเหลือด่วนที่{" "}
              <Link href="/sos" className="font-semibold text-lavender-700 underline">
                SOS
              </Link>{" "}
              หรือ{" "}
              <Link href="/appointments" className="font-semibold text-lavender-700 underline">
                นัดคุยกับครู
              </Link>{" "}
              — ใจของเธอสำคัญกว่าความรักครั้งไหน ๆ
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
          💗 ใจสลายไม่สลายใจ
        </h1>
        <span className="shrink-0 rounded-full bg-rose-50 px-3 py-1 text-[0.74rem] font-bold text-rose-500 ring-1 ring-rose-200">
          จังหวะที่ {index + 1}/{ROUNDS.length}
        </span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-rose-400 transition-all duration-500"
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
              <p className="text-[0.85rem] font-medium text-ink">ใจเธอจะเลือกทางไหน?</p>
              {round.options.map((o) => (
                <button
                  key={o.text}
                  type="button"
                  onClick={() => pick(o.kind)}
                  className="block w-full rounded-2xl bg-white p-3.5 text-left text-[0.85rem] leading-relaxed text-ink ring-1 ring-neutral-200 transition hover:ring-rose-300 active:scale-[0.99]"
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
                  picked === "care" ? "bg-mint-50 ring-mint-200" : "bg-amber-50 ring-amber-200",
                )}
              >
                <div className="flex items-start gap-3">
                  <FluffyBuddy
                    expression={(picked === "care" ? "happy" : "concerned") as FluffyExpression}
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
                    {picked !== "care" && (
                      <p className="mt-2 rounded-xl bg-white/70 p-2.5 text-[0.8rem] leading-relaxed text-mint-700">
                        <span className="font-semibold">ทางดูแลใจคือ:</span> {careLine}
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
                    ดูผลการดูแลใจ
                    <Sparkles className="size-4" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    จังหวะถัดไป
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

export default HeartbreakCareGame;
