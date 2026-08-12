"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Copy, HeartHandshake, Phone, RotateCcw, ShieldCheck } from "lucide-react";

import {
  mentalHealthAssessments,
  type Assessment,
  type Interpretation,
  type Question,
} from "@/data/assessments";
import { SLA_HOURS, useCasesStore } from "@/lib/store/useCasesStore";
import { useUserStore } from "@/lib/store/useUserStore";

/* ------------------------------------------------------------------- constants */

/** Emergency contacts, inlined so the component stays self-contained. */
const HOTLINES = [
  { label: "สายด่วนสุขภาพจิต", number: "1323", tel: "1323" },
  { label: "สมาคมสะมาริตันส์", number: "02-113-6789", tel: "021136789" },
];

/** The screens a student can start from — 9Q and 8Q are only reached by routing. */
const ENTRY_POINTS = [
  { id: "2Q", emoji: "🌧️", label: "ความรู้สึกเศร้า", desc: "เช็คใจเร็ว ๆ 2 คำถาม" },
  { id: "PHQ-A", emoji: "💧", label: "ซึมเศร้า (วัยรุ่น)", desc: "PHQ-A · 9 คำถาม" },
  { id: "ST-5", emoji: "😮‍💨", label: "ความเครียด", desc: "5 คำถามสั้น ๆ" },
  { id: "GAD-7", emoji: "🍃", label: "ความกังวล", desc: "7 คำถาม" },
];

/**
 * Questions that screen for suicidal ideation. If any of these is answered above
 * zero, the flow must continue to the 8Q suicide-risk assessment — regardless of
 * the total score. The data flags this for 9Q; PHQ-A's item 9 carries the same risk.
 */
const SUICIDE_ITEM_IDS = new Set(["9q-9", "phqa-9"]);

/** Slide + fade between questions. `dir` = 1 forward, -1 back. */
const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir >= 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir >= 0 ? -40 : 40 }),
};

/* ------------------------------------------------------------------- helpers */

/**
 * Sum the chosen options' scores for one assessment. `answers` holds option indexes.
 *
 * เจตนานับเฉพาะ `questions` — คำถามท้ายแบบ (supplemental) ไม่นับรวมคะแนนตามต้นฉบับ
 * ถ้านับรวมจะทำให้คะแนนเกินเพดานของเครื่องมือและเกณฑ์แปลผลเพี้ยนทั้งชุด
 */
function totalScore(a: Assessment, answers: Record<string, number>): number {
  return a.questions.reduce((sum, q) => sum + (q.options[answers[q.id]]?.score ?? 0), 0);
}

/** ลำดับคำถามที่ผู้ใช้เห็นจริง = ข้อที่นับคะแนน ตามด้วยคำถามท้ายแบบ */
function allQuestions(a: Assessment): Question[] {
  return a.supplemental ? [...a.questions, ...a.supplemental] : a.questions;
}

/** Find the interpretation band a score falls into (falls back to the most severe). */
function interpret(a: Assessment, score: number): Interpretation {
  return (
    a.interpretations.find((i) => score >= i.minScore && score <= i.maxScore) ??
    a.interpretations[a.interpretations.length - 1]
  );
}

/**
 * Which test comes next, if any. Starts from the data's own `nextAssessment`,
 * then applies the safety rule the data file flags: if any suicidal-ideation item
 * (see SUICIDE_ITEM_IDS — 9Q item 9, PHQ-A item 9) is answered above zero, always
 * continue to 8Q, even below the numeric threshold the score-only function sees.
 */
function routeNext(a: Assessment, score: number, answers: Record<string, number>): string | null {
  let next = a.nextAssessment?.(score) ?? null;
  // Safety: any endorsed suicidal-ideation item forces the 8Q risk assessment,
  // even below the numeric threshold (the score-only nextAssessment can't see it).
  for (const q of a.questions) {
    if (SUICIDE_ITEM_IDS.has(q.id) && (q.options[answers[q.id]]?.score ?? 0) > 0) {
      next = "8Q";
      break;
    }
  }
  // คำถามท้ายแบบ: ตอบรับข้อใดข้อหนึ่งก็ส่งต่อ 8Q เสมอ ไม่ว่าคะแนนรวมจะต่ำแค่ไหน
  // — นี่คือเหตุผลที่คำถามพวกนี้มีอยู่ ประวัติการพยายามฆ่าตัวตายไม่ปรากฏในคะแนน
  for (const q of a.supplemental ?? []) {
    if ((q.options[answers[q.id]]?.score ?? 0) > 0) {
      next = "8Q";
      break;
    }
  }
  return next;
}

/* ------------------------------------------------------------------- component */

/** ผลของแบบประเมินหนึ่งชุด */
export type AssessOutcome = {
  assessmentId: string;
  score: number;
  action: Interpretation["action"];
};

export type MentalHealthAssessmentProps = {
  /**
   * Fired when the whole flow reaches a result (useful for logging / follow-up).
   *
   * ส่งทั้ง "ผลหนักสุด" และ "ทุกแบบที่ทำจบตลอดเส้นทาง" เพราะสองอย่างนี้ใช้คนละที่:
   * สถิติโรงเรียนต้องการจุดเดียวต่อการทำหนึ่งรอบ (ติดป้ายด้วยระดับหนักสุด ไม่งั้น
   * 9Q รุนแรงที่ตามด้วย 8Q สะอาดจะถูกฟอกให้ดูปลอดภัย) ส่วนพัฒนาการใจของนักเรียน
   * ต้องเก็บครบทุกแบบ ไม่งั้นทำ PHQ-A แล้วต่อ 8Q กราฟจะขึ้นแค่ 8Q แบบเดียว
   */
  onComplete?: (result: AssessOutcome & { steps: AssessOutcome[] }) => void;
  className?: string;
};

type View = "intro" | "quiz" | "bridge" | "result";

/** หนึ่งแบบประเมินที่ทำจบระหว่างเส้นทาง (2Q → 9Q → 8Q ฯลฯ) */
type JourneyStep = { assessment: Assessment; score: number; interp: Interpretation };

/** ลำดับความหนักของผล — ใช้เลือก "ผลหนักสุดตลอดเส้นทาง" มาแสดงและบันทึก */
const ACTION_RANK: Record<Interpretation["action"], number> = {
  safe: 0,
  monitor: 1,
  warning: 2,
  emergency: 3,
};

export function MentalHealthAssessment({ onComplete, className }: MentalHealthAssessmentProps) {
  const [view, setView] = useState<View>("intro");
  /** แบบถัดไปที่รออยู่หลังจอคั่น (null = ไม่มีอะไรค้าง) */
  const [pendingId, setPendingId] = useState<string | null>(null);
  /** บังคับให้หน้าผลแสดงชุดดูแล+สายด่วน แม้คะแนนจะอยู่ในเกณฑ์ต่ำ */
  const [forceCare, setForceCare] = useState(false);
  const [currentId, setCurrentId] = useState("2Q");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [direction, setDirection] = useState(1);
  const [result, setResult] = useState<{ assessment: Assessment; score: number; interp: Interpretation } | null>(null);
  // ทุกแบบที่ทำจบในเส้นทางนี้ — ผลสุดท้ายต้องสะท้อน "ระดับหนักสุด" ไม่ใช่แบบสุดท้าย:
  // เด็ก 9Q = 27 (ซึมเศร้ารุนแรง) ที่ตอบ 8Q เป็นศูนย์ ต้องไม่จบที่หน้าจอเขียว "โอเคดี"
  const journeyRef = useRef<JourneyStep[]>([]);

  const assessment = mentalHealthAssessments[currentId];
  // รวมคำถามท้ายแบบเข้าลำดับที่เดินจริง — แต่การให้คะแนนยังนับเฉพาะข้อหลัก
  const flow = assessment ? allQuestions(assessment) : [];
  const question = flow[questionIndex];
  const questionCount = flow.length || 1;
  const progress = ((questionIndex + 1) / questionCount) * 100;
  /** อยู่ในช่วงคำถามท้ายแบบหรือยัง — ใช้เปลี่ยนคำอธิบายด้านบนให้ตรงบริบท */
  const inSupplemental = !!assessment && questionIndex >= assessment.questions.length;

  /* ---- flow ---------------------------------------------------------------- */

  function start(id: string) {
    setAnswers({});
    setResult(null);
    setPendingId(null);
    setForceCare(false);
    journeyRef.current = [];
    setCurrentId(id);
    setQuestionIndex(0);
    setDirection(1);
    setView("quiz");
  }

  function choose(optionIndex: number) {
    if (!assessment || !question) return;
    const next = { ...answers, [question.id]: optionIndex };
    setAnswers(next);

    if (questionIndex < flow.length - 1) {
      setDirection(1);
      // Use the closure's index (not a functional `i => i + 1`) so the guard above
      // and the increment can never desync — a stale click on an exiting question
      // then re-sets the same index instead of overshooting past the last one.
      setQuestionIndex(questionIndex + 1);
      return;
    }

    // Last question of this test → score it and decide what happens next.
    const score = totalScore(assessment, next);
    // จดผลของแบบนี้ลงเส้นทางก่อนตัดสินใจ route ต่อ (แทนที่ตาม id กันคลิกซ้ำเบิ้ลรายการ)
    journeyRef.current = [
      ...journeyRef.current.filter((j) => j.assessment.id !== assessment.id),
      { assessment, score, interp: interpret(assessment, score) },
    ];
    const nextId = routeNext(assessment, score, next);

    if (nextId && mentalHealthAssessments[nextId]) {
      // ก่อนเข้า 8Q ต้องมีจอคั่นเสมอ — เด็กเพิ่งยอมรับเรื่องหนักที่สุดในชีวิต
      // การโยนคำถามชุดใหม่ใส่เงียบ ๆ อ่านได้ว่า "ตอบผิดหรือเปล่า" หรือ
      // "ระบบไม่สนใจสิ่งที่เพิ่งบอก" ซึ่งทั้งคู่คือเหตุผลที่เด็กจะเลิกทำกลางคัน
      // (แบบอื่นที่ไม่ใช่ 8Q ไหลต่อได้เลย เพราะไม่ได้แตะเรื่องการทำร้ายตัวเอง)
      setDirection(1);
      setPendingId(nextId);
      if (nextId === "8Q") {
        setView("bridge");
        return;
      }
      setCurrentId(nextId);
      setQuestionIndex(0);
      return;
    }

    // จบเส้นทาง — แสดงและบันทึก "ผลหนักสุด" ที่พบตลอดทาง ไม่ใช่แค่แบบสุดท้าย
    // (>= ให้แบบหลังชนะเมื่อเสมอกัน: เครื่องมือที่เจาะจงกว่ามาทีหลังเสมอ)
    const worst = journeyRef.current.reduce((w, j) =>
      ACTION_RANK[j.interp.action] >= ACTION_RANK[w.interp.action] ? j : w,
    );
    setResult({ assessment: worst.assessment, score: worst.score, interp: worst.interp });
    setView("result");
    reportComplete(worst);
  }

  /** ส่งผลออกไปข้างนอก: ผลหนักสุด + ทุกแบบที่ทำจบ (ดูเหตุผลที่ onComplete) */
  function reportComplete(worst: JourneyStep) {
    onComplete?.({
      assessmentId: worst.assessment.id,
      score: worst.score,
      action: worst.interp.action,
      steps: journeyRef.current.map((j) => ({
        assessmentId: j.assessment.id,
        score: j.score,
        action: j.interp.action,
      })),
    });
  }

  /** จอคั่น → ทำต่อ: เข้าแบบที่รออยู่ */
  function continueFromBridge() {
    if (!pendingId) return;
    setCurrentId(pendingId);
    setPendingId(null);
    setQuestionIndex(0);
    setDirection(1);
    setView("quiz");
  }

  /**
   * จอคั่น → ขอพักก่อน
   *
   * "ไม่ทำต่อ" ต้องไม่แปลว่า "ถูกทิ้งกลางอากาศ" — เด็กที่เพิ่งยอมรับเรื่องการทำร้าย
   * ตัวเองแล้วขอหยุด คือคนที่ต้องเห็นสายด่วนมากที่สุด ไม่ใช่คนที่ควรเจอหน้าจอเขียว
   * ว่า "ใจคุณดูโอเคดี" เพราะคะแนน 2 สัปดาห์ล่าสุดยังต่ำ
   *
   * แยก "สิ่งที่บันทึก" ออกจาก "สิ่งที่แสดง": สถิติยังบันทึกผลจริงตามที่ทำได้
   * (ไม่ปั้นตัวเลขให้เกินจริง) แต่หน้าจอบังคับให้แสดงชุดดูแลเสมอ
   */
  function pauseAtBridge() {
    const worst = journeyRef.current.reduce((w, j) =>
      ACTION_RANK[j.interp.action] >= ACTION_RANK[w.interp.action] ? j : w,
    );
    setResult({ assessment: worst.assessment, score: worst.score, interp: worst.interp });
    setForceCare(true);
    setPendingId(null);
    setView("result");
    reportComplete(worst);
  }

  const canGoBack = questionIndex > 0 || ENTRY_POINTS.some((e) => e.id === currentId);
  function goBack() {
    if (questionIndex > 0) {
      setDirection(-1);
      setQuestionIndex((i) => i - 1);
    } else if (ENTRY_POINTS.some((e) => e.id === currentId)) {
      setView("intro");
    }
  }

  function restart() {
    setView("intro");
    setCurrentId("2Q");
    setQuestionIndex(0);
    setAnswers({});
    setResult(null);
    setPendingId(null);
    setForceCare(false);
    journeyRef.current = [];
  }

  /* ---- shell --------------------------------------------------------------- */

  return (
    <div
      className={[
        "mx-auto w-full max-w-md rounded-[2rem] bg-gradient-to-b from-emerald-50/50 via-white to-violet-50/50 p-6 shadow-sm ring-1 ring-slate-100",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {view === "intro" && <Intro onPick={start} />}

      {view === "quiz" && assessment && question && (
        <div className="flex flex-col gap-5">
          {/* Progress bar — soft mint */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-400">
              <span className="max-w-[70%] truncate">{assessment.title}</span>
              <span className="tabular-nums">
                ข้อ {questionIndex + 1}/{questionCount}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className="h-full rounded-full bg-emerald-400"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* One question at a time, sliding in/out */}
          <div className="relative min-h-[19rem]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`${currentId}-${questionIndex}`}
                custom={direction}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="flex flex-col gap-4"
              >
                {questionIndex === 0 && (
                  <p className="rounded-2xl bg-slate-50 px-4 py-3 text-center text-xs leading-relaxed text-slate-500">
                    {assessment.description}
                  </p>
                )}

                {/* คำถามท้ายแบบถามคนละช่วงเวลากับ 9 ข้อแรก (1 เดือน / ตลอดชีวิต)
                    ถ้าไม่บอก เด็กจะเผลอตอบด้วยกรอบ "2 สัปดาห์ที่ผ่านมา" ของข้อก่อนหน้า */}
                {inSupplemental && questionIndex === assessment.questions.length && (
                  <p className="rounded-2xl bg-slate-50 px-4 py-3 text-center text-xs leading-relaxed text-slate-500">
                    อีก 2 คำถามสุดท้าย — ข้อนี้ถามถึงช่วงเวลาที่ยาวกว่าเดิม ตอบตามความจริงได้เลยนะ
                  </p>
                )}

                <h2 className="text-center text-lg font-semibold leading-relaxed text-slate-800">
                  {question.text}
                </h2>

                <div className="flex flex-col gap-2.5">
                  {question.options.map((opt, i) => {
                    const selected = answers[question.id] === i;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => choose(i)}
                        className={`flex w-full items-center gap-3 rounded-2xl border px-5 py-4 text-left text-base font-medium transition active:scale-[0.98] ${
                          selected
                            ? "border-emerald-400 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200"
                            : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/40"
                        }`}
                      >
                        <span
                          className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${
                            selected ? "border-emerald-400 bg-emerald-400 text-white" : "border-slate-300"
                          }`}
                        >
                          {selected && <Check className="size-4" strokeWidth={3} />}
                        </span>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {canGoBack && (
            <button
              type="button"
              onClick={goBack}
              className="mx-auto flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-slate-600"
            >
              <ArrowLeft className="size-4" />
              ย้อนกลับ
            </button>
          )}
        </div>
      )}

      {view === "bridge" && (
        <RiskBridge onContinue={continueFromBridge} onPause={pauseAtBridge} />
      )}

      {view === "result" && result && (
        <Result
          assessment={result.assessment}
          interp={result.interp}
          score={result.score}
          forceCare={forceCare}
          journey={journeyRef.current}
          onRestart={restart}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------- sub-views */

function Intro({ onPick }: { onPick: (id: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-5 text-center"
    >
      <div className="text-4xl" aria-hidden="true">
        🌿
      </div>
      <div>
        <h1 className="text-xl font-bold text-slate-800">เช็คใจกันสักหน่อยไหม</h1>
        <p className="mt-1 text-sm text-slate-500">เลือกเรื่องที่อยากสำรวจ ใช้เวลาไม่กี่นาที</p>
      </div>

      <div className="flex w-full flex-col gap-3">
        {ENTRY_POINTS.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => onPick(e.id)}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md active:translate-y-0"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-emerald-50 text-2xl" aria-hidden="true">
              {e.emoji}
            </span>
            <span>
              <span className="block font-semibold text-slate-800">{e.label}</span>
              <span className="block text-xs text-slate-400">{e.desc}</span>
            </span>
          </button>
        ))}
      </div>

      <p className="text-xs leading-relaxed text-slate-400">
        เป็นพื้นที่ปลอดภัย ข้อมูลนี้เป็นความลับ 🤍 และเป็นเพียงการคัดกรองเบื้องต้น ไม่ใช่การวินิจฉัยทางการแพทย์
      </p>
    </motion.div>
  );
}

/** สีประจำระดับผล — ใช้ทั้งในรายการสรุปและที่อื่น ๆ ที่ต้องบอก "ระดับ" ด้วยสี */
const ACTION_TINT: Record<Interpretation["action"], string> = {
  safe: "bg-emerald-100 text-emerald-700",
  monitor: "bg-violet-100 text-violet-700",
  warning: "bg-amber-100 text-amber-700",
  emergency: "bg-rose-100 text-rose-700",
};

/**
 * ผลรายแบบตลอดเส้นทาง
 *
 * เส้นทางหนึ่งรอบทำได้หลายแบบ (เช่น PHQ-A → 8Q) แต่หน้าผลเดิมโชว์แค่ "แบบที่หนักสุด"
 * แบบเดียว เด็กที่ PHQ-A ปกติแต่ 8Q เสี่ยง จึงไม่เคยเห็นว่า PHQ-A ของตัวเองออกมาปกติ
 * — แต่ละเครื่องมือมีเกณฑ์ของตัวเอง ต้องอ่านผลแยกกัน ไม่ใช่ยุบเป็นค่าเดียว
 */
function JourneyBreakdown({ journey }: { journey: JourneyStep[] }) {
  if (journey.length < 2) return null;
  return (
    <div className="w-full rounded-2xl bg-white/70 p-3 text-left ring-1 ring-slate-200/80">
      <p className="mb-2 text-[0.72rem] font-semibold text-slate-400">ผลของแต่ละแบบประเมิน</p>
      <ul className="flex flex-col gap-1.5">
        {journey.map((j) => (
          <li key={j.assessment.id} className="flex items-center gap-2 text-[0.78rem]">
            <span className="font-semibold text-slate-600">{j.assessment.id}</span>
            <span className="min-w-0 flex-1 truncate text-slate-400">
              {j.assessment.title.replace(/\s*\(.*\)/, "")}
            </span>
            <span className="shrink-0 tabular-nums text-slate-400">{j.score}</span>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[0.68rem] font-semibold ${ACTION_TINT[j.interp.action]}`}
            >
              {j.interp.level}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * จอคั่นก่อนเข้าแบบประเมินความเสี่ยง (8Q)
 *
 * เด็กเพิ่งยอมรับเรื่องที่หนักที่สุดในชีวิต การโยนคำถามชุดใหม่ใส่เงียบ ๆ อ่านได้ว่า
 * "ตอบผิดหรือเปล่า" หรือ "ระบบไม่สนใจสิ่งที่เพิ่งบอก" — จอนี้ทำสามอย่าง:
 * รับรู้สิ่งที่เด็กเพิ่งบอก · บอกตรง ๆ ว่าทำไมต้องถามต่อ · ให้สายด่วนไว้ตรงนี้เลย
 *
 * ปุ่ม "ขอพักก่อน" สำคัญพอกับปุ่ม "ทำต่อ": ต้องมีทางออกที่ไม่ใช่การกดปิดแอปหนีไป
 */
function RiskBridge({
  onContinue,
  onPause,
}: {
  onContinue: () => void;
  onPause: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-b from-mint-50 to-white p-6 text-center ring-1 ring-mint-200"
    >
      <div className="grid size-14 place-items-center rounded-full bg-mint-100" aria-hidden="true">
        <HeartHandshake className="size-7 text-mint-700" />
      </div>

      <h2 className="text-xl font-bold text-slate-800">ขอบคุณที่กล้าบอกเรานะ 💚</h2>

      <p className="text-sm leading-relaxed text-slate-600">
        เรื่องที่เธอเพิ่งเล่ามาสำคัญมาก — ขออีก <span className="font-semibold text-slate-800">8 คำถามสั้น ๆ</span>{" "}
        เพื่อให้เข้าใจว่าตอนนี้เธอต้องการความช่วยเหลือแบบไหน
      </p>

      <a
        href="tel:1323"
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-100 active:scale-95"
      >
        <Phone className="size-4" aria-hidden="true" />
        ถ้าตอนนี้รู้สึกไม่ไหว โทร 1323 ได้เลยตลอด 24 ชม.
      </a>

      <div className="mt-1 flex w-full flex-col gap-2.5">
        <button
          type="button"
          onClick={onContinue}
          className="w-full rounded-full bg-mint-700 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-mint-600 active:scale-95"
        >
          ทำต่อ
        </button>
        <button
          type="button"
          onClick={onPause}
          className="w-full rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-500 ring-1 ring-slate-200 transition hover:text-slate-700 active:scale-95"
        >
          ขอพักก่อน
        </button>
      </div>
    </motion.div>
  );
}

function Result({
  assessment,
  interp,
  score,
  journey,
  forceCare = false,
  onRestart,
}: {
  assessment: Assessment;
  interp: Interpretation;
  score: number;
  journey: JourneyStep[];
  /** เด็กขอพักกลางทางหลังยอมรับเรื่องการทำร้ายตัวเอง — ต้องเห็นสายด่วนเสมอ */
  forceCare?: boolean;
  onRestart: () => void;
}) {
  if (interp.action === "emergency" || forceCare) {
    return (
      <SafetyAlert assessment={assessment} interp={interp} score={score} journey={journey} onRestart={onRestart} />
    );
  }

  // ความคิดทำร้ายตัวเองแม้แต่ระดับต่ำ (8Q ≥ 1) ต้องเห็นสายด่วนและช่องส่งต่อเสมอ
  // ถึงแม้ผลรวมจะอยู่แค่ระดับเฝ้าระวังก็ตาม
  const hasIdeation = journey.some((j) => j.assessment.id === "8Q" && j.score >= 1);
  const showCare = interp.action === "warning" || hasIdeation;

  const styles = {
    safe: {
      ring: "ring-emerald-200",
      bg: "from-emerald-50 to-white",
      chip: "bg-emerald-100 text-emerald-700",
      emoji: "🌿",
      head: "ใจคุณกำลังดูโอเคดีนะ",
      body: "ตอนนี้ยังไม่พบสัญญาณที่น่ากังวล ดูแลใจตัวเองแบบนี้ต่อไปนะ แล้วกลับมาเช็คได้เสมอ 💚",
    },
    monitor: {
      ring: "ring-violet-200",
      bg: "from-violet-50 to-white",
      chip: "bg-violet-100 text-violet-700",
      emoji: "💜",
      head: "ขอบคุณที่ใส่ใจความรู้สึกตัวเองนะ",
      body: "ช่วงนี้อาจมีบางอย่างกวนใจอยู่บ้าง ลองพักผ่อน หายใจช้า ๆ หรือคุยกับคนที่ไว้ใจดูนะ ค่อย ๆ ดูแลใจไปด้วยกัน",
    },
    warning: {
      ring: "ring-amber-200",
      bg: "from-amber-50 to-white",
      chip: "bg-amber-100 text-amber-700",
      emoji: "🧡",
      head: "อยากชวนให้ดูแลใจตัวเองสักหน่อยนะ",
      body: "ช่วงนี้ใจคุณอาจเหนื่อยอยู่ไม่น้อย การได้คุยกับครูแนะแนวหรือผู้เชี่ยวชาญจะช่วยได้มากเลย คุณไม่จำเป็นต้องรับมือคนเดียวนะ",
    },
  }[interp.action];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-b ${styles.bg} p-6 text-center ring-1 ${styles.ring}`}
    >
      <div className="text-5xl" aria-hidden="true">
        {styles.emoji}
      </div>
      <h2 className="text-xl font-bold text-slate-800">{styles.head}</h2>
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles.chip}`}>
        {assessment.title.replace(/\s*\(.*\)/, "")}: {interp.level}
      </span>
      <p className="text-sm leading-relaxed text-slate-600">{styles.body}</p>

      <JourneyBreakdown journey={journey} />

      {showCare && (
        <p className="text-xs text-slate-400">
          ถ้าอยากคุยกับใครสักคนตอนนี้ โทร 1323 ได้ตลอด 24 ชม.
        </p>
      )}

      {/* จุดยินยอมส่งต่อ — ระดับ "ควรดูแล" หรือมีสัญญาณจาก 8Q: เด็กเลือกเองว่าจะให้ครูเห็น */}
      {showCare && (
        <ConsentShare assessment={assessment} interp={interp} score={score} journey={journey} />
      )}

      <button
        type="button"
        onClick={onRestart}
        className="mt-1 flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:text-slate-800 active:scale-95"
      >
        <RotateCcw className="size-4" />
        ทำแบบประเมินใหม่
      </button>
    </motion.div>
  );
}

function SafetyAlert({
  assessment,
  interp,
  score,
  journey,
  onRestart,
}: {
  assessment: Assessment;
  interp: Interpretation;
  score: number;
  journey: JourneyStep[];
  onRestart: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-b from-rose-50 to-orange-50 p-6 text-center ring-1 ring-rose-200"
    >
      <div className="grid size-16 place-items-center rounded-full bg-rose-100" aria-hidden="true">
        <HeartHandshake className="size-8 text-rose-500" />
      </div>
      <h2 className="text-xl font-bold text-rose-700">เราอยู่ตรงนี้กับคุณนะ</h2>
      <p className="text-sm leading-relaxed text-slate-700">
        เราสัมผัสได้ว่าตอนนี้คุณกำลังแบกรับเรื่องหนักหนามาก และเราเป็นห่วงคุณมาก ๆ นะ 💙 การขอความช่วยเหลือคือความกล้าหาญ —
        มีผู้เชี่ยวชาญที่พร้อมรับฟังและอยู่ข้างคุณได้ทันที ลองโทรหาพวกเขาตอนนี้เลยนะ
      </p>

      <div className="flex w-full flex-col gap-2.5">
        {HOTLINES.map((h) => (
          <a
            key={h.tel}
            href={`tel:${h.tel}`}
            className="flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-600 active:scale-95"
          >
            <Phone className="size-5" />
            {h.label} {h.number}
          </a>
        ))}
      </div>

      <p className="text-xs leading-relaxed text-rose-400">
        คุณไม่ได้อยู่คนเดียว มีคนที่พร้อมจะรับฟังและช่วยคุณเสมอ 🤍
      </p>

      {/* สายด่วนมาก่อนเสมอ — แต่ถ้าอยากให้ครูในโรงเรียนรู้และติดต่อกลับด้วย
          เด็กกดยินยอมเองได้จากตรงนี้ (เส้นทางเดียวที่ผลรายคนไปถึงครู) */}
      <ConsentShare assessment={assessment} interp={interp} score={score} journey={journey} />

      <button
        type="button"
        onClick={onRestart}
        className="text-xs font-medium text-slate-400 underline-offset-2 transition hover:text-slate-600 hover:underline"
      >
        กลับหน้าแรก
      </button>
    </motion.div>
  );
}

/* ---------------------------------------------------------------- consent share */

/**
 * จุดยินยอมส่งต่อ — สะพานเดียวระหว่าง "ผลประเมินที่เป็นความลับ" กับ "ครูที่ช่วยได้จริง"
 *
 * หลักการ: สถิติประเมินของโรงเรียนเป็นนิรนามทั้งหมด ครูไม่มีทางรู้ผลรายคน
 * เว้นแต่เด็กกดยินยอมเองจากตรงนี้ → ระบบเปิดเคสเข้าแดชบอร์ดครูพร้อมกรอบเวลา
 * ตอบสนอง (SLA) เหมือนการแจ้งเหตุปกติ เด็กที่ไม่กล้าพูดต่อหน้า จึงมีช่องที่กล้ากด
 * ในความเงียบ — และไม่มีเหรียญรางวัลจากการกดนี้ (เราไม่ให้รางวัลกับความทุกข์)
 */
export function ConsentShare({
  assessment,
  interp,
  score,
  journey = [],
}: {
  assessment: Assessment;
  interp: Interpretation;
  score: number;
  journey?: JourneyStep[];
}) {
  const openCase = useCasesStore((s) => s.openCase);
  const profile = useUserStore((s) => s.profile);
  const [step, setStep] = useState<"idle" | "form" | "done">("idle");
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [phone, setPhone] = useState("");
  const [ticket, setTicket] = useState("");
  const [copied, setCopied] = useState(false);

  const urgent = interp.action === "emergency";
  const slaHours = SLA_HOURS[urgent ? "urgent" : "prepare"];

  function submit() {
    if (!name.trim() || !room.trim()) return;
    // เส้นทางประเมินทั้งหมดช่วยครูเห็นภาพ เช่น 9Q รุนแรงแม้ 8Q จะเป็นศูนย์
    const flow =
      journey.length > 1
        ? ` · เส้นทางประเมิน: ${journey.map((j) => `${j.assessment.id} ${j.score} คะแนน (${j.interp.level})`).join(" → ")}`
        : "";
    const t = openCase({
      categoryId: "self-assessment",
      categoryLabel: "ขอรับการดูแล (ผลประเมินใจ)",
      expectation: urgent ? "urgent" : "prepare",
      sensitive: urgent,
      contact: { name: name.trim(), room: room.trim(), phone: phone.trim() },
      incident: `นักเรียนยินยอมส่งผลแบบประเมินให้ครู: ${assessment.title} — ระดับ "${interp.level}" (คะแนน ${score})${flow} และขอให้ติดต่อกลับ`,
      victim: "ตัวนักเรียนเอง (ขอรับการดูแล)",
      perpetrator: "-",
      location: null,
    });
    setTicket(t);
    setStep("done");
  }

  function copyTicket() {
    navigator.clipboard
      ?.writeText(ticket)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => {});
  }

  if (step === "done") {
    return (
      <div className="w-full rounded-2xl bg-mint-50 p-4 text-left ring-1 ring-mint-200">
        <p className="flex items-center gap-2 text-sm font-semibold text-mint-800">
          <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
          ส่งถึงครูแนะแนวแล้ว
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-lg bg-white px-2.5 py-1 font-mono text-sm font-bold text-slate-800 ring-1 ring-mint-200">
            {ticket}
          </span>
          <button
            type="button"
            onClick={copyTicket}
            className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[0.7rem] font-medium text-mint-700 ring-1 ring-mint-300 transition hover:bg-mint-50 active:scale-95"
          >
            <Copy className="size-3" aria-hidden="true" />
            {copied ? "คัดลอกแล้ว ✓" : "คัดลอกรหัส"}
          </button>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          จดหรือคัดลอกรหัสนี้ไว้ติดตามเรื่องนะ — เรื่องของคุณเข้าคิว{urgent ? "ด่วน" : ""}ของครูแล้ว
          (เป้าหมายรับเรื่องภายใน {slaHours} ชั่วโมง) ระหว่างนี้ไม่ต้องรอครูฝ่ายเดียว
          ถ้ารู้สึกแย่ลง โทร 1323 ได้ทันทีตลอด 24 ชม.
        </p>
      </div>
    );
  }

  if (step === "form") {
    const input =
      "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-300 focus:border-mint-400 focus:outline-none focus:ring-4 focus:ring-mint-100";
    return (
      <div className="w-full rounded-2xl bg-white p-4 text-left ring-1 ring-slate-200">
        <p className="text-sm font-semibold text-slate-700">ให้ครูติดต่อกลับหาใคร?</p>
        <p className="mt-0.5 text-[0.72rem] leading-relaxed text-slate-400">
          ข้อมูลนี้จะถูกส่งให้ครูแนะแนวพร้อมผลประเมิน — การเปิดดูข้อมูลติดต่อของคุณโดยครูจะถูกบันทึกไว้ให้ตรวจสอบได้
        </p>
        <div className="mt-3 flex flex-col gap-2.5">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อ-ชื่อเล่น *" className={input} />
          <input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="ชั้น/ห้อง เช่น ม.4/2 *" className={input} />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="เบอร์ติดต่อ (ไม่บังคับ)" className={input} inputMode="tel" />
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setStep("idle")}
            className="rounded-full px-4 py-2.5 text-xs font-medium text-slate-400 transition hover:text-slate-600"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!name.trim() || !room.trim()}
            className="flex-1 rounded-full bg-mint-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-mint-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ยินยอมและส่งให้ครูแนะแนว
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-slate-50 p-4 text-left ring-1 ring-slate-200">
      <p className="flex items-start gap-2 text-[0.78rem] leading-relaxed text-slate-500">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-mint-500" aria-hidden="true" />
        <span>
          ผลนี้<span className="font-semibold text-slate-700">เป็นความลับ</span> — ครูจะเห็นก็ต่อเมื่อคุณยินยอมเท่านั้น
          ถ้าอยากให้ครูแนะแนวรู้และติดต่อกลับ กดปุ่มด้านล่างได้เลย
        </span>
      </p>
      <button
        type="button"
        onClick={() => {
          setName(profile?.username ?? "");
          setStep("form");
        }}
        className="mt-3 w-full rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-mint-700 ring-1 ring-mint-300 transition hover:bg-mint-50 active:scale-95"
      >
        ยินยอมส่งผลให้ครูแนะแนวติดต่อฉัน
      </button>
    </div>
  );
}

export default MentalHealthAssessment;
