"use client";

import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";

/**
 * พาทำ 5-4-3-2-1 ทีละประสาทสัมผัส
 *
 * เป็นการนับด้วยการแตะ ไม่ใช่การพิมพ์ เพราะหัวใจของเทคนิคนี้คือการ "หันไปมองของจริง
 * รอบตัว" การให้พิมพ์ชื่อของ 15 อย่างลงมือถือจะดึงสายตากลับมาที่จอ ซึ่งตรงข้ามกับ
 * สิ่งที่เทคนิคนี้พยายามทำ
 *
 * ไม่มีการเก็บข้อมูลใด ๆ ทั้งสิ้น ปิดหน้าแล้วหาย
 */

const SENSES = [
  { n: 5, icon: "👀", verb: "มองเห็น", hint: "กวาดตาช้า ๆ แล้วเรียกชื่อมันในใจ" },
  { n: 4, icon: "✋", verb: "สัมผัสได้", hint: "พื้นใต้เท้า ผ้าที่ใส่ ขอบโต๊ะ" },
  { n: 3, icon: "👂", verb: "ได้ยิน", hint: "รวมเสียงลมหายใจตัวเองด้วยก็ได้" },
  { n: 2, icon: "👃", verb: "ได้กลิ่น", hint: "ถ้าไม่ได้กลิ่นอะไร นึกถึงกลิ่นที่ชอบแทนได้" },
  { n: 1, icon: "👅", verb: "รับรส", hint: "จิบน้ำสักอึก หรือสังเกตรสที่ค้างอยู่" },
];

export function GroundingWalk() {
  const [stage, setStage] = useState(0);
  const [ticked, setTicked] = useState(0);

  const done = stage >= SENSES.length;
  const sense = SENSES[Math.min(stage, SENSES.length - 1)];

  const tap = () => {
    const next = ticked + 1;
    if (next >= sense.n) {
      setStage((s) => s + 1);
      setTicked(0);
      return;
    }
    setTicked(next);
  };

  const reset = () => {
    setStage(0);
    setTicked(0);
  };

  if (done) {
    return (
      <div className="rounded-2xl bg-sky-50/70 p-5 text-center ring-1 ring-sky-200/70">
        <p className="text-[0.95rem] font-bold text-ink">ครบทั้งห้าอย่างแล้ว</p>
        <p className="mx-auto mt-1.5 max-w-[20rem] text-[0.82rem] leading-relaxed text-ink-soft">
          ถ้าความคิดยังวนอยู่ ทำซ้ำอีกรอบได้เลย บางครั้งต้องสองสามรอบถึงจะรู้สึกว่ากลับมาอยู่กับตัว
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-sky-600 px-5 text-[0.86rem] font-semibold text-white transition-colors hover:bg-sky-500"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          ทำอีกรอบ
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-sky-50/70 p-4 ring-1 ring-sky-200/70">
      <div className="flex items-center gap-2">
        {SENSES.map((s, i) => (
          <span
            key={s.verb}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < stage ? "bg-sky-500" : i === stage ? "bg-sky-300" : "bg-sky-200/60"
            }`}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className="mt-4 text-center">
        <span className="text-[2rem] leading-none" aria-hidden="true">
          {sense.icon}
        </span>
        <p className="mt-1.5 text-[1.02rem] font-bold text-ink">
          หา {sense.n} อย่างที่{sense.verb}
        </p>
        <p className="mt-1 text-[0.78rem] leading-snug text-ink-soft">{sense.hint}</p>
      </div>

      {/* จุดนับ — แตะแล้วเต็มทีละดวง เห็นชัดว่าเหลืออีกกี่อย่าง */}
      <div className="mt-4 flex justify-center gap-2">
        {Array.from({ length: sense.n }, (_, i) => (
          <span
            key={i}
            className={`grid size-8 place-items-center rounded-full ring-1 transition-colors ${
              i < ticked
                ? "bg-sky-500 text-white ring-sky-500"
                : "bg-white text-sky-300 ring-sky-200"
            }`}
            aria-hidden="true"
          >
            <Check className="size-4" strokeWidth={3} />
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={tap}
        className="mt-4 min-h-12 w-full rounded-2xl bg-sky-600 text-[0.9rem] font-semibold text-white transition-colors hover:bg-sky-500 active:translate-y-px"
      >
        เจอแล้ว ({ticked + 1}/{sense.n})
      </button>

      <button
        type="button"
        onClick={reset}
        className="mx-auto mt-2 block min-h-11 px-3 text-[0.78rem] text-ink-mute transition-colors hover:text-ink-soft"
      >
        เริ่มต้นใหม่
      </button>
    </div>
  );
}
