"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { FluffyBuddy } from "@/components/FluffyBuddy";
import { CORE_BY_KEY, EMOTION_WHEEL, type CoreKey } from "@/data/emotionWheel";
import { useMoodDiaryStore } from "@/lib/store/useMoodDiaryStore";
import { localDay } from "@/lib/date";

/* ------------------------------------------------------------------ data */

type MoodEntry = { date: number; coreColor: CoreKey; secondary: string; tertiary: string };

const WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const MONTH_NAMES = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

/** "2026-08-12" → [2026, 7, 12] (เดือนฐานศูนย์) — อ่านจากสตริงตรง ๆ ไม่ผ่าน Date
 *  จะได้ไม่โดน timezone เลื่อนวันข้ามคืน */
function partsOf(day: string): [number, number, number] {
  const [y, m, d] = day.split("-").map(Number);
  return [y, m - 1, d];
}

/** An empathetic line for whichever colour showed up most this month. */
const MONTH_MESSAGE: Record<CoreKey, string> = {
  blue: "เดือนนี้สีฟ้ามาเยี่ยมบ่อยเลยนะ เหนื่อยหน่อยใช่ไหม ไม่เป็นไรนะ กอด ๆ 💙",
  yellow: "เดือนนี้หัวใจเธออบอุ่นสดใสบ่อยเลยนะ ดีใจด้วยจริง ๆ 💛",
  green: "เดือนนี้มีเรื่องให้เหนื่อยใจอยู่บ้าง ค่อย ๆ พักไปด้วยกันนะ 💚",
  orange: "เดือนนี้ความกังวลแวะมาบ่อยหน่อย เธอดูแลตัวเองเก่งมากแล้วนะ 🧡",
  red: "เดือนนี้มีเรื่องให้หัวใจร้อนอยู่บ้าง การรู้ทันอารมณ์ตัวเองคือความเก่งนะ ❤️",
  purple: "เดือนนี้มีเรื่องเซอร์ไพรส์ให้ตื่นเต้นอยู่บ่อย ๆ เลยนะ 💜",
  gray: "เดือนนี้มีบางอย่างที่ยอมรับได้ยากอยู่บ้าง ไม่เป็นไรนะ เธอทำดีที่สุดแล้ว 🤍",
};

/* ------------------------------------------------------------------ component */

export function MonthlyMoodStickerBook({ className }: { className?: string }) {
  const [selected, setSelected] = useState<MoodEntry | null>(null);

  // สมุดของจริงจากเครื่องนักเรียนเอง — เดิมหน้านี้เป็นข้อมูลตัวอย่างฮาร์ดโค้ด
  // นักเรียนจึงบันทึกอารมณ์แล้วไม่เคยเห็นดวงของตัวเองสักครั้ง
  const entries = useMoodDiaryStore((s) => s.entries);

  // เดือนที่กำลังเปิดดู — เริ่มที่เดือนปัจจุบันจริง ไม่ใช่เดือนที่เขียนค้างไว้ในโค้ด
  const [cursor, setCursor] = useState(() => {
    const [y, m] = partsOf(localDay());
    return { year: y, month: m };
  });

  // เรนเดอร์หลัง mount เท่านั้น: สโตร์ persist ทำให้ครั้งแรกยังว่างเสมอ
  // ถ้าเรนเดอร์ตรง ๆ จะ hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const monthEntries = useMemo(() => {
    if (!mounted) return [];
    return entries.filter((e) => {
      const [y, m] = partsOf(e.day);
      return y === cursor.year && m === cursor.month;
    });
  }, [entries, cursor, mounted]);

  const byDate = useMemo(() => {
    const map = new Map<number, MoodEntry>();
    for (const e of monthEntries) {
      const [, , d] = partsOf(e.day);
      map.set(d, {
        date: d,
        coreColor: e.core,
        secondary: e.secondary,
        tertiary: e.tertiary,
      });
    }
    return map;
  }, [monthEntries]);

  const dominant = useMemo(() => {
    const counts = new Map<CoreKey, number>();
    for (const e of monthEntries) counts.set(e.core, (counts.get(e.core) ?? 0) + 1);
    let top: CoreKey = "yellow";
    let max = -1;
    for (const c of EMOTION_WHEEL) {
      const n = counts.get(c.key) ?? 0;
      if (n > max) {
        max = n;
        top = c.key;
      }
    }
    return top;
  }, [monthEntries]);
  const dominantCore = CORE_BY_KEY[dominant];

  // ย้อนได้ไม่เกินเดือนแรกที่มีบันทึก และไปหน้าไม่เกินเดือนปัจจุบัน
  const bounds = useMemo(() => {
    const [ny, nm] = partsOf(localDay());
    const now = ny * 12 + nm;
    let oldest = now;
    for (const e of entries) {
      const [y, m] = partsOf(e.day);
      oldest = Math.min(oldest, y * 12 + m);
    }
    return { oldest, now };
  }, [entries]);
  const cursorIndex = cursor.year * 12 + cursor.month;
  const step = (delta: number) => {
    const next = cursorIndex + delta;
    if (next < bounds.oldest || next > bounds.now) return;
    setCursor({ year: Math.floor(next / 12), month: next % 12 });
  };

  const monthLabel = `${MONTH_NAMES[cursor.month]} ${cursor.year + 543}`;
  const firstWeekday = new Date(cursor.year, cursor.month, 1).getDay();
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div
      className={[
        "mx-auto w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-100",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Header — soft mint */}
      <div className="bg-gradient-to-b from-emerald-100 to-emerald-50 px-6 py-5 text-center">
        <h2 className="text-lg font-bold text-emerald-800">สมุดสะสมอารมณ์ของฉัน</h2>
        <div className="mt-1 flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={cursorIndex <= bounds.oldest}
            aria-label="เดือนก่อนหน้า"
            className="grid size-7 place-items-center rounded-full text-emerald-700 transition enabled:hover:bg-emerald-100 disabled:opacity-25"
          >
            <ChevronLeft className="size-4" />
          </button>
          <p className="min-w-[9rem] text-sm font-medium text-emerald-600/80">{monthLabel}</p>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={cursorIndex >= bounds.now}
            aria-label="เดือนถัดไป"
            className="grid size-7 place-items-center rounded-full text-emerald-700 transition enabled:hover:bg-emerald-100 disabled:opacity-25"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="p-5">
        {/* Weekday row */}
        <div className="mb-1 grid grid-cols-7 text-center text-[0.7rem] font-semibold text-slate-400">
          {WEEKDAYS.map((d) => (
            <span key={d} className="py-1">
              {d}
            </span>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <span key={`b-${i}`} className="aspect-square" />;
            const entry = byDate.get(day);
            const core = entry ? CORE_BY_KEY[entry.coreColor] : null;
            return (
              <button
                key={day}
                type="button"
                disabled={!entry}
                onClick={() => entry && setSelected(entry)}
                className={`relative grid aspect-square place-items-center rounded-xl text-[0.65rem] transition ${
                  entry ? "hover:scale-105 active:scale-95" : "text-slate-300"
                }`}
              >
                {core ? (
                  <>
                    <span className="animate-breathe">
                      <FluffyBuddy
                        size={30}
                        expression={core.face}
                        gradient={core.gradient}
                        ink={core.ink}
                        glowColor={core.glow}
                      />
                    </span>
                    <span className="absolute right-1 top-0.5 text-[0.55rem] font-semibold text-white/90">{day}</span>
                  </>
                ) : (
                  <span className="font-medium">{day}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Monthly summary — เดือนที่ยังไม่มีบันทึกต้องไม่สรุปอารมณ์ที่ไม่เคยเกิดขึ้น */}
        {monthEntries.length > 0 ? (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl p-5" style={{ backgroundColor: dominantCore.soft }}>
            <FluffyBuddy
              size={96}
              expression={dominantCore.face}
              gradient={dominantCore.gradient}
              ink={dominantCore.ink}
              glowColor={dominantCore.glow}
            />
            <p className="text-center text-sm font-medium leading-relaxed text-slate-600">{MONTH_MESSAGE[dominant]}</p>
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl bg-slate-50 p-5">
            <FluffyBuddy size={80} expression="content" />
            <p className="text-center text-sm font-medium leading-relaxed text-slate-500">
              {mounted && cursorIndex === bounds.now
                ? "เดือนนี้ยังไม่มีดวงอารมณ์เลย — ไปแท็บ “วันนี้” แล้วบันทึกความรู้สึกดวงแรกกันไหม ☁️"
                : "เดือนนี้ยังไม่มีบันทึกไว้นะ"}
            </p>
          </div>
        )}
      </div>

      {/* Detail popover */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-slate-900/30 p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="relative w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-xl"
              initial={{ opacity: 0, scale: 0.94, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="ปิด"
                className="absolute right-3 top-3 grid size-7 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>

              <p className="text-xs font-semibold text-slate-400">วันที่ {selected.date}</p>

              {(() => {
                const core = CORE_BY_KEY[selected.coreColor];
                return (
                  <>
                    <div className="mx-auto my-3">
                      <FluffyBuddy size={80} expression={core.face} gradient={core.gradient} ink={core.ink} glowColor={core.glow} />
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-1.5 text-sm">
                      <span className="rounded-full px-3 py-1 font-semibold" style={{ backgroundColor: core.soft, color: core.ink }}>
                        {core.emoji} {core.label}
                      </span>
                      <span className="text-slate-300">→</span>
                      <span className="font-medium text-slate-500">{selected.secondary}</span>
                      <span className="text-slate-300">→</span>
                      <span className="rounded-full border px-3 py-1 font-semibold" style={{ borderColor: core.ink, color: core.ink }}>
                        {selected.tertiary}
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-slate-600">เก่งมากเลยที่ผ่านวันนั้นมาได้ ☁️</p>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MonthlyMoodStickerBook;
