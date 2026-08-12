"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Brain, Check, RotateCcw, Sparkles, X } from "lucide-react";

import { FluffyBuddy } from "@/components/FluffyBuddy";
import { cn } from "@/lib/utils";

/* ============================================================================
   จับความคิดที่หลอกเรา — the Academics island's thought-trap game.

   เกาะการเรียนมีเกมตัดสินใจ (คืนก่อนสอบ) กับเกมแยกประเภทสถานการณ์ (กู้ไฟหมดใจ)
   อยู่แล้ว เกมนี้จึงเล่นกับ "ประโยคในหัว" แทน และเดินสองจังหวะต่อข้อ:

     1) ความคิดนี้ติดกับดักแบบไหน — ต้อง "เรียกชื่อ" มันให้ถูก
     2) แล้วจะพูดกับตัวเองใหม่ว่ายังไง — ต้องใจดีขึ้น "โดยไม่โกหกตัวเอง"

   จังหวะที่สองคือหัวใจ: เด็กที่ฝึก CBT ใหม่ ๆ มักแกว่งไปอีกทาง คือปลอบแบบ
   ไม่จริง ("ไม่เป็นไรหรอก เดี๋ยวก็ดีเอง") ซึ่งใจไม่เชื่อและไม่ช่วยอะไร ตัวเลือก
   ทุกข้อจึงมีทั้งแบบยังโหดกับตัวเอง แบบหวานเกินจริง และแบบที่ทั้งใจดีและตรง

   หนึ่งข้อในเกม "ไม่ใช่กับดัก" โดยตั้งใจ — ไม่ใช่ทุกความคิดลบจะเป็นความคิดผิด
   บางเรื่องเป็นข้อเท็จจริงที่ต้องรับมือ ไม่ใช่มายาที่ต้องรีบเถียงทิ้ง
   ========================================================================== */

type TrapId =
  | "overgeneralize"
  | "catastrophize"
  | "mindread"
  | "labeling"
  | "discount"
  | "fact";

const TRAPS: Record<TrapId, { label: string; emoji: string; hint: string }> = {
  overgeneralize: {
    label: "เหมารวมทั้งชีวิต",
    emoji: "🌀",
    hint: "เรื่องเดียวถูกขยายเป็น “ตลอดไป / ทุกครั้ง / ไม่มีวัน”",
  },
  catastrophize: {
    label: "คิดไปถึงหายนะ",
    emoji: "🌊",
    hint: "กระโดดข้ามไปฉากที่แย่ที่สุดทันที ทั้งที่ยังไม่เกิด",
  },
  mindread: {
    label: "เดาใจคนอื่น",
    emoji: "🔮",
    hint: "สรุปเองว่าคนอื่นคิดยังไงกับเรา ทั้งที่ไม่มีใครบอก",
  },
  labeling: {
    label: "ตราหน้าตัวเอง",
    emoji: "🏷️",
    hint: "เปลี่ยนสิ่งที่ “ทำพลาด” ให้กลายเป็นสิ่งที่ “เราเป็น”",
  },
  discount: {
    label: "มองข้ามด้านดี",
    emoji: "🕳️",
    hint: "ส่วนที่ทำได้ดีถูกปัดทิ้งว่าฟลุ๊คหรือไม่นับ",
  },
  fact: {
    label: "เป็นข้อเท็จจริง",
    emoji: "📌",
    hint: "ไม่ใช่กับดัก — เป็นเรื่องจริงที่ต้องวางแผนรับมือ",
  },
};

type ReframeKind = "balanced" | "harsh" | "sugar";

type Round = {
  id: string;
  scene: string;
  thought: string;
  trap: TrapId;
  /** ตัวเลือกกับดักที่ให้เลือกในข้อนี้ (มีคำตอบถูกอยู่เสมอ) */
  options: TrapId[];
  why: string;
  reframes: { text: string; kind: ReframeKind; note: string }[];
};

const ROUNDS: Round[] = [
  {
    id: "one-exam",
    scene: "คะแนนสอบกลางภาคออก ได้ 12 จาก 20",
    thought: "“เราทำข้อสอบพังตลอด ไม่มีวันทำได้ดีสักที”",
    trap: "overgeneralize",
    options: ["overgeneralize", "mindread", "fact"],
    why: "คำว่า “ตลอด” กับ “ไม่มีวัน” คือสัญญาณของการเหมารวม — ข้อสอบหนึ่งครั้งถูกขยายเป็นทั้งชีวิตการเรียน",
    reframes: [
      {
        text: "“รอบนี้ได้ 12 ซึ่งต่ำกว่าที่หวัง ครั้งก่อนเราได้ 16 แปลว่าทำได้ ไม่ใช่ทำไม่ได้”",
        kind: "balanced",
        note: "ใจดีขึ้นโดยไม่โกหก — ยอมรับว่ารอบนี้ไม่ดี แต่ไม่ลบหลักฐานว่าเคยทำได้",
      },
      {
        text: "“ไม่เป็นไรเลย คะแนนไม่สำคัญหรอก”",
        kind: "sugar",
        note: "ปลอบแบบไม่จริง — ในเมื่อใจเรารู้ว่ามันสำคัญ ประโยคนี้จึงไม่มีน้ำหนักพอให้เชื่อ",
      },
      {
        text: "“ก็สมควรแล้วที่ได้เท่านี้ อ่านน้อยเอง”",
        kind: "harsh",
        note: "เปลี่ยนคำด่าเป็นคำด่าที่สุภาพขึ้นเฉย ๆ — ยังไม่ได้ช่วยให้พรุ่งนี้ทำอะไรต่อ",
      },
    ],
  },
  {
    id: "presentation",
    scene: "พรุ่งนี้ต้องออกไปนำเสนอหน้าชั้น",
    thought: "“ถ้าพูดผิดสักคำ ทุกคนจะจำไปทั้งปี แล้วเราจะอยู่ในห้องนี้ไม่ได้อีกเลย”",
    trap: "catastrophize",
    options: ["catastrophize", "discount", "labeling"],
    why: "ความคิดกระโดดจาก “พูดผิดหนึ่งคำ” ไปถึง “อยู่ในห้องไม่ได้ทั้งปี” ในก้าวเดียว — นั่นคือการต่อฉากหายนะให้ตัวเอง",
    reframes: [
      {
        text: "“ถ้าพูดผิด เพื่อนอาจขำสักครู่แล้วก็ลืม เหมือนที่เราลืมตอนคนอื่นพูดผิด”",
        kind: "balanced",
        note: "ตรวจสอบกับหลักฐานจริง — เราเองก็จำไม่ได้ว่าใครพูดผิดอะไรเมื่อเดือนที่แล้ว",
      },
      {
        text: "“เราต้องพูดให้เพอร์เฟกต์ ห้ามพลาดแม้แต่คำเดียว”",
        kind: "harsh",
        note: "ยิ่งตั้งเพดานสูง ยิ่งเกร็ง — ความกลัวพลาดมักทำให้พลาดมากกว่าเดิม",
      },
      {
        text: "“ชิลล์ ๆ ไม่มีใครสนใจเราหรอก”",
        kind: "sugar",
        note: "กดความรู้สึกทิ้งแทนที่จะรับมือ ความประหม่าที่ไม่ถูกยอมรับมักโผล่กลับมาตอนขึ้นพูดจริง",
      },
    ],
  },
  {
    id: "teacher-face",
    scene: "ส่งการบ้านช้าไปหนึ่งวัน ครูรับไปเงียบ ๆ",
    thought: "“ครูต้องคิดแล้วว่าเราเป็นเด็กไม่เอาไหน”",
    trap: "mindread",
    options: ["mindread", "overgeneralize", "fact"],
    why: "เราสรุปความคิดในหัวคนอื่นจากสีหน้าเพียงเสี้ยววินาที ทั้งที่ยังไม่มีใครพูดอะไรสักคำ",
    reframes: [
      {
        text: "“เราไม่รู้ว่าครูคิดอะไร รู้แค่ว่าส่งช้าไปหนึ่งวัน ถ้ากังวลจริงก็ไปคุยกับครูได้”",
        kind: "balanced",
        note: "แยก “สิ่งที่รู้” ออกจาก “สิ่งที่เดา” แล้วเปลี่ยนความกังวลเป็นการกระทำที่ทำได้จริง",
      },
      {
        text: "“ครูคงเข้าใจแหละ ไม่ต้องคิดมาก”",
        kind: "sugar",
        note: "ก็เดาใจครูเหมือนกัน แค่เดาไปทางบวก — ยังเป็นการเดาอยู่ดี",
      },
      {
        text: "“เราก็ไม่เอาไหนจริง ๆ นั่นแหละ”",
        kind: "harsh",
        note: "รับคำตัดสินที่ยังไม่มีใครตัดสินมาเป็นของตัวเอง",
      },
    ],
  },
  {
    id: "praise-bounce",
    scene: "ครูชมหน้าห้องว่าคราวนี้ทำได้ดีขึ้นมาก",
    thought: "“ครูคงพูดให้กำลังใจไปงั้นแหละ ที่ได้ดีก็เพราะข้อสอบมันง่าย”",
    trap: "discount",
    options: ["discount", "catastrophize", "labeling"],
    why: "คำชมถูกปัดทิ้งทันทีด้วยเหตุผลว่า “ฟลุ๊ค” ทั้งที่ความพยายามของเราก็อยู่ในนั้น",
    reframes: [
      {
        text: "“ข้อสอบอาจง่ายขึ้นจริง และเราก็อ่านมาจริงด้วย สองอย่างเป็นจริงพร้อมกันได้”",
        kind: "balanced",
        note: "ไม่ต้องเลือกข้างระหว่างโชคกับความพยายาม — รับเครดิตส่วนที่เป็นของเราไว้",
      },
      {
        text: "“ใช่ เราเก่งที่สุดในห้องอยู่แล้ว”",
        kind: "sugar",
        note: "แกว่งไปอีกสุด ซึ่งใจก็ไม่เชื่ออีกเหมือนกัน",
      },
      {
        text: "“อย่าเพิ่งดีใจ เดี๋ยวรอบหน้าก็พังอยู่ดี”",
        kind: "harsh",
        note: "ห้ามตัวเองดีใจเพื่อกันผิดหวังล่วงหน้า — จ่ายด้วยความสุขที่ควรได้รับตอนนี้",
      },
    ],
  },
  {
    id: "real-problem",
    scene: "เหลืออีก 3 วันสอบ แต่ยังไม่ได้เริ่มอ่านเลยสักบท",
    thought: "“ถ้าไม่เริ่มวันนี้ อีก 3 วันอ่านไม่ทันแน่”",
    trap: "fact",
    options: ["fact", "catastrophize", "overgeneralize"],
    why: "ข้อนี้ไม่ใช่กับดัก — มันคือการประเมินตามความจริง ความคิดลบไม่ได้แปลว่าความคิดผิดเสมอไป บางอย่างต้องรับมือ ไม่ใช่เถียงทิ้ง",
    reframes: [
      {
        text: "“จริง งั้นคืนนี้เริ่มบทที่ออกสอบเยอะที่สุดก่อน 40 นาที แล้วค่อยว่ากันต่อ”",
        kind: "balanced",
        note: "เมื่อความคิดเป็นเรื่องจริง สิ่งที่ต้องเปลี่ยนคือแผน ไม่ใช่ความคิด",
      },
      {
        text: "“ไม่ทันก็ไม่ทัน ช่างมัน”",
        kind: "sugar",
        note: "ปลอบด้วยการยอมแพ้ ซึ่งพรุ่งนี้ใจจะยิ่งหนักกว่าเดิม",
      },
      {
        text: "“สมควรแล้วที่จะสอบตก ปล่อยปละละเลยเอง”",
        kind: "harsh",
        note: "ลงโทษตัวเองไม่ได้ทำให้เวลาที่เหลือเพิ่มขึ้นแม้แต่นาทีเดียว",
      },
    ],
  },
];

const MAX_SCORE = ROUNDS.length * 2;

const slide = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export type ThoughtCatcherGameProps = {
  onComplete?: (score: number) => void;
  className?: string;
};

export function ThoughtCatcherGame({ onComplete, className }: ThoughtCatcherGameProps) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  /** "trap" = กำลังเลือกว่าเป็นกับดักแบบไหน · "reframe" = กำลังเลือกประโยคใหม่ */
  const [phase, setPhase] = useState<"trap" | "reframe">("trap");
  const [pickedTrap, setPickedTrap] = useState<TrapId | null>(null);
  const [pickedReframe, setPickedReframe] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const round = ROUNDS[index];

  function chooseTrap(id: TrapId) {
    if (pickedTrap) return;
    setPickedTrap(id);
    if (id === round.trap) setScore((s) => s + 1);
  }

  function chooseReframe(i: number) {
    if (pickedReframe !== null) return;
    setPickedReframe(i);
    if (round.reframes[i].kind === "balanced") setScore((s) => s + 1);
  }

  function next() {
    if (phase === "trap") {
      setPhase("reframe");
      return;
    }
    if (index + 1 >= ROUNDS.length) {
      setDone(true);
      onComplete?.(score);
      return;
    }
    setIndex((i) => i + 1);
    setPhase("trap");
    setPickedTrap(null);
    setPickedReframe(null);
  }

  function replay() {
    setIndex(0);
    setPhase("trap");
    setPickedTrap(null);
    setPickedReframe(null);
    setScore(0);
    setDone(false);
  }

  if (done) {
    const great = score >= MAX_SCORE - 2;
    return (
      <div className={cn("mx-auto w-full max-w-md", className)}>
        <div className="space-y-4 text-center" role="status" aria-live="polite">
          <FluffyBuddy expression={great ? "happy" : "content"} size={110} className="mx-auto" />
          <div>
            <p className="text-[0.78rem] font-semibold text-sky-700">จับความคิดที่หลอกเรา</p>
            <h2 className="font-display th:leading-snug mt-1 text-[1.3rem] font-bold text-ink">
              ได้ {score} จาก {MAX_SCORE} คะแนน
            </h2>
            <p className="mx-auto mt-1.5 max-w-sm text-[0.84rem] leading-relaxed text-ink-soft">
              {great
                ? "เธอเรียกชื่อกับดักได้ไวและพูดกับตัวเองใหม่ได้อย่างใจดีโดยไม่หลอกตัวเอง — นั่นคือทักษะที่ใช้ได้ทั้งชีวิต"
                : "แค่เริ่มสังเกตว่าความคิดไหนเป็นกับดัก ก็เปลี่ยนไปครึ่งทางแล้ว ยิ่งฝึกยิ่งจับได้ไวขึ้นเอง"}
            </p>
          </div>

          <div className="rounded-2xl bg-sky-50 p-4 text-left ring-1 ring-sky-200/70">
            <p className="flex items-center gap-1.5 text-[0.82rem] font-bold text-sky-700">
              <Sparkles className="size-4" aria-hidden="true" />
              กับดักที่เจอบ่อยในเรื่องเรียน
            </p>
            <ul className="mt-2 space-y-1.5">
              {(Object.keys(TRAPS) as TrapId[])
                .filter((t) => t !== "fact")
                .map((t) => (
                  <li key={t} className="text-[0.8rem] leading-relaxed text-ink-soft">
                    <span className="font-semibold text-ink">
                      {TRAPS[t].emoji} {TRAPS[t].label}
                    </span>{" "}
                    — {TRAPS[t].hint}
                  </li>
                ))}
            </ul>
            <p className="mt-3 text-[0.8rem] leading-relaxed text-ink-soft">
              และอย่าลืมว่า <span className="font-semibold text-ink">ความคิดลบบางอย่างเป็นเรื่องจริง</span> —
              เวลาเจอแบบนั้น สิ่งที่ต้องเปลี่ยนคือแผน ไม่ใช่ความคิด 🌱
            </p>
          </div>

          <p className="text-[0.78rem] leading-relaxed text-ink-mute">
            ถ้าเสียงในหัวดังจนไม่ไหวเป็นเดือน ๆ ลองเล่าให้{" "}
            <Link href="/chatbot" className="font-semibold text-lavender-700 underline">
              Well.AI
            </Link>{" "}
            ฟัง หรือ{" "}
            <Link href="/appointments" className="font-semibold text-lavender-700 underline">
              นัดคุยกับครู
            </Link>{" "}
            ได้เสมอนะ
          </p>

          <button
            type="button"
            onClick={replay}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-neutral-300 px-5 py-3 text-[0.88rem] font-medium text-ink-soft transition hover:border-neutral-400 hover:text-ink"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            เล่นอีกรอบ
          </button>
        </div>
      </div>
    );
  }

  const trapRight = pickedTrap === round.trap;

  return (
    <div className={cn("mx-auto w-full max-w-md", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h1 className="font-display th:leading-snug text-[1.15rem] font-bold text-ink">
          🧠 จับความคิดที่หลอกเรา
        </h1>
        <span className="shrink-0 rounded-full bg-sky-50 px-3 py-1 text-[0.74rem] font-bold text-sky-700 ring-1 ring-sky-200">
          ข้อ {index + 1}/{ROUNDS.length}
        </span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-sky-400 transition-all duration-500"
          style={{
            width: `${((index + (phase === "reframe" ? 0.5 : 0)) / ROUNDS.length) * 100}%`,
          }}
        />
      </div>

      <AnimatePresence initial={false}>
        <motion.div key={`${round.id}-${phase}`} {...(reduce ? {} : slide)}>
          <div className="rounded-3xl bg-white p-4 ring-1 ring-neutral-200">
            <p className="text-[0.76rem] font-medium text-ink-mute">{round.scene}</p>
            <p className="mt-1.5 text-[0.98rem] font-semibold leading-relaxed text-ink">
              {round.thought}
            </p>
          </div>

          {phase === "trap" ? (
            <>
              <p className="mb-2 mt-4 text-[0.8rem] text-ink-soft">
                ความคิดนี้ติดกับดักแบบไหน?
              </p>
              <div className="space-y-2">
                {round.options.map((id) => {
                  const meta = TRAPS[id];
                  const chosen = pickedTrap === id;
                  const isAnswer = id === round.trap;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => chooseTrap(id)}
                      disabled={pickedTrap !== null}
                      className={cn(
                        "flex w-full items-start gap-2.5 rounded-2xl border-2 p-3 text-left transition",
                        pickedTrap === null && "border-neutral-200 bg-white hover:border-sky-300",
                        pickedTrap !== null && isAnswer && "border-mint-400 bg-mint-50",
                        pickedTrap !== null && chosen && !isAnswer && "border-rose-300 bg-rose-50",
                        pickedTrap !== null && !chosen && !isAnswer && "border-neutral-200 bg-white opacity-55",
                      )}
                    >
                      <span className="text-lg leading-none" aria-hidden="true">
                        {meta.emoji}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[0.88rem] font-semibold text-ink">
                          {meta.label}
                        </span>
                        <span className="mt-0.5 block text-[0.74rem] leading-relaxed text-ink-mute">
                          {meta.hint}
                        </span>
                      </span>
                      {pickedTrap !== null && isAnswer && (
                        <Check className="size-4 shrink-0 text-mint-600" aria-hidden="true" />
                      )}
                      {pickedTrap !== null && chosen && !isAnswer && (
                        <X className="size-4 shrink-0 text-rose-500" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>

              {pickedTrap !== null && (
                <div
                  className={cn(
                    "mt-3 rounded-2xl p-3.5 ring-1",
                    trapRight ? "bg-mint-50 ring-mint-200" : "bg-amber-50 ring-amber-200",
                  )}
                  role="status"
                  aria-live="polite"
                >
                  <p className="text-[0.82rem] font-bold text-ink">
                    {trapRight ? "จับได้แม่นมาก" : `จริง ๆ แล้วคือ “${TRAPS[round.trap].label}”`}
                  </p>
                  <p className="mt-1 text-[0.8rem] leading-relaxed text-ink-soft">{round.why}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="mb-2 mt-4 flex items-start gap-1.5 text-[0.8rem] text-ink-soft">
                <Brain className="mt-0.5 size-4 shrink-0 text-sky-500" aria-hidden="true" />
                แล้วจะพูดกับตัวเองใหม่ว่ายังไงดี? เลือกประโยคที่ทั้ง{" "}
                <span className="font-semibold text-ink">ใจดีขึ้น</span> และ{" "}
                <span className="font-semibold text-ink">ยังเป็นเรื่องจริง</span>
              </p>
              <div className="space-y-2">
                {round.reframes.map((r, i) => {
                  const chosen = pickedReframe === i;
                  const isBest = r.kind === "balanced";
                  return (
                    <button
                      key={r.text}
                      type="button"
                      onClick={() => chooseReframe(i)}
                      disabled={pickedReframe !== null}
                      className={cn(
                        "block w-full rounded-2xl border-2 p-3 text-left transition",
                        pickedReframe === null && "border-neutral-200 bg-white hover:border-sky-300",
                        pickedReframe !== null && isBest && "border-mint-400 bg-mint-50",
                        pickedReframe !== null && chosen && !isBest && "border-rose-300 bg-rose-50",
                        pickedReframe !== null && !chosen && !isBest && "border-neutral-200 bg-white opacity-55",
                      )}
                    >
                      <span className="block text-[0.88rem] leading-relaxed text-ink">{r.text}</span>
                      {pickedReframe !== null && (
                        <span className="mt-1.5 block text-[0.76rem] leading-relaxed text-ink-mute">
                          {r.note}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {((phase === "trap" && pickedTrap !== null) ||
            (phase === "reframe" && pickedReframe !== null)) && (
            <button
              type="button"
              onClick={next}
              className="mt-4 w-full rounded-2xl bg-sky-600 py-3.5 text-[0.9rem] font-semibold text-white transition hover:bg-sky-500"
            >
              {phase === "trap"
                ? "ต่อไป: พูดกับตัวเองใหม่"
                : index + 1 >= ROUNDS.length
                  ? "ดูสรุป"
                  : "ข้อถัดไป"}
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default ThoughtCatcherGame;
