"use client";

import { useState } from "react";
import { ArrowRight, Lock, RotateCcw } from "lucide-react";

/**
 * พาตรวจสอบความคิดหนึ่งความคิด ตามแนว CBT — ทีละคำถาม
 *
 * ที่ถามทีละข้อแทนการวางฟอร์มสี่ช่องพร้อมกัน เพราะฟอร์มยาว ๆ ทำให้คนที่กำลังคิดวน
 * ปิดหน้าไปตั้งแต่ยังไม่เริ่ม และเพราะคำถามข้อสองจะได้ผลก็ต่อเมื่อเขาเขียนข้อแรกไปแล้ว
 *
 * ทุกอย่างอยู่ในหน่วยความจำของหน้านี้เท่านั้น ไม่ถูกบันทึกและไม่ถูกส่งไปไหน —
 * ประโยคที่คนเขียนตอนเกลียดตัวเองที่สุด ไม่ควรถูกเก็บไว้ที่ไหนทั้งนั้น
 */

const QUESTIONS = [
  {
    key: "thought",
    label: "ความคิดที่วนอยู่ในหัวตอนนี้คืออะไร",
    hint: "เขียนแบบที่มันดังจริง ๆ ไม่ต้องทำให้สุภาพขึ้น",
    placeholder: "เช่น ไม่มีใครชอบเราเลย",
  },
  {
    key: "against",
    label: "มีอะไรที่ค้านความคิดนี้บ้าง แม้แต่นิดเดียว",
    hint: "ไม่ต้องหาให้ครบ ข้อเดียวก็นับ",
    placeholder: "เช่น เมื่อวานมีคนชวนกินข้าว",
  },
  {
    key: "friend",
    label: "ถ้าเพื่อนสนิทเจอเรื่องนี้ เราจะพูดกับเขาว่าอะไร",
    hint: "เขียนประโยคที่จะพูดกับเขาจริง ๆ",
    placeholder: "เช่น มันไม่ใช่ความผิดเธอนะ",
  },
  {
    key: "rewrite",
    label: "ลองเขียนความคิดเดิมใหม่ ให้ยังจริงอยู่แต่ไม่ทำร้ายเรา",
    hint: "ไม่ต้องบวกจนไม่จริง แค่ให้ตรงกับความจริงมากขึ้น",
    placeholder: "เช่น วันนี้เรารู้สึกโดดเดี่ยว และยังมีบางคนที่คุยกับเราอยู่",
  },
];

export function ReframeWalk() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(() => QUESTIONS.map(() => ""));

  const done = step >= QUESTIONS.length;
  const q = QUESTIONS[Math.min(step, QUESTIONS.length - 1)];
  const value = answers[Math.min(step, QUESTIONS.length - 1)];

  const setValue = (v: string) =>
    setAnswers((a) => a.map((old, i) => (i === step ? v : old)));

  const reset = () => {
    setStep(0);
    setAnswers(QUESTIONS.map(() => ""));
  };

  if (done) {
    return (
      <div className="rounded-2xl bg-amber-50/70 p-4 ring-1 ring-amber-200/70">
        <p className="text-[0.78rem] font-semibold text-amber-800">
          จากความคิดเดิม
        </p>
        <p className="mt-1 rounded-xl bg-white/70 p-3 text-[0.86rem] leading-relaxed text-ink-soft line-through decoration-amber-400/70">
          {answers[0] || "—"}
        </p>

        <div className="my-2 flex justify-center">
          <ArrowRight className="size-4 rotate-90 text-amber-500" aria-hidden="true" />
        </div>

        <p className="text-[0.78rem] font-semibold text-amber-800">มาเป็น</p>
        <p className="mt-1 rounded-xl bg-white p-3 text-[0.92rem] font-medium leading-relaxed text-ink ring-1 ring-amber-200">
          {answers[3] || "—"}
        </p>

        <p className="mt-3 flex items-start gap-1.5 text-[0.72rem] leading-relaxed text-ink-mute">
          <Lock className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
          สิ่งที่เขียนตรงนี้ไม่ได้ถูกบันทึกไว้ที่ไหนเลย ปิดหน้านี้แล้วหายไปทั้งหมด
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-600 px-5 text-[0.86rem] font-semibold text-white transition-colors hover:bg-amber-500"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          ลองความคิดอื่น
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-amber-50/70 p-4 ring-1 ring-amber-200/70">
      <div className="flex items-center gap-2">
        {QUESTIONS.map((item, i) => (
          <span
            key={item.key}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < step ? "bg-amber-500" : i === step ? "bg-amber-300" : "bg-amber-200/60"
            }`}
            aria-hidden="true"
          />
        ))}
      </div>

      <label htmlFor={`reframe-${q.key}`} className="mt-3 block">
        <span className="block text-[0.92rem] font-bold text-ink">{q.label}</span>
        <span className="mt-0.5 block text-[0.76rem] text-ink-soft">{q.hint}</span>
      </label>
      <textarea
        id={`reframe-${q.key}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        placeholder={q.placeholder}
        className="mt-2 w-full resize-none rounded-xl border border-amber-200 bg-white p-3 text-[0.88rem] leading-relaxed text-ink placeholder:text-ink-mute focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-100"
      />

      <div className="mt-2 flex items-center gap-2">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="min-h-11 rounded-full px-3 text-[0.82rem] text-ink-soft transition-colors hover:text-ink"
          >
            ย้อนกลับ
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setStep((s) => s + 1)}
          disabled={!value.trim()}
          className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-600 px-5 text-[0.86rem] font-semibold text-white transition-colors hover:bg-amber-500 disabled:opacity-40"
        >
          {step === QUESTIONS.length - 1 ? "ดูผล" : "ต่อไป"}
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
