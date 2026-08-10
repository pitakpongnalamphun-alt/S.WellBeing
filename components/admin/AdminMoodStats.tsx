"use client";

import { useEffect, useMemo, useState } from "react";

import { Card } from "@/components/ui/Card";
import { EMOTION_WHEEL } from "@/data/emotionWheel";
import { useMoodStatsStore } from "@/lib/store/useMoodStatsStore";
import { localDay } from "@/lib/date";
import { cn } from "@/lib/utils";

const CORE = Object.fromEntries(EMOTION_WHEEL.map((c) => [c.key, c]));
/** Clearly-unpleasant cores — the wellbeing signal to watch. (yellow = pleasant, purple = surprise.) */
const NEGATIVE = new Set(["green", "orange", "red", "gray", "blue"]);

const DAY_MS = 24 * 60 * 60 * 1000;

export function AdminMoodStats() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const records = useMoodStatsStore((s) => s.records);

  const { total, coreRows, negCount, weekCount, topTertiary, trend, trendMax } =
    useMemo(() => {
      const coreCounts: Record<string, number> = {};
      const tertCounts: Record<string, number> = {};
      const dayMap = new Map<string, { total: number; neg: number }>();
      const weekAgo = Date.now() - 7 * DAY_MS;
      let negCount = 0;
      let weekCount = 0;

      for (const r of records) {
        coreCounts[r.core] = (coreCounts[r.core] ?? 0) + 1;
        tertCounts[r.tertiary] = (tertCounts[r.tertiary] ?? 0) + 1;
        if (NEGATIVE.has(r.core)) negCount += 1;
        const t = new Date(r.at).getTime();
        if (t >= weekAgo) weekCount += 1;
        const day = localDay(new Date(r.at));
        const d = dayMap.get(day) ?? { total: 0, neg: 0 };
        d.total += 1;
        if (NEGATIVE.has(r.core)) d.neg += 1;
        dayMap.set(day, d);
      }

      const coreRows = Object.entries(coreCounts)
        .map(([key, n]) => ({ key, n }))
        .sort((a, b) => b.n - a.n);

      const topTertiary = Object.entries(tertCounts)
        .map(([label, n]) => ({ label, n }))
        .sort((a, b) => b.n - a.n)
        .slice(0, 8);

      // last 14 days ending today
      const trend: { day: string; total: number; neg: number }[] = [];
      for (let i = 13; i >= 0; i -= 1) {
        const day = localDay(new Date(Date.now() - i * DAY_MS));
        const d = dayMap.get(day) ?? { total: 0, neg: 0 };
        trend.push({ day, total: d.total, neg: d.neg });
      }
      const trendMax = Math.max(1, ...trend.map((d) => d.total));

      return {
        total: records.length,
        coreRows,
        negCount,
        weekCount,
        topTertiary,
        trend,
        trendMax,
      };
    }, [records]);

  const coreMax = Math.max(1, ...coreRows.map((r) => r.n));
  const negShare = total > 0 ? Math.round((negCount / total) * 100) : 0;
  const topCore = coreRows[0] ? CORE[coreRows[0].key] : null;

  const tiles = [
    { label: "บันทึกอารมณ์ทั้งหมด", value: String(total), sub: "ทุกคนรวมกัน" },
    {
      label: "อารมณ์พบบ่อยสุด",
      value: topCore ? `${topCore.emoji} ${topCore.label}` : "—",
      sub: coreRows[0] ? `${coreRows[0].n} ครั้ง` : "ยังไม่มีข้อมูล",
      small: true,
    },
    {
      label: "สัดส่วนอารมณ์ไม่สบายใจ",
      value: `${negShare}%`,
      sub: `${negCount} จาก ${total}`,
      warn: negShare >= 40,
    },
    { label: "สัปดาห์นี้", value: String(weekCount), sub: "7 วันล่าสุด" },
  ];
  const show = (v: string) => (mounted ? v : "—");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="font-display th:leading-snug text-[1.6rem] font-bold text-ink">
          วิเคราะห์อารมณ์นักเรียน
        </h1>
        <p className="mt-1 text-[0.88rem] text-ink-soft">
          บรรยากาศอารมณ์ทั้งโรงเรียนจากการเช็คอินรายวัน — นับรวมแบบนิรนาม (ไม่มีชื่อ ไม่ผูกกับตัวบุคคล)
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label} className="p-4">
            <p className="text-[0.78rem] text-ink-mute">{t.label}</p>
            <p
              className={cn(
                "mt-1.5 font-bold",
                t.small ? "text-[1.05rem] leading-snug" : "text-[1.6rem] tabular-nums",
                mounted && t.warn ? "text-risk-high" : "text-ink",
              )}
            >
              {show(t.value)}
            </p>
            <p className="mt-0.5 text-[0.72rem] text-ink-mute">{mounted ? t.sub : ""}</p>
          </Card>
        ))}
      </div>

      {/* core emotion distribution */}
      <Card className="p-5">
        <h2 className="text-[0.95rem] font-semibold text-ink">อารมณ์หลัก</h2>
        {!mounted ? (
          <p className="py-4 text-[0.84rem] text-ink-mute">กำลังโหลด…</p>
        ) : total === 0 ? (
          <p className="py-4 text-[0.84rem] text-ink-mute">ยังไม่มีนักเรียนเช็คอินอารมณ์</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2.5">
            {coreRows.map(({ key, n }) => {
              const c = CORE[key];
              return (
                <div
                  key={key}
                  className="grid items-center gap-3"
                  style={{ gridTemplateColumns: "110px 1fr 62px" }}
                >
                  <span className="text-[0.82rem] text-ink">
                    {c?.emoji} {c?.label ?? key}
                  </span>
                  <span className="h-4 rounded bg-neutral-100">
                    <span
                      className="block h-full rounded"
                      style={{ width: `${(n / coreMax) * 100}%`, background: c?.swatch ?? "#cbd5e1" }}
                    />
                  </span>
                  <span className="text-right text-[0.8rem] text-ink-soft">
                    <span className="font-semibold text-ink">{n}</span> ·{" "}
                    {Math.round((n / total) * 100)}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* 14-day trend */}
      <Card className="p-5">
        <h2 className="text-[0.95rem] font-semibold text-ink">แนวโน้ม 14 วัน</h2>
        <p className="mt-0.5 text-[0.76rem] text-ink-soft">
          ส่วนสีชมพู = สัดส่วนอารมณ์ไม่สบายใจของวันนั้น
        </p>
        {!mounted ? (
          <p className="py-4 text-[0.84rem] text-ink-mute">กำลังโหลด…</p>
        ) : (
          <>
            <div className="mt-4 flex h-28 items-end gap-1.5">
              {trend.map((d) => {
                const h = (d.total / trendMax) * 100;
                const negH = d.total > 0 ? (d.neg / d.total) * 100 : 0;
                return (
                  <div key={d.day} className="flex flex-1 flex-col justify-end" title={`${d.day} · ${d.total} ครั้ง (ไม่สบายใจ ${d.neg})`}>
                    <div
                      className="w-full overflow-hidden rounded-t bg-neutral-100"
                      style={{ height: `${Math.max(h, d.total > 0 ? 6 : 2)}%` }}
                    >
                      <div className="h-full w-full bg-slate-300">
                        <div className="w-full bg-rose-300" style={{ height: `${negH}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-1.5 flex justify-between text-[0.68rem] text-ink-mute">
              <span>{trend[0]?.day.slice(5)}</span>
              <span>วันนี้</span>
            </div>
          </>
        )}
      </Card>

      {/* top specific feelings */}
      <Card className="p-5">
        <h2 className="text-[0.95rem] font-semibold text-ink">ความรู้สึกที่พบบ่อย</h2>
        <p className="mt-0.5 text-[0.76rem] text-ink-soft">อารมณ์ย่อยที่นักเรียนเลือกมากที่สุด</p>
        {!mounted ? (
          <p className="py-4 text-[0.84rem] text-ink-mute">กำลังโหลด…</p>
        ) : topTertiary.length === 0 ? (
          <p className="py-4 text-[0.84rem] text-ink-mute">ยังไม่มีข้อมูล</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {topTertiary.map((t) => (
              <span
                key={t.label}
                className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-[0.82rem] text-ink-soft"
              >
                {t.label}
                <span className="font-bold tabular-nums text-ink">{t.n}</span>
              </span>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminMoodStats;
