"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

/**
 * พาหายใจแบบ Physiological Sigh — สูดเข้า 2 ครั้งติดกัน แล้วผ่อนออกยาว
 *
 * ทำไมไม่ใช้ห้องฝึกหายใจที่มีอยู่แล้ว (components/BoxBreathing.tsx)
 * ห้องนั้นเป็นคอร์สแบบจับเวลาเป็นนาทีและมีเหรียญตอนจบ ซึ่งเหมาะกับการฝึกประจำวัน
 * แต่เทคนิคนี้เป็นของใช้ตอนฉุกเฉิน วัดกันเป็น "จำนวนรอบ" ไม่ใช่นาที และคนที่เพิ่ง
 * ใจสั่นไม่ควรต้องเลือกความยาวคอร์สก่อนถึงจะได้เริ่มหายใจ
 *
 * และการ์ดนี้ตั้งใจไม่ให้เหรียญ เพราะของที่ใช้ตอนแย่ที่สุดไม่ควรกลายเป็นของที่ทำเพื่อเก็บแต้ม
 */

type Step = { label: string; hint: string; seconds: number; scale: number };

const CYCLE: Step[] = [
  { label: "สูดเข้าทางจมูก", hint: "ยาว ๆ จนอกขยาย", seconds: 4, scale: 0.86 },
  { label: "สูดเข้าอีกนิด", hint: "สั้น ๆ ทับของเดิม ยังไม่ปล่อย", seconds: 2, scale: 1 },
  { label: "ผ่อนออกทางปาก", hint: "ช้า ๆ ยาว ๆ จนหมด", seconds: 7, scale: 0.62 },
];

const ROUNDS = 5;
const CYCLE_SECONDS = CYCLE.reduce((s, p) => s + p.seconds, 0);

export function SighPlayer() {
  const [running, setRunning] = useState(false);
  const [round, setRound] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [left, setLeft] = useState(CYCLE[0].seconds);
  const [done, setDone] = useState(false);

  // ตัวจับเวลาอ่านค่าล่าสุดผ่าน ref เพื่อไม่ต้องตั้ง interval ใหม่ทุกวินาที
  const stepRef = useRef(stepIndex);
  const roundRef = useRef(round);
  useEffect(() => void (stepRef.current = stepIndex), [stepIndex]);
  useEffect(() => void (roundRef.current = round), [round]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setLeft((r) => {
        if (r > 1) return r - 1;
        const next = (stepRef.current + 1) % CYCLE.length;
        if (next === 0) {
          const nextRound = roundRef.current + 1;
          if (nextRound >= ROUNDS) {
            setRunning(false);
            setDone(true);
            return 0;
          }
          setRound(nextRound);
        }
        setStepIndex(next);
        return CYCLE[next].seconds;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const step = CYCLE[stepIndex];
  const reset = () => {
    setRunning(false);
    setDone(false);
    setRound(0);
    setStepIndex(0);
    setLeft(CYCLE[0].seconds);
  };

  return (
    <div className="rounded-2xl bg-mint-50/70 p-4 ring-1 ring-mint-200/70">
      <div className="flex flex-col items-center">
        {/* วงกลมนำลมหายใจ — ขยายตามขั้น ไม่มีตัวเลขนับถอยหลังตัวใหญ่ให้จ้อง */}
        <div className="relative flex h-40 w-40 items-center justify-center">
          {/* วงนอกกับวงในขยายพร้อมกัน โดยวงในเล็กกว่ามาก เพื่อให้เห็น "ขอบที่หนาขึ้น"
              ตอนสูดเข้าและบางลงตอนผ่อนออก — ถ้าวงในใหญ่เกือบเท่าวงนอก การขยับจะเหลือ
              เป็นเส้นบาง ๆ ที่มองแทบไม่ออกบนพื้นสีเดียวกัน */}
          <span
            className="absolute inset-0 rounded-full bg-mint-400/45 motion-safe:transition-transform motion-safe:ease-in-out"
            style={{
              transform: `scale(${running || done ? step.scale : 0.72})`,
              transitionDuration: `${running ? step.seconds : 0.6}s`,
            }}
            aria-hidden="true"
          />
          <span
            className="absolute inset-11 rounded-full bg-white/85 motion-safe:transition-transform motion-safe:ease-in-out"
            style={{
              transform: `scale(${running || done ? step.scale : 0.72})`,
              transitionDuration: `${running ? step.seconds : 0.6}s`,
            }}
            aria-hidden="true"
          />
          <div className="relative text-center">
            {done ? (
              <p className="px-3 text-[0.9rem] font-bold text-mint-800">
                ครบ {ROUNDS} รอบแล้ว
              </p>
            ) : running ? (
              <>
                <p className="text-[0.92rem] font-bold text-mint-800">{step.label}</p>
                <p className="mt-0.5 px-2 text-[0.72rem] leading-snug text-ink-soft">
                  {step.hint}
                </p>
              </>
            ) : (
              <p className="px-3 text-[0.82rem] leading-snug text-ink-soft">
                พร้อมเมื่อไหร่ก็กดเริ่มได้เลย
              </p>
            )}
          </div>
        </div>

        {/* ความคืบหน้าเป็นจุด ไม่ใช่แถบเปอร์เซ็นต์ — นับรอบเข้าใจง่ายกว่า */}
        <div className="mt-3 flex items-center gap-1.5" aria-hidden="true">
          {Array.from({ length: ROUNDS }, (_, i) => (
            <span
              key={i}
              className={`size-1.5 rounded-full transition-colors ${
                done || i < round ? "bg-mint-600" : i === round && running ? "bg-mint-400" : "bg-mint-200"
              }`}
            />
          ))}
        </div>
        <p className="mt-1.5 text-[0.72rem] text-ink-mute">
          {done ? "ทำซ้ำได้ทุกเมื่อที่ต้องการ" : `รอบที่ ${Math.min(round + 1, ROUNDS)} จาก ${ROUNDS} · รอบละ ${CYCLE_SECONDS} วินาที`}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => (done ? reset() : setRunning((r) => !r))}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-mint-700 px-5 text-[0.86rem] font-semibold text-white transition-colors hover:bg-mint-600"
          >
            {done ? (
              <>
                <RotateCcw className="size-4" aria-hidden="true" />
                เริ่มใหม่
              </>
            ) : running ? (
              <>
                <Pause className="size-4" aria-hidden="true" />
                พักก่อน
              </>
            ) : (
              <>
                <Play className="size-4" aria-hidden="true" />
                เริ่มหายใจ
              </>
            )}
          </button>
          {(running || round > 0) && !done ? (
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-11 items-center rounded-full px-3 text-[0.82rem] text-ink-soft transition-colors hover:text-ink"
            >
              เริ่มต้นใหม่
            </button>
          ) : null}
        </div>

        {/* ผู้ที่ปิดแอนิเมชันในระบบจะไม่เห็นวงกลมขยับ ข้อความจึงต้องบอกครบด้วยตัวเอง */}
        <p className="sr-only" role="status">
          {running ? `${step.label} ${step.hint} เหลือ ${left} วินาที` : ""}
        </p>
      </div>
    </div>
  );
}
