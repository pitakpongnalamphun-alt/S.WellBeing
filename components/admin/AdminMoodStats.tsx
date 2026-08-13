"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { downloadCsv } from "@/lib/csv";
import { EMOTION_WHEEL } from "@/data/emotionWheel";
import { useMoodStatsStore } from "@/lib/store/useMoodStatsStore";
import { daysInMonth, localDay, monthKey, monthLabel, shiftMonth } from "@/lib/date";
import { cn } from "@/lib/utils";

const CORE = Object.fromEntries(EMOTION_WHEEL.map((c) => [c.key, c]));
/** Clearly-unpleasant cores — the wellbeing signal to watch. (yellow = pleasant, purple = surprise.) */
const NEGATIVE = new Set(["green", "orange", "red", "gray", "blue"]);

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * เส้นอ้างอิงแนวนอนของกราฟแท่ง
 *
 * ตอนค่าสูงสุดน้อย ๆ (เช่น 1) การหาร 3 ระดับจะได้ "1 / 1 / 0" ซึ่งอ่านแล้วเหมือน
 * กราฟพัง — จึงตัดค่าที่ซ้ำกันออก เหลือเท่าที่บอกอะไรได้จริง
 */
function gridTicks(max: number): number[] {
  const raw = [0, 0.5, 1].map((f) => Math.round(max * f));
  return [...new Set(raw)];
}

export function AdminMoodStats() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const records = useMoodStatsStore((s) => s.records);

  // เดือนที่กำลังดูอยู่ (null = ยังไม่ mount ห้ามอ่านนาฬิกาก่อนหน้าจอพร้อม)
  const [month, setMonth] = useState<string | null>(null);
  useEffect(() => setMonth(monthKey(new Date())), []);

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

  /**
   * สรุปรายเดือน — ครูวางแผนเป็นเดือน (ประชุมระดับชั้น รายงานผู้บริหาร ปฏิทินกิจกรรม)
   * ตัวเลข 14 วันตอบคำถาม "ตอนนี้เป็นยังไง" แต่ตอบไม่ได้ว่า "เดือนนี้ดีขึ้นหรือแย่ลง
   * กว่าเดือนที่แล้ว" ซึ่งเป็นคำถามที่ต้องใช้ตอนตัดสินใจว่าจะทำอะไรต่อ
   */
  const monthly = useMemo(() => {
    if (!month) return null;

    const byMonth = new Map<string, { total: number; neg: number }>();
    const byDay = new Map<string, { total: number; neg: number }>();
    const coreOfMonth: Record<string, number> = {};

    for (const r of records) {
      const day = localDay(new Date(r.at));
      const mk = day.slice(0, 7);
      const neg = NEGATIVE.has(r.core) ? 1 : 0;

      const m = byMonth.get(mk) ?? { total: 0, neg: 0 };
      m.total += 1;
      m.neg += neg;
      byMonth.set(mk, m);

      if (mk === month) {
        const d = byDay.get(day) ?? { total: 0, neg: 0 };
        d.total += 1;
        d.neg += neg;
        byDay.set(day, d);
        coreOfMonth[r.core] = (coreOfMonth[r.core] ?? 0) + 1;
      }
    }

    // ทุกวันของเดือน รวมวันที่ไม่มีใครเช็คอิน — ช่องว่างคือข้อมูลอย่างหนึ่ง
    const days: { day: string; dom: number; total: number; neg: number }[] = [];
    for (let i = 1; i <= daysInMonth(month); i += 1) {
      const day = `${month}-${String(i).padStart(2, "0")}`;
      const d = byDay.get(day) ?? { total: 0, neg: 0 };
      days.push({ day, dom: i, total: d.total, neg: d.neg });
    }

    const cur = byMonth.get(month) ?? { total: 0, neg: 0 };
    const prevKey = shiftMonth(month, -1);
    const prev = byMonth.get(prevKey) ?? { total: 0, neg: 0 };
    const share = (v: { total: number; neg: number }) =>
      v.total > 0 ? Math.round((v.neg / v.total) * 100) : 0;

    // 6 เดือนล่าสุดนับจากเดือนที่เลือก
    const series: { key: string; total: number; neg: number; share: number }[] = [];
    for (let i = 5; i >= 0; i -= 1) {
      const key = shiftMonth(month, -i);
      const v = byMonth.get(key) ?? { total: 0, neg: 0 };
      series.push({ key, total: v.total, neg: v.neg, share: share(v) });
    }

    const oldest = records.length
      ? records.reduce((min, r) => {
          const mk = localDay(new Date(r.at)).slice(0, 7);
          return mk < min ? mk : min;
        }, monthKey(new Date()))
      : monthKey(new Date());

    return {
      days,
      dayMax: Math.max(1, ...days.map((d) => d.total)),
      activeDays: days.filter((d) => d.total > 0).length,
      cur,
      prev,
      prevKey,
      curShare: share(cur),
      prevShare: share(prev),
      series,
      seriesMax: Math.max(1, ...series.map((m) => m.total)),
      coreRows: Object.entries(coreOfMonth)
        .map(([key, n]) => ({ key, n }))
        .sort((a, b) => b.n - a.n),
      canPrev: month > oldest,
      canNext: month < monthKey(new Date()),
    };
  }, [records, month]);

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
            {/*
              เดิมกราฟนี้ไม่ขึ้นเลยสักแท่ง: ความสูงตั้งเป็น % แต่กล่องแม่ของแต่ละแท่ง
              สูงตามเนื้อหา (auto) เปอร์เซ็นต์จึงตีเป็นศูนย์ทั้งหมด — การ์ดว่างเปล่า
              โดยไม่มี error ให้เห็น ตอนนี้วัดจากกล่องที่สูงแน่นอนด้วย absolute แทน
            */}
            <div className="relative mt-4 h-28">
              <div className="absolute inset-0 flex items-end gap-1.5">
                {trend.map((d) => (
                  <div
                    key={d.day}
                    className="relative h-full flex-1"
                    title={`${d.day} · ${d.total} ครั้ง (ไม่สบายใจ ${d.neg})`}
                  >
                    <div
                      className="absolute inset-x-0 bottom-0 overflow-hidden rounded-t bg-slate-300"
                      style={{
                        height: `${(d.total / trendMax) * 100}%`,
                        minHeight: d.total > 0 ? 3 : 0,
                      }}
                    >
                      <div
                        className="absolute inset-x-0 bottom-0 bg-rose-400"
                        style={{ height: d.total > 0 ? `${(d.neg / d.total) * 100}%` : 0 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-1.5 flex justify-between text-[0.68rem] text-ink-mute">
              <span>{trend[0]?.day.slice(5)}</span>
              <span>วันนี้</span>
            </div>
          </>
        )}
      </Card>

      {/* ---------------------------------------------------- สรุปรายเดือน */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[0.95rem] font-semibold text-ink">สรุปรายเดือน</h2>
            <p className="mt-0.5 text-[0.76rem] text-ink-soft">
              จำนวนการเช็คอินรายวันตลอดเดือน — แถบสีชมพูคือส่วนที่เป็นอารมณ์ไม่สบายใจ
            </p>
          </div>

          {mounted && month ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMonth(shiftMonth(month, -1))}
                disabled={!monthly?.canPrev}
                aria-label="เดือนก่อนหน้า"
                className="rounded-lg p-1.5 text-ink-soft transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </button>
              <span className="min-w-[8.5rem] text-center text-[0.86rem] font-semibold text-ink">
                {monthLabel(month, true)}
              </span>
              <button
                type="button"
                onClick={() => setMonth(shiftMonth(month, 1))}
                disabled={!monthly?.canNext}
                aria-label="เดือนถัดไป"
                className="rounded-lg p-1.5 text-ink-soft transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>

        {!mounted || !monthly ? (
          <p className="py-4 text-[0.84rem] text-ink-mute">กำลังโหลด…</p>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                {
                  label: "เช็คอินเดือนนี้",
                  value: String(monthly.cur.total),
                  sub: `${monthly.activeDays} วันที่มีการเช็คอิน`,
                },
                {
                  label: "อารมณ์ไม่สบายใจ",
                  value: `${monthly.curShare}%`,
                  sub: `${monthly.cur.neg} จาก ${monthly.cur.total}`,
                  warn: monthly.curShare >= 40,
                },
                {
                  label: `เทียบ ${monthLabel(monthly.prevKey)}`,
                  value:
                    monthly.prev.total === 0
                      ? "—"
                      : `${monthly.curShare - monthly.prevShare > 0 ? "+" : ""}${monthly.curShare - monthly.prevShare}%`,
                  sub:
                    monthly.prev.total === 0
                      ? "เดือนก่อนไม่มีข้อมูล"
                      : `เดือนก่อน ${monthly.prevShare}%`,
                  // ไม่สบายใจเพิ่มขึ้น = สัญญาณให้ดู ไม่ใช่ตัวเลขที่ควรกลมกลืนไปกับตัวอื่น
                  warn: monthly.prev.total > 0 && monthly.curShare > monthly.prevShare,
                },
                {
                  label: "เฉลี่ยต่อวัน",
                  value:
                    monthly.activeDays > 0
                      ? (monthly.cur.total / monthly.activeDays).toFixed(1)
                      : "—",
                  sub: "เฉพาะวันที่มีการเช็คอิน",
                },
              ].map((t) => (
                <div key={t.label} className="rounded-xl bg-neutral-50 p-3">
                  <p className="text-[0.74rem] text-ink-mute">{t.label}</p>
                  <p
                    className={cn(
                      "mt-1 text-[1.3rem] font-bold tabular-nums",
                      t.warn ? "text-risk-high" : "text-ink",
                    )}
                  >
                    {t.value}
                  </p>
                  <p className="mt-0.5 text-[0.7rem] text-ink-mute">{t.sub}</p>
                </div>
              ))}
            </div>

            {monthly.cur.total === 0 ? (
              <p className="py-8 text-center text-[0.84rem] text-ink-mute">
                เดือนนี้ยังไม่มีนักเรียนเช็คอินอารมณ์
              </p>
            ) : (
              <>
                {/* กราฟรายวัน — มีเส้นอ้างอิงและตัวเลขสูงสุด ไม่ใช่แท่งลอย ๆ ที่อ่านค่าไม่ได้ */}
                <div className="relative mt-5 h-40">
                  {gridTicks(monthly.dayMax).map((t) => (
                    <div
                      key={t}
                      className="absolute inset-x-0 border-t border-dashed border-neutral-200"
                      style={{ bottom: `${(monthly.dayMax ? t / monthly.dayMax : 0) * 100}%` }}
                    >
                      <span className="absolute -top-2 -left-1 bg-white pr-1 text-[0.62rem] tabular-nums text-ink-mute">
                        {t}
                      </span>
                    </div>
                  ))}
                  <div className="absolute inset-0 flex items-end gap-[2px] pl-5">
                    {monthly.days.map((d) => (
                      <div
                        key={d.day}
                        className="relative h-full flex-1"
                        title={`${d.dom} ${monthLabel(month!)} · ${d.total} ครั้ง (ไม่สบายใจ ${d.neg})`}
                      >
                        <div
                          className="absolute inset-x-0 bottom-0 overflow-hidden rounded-t bg-slate-300"
                          style={{
                            height: `${(d.total / monthly.dayMax) * 100}%`,
                            minHeight: d.total > 0 ? 3 : 0,
                          }}
                        >
                          <div
                            className="absolute inset-x-0 bottom-0 bg-rose-400"
                            style={{
                              height: d.total > 0 ? `${(d.neg / d.total) * 100}%` : 0,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-1.5 flex justify-between pl-5 text-[0.66rem] tabular-nums text-ink-mute">
                  {Array.from({ length: 7 }, (_, i) =>
                    Math.round(1 + (i * (monthly.days.length - 1)) / 6),
                  ).map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-[0.72rem] text-ink-soft">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-sm bg-rose-400" /> ไม่สบายใจ
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-sm bg-slate-300" /> อารมณ์อื่น ๆ
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      downloadCsv(`mood-${month}.csv`, [
                        ["วันที่", "เช็คอินทั้งหมด", "อารมณ์ไม่สบายใจ", "สัดส่วนไม่สบายใจ (%)"],
                        ...monthly.days.map((d) => [
                          d.day,
                          d.total,
                          d.neg,
                          d.total > 0 ? Math.round((d.neg / d.total) * 100) : 0,
                        ]),
                      ])
                    }
                    className="ml-auto flex items-center gap-1.5 rounded-lg px-2 py-1 text-ink-mute transition-colors hover:text-ink"
                  >
                    <Download className="size-3.5" aria-hidden="true" />
                    ดาวน์โหลด CSV
                  </button>
                </div>

                {/* อารมณ์หลักเฉพาะเดือนนี้ */}
                <div className="mt-5 border-t border-neutral-100 pt-4">
                  <h3 className="text-[0.84rem] font-semibold text-ink">
                    อารมณ์หลักของเดือนนี้
                  </h3>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {monthly.coreRows.map(({ key, n }) => {
                      const c = CORE[key];
                      return (
                        <span
                          key={key}
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.8rem] text-ink"
                          style={{ background: `${c?.swatch ?? "#e2e8f0"}33` }}
                        >
                          {c?.emoji} {c?.label ?? key}
                          <span className="font-bold tabular-nums">{n}</span>
                          <span className="text-ink-mute">
                            {Math.round((n / monthly.cur.total) * 100)}%
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </Card>

      {/* ------------------------------------------- เทียบย้อนหลัง 6 เดือน */}
      <Card className="p-5">
        <h2 className="text-[0.95rem] font-semibold text-ink">เทียบย้อนหลัง 6 เดือน</h2>
        <p className="mt-0.5 text-[0.76rem] text-ink-soft">
          ความสูงคือจำนวนเช็คอินทั้งเดือน ตัวเลขบนแท่งคือสัดส่วนอารมณ์ไม่สบายใจ
        </p>
        {!mounted || !monthly ? (
          <p className="py-4 text-[0.84rem] text-ink-mute">กำลังโหลด…</p>
        ) : (
          <div className="mt-5 flex h-44 items-end gap-3">
            {monthly.series.map((m) => {
              const h = (m.total / monthly.seriesMax) * 100;
              const negH = m.total > 0 ? (m.neg / m.total) * 100 : 0;
              const isCurrent = m.key === month;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMonth(m.key)}
                  title={`${monthLabel(m.key, true)} · ${m.total} ครั้ง (ไม่สบายใจ ${m.neg})`}
                  className="flex h-full flex-1 flex-col justify-end gap-1.5 rounded-lg p-1 transition-colors hover:bg-neutral-50"
                >
                  <span
                    className={cn(
                      "text-center text-[0.72rem] font-semibold tabular-nums",
                      m.share >= 40 ? "text-risk-high" : "text-ink-soft",
                    )}
                  >
                    {m.total > 0 ? `${m.share}%` : "—"}
                  </span>
                  <span
                    className="relative w-full overflow-hidden rounded-t bg-slate-300"
                    style={{ height: `${Math.max(h, m.total > 0 ? 4 : 1)}%` }}
                  >
                    <span
                      className="absolute inset-x-0 bottom-0 bg-rose-400"
                      style={{ height: `${negH}%` }}
                    />
                  </span>
                  <span
                    className={cn(
                      "text-center text-[0.7rem]",
                      isCurrent ? "font-bold text-ink" : "text-ink-mute",
                    )}
                  >
                    {monthLabel(m.key)}
                  </span>
                </button>
              );
            })}
          </div>
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
