"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ChevronDown, Pause, Play, RotateCcw, Timer } from "lucide-react";
import { motion } from "framer-motion";

import { FluffyBuddy, type FluffyExpression } from "@/components/FluffyBuddy";
import { References } from "@/components/shared/References";
import type { Reference } from "@/data/copingGuides";

/**
 * BoxBreathing — the full breathing coach.
 *
 * น้องปุย (the real green-screen clip, keyed onto a pastel backdrop) inflates on
 * the in-breath, holds, and deflates on the out-breath, ringed by a soft halo.
 * The background eases brighter as you breathe in and darker as you breathe out,
 * and gentle Thai copy names each phase. On top of the calm visuals it keeps the
 * practical bits: two techniques (Box 4-4-4-4 + Relaxing 4-7-8), a 1/3/5-minute
 * session picker, a countdown clock, and a reward when a session completes.
 */

/* ------------------------------------------------------------- patterns */

type PhaseKey = "inhale" | "hold" | "exhale" | "rest";
type Phase = {
  key: PhaseKey;
  label: string;
  seconds: number;
  /** true → น้องปุย sits inflated for this phase. */
  expand: boolean;
  /**
   * ข้อความประจำจังหวะ เมื่อคำกลาง ๆ ของ COPY ไม่พอ
   *
   * จำเป็นสำหรับท่าสูดสองครั้ง: สองจังหวะแรกเป็น "inhale" เหมือนกันทั้งคู่ ถ้าปล่อยให้
   * ใช้คำเดียวกัน หน้าจอจะขึ้น "สูดลมหายใจเข้าลึกๆ..." สองรอบติดโดยไม่มีอะไรบอกว่า
   * ต้องสูดซ้ำ — ซึ่งทำให้ทั้งเทคนิคหายไป เพราะหัวใจของมันอยู่ที่การสูดครั้งที่สอง
   */
  copy?: string;
  /** ระดับการพองที่ต้องการ เมื่อ expand อย่างเดียวหยาบเกินไป (เช่น สูดเข้าสองระดับ) */
  scaleTo?: number;
};
type Pattern = {
  id: string;
  name: string;
  hint: string;
  sessionSeconds: number;
  phases: Phase[];
  /** ข้อควรระวังของท่านี้ — ขึ้นใต้คำอธิบาย ไม่ใช่ซ่อนไว้ในหน้าอื่น */
  caution?: string;
  /** แหล่งอ้างอิงของท่านี้ — ขึ้นบรรทัดล่างสุด เปลี่ยนตามท่าที่เลือก */
  references: Reference[];
};

/* งานวิจัยชิ้นเดียวกันครอบคลุมทั้ง box และ sigh เพราะทดลองทั้งสองท่าในการศึกษาเดียว
   ส่วน 4-7-8 ไม่ได้อยู่ในงานนั้น จึงอ้างต้นทางของเทคนิคตรง ๆ แทน ไม่ยืมความน่าเชื่อถือ
   ของงานวิจัยที่ไม่ได้ทดลองท่านี้ */
const STANFORD_2023: Reference = {
  label:
    "Balban MY และคณะ (2023) — Brief structured respiration practices enhance mood and reduce physiological arousal, Cell Reports Medicine",
  url: "https://pubmed.ncbi.nlm.nih.gov/36630953/",
};

/** Warm, calming line for each phase. */
const COPY: Record<PhaseKey, string> = {
  inhale: "สูดลมหายใจเข้าลึกๆ...",
  hold: "กลั้นไว้ก่อนนะ เก่งมาก...",
  exhale: "ค่อยๆ ปล่อยลมหายใจออก...",
  rest: "พักสักนิด...",
};
const TONE: Record<PhaseKey, string> = {
  inhale: "text-emerald-600",
  hold: "text-violet-500",
  exhale: "text-sky-600",
  rest: "text-violet-400",
};

const PATTERNS: Pattern[] = [
  {
    id: "box",
    name: "Box Breathing (4-4-4-4)",
    hint: "เข้า · กลั้น · ออก · กลั้น — อย่างละ 4 วินาที",
    sessionSeconds: 120, // แนะนำ 2 นาที
    references: [STANFORD_2023],
    phases: [
      { key: "inhale", label: "หายใจเข้า", seconds: 4, expand: true },
      { key: "hold", label: "กลั้นไว้", seconds: 4, expand: true },
      { key: "exhale", label: "หายใจออก", seconds: 4, expand: false },
      { key: "rest", label: "พักไว้", seconds: 4, expand: false },
    ],
  },
  {
    id: "478",
    name: "Relaxing (4-7-8)",
    hint: "เข้า 4 · กลั้น 7 · ออก 8 — ผ่อนลมหายใจออกให้ยาว",
    sessionSeconds: 60, // แนะนำ 1 นาที
    caution:
      "ท่านี้ต้องกลั้นหายใจ ถ้าเป็นหอบหืด มีโรคปอด หรือกำลังหายใจไม่ทันอยู่ ให้ใช้ท่าสูดสองครั้งแทน และถ้าเวียนหัวเมื่อไหร่ให้กลับมาหายใจปกติทันที",
    references: [
      {
        label: "Andrew Weil, M.D. — The 4-7-8 Breath (ต้นทางของเทคนิค)",
        url: "https://www.drweil.com/health-wellness/body-mind-spirit/stress-anxiety/three-breathing-exercises-and-techniques/",
      },
      STANFORD_2023,
    ],
    phases: [
      { key: "inhale", label: "หายใจเข้า", seconds: 4, expand: true },
      { key: "hold", label: "กลั้นไว้", seconds: 7, expand: true },
      { key: "exhale", label: "หายใจออก", seconds: 8, expand: false },
    ],
  },
  {
    // ท่าฉุกเฉิน — ของจริงนับเป็น "รอบ" ไม่ใช่นาที ตัวเล่นแบบนับรอบอยู่ในการ์ด
    // ที่ /coping (components/coping/SighPlayer.tsx) ส่วนที่นี่คือเวอร์ชันฝึกยาว
    // สำหรับคนที่อยากทำเป็นกิจวัตร ไม่ใช่คนที่กำลังใจสั่นอยู่ตอนนี้
    id: "sigh",
    name: "Physiological Sigh (สูดสองครั้ง)",
    hint: "สูดเข้า 2 ครั้งติดกัน แล้วผ่อนออกทางปากยาว ๆ",
    sessionSeconds: 60, // แนะนำ 1 นาที (รอบละ 13 วิ)
    references: [STANFORD_2023],
    phases: [
      {
        key: "inhale",
        label: "สูดเข้า",
        seconds: 4,
        expand: true,
        scaleTo: 0.93,
        copy: "สูดเข้าทางจมูกยาว ๆ...",
      },
      {
        key: "inhale",
        label: "สูดเข้าอีกนิด",
        seconds: 2,
        expand: true,
        copy: "สูดเข้าอีกนิด สั้น ๆ ยังไม่ปล่อย...",
      },
      {
        key: "exhale",
        label: "ผ่อนออก",
        seconds: 7,
        expand: false,
        copy: "ผ่อนลมออกทางปากช้า ๆ ยาว ๆ...",
      },
    ],
  },
];

/** ระดับการพองของจังหวะนี้ — scaleTo ชนะ ถ้าไม่มีก็ใช้ expand ตามเดิม */
const targetScale = (p: Phase) => p.scaleTo ?? (p.expand ? SCALE_MAX : SCALE_MIN);

const DURATIONS: { label: string; seconds: number | null }[] = [
  { label: "แนะนำ", seconds: null },
  { label: "1 นาที", seconds: 60 },
  { label: "3 นาที", seconds: 180 },
  { label: "5 นาที", seconds: 300 },
];

const cycleSeconds = (p: Pattern) => p.phases.reduce((s, ph) => s + ph.seconds, 0);

function minutesLabel(seconds: number): string {
  const m = seconds / 60;
  return `${Number.isInteger(m) ? m : m.toFixed(1)} นาที`;
}

function clock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/* ------------------------------------------------------------- the breath */

const SCALE_MAX = 1; // fully inhaled
const SCALE_MIN = 0.72; // fully exhaled
const SCALE_REST = 0.82; // idle

type Status = "idle" | "running" | "paused" | "done";

/** น้องปุย's face for the current breathing state — it changes per phase. */
function buddyExpressionFor(status: Status, phaseKey: PhaseKey): FluffyExpression {
  if (status === "done") return "happy";
  if (status === "idle") return "content";
  switch (phaseKey) {
    case "inhale":
      return "breatheIn";
    case "hold":
      return "breatheHold";
    case "exhale":
      return "breatheOut";
    default:
      return "sleepy"; // rest
  }
}

/** Read น้องปุย's live scale, so a pause freezes it exactly where it is. */
function readScale(el: HTMLElement): number {
  const t = getComputedStyle(el).transform;
  if (!t || t === "none") return SCALE_REST;
  try {
    return new DOMMatrixReadOnly(t).a || SCALE_REST;
  } catch {
    return SCALE_REST;
  }
}

/* ------------------------------------------------------------- component */

export type BoxBreathingProps = {
  onCycleComplete?: () => void;
  onSessionComplete?: () => void;
  className?: string;
  /** ท่าที่ให้เปิดค้างไว้ตั้งแต่แรก — ใช้เมื่อมีคนลิงก์ตรงมาจากการ์ดในคลังวิธีรับมือ */
  initialPatternId?: string;
};

export function BoxBreathing({
  onCycleComplete,
  onSessionComplete,
  className,
  initialPatternId,
}: BoxBreathingProps) {
  const [patternId, setPatternId] = useState(
    () =>
      (initialPatternId && PATTERNS.some((p) => p.id === initialPatternId)
        ? initialPatternId
        : PATTERNS[0].id),
  );
  const pattern = PATTERNS.find((p) => p.id === patternId) ?? PATTERNS[0];
  const phases = pattern.phases;

  const [customSeconds, setCustomSeconds] = useState<number | null>(null);
  const sessionTotal = customSeconds ?? pattern.sessionSeconds;

  const [status, setStatus] = useState<Status>("idle");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [remaining, setRemaining] = useState(phases[0].seconds);
  const [sessionLeft, setSessionLeft] = useState(pattern.sessionSeconds);

  // น้องปุย is a pure function of `leg`: a target scale + how long to reach it.
  // A new leg is pushed only at phase changes / resume / pause — never on the
  // per-second tick — so the transition never restarts mid-breath.
  const [leg, setLeg] = useState({ id: 0, scale: SCALE_REST, seconds: 0.6 });
  const beginLeg = (scale: number, seconds: number) =>
    setLeg((l) => ({ id: l.id + 1, scale, seconds }));

  const bodyRef = useRef<HTMLDivElement>(null);

  const phaseIndexRef = useRef(phaseIndex);
  const remainingRef = useRef(remaining);
  const sessionLeftRef = useRef(sessionLeft);
  const phasesRef = useRef(phases);
  const onCycleRef = useRef(onCycleComplete);
  const onSessionRef = useRef(onSessionComplete);
  useEffect(() => void (phaseIndexRef.current = phaseIndex), [phaseIndex]);
  useEffect(() => void (remainingRef.current = remaining), [remaining]);
  useEffect(() => void (sessionLeftRef.current = sessionLeft), [sessionLeft]);
  useEffect(() => void (phasesRef.current = phases), [phases]);
  useEffect(() => void (onCycleRef.current = onCycleComplete), [onCycleComplete]);
  useEffect(() => void (onSessionRef.current = onSessionComplete), [onSessionComplete]);

  const phase = phases[phaseIndex] ?? phases[0];

  useEffect(() => {
    if (status !== "running") return;

    const id = window.setInterval(() => {
      if (sessionLeftRef.current <= 1) {
        setSessionLeft(0);
        setStatus("done");
        beginLeg(SCALE_REST, 1);
        onSessionRef.current?.();
        return;
      }
      setSessionLeft((s) => s - 1);

      if (remainingRef.current > 1) {
        setRemaining((r) => r - 1);
        return;
      }
      const list = phasesRef.current;
      const nextIndex = (phaseIndexRef.current + 1) % list.length;
      const nextPhase = list[nextIndex];

      if (nextIndex === 0) onCycleRef.current?.();

      setPhaseIndex(nextIndex);
      setRemaining(nextPhase.seconds);
      beginLeg(targetScale(nextPhase), nextPhase.seconds);
    }, 1000);

    return () => window.clearInterval(id);
  }, [status]);

  /* ---- controls ---- */

  function startOrResume() {
    if (status === "running") return;
    if (status === "idle") {
      beginLeg(targetScale(phase), phase.seconds);
    } else {
      beginLeg(targetScale(phase), remaining);
    }
    setStatus("running");
  }

  function pause() {
    if (status !== "running") return;
    const el = bodyRef.current;
    beginLeg(el ? readScale(el) : leg.scale, 0);
    setStatus("paused");
  }

  function resetTo(total: number) {
    setStatus("idle");
    setPhaseIndex(0);
    setRemaining(phases[0].seconds);
    setSessionLeft(total);
    beginLeg(SCALE_REST, 0.6);
  }

  function reset() {
    resetTo(sessionTotal);
  }

  function choosePattern(id: string) {
    const next = PATTERNS.find((p) => p.id === id) ?? PATTERNS[0];
    setPatternId(id);
    setStatus("idle");
    setPhaseIndex(0);
    setRemaining(next.phases[0].seconds);
    setSessionLeft(customSeconds ?? next.sessionSeconds);
    beginLeg(SCALE_REST, 0.6);
  }

  function chooseDuration(seconds: number | null) {
    setCustomSeconds(seconds);
    resetTo(seconds ?? pattern.sessionSeconds);
  }

  function onPrimary() {
    if (status === "running") pause();
    else if (status === "done") reset();
    else startOrResume();
  }

  /* ---- render ---- */

  const idle = status === "idle";
  const done = status === "done";
  const running = status === "running";

  // น้องปุย's face follows the breath; the glow pulses while holding.
  const buddyExpression = buddyExpressionFor(status, phase.key);
  const isHold = running && phase.key === "hold";

  // Background brightens on the in-breath, eases darker on the out-breath.
  const bright = idle || done ? 1 : phase.expand ? 1.1 : 0.9;
  const bgTrans = idle || done ? 1.2 : phase.seconds;

  const progressPct = ((sessionTotal - sessionLeft) / sessionTotal) * 100;

  return (
    <div
      className={[
        "relative mx-auto flex w-full max-w-sm flex-col items-center gap-5 overflow-hidden rounded-[2rem] p-6",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Pastel backdrop — brightness eases with the breath. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-mint-100 via-white to-lavender-200"
        style={{ filter: `brightness(${bright})`, transition: `filter ${bgTrans}s ease-in-out` }}
      />

      <div className="relative z-10 flex w-full flex-col items-center gap-5">
        {/* Greeting */}
        <p className="text-sm font-medium text-slate-500">ให้น้องปุยหายใจเป็นเพื่อนกันนะ ☁️</p>

        {/* Pattern dropdown */}
        <div className="relative w-full">
          <label htmlFor="breath-pattern" className="sr-only">
            เลือกจังหวะการหายใจ
          </label>
          <select
            id="breath-pattern"
            value={patternId}
            onChange={(e) => choosePattern(e.target.value)}
            className="w-full cursor-pointer appearance-none rounded-2xl border border-pink-100 bg-white/80 px-4 py-3 pr-10 text-sm font-medium text-slate-600 shadow-sm outline-none transition focus-visible:ring-4 focus-visible:ring-pink-200"
          >
            {PATTERNS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · แนะนำ {minutesLabel(p.sessionSeconds)}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
        </div>
        <div className="-mt-3 flex flex-col items-center gap-0.5 text-center">
          <p className="text-xs text-slate-400">{pattern.hint}</p>
          <p className="text-xs font-medium text-slate-500">
            1 รอบ {cycleSeconds(pattern)} วิ · แนะนำ {minutesLabel(pattern.sessionSeconds)}
          </p>
        </div>

        {/* ข้อควรระวังของท่าที่เลือกอยู่ ต้องอยู่ในห้องนี้ด้วย ไม่ใช่มีแต่ในคลังวิธีรับมือ —
            ห้องนี้คือที่ที่คนกดหายใจจริง คำเตือนที่อยู่แค่หน้าอื่นคือคำเตือนที่คนส่วนใหญ่ไม่เห็น */}
        {pattern.caution ? (
          <p className="-mt-2 flex items-start gap-2 rounded-2xl bg-amber-50/90 px-3.5 py-2.5 text-left text-[0.74rem] leading-relaxed text-amber-900 ring-1 ring-amber-200/70">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" aria-hidden="true" />
            {pattern.caution}
          </p>
        ) : null}

        {/* Session-length picker */}
        <div className="flex w-full flex-col items-center gap-2">
          <span className="text-xs font-medium text-slate-400">ระยะเวลา</span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {DURATIONS.map((d) => {
              const active =
                d.seconds === null ? customSeconds === null : customSeconds === d.seconds;
              return (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => chooseDuration(d.seconds)}
                  aria-pressed={active}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 ${
                    active
                      ? "bg-pink-400 text-white shadow-sm shadow-pink-200"
                      : "bg-white text-slate-500 ring-1 ring-slate-200 hover:ring-pink-200"
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* น้องปุย + halo — the whole group inflates and deflates with the breath */}
        <div className="relative grid h-80 w-80 place-items-center">
          {/* ambient glow (unscaled) */}
          <div
            className="pointer-events-none absolute size-60 rounded-full bg-pink-200/40 blur-3xl motion-safe:animate-pulse"
            aria-hidden="true"
          />
          {/* SCALE layer — the breath. Duration matches the phase. */}
          <div
            ref={bodyRef}
            className="relative grid place-items-center will-change-transform"
            style={{
              transform: `scale(${leg.scale})`,
              transition: `transform ${leg.seconds}s ease-in-out`,
            }}
          >
            {/* halo glow + ring, scaling with น้องปุย */}
            <div
              className="absolute rounded-full bg-pink-200/40 blur-2xl"
              style={{ width: 296, height: 296 }}
              aria-hidden="true"
            />
            <div
              className="absolute rounded-full ring-4 ring-pink-200/70"
              style={{ width: 288, height: 288 }}
              aria-hidden="true"
            />
            {/* น้องปุย (CSS) — the face changes with each breathing phase */}
            <FluffyBuddy expression={buddyExpression} size={232} glow={isHold} />
          </div>
        </div>

        {/* Phase copy + countdown */}
        <div className="grid min-h-[5.5rem] place-items-center text-center" aria-live="polite">
          {done ? (
            <p className="text-xl font-semibold text-pink-500">
              เก่งมาก! หายใจครบ {minutesLabel(sessionTotal)}แล้ว 🌸
            </p>
          ) : idle ? (
            <p className="text-xl font-medium text-slate-500">พร้อมหายใจไปด้วยกันไหม? 🌿</p>
          ) : (
            <div>
              {/* key เป็นลำดับจังหวะ ไม่ใช่ชนิดจังหวะ — ท่าสูดสองครั้งมี "inhale" ติดกัน
                  สองจังหวะ ถ้า key ไม่เปลี่ยน ข้อความจะไม่เล่นแอนิเมชันใหม่และดูเหมือนค้าง */}
              <motion.p
                key={phaseIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className={`text-2xl font-semibold ${TONE[phase.key]}`}
              >
                {phase.copy ?? COPY[phase.key]}
              </motion.p>
              <p className="mt-1 text-4xl font-bold tabular-nums text-slate-600/80" aria-hidden="true">
                {remaining}
              </p>
            </div>
          )}
        </div>

        {/* Session timer + progress */}
        <div className="flex w-full max-w-[240px] flex-col items-center gap-1.5">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Timer className="size-4" aria-hidden="true" />
            <span className="tabular-nums text-sm font-semibold text-slate-700">
              {clock(sessionLeft)}
            </span>
            <span className="text-xs text-slate-400">/ {clock(sessionTotal)}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/60">
            <div
              className="h-full rounded-full bg-pink-300 transition-[width] duration-1000 ease-linear"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onPrimary}
            className={`flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold text-white shadow-lg transition active:scale-95 ${
              running
                ? "bg-violet-400 shadow-violet-200/70 hover:bg-violet-500"
                : "bg-pink-400 shadow-pink-200/70 hover:bg-pink-500"
            }`}
          >
            {running ? (
              <>
                <Pause className="size-5" aria-hidden="true" />
                พัก
              </>
            ) : done ? (
              <>
                <RotateCcw className="size-5" aria-hidden="true" />
                เริ่มใหม่
              </>
            ) : (
              <>
                <Play className="size-5" aria-hidden="true" />
                {status === "paused" ? "ไปต่อ" : "เริ่มหายใจด้วยกัน"}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={reset}
            disabled={idle || done}
            aria-label="เริ่มใหม่"
            className="flex items-center justify-center rounded-full bg-white p-3.5 text-slate-500 shadow-md ring-1 ring-slate-100 transition hover:text-slate-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* บรรทัดล่างสุดของห้อง เปลี่ยนตามท่าที่เลือกอยู่ — ห้องนี้เป็นที่ที่คนกดหายใจจริง
            แหล่งอ้างอิงจึงควรอยู่ตรงนี้ด้วย ไม่ใช่มีแต่ในคลังวิธีรับมือ */}
        <References
          items={pattern.references}
          className="w-full border-t border-slate-900/10 pt-3 text-center"
        />
      </div>
    </div>
  );
}

export default BoxBreathing;
