"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, BookHeart, Cloud, Send } from "lucide-react";

import { FluffyBuddy } from "@/components/FluffyBuddy";
import { EMOTION_WHEEL, type CoreEmotion, type SecondaryEmotion } from "@/data/emotionWheel";
import { NEGATIVE_CORES } from "@/data/cloudHugs";
import { useCloudHugsStore } from "@/lib/store/useCloudHugsStore";

/** A gentle crossfade + drift. Deliberately soft and non-bouncy. */
const swap = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};
const EASE = { duration: 0.32, ease: [0.4, 0, 0.2, 1] as const };

const PALE = {
  gradient: "linear-gradient(to bottom right, #ffffff, #f1f5f9, #e2e8f0)",
  ink: "#94a3b8",
  glow: "rgba(203,213,225,0.4)",
};

type Step = "core" | "secondary" | "tertiary" | "done";

export type DailyMoodPetProps = {
  /** Called when "Save to Diary" is pressed with the finished 3-layer entry. */
  onSave?: (entry: { core: string; secondary: string; tertiary: string }) => void;
  /** Called from the very first step's back button (e.g. to leave the tab). */
  onExit?: () => void;
  /** Called after a cloud is released, so the host can jump to the galaxy. */
  onReleaseCloud?: () => void;
  className?: string;
};

export function DailyMoodPet({ onSave, onExit, onReleaseCloud, className }: DailyMoodPetProps) {
  const release = useCloudHugsStore((s) => s.release);
  const [step, setStep] = useState<Step>("core");
  const [core, setCore] = useState<CoreEmotion | null>(null);
  const [secondary, setSecondary] = useState<SecondaryEmotion | null>(null);
  const [tertiary, setTertiary] = useState<string | null>(null);
  const [released, setReleased] = useState(false);

  const skin = core ?? PALE;

  const prompt =
    step === "core"
      ? "วันนี้หัวใจของเธอเป็นสีอะไรนะ?"
      : step === "secondary"
        ? "ความรู้สึกนั้นคืออะไรหรอ?"
        : step === "tertiary"
          ? "เจาะลึกลงไปอีกนิด มันคือความรู้สึกแบบไหน?"
          : "ขอบคุณที่เล่าให้ฟังนะ ☁️";

  function goBack() {
    setReleased(false); // a changed feeling deserves a fresh release choice
    if (step === "done") {
      setTertiary(null);
      setStep("tertiary");
    } else if (step === "tertiary") {
      setSecondary(null);
      setStep("secondary");
    } else if (step === "secondary") {
      setCore(null);
      setStep("core");
    } else {
      onExit?.();
    }
  }

  function save() {
    if (!core || !secondary || !tertiary) return;
    const entry = { core: core.key, secondary: secondary.label, tertiary };
    // Dev-only mock save — private feelings must never be logged in production.
    if (process.env.NODE_ENV !== "production") {
      console.log("[mood] save to diary:", entry);
    }
    onSave?.(entry);
  }

  function releaseMyCloud() {
    if (!core || !tertiary || released) return;
    // ไม่ต้องยัดชนิดข้อมูลแล้ว — CoreColor ครอบคลุมคีย์ของวงล้อครบทุกสี
    release(tertiary, core.key);
    setReleased(true);
  }

  return (
    <div
      className={[
        "mx-auto flex w-full max-w-md flex-col items-center gap-5 rounded-[2rem] p-6",
        "bg-gradient-to-b from-white via-white to-slate-50",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* The pet — recolours to match the chosen feeling */}
      <motion.div
        key={core?.key ?? "pale"}
        initial={{ scale: 0.92, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={EASE}
      >
        <FluffyBuddy
          expression={core ? core.face : "content"}
          size={128}
          gradient={skin.gradient}
          ink={skin.ink}
          glowColor={skin.glow}
        />
      </motion.div>

      {/* Prompt */}
      <AnimatePresence mode="wait">
        <motion.p
          key={prompt}
          variants={swap}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={EASE}
          className="text-center text-lg font-semibold text-slate-700"
        >
          {prompt}
        </motion.p>
      </AnimatePresence>

      {/* Step body */}
      <div className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={swap}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={EASE}
          >
            {step === "core" && (
              <ul className="flex flex-wrap justify-center gap-3">
                {EMOTION_WHEEL.map((c) => (
                  <li key={c.key}>
                    <button
                      type="button"
                      onClick={() => {
                        setCore(c);
                        setStep("secondary");
                      }}
                      className="flex w-20 flex-col items-center gap-1.5 transition active:scale-95"
                    >
                      <span
                        className="size-16 rounded-full shadow-sm ring-4 ring-white transition hover:scale-105"
                        style={{ background: `radial-gradient(circle at 32% 28%, #ffffff88, transparent 55%), ${c.swatch}` }}
                      />
                      <span className="text-xs font-semibold text-slate-500">{c.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {step === "secondary" && core && (
              <div className="flex flex-wrap justify-center gap-2.5">
                {core.secondaries.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => {
                      setSecondary(s);
                      setStep("tertiary");
                    }}
                    className="rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 active:scale-95"
                    style={{ backgroundColor: core.soft, color: core.ink }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            {step === "tertiary" && core && secondary && (
              <div className="flex flex-wrap justify-center gap-2.5">
                {secondary.tertiaries.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTertiary(t);
                      setStep("done");
                    }}
                    className="rounded-full border-2 bg-white/70 px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 active:scale-95"
                    style={{ borderColor: core.ink, color: core.ink }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            {step === "done" && core && secondary && tertiary && (
              <div className="flex flex-col items-center gap-4">
                {/* the 3-layer path */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-sm">
                  <span className="rounded-full px-3 py-1 font-semibold" style={{ backgroundColor: core.soft, color: core.ink }}>
                    {core.emoji} {core.label}
                  </span>
                  <span className="text-slate-300">→</span>
                  <span className="rounded-full px-3 py-1 font-medium text-slate-500" style={{ backgroundColor: core.soft }}>
                    {secondary.label}
                  </span>
                  <span className="text-slate-300">→</span>
                  <span className="rounded-full border px-3 py-1 font-semibold" style={{ borderColor: core.ink, color: core.ink }}>
                    {tertiary}
                  </span>
                </div>

                {/* CBT validating message */}
                <p className="text-center text-[0.95rem] leading-relaxed text-slate-600">
                  เข้าใจเลยที่รู้สึก “<span className="font-semibold" style={{ color: core.ink }}>{tertiary}</span>” — ทุกความรู้สึกมีที่ทางของมันเสมอนะ กอด ๆ ☁️
                </p>

                {/* Release to the Cloud Hugs galaxy — offered only for heavy feelings */}
                {NEGATIVE_CORES.has(core.key) &&
                  (released ? (
                    <div className="flex w-full flex-col items-center gap-2.5 rounded-2xl bg-indigo-50 p-4 text-center ring-1 ring-indigo-100">
                      <p className="text-[0.9rem] font-semibold text-indigo-700">เมฆของเธอลอยเข้ากาแล็กซีแล้ว 💙</p>
                      <p className="text-[0.78rem] leading-relaxed text-indigo-500">
                        เดี๋ยวเพื่อน ๆ จะแวะมาส่งกอดให้นะ เธอไม่ได้อยู่คนเดียว
                      </p>

                      {/* ปล่อยเมฆกับบันทึกลงไดอารี่เป็นคนละปุ่มโดยตั้งใจ (คนละปลายทาง คนละคำยินยอม)
                          แต่คนที่กดปล่อยเมฆแล้วกด "ไปดูกาแล็กซี" ต่อจะออกจากหน้านี้ทันที
                          แล้วความรู้สึกวันนั้นจะไม่ถูกเก็บที่ไหนเลย — เตือนไว้ก่อนถึงปุ่มนั้น */}
                      <p className="flex items-start gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-left text-[0.76rem] leading-relaxed text-amber-800 ring-1 ring-amber-200">
                        <BookHeart className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                        <span>
                          อย่าลืมกด <span className="font-semibold">“บันทึกลงไดอารี่”</span> ด้านล่างด้วยนะ
                          ไม่งั้นความรู้สึกวันนี้จะไม่ถูกเก็บไว้ในสมุดของเธอ
                        </span>
                      </p>

                      <button
                        type="button"
                        onClick={() => onReleaseCloud?.()}
                        className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600 active:scale-95"
                      >
                        <Cloud className="size-4" />
                        ไปดูกาแล็กซี
                      </button>
                    </div>
                  ) : (
                    <div className="flex w-full flex-col items-center gap-2.5 rounded-2xl bg-indigo-50/70 p-4 text-center ring-1 ring-indigo-100">
                      <p className="text-[0.82rem] leading-relaxed text-slate-600">
                        อยากปล่อยความรู้สึกนี้เป็น <span className="font-semibold text-indigo-600">ก้อนเมฆนิรนาม</span> ให้เพื่อน ๆ ส่งกอดไหม?
                      </p>
                      <button
                        type="button"
                        onClick={releaseMyCloud}
                        className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 active:scale-95"
                      >
                        <Send className="size-4" />
                        ปล่อยเมฆของฉัน ☁️
                      </button>
                    </div>
                  ))}

                <button
                  type="button"
                  onClick={save}
                  className="flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold text-white shadow-lg transition active:scale-95"
                  style={{ backgroundColor: core.ink }}
                >
                  <BookHeart className="size-5" />
                  บันทึกลงไดอารี่
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Back */}
      <button
        type="button"
        onClick={goBack}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-slate-600"
      >
        <ArrowLeft className="size-4" />
        {step === "core" ? "กลับ" : "ย้อนกลับ"}
      </button>
    </div>
  );
}

export default DailyMoodPet;
