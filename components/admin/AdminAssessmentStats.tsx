"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Minus,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { downloadCsv } from "@/lib/csv";
import { daysInMonth, localDay, monthKey, monthLabel, shiftMonth } from "@/lib/date";
import {
  ASSESS_ACTION_META,
  ASSESS_ACTION_ORDER,
  type AssessAction,
  useAssessmentStore,
} from "@/lib/store/useAssessmentStore";
import { mentalHealthAssessments } from "@/data/assessments";
import { cn } from "@/lib/utils";

const pct = (n: number, total: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

type PerAssess = {
  id: string;
  title: string;
  count: number;
  actions: Record<AssessAction, number>;
};

export function AdminAssessmentStats() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const records = useAssessmentStore((s) => s.records);

  // เดือนที่กำลังดูอยู่ (null = ยังไม่ mount ห้ามอ่านนาฬิกาก่อนหน้าจอพร้อม)
  const [month, setMonth] = useState<string | null>(null);
  useEffect(() => setMonth(monthKey(new Date())), []);

  const { total, actionTotals, byAssessment } = useMemo(() => {
    const actionTotals: Record<AssessAction, number> = {
      safe: 0,
      monitor: 0,
      warning: 0,
      emergency: 0,
    };
    const map = new Map<string, PerAssess>();
    for (const r of records) {
      actionTotals[r.action] += 1;
      const cur =
        map.get(r.assessmentId) ??
        ({
          id: r.assessmentId,
          title: mentalHealthAssessments[r.assessmentId]?.title ?? r.assessmentId,
          count: 0,
          actions: { safe: 0, monitor: 0, warning: 0, emergency: 0 },
        } as PerAssess);
      cur.count += 1;
      cur.actions[r.action] += 1;
      map.set(r.assessmentId, cur);
    }
    const byAssessment = [...map.values()].sort((a, b) => b.count - a.count);
    return { total: records.length, actionTotals, byAssessment };
  }, [records]);

  const needCare = actionTotals.warning + actionTotals.emergency;
  const topAssess = byAssessment[0];

  /**
   * สรุปรายเดือน — ทั้งรายวันของเดือนที่เลือก และ 6 เดือนติดกันเพื่อดูก่อน-หลัง
   *
   * ของเดิมหยิบมาเฉพาะ "เดือนที่มีข้อมูล" 6 เดือน ซึ่งทำให้เดือนที่ไม่มีใครทำแบบทดสอบ
   * หายไปจากกราฟ แล้ว ม.ค. กับ พ.ค. ไปยืนติดกันเหมือนเป็นเดือนต่อเนื่องกัน — ระยะห่าง
   * บนกราฟเลยโกหกโดยที่ไม่มีใครตั้งใจ ตอนนี้ไล่เดือนติดกันจริงและปล่อยให้เดือนว่าง
   * เป็นช่องว่าง
   */
  const monthly = useMemo(() => {
    if (!month) return null;

    const byMonth = new Map<string, { count: number; risk: number; emergency: number }>();
    const byDay = new Map<string, { count: number; risk: number }>();
    const actionsOfMonth: Record<AssessAction, number> = {
      safe: 0,
      monitor: 0,
      warning: 0,
      emergency: 0,
    };

    for (const r of records) {
      const day = localDay(new Date(r.at));
      const mk = day.slice(0, 7);
      const risk = r.action === "warning" || r.action === "emergency" ? 1 : 0;

      const m = byMonth.get(mk) ?? { count: 0, risk: 0, emergency: 0 };
      m.count += 1;
      m.risk += risk;
      if (r.action === "emergency") m.emergency += 1;
      byMonth.set(mk, m);

      if (mk === month) {
        const d = byDay.get(day) ?? { count: 0, risk: 0 };
        d.count += 1;
        d.risk += risk;
        byDay.set(day, d);
        actionsOfMonth[r.action] += 1;
      }
    }

    const days: { day: string; dom: number; count: number; risk: number }[] = [];
    for (let i = 1; i <= daysInMonth(month); i += 1) {
      const day = `${month}-${String(i).padStart(2, "0")}`;
      const d = byDay.get(day) ?? { count: 0, risk: 0 };
      days.push({ day, dom: i, count: d.count, risk: d.risk });
    }

    const series: { key: string; count: number; risk: number; share: number }[] = [];
    for (let i = 5; i >= 0; i -= 1) {
      const key = shiftMonth(month, -i);
      const v = byMonth.get(key) ?? { count: 0, risk: 0, emergency: 0 };
      series.push({ key, count: v.count, risk: v.risk, share: pct(v.risk, v.count) });
    }

    const cur = byMonth.get(month) ?? { count: 0, risk: 0, emergency: 0 };
    const prevKey = shiftMonth(month, -1);
    const prev = byMonth.get(prevKey) ?? { count: 0, risk: 0, emergency: 0 };

    const oldest = records.length
      ? records.reduce(
          (min, r) => {
            const mk = localDay(new Date(r.at)).slice(0, 7);
            return mk < min ? mk : min;
          },
          monthKey(new Date()),
        )
      : monthKey(new Date());

    return {
      days,
      dayMax: Math.max(1, ...days.map((d) => d.count)),
      activeDays: days.filter((d) => d.count > 0).length,
      actionsOfMonth,
      cur,
      prev,
      prevKey,
      curShare: pct(cur.risk, cur.count),
      prevShare: pct(prev.risk, prev.count),
      series,
      seriesMax: Math.max(1, ...series.map((m) => m.count)),
      canPrev: month > oldest,
      canNext: month < monthKey(new Date()),
    };
  }, [records, month]);

  // เดือนที่มีไม่ถึง 5 ครั้งเปอร์เซ็นต์แกว่งแรงมาก (1 ครั้ง = 100 จุด) — อย่าให้ชิปสรุป
  // "ดีขึ้น/แย่ลง" จากตัวอย่างจิ๋วที่ผู้บริหารจะเอาไปอ้างต่อ
  const MIN_MONTH_N = 5;
  // เทียบเดือนแรกกับเดือนหลังสุด "ที่มีข้อมูลพอ" ในหน้าต่าง 6 เดือน — ไม่ใช่หัวท้าย
  // ของหน้าต่างเฉย ๆ เพราะหัวท้ายอาจเป็นเดือนว่างที่เอามาเทียบไม่ได้อยู่แล้ว
  const solid = (monthly?.series ?? []).filter((m) => m.count >= MIN_MONTH_N);
  const firstMonth = solid[0];
  const lastMonth = solid[solid.length - 1];
  const monthlyDelta =
    solid.length >= 2 ? lastMonth.share - firstMonth.share : null;
  const monthlyTooSmall =
    (monthly?.series ?? []).some((m) => m.count > 0 && m.count < MIN_MONTH_N) &&
    monthlyDelta === null;

  const tiles = [
    { label: "ทำแบบทดสอบทั้งหมด", value: String(total), sub: "ทุกแบบรวมกัน" },
    { label: "เข้าเกณฑ์เร่งด่วน", value: String(actionTotals.emergency), sub: "ควรติดตามทันที", danger: true },
    { label: "ควรดูแลขึ้นไป", value: String(needCare), sub: "ควรดูแล + เร่งด่วน" },
    {
      label: "แบบที่ทำบ่อยสุด",
      value: topAssess ? shortName(topAssess.id) : "—",
      sub: topAssess ? `${topAssess.count} ครั้ง` : "ยังไม่มีข้อมูล",
      small: true,
    },
  ];
  const show = (v: string) => (mounted ? v : "—");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="font-display th:leading-snug text-[1.6rem] font-bold text-ink">
          สถิติการประเมินใจ
        </h1>
        <p className="mt-1 text-[0.88rem] text-ink-soft">
          ภาพรวมการทำแบบคัดกรองของนักเรียน — นับรวมแบบไม่ระบุตัวตน (ผลรายคนเป็นความลับ)
        </p>
      </header>

      {mounted && actionTotals.emergency > 0 && (
        <Card className="flex items-center gap-3 border-l-4 border-l-risk-high p-4">
          <TriangleAlert className="size-5 shrink-0 text-risk-high" aria-hidden="true" />
          <p className="text-[0.86rem] text-ink">
            มีผลประเมิน{" "}
            <span className="font-bold text-risk-high">เข้าเกณฑ์เร่งด่วน {actionTotals.emergency} ครั้ง</span>{" "}
            — โปรดทบทวนมาตรการดูแลเชิงรุกทั้งโรงเรียน (ข้อมูลนี้เป็นภาพรวม ไม่ระบุตัวบุคคล)
          </p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label} className="p-4">
            <p className="text-[0.78rem] text-ink-mute">{t.label}</p>
            <p
              className={cn(
                "mt-1.5 font-bold",
                t.small ? "text-[1rem] leading-snug text-ink" : "text-[1.6rem] tabular-nums",
                t.danger ? "text-risk-high" : "text-ink",
              )}
            >
              {show(t.value)}
            </p>
            {/* sub ของไทล์ "ทำบ่อยสุด" ขึ้นกับข้อมูลใน store — ต้องผ่าน mounted mask เหมือน value */}
            <p className="mt-0.5 text-[0.72rem] text-ink-mute">{show(t.sub)}</p>
          </Card>
        ))}
      </div>

      {/* Overall severity distribution */}
      <Card className="p-5">
        <h2 className="text-[0.95rem] font-semibold text-ink">การกระจายระดับผล</h2>
        {!mounted ? (
          <p className="py-4 text-[0.84rem] text-ink-mute">กำลังโหลด…</p>
        ) : total === 0 ? (
          <p className="py-4 text-[0.84rem] text-ink-mute">ยังไม่มีนักเรียนทำแบบทดสอบ</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2.5">
            {ASSESS_ACTION_ORDER.map((a) => {
              const m = ASSESS_ACTION_META[a];
              const n = actionTotals[a];
              return (
                <div
                  key={a}
                  className="grid items-center gap-3"
                  style={{ gridTemplateColumns: "90px 1fr 62px" }}
                >
                  <span className="text-[0.82rem] text-ink">{m.label}</span>
                  <span className="h-4 rounded bg-neutral-100">
                    <span
                      className="block h-full rounded"
                      style={{ width: `${pct(n, total)}%`, background: m.bar }}
                    />
                  </span>
                  <span className="text-right text-[0.8rem] text-ink-soft">
                    <span className="font-semibold text-ink">{n}</span> · {pct(n, total)}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ---------------------------------------------------- สรุปรายเดือน */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[0.95rem] font-semibold text-ink">สรุปรายเดือน</h2>
            <p className="mt-0.5 text-[0.76rem] text-ink-soft">
              จำนวนการทำแบบทดสอบรายวันตลอดเดือน — แถบสีชมพูคือผลระดับ “ควรดูแลขึ้นไป”
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
                  label: "ทำแบบทดสอบเดือนนี้",
                  value: String(monthly.cur.count),
                  sub: `${monthly.activeDays} วันที่มีการทำ`,
                },
                {
                  label: "ควรดูแลขึ้นไป",
                  value: `${monthly.curShare}%`,
                  sub: `${monthly.cur.risk} จาก ${monthly.cur.count} ครั้ง`,
                  warn: monthly.curShare >= 40,
                },
                {
                  label: `เทียบ ${monthLabel(monthly.prevKey)}`,
                  value:
                    monthly.prev.count === 0
                      ? "—"
                      : `${monthly.curShare - monthly.prevShare > 0 ? "+" : ""}${monthly.curShare - monthly.prevShare}%`,
                  sub:
                    monthly.prev.count === 0
                      ? "เดือนก่อนไม่มีข้อมูล"
                      : `เดือนก่อน ${monthly.prevShare}%`,
                  warn: monthly.prev.count > 0 && monthly.curShare > monthly.prevShare,
                },
                {
                  label: "เข้าเกณฑ์เร่งด่วน",
                  value: String(monthly.cur.emergency),
                  sub: "ในเดือนนี้",
                  warn: monthly.cur.emergency > 0,
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

            {monthly.cur.count === 0 ? (
              <p className="py-8 text-center text-[0.84rem] text-ink-mute">
                เดือนนี้ยังไม่มีนักเรียนทำแบบทดสอบ
              </p>
            ) : (
              <>
                <div className="relative mt-5 h-40">
                  {[0, 0.5, 1].map((f) => (
                    <div
                      key={f}
                      className="absolute inset-x-0 border-t border-dashed border-neutral-200"
                      style={{ bottom: `${f * 100}%` }}
                    >
                      <span className="absolute -top-2 -left-1 bg-white pr-1 text-[0.62rem] tabular-nums text-ink-mute">
                        {Math.round(monthly.dayMax * f)}
                      </span>
                    </div>
                  ))}
                  <div className="absolute inset-0 flex items-end gap-[2px] pl-5">
                    {monthly.days.map((d) => (
                      <div
                        key={d.day}
                        className="relative h-full flex-1"
                        title={`${d.dom} ${monthLabel(month!)} · ${d.count} ครั้ง (ควรดูแลขึ้นไป ${d.risk})`}
                      >
                        <div
                          className="absolute inset-x-0 bottom-0 overflow-hidden rounded-t bg-slate-300"
                          style={{
                            height: `${(d.count / monthly.dayMax) * 100}%`,
                            minHeight: d.count > 0 ? 3 : 0,
                          }}
                        >
                          <div
                            className="absolute inset-x-0 bottom-0 bg-rose-400"
                            style={{ height: d.count > 0 ? `${(d.risk / d.count) * 100}%` : 0 }}
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
                    <span className="size-2.5 rounded-sm bg-rose-400" /> ควรดูแลขึ้นไป
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-sm bg-slate-300" /> ปกติ / เฝ้าระวัง
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      downloadCsv(`assessment-${month}.csv`, [
                        ["วันที่", "ทำแบบทดสอบ", "ควรดูแลขึ้นไป", "สัดส่วนควรดูแล (%)"],
                        ...monthly.days.map((d) => [
                          d.day,
                          d.count,
                          d.risk,
                          pct(d.risk, d.count),
                        ]),
                      ])
                    }
                    className="ml-auto flex items-center gap-1.5 rounded-lg px-2 py-1 text-ink-mute transition-colors hover:text-ink"
                  >
                    <Download className="size-3.5" aria-hidden="true" />
                    ดาวน์โหลด CSV
                  </button>
                </div>

                <div className="mt-5 border-t border-neutral-100 pt-4">
                  <h3 className="text-[0.84rem] font-semibold text-ink">ระดับผลของเดือนนี้</h3>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {ASSESS_ACTION_ORDER.map((a) => {
                      const n = monthly.actionsOfMonth[a];
                      if (n === 0) return null;
                      const m = ASSESS_ACTION_META[a];
                      return (
                        <span
                          key={a}
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.8rem] text-ink"
                          style={{ background: `${m.bar}22` }}
                        >
                          <span
                            className="size-2.5 rounded-full"
                            style={{ background: m.bar }}
                          />
                          {m.label}
                          <span className="font-bold tabular-nums">{n}</span>
                          <span className="text-ink-mute">{pct(n, monthly.cur.count)}%</span>
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

      {/* Monthly trend — the "before vs after" evidence */}
      <Card className="p-5">
        <h2 className="text-[0.95rem] font-semibold text-ink">แนวโน้มรายเดือน (เทียบก่อน–หลัง)</h2>
        <p className="mt-0.5 text-[0.76rem] text-ink-soft">
          สัดส่วนผลระดับ &ldquo;ควรดูแลขึ้นไป&rdquo; ต่อเดือน — ใช้ติดตามว่าภาพรวมดีขึ้นหรือไม่หลังเริ่มใช้งาน
        </p>
        {!mounted || !monthly ? (
          <p className="py-4 text-[0.84rem] text-ink-mute">กำลังโหลด…</p>
        ) : total === 0 ? (
          <p className="py-4 text-[0.84rem] text-ink-mute">ยังไม่มีข้อมูล</p>
        ) : (
          <>
            {monthlyDelta !== null && firstMonth && lastMonth && (
              <p
                className={cn(
                  "mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.78rem] font-semibold ring-1",
                  monthlyDelta < 0
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : monthlyDelta > 0
                      ? "bg-amber-50 text-amber-700 ring-amber-200"
                      : "bg-slate-100 text-slate-500 ring-slate-200",
                )}
              >
                {monthlyDelta < 0 ? (
                  <TrendingDown className="size-3.5" aria-hidden="true" />
                ) : monthlyDelta > 0 ? (
                  <TrendingUp className="size-3.5" aria-hidden="true" />
                ) : (
                  <Minus className="size-3.5" aria-hidden="true" />
                )}
                {monthLabel(firstMonth.key)}: {firstMonth.share}% → {monthLabel(lastMonth.key)}:{" "}
                {lastMonth.share}%
                {monthlyDelta < 0
                  ? ` (ดีขึ้น ${Math.abs(monthlyDelta)} จุด)`
                  : monthlyDelta > 0
                    ? ` (สูงขึ้น ${monthlyDelta} จุด)`
                    : " (คงที่)"}
                {` · n ${firstMonth.count}→${lastMonth.count} ครั้ง`}
              </p>
            )}
            {monthlyTooSmall && (
              <p className="mt-3 text-[0.78rem] text-ink-mute">
                บางเดือนมีข้อมูลน้อยกว่า {MIN_MONTH_N} ครั้ง — ยังไม่พอสรุปแนวโน้ม
                (ดูแถบรายเดือนด้านล่างประกอบจำนวนครั้ง)
              </p>
            )}
            {/* ข้อความสองอันนี้บอกเรื่องเดียวกัน อย่าขึ้นพร้อมกัน */}
            {solid.length < 2 && !monthlyTooSmall && (
              <p className="mt-3 text-[0.78rem] text-ink-mute">
                ยังมีข้อมูลไม่พอเทียบก่อน-หลัง — ต้องมีอย่างน้อย 2 เดือนที่มีตั้งแต่{" "}
                {MIN_MONTH_N} ครั้งขึ้นไป
              </p>
            )}

            {/* ความสูง = จำนวนครั้ง, ตัวเลขบนหัว = สัดส่วนควรดูแลขึ้นไป, กดเพื่อไปดูเดือนนั้น */}
            <div className="mt-5 flex h-44 items-end gap-3">
              {monthly.series.map((m) => {
                const h = (m.count / monthly.seriesMax) * 100;
                const riskH = m.count > 0 ? (m.risk / m.count) * 100 : 0;
                const isCurrent = m.key === month;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMonth(m.key)}
                    title={`${monthLabel(m.key, true)} · ${m.count} ครั้ง (ควรดูแลขึ้นไป ${m.risk})`}
                    className="flex h-full flex-1 flex-col justify-end gap-1.5 rounded-lg p-1 transition-colors hover:bg-neutral-50"
                  >
                    <span
                      className={cn(
                        "text-center text-[0.72rem] font-semibold tabular-nums",
                        m.share >= 40 ? "text-risk-high" : "text-ink-soft",
                      )}
                    >
                      {m.count > 0 ? `${m.share}%` : "—"}
                    </span>
                    <span
                      className="relative w-full overflow-hidden rounded-t bg-slate-300"
                      style={{ height: `${Math.max(h, m.count > 0 ? 4 : 1)}%` }}
                    >
                      <span
                        className="absolute inset-x-0 bottom-0 bg-rose-400"
                        style={{ height: `${riskH}%` }}
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
                    <span className="text-center text-[0.66rem] tabular-nums text-ink-mute">
                      {m.count > 0 ? `${m.count} ครั้ง` : "ไม่มี"}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {/* Per assessment */}
      <Card className="p-5">
        <h2 className="text-[0.95rem] font-semibold text-ink">แยกตามแบบทดสอบ</h2>
        <p className="mt-0.5 text-[0.76rem] text-ink-soft">แถบสีคือสัดส่วนระดับผลของแต่ละแบบ</p>
        {!mounted ? (
          <p className="py-4 text-[0.84rem] text-ink-mute">กำลังโหลด…</p>
        ) : byAssessment.length === 0 ? (
          <p className="py-4 text-[0.84rem] text-ink-mute">ยังไม่มีข้อมูล</p>
        ) : (
          <div className="mt-3 flex flex-col gap-4">
            {byAssessment.map((row) => (
              <div key={row.id}>
                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                  <span className="text-[0.85rem] font-medium text-ink">
                    {row.title}
                    {row.actions.emergency > 0 && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[0.66rem] font-semibold text-rose-600 ring-1 ring-rose-200">
                        <TriangleAlert className="size-3" aria-hidden="true" />
                        เร่งด่วน {row.actions.emergency}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-[0.78rem] text-ink-soft">
                    <span className="font-semibold text-ink">{row.count}</span> ครั้ง
                  </span>
                </div>
                <div className="flex h-4 overflow-hidden rounded bg-neutral-100">
                  {ASSESS_ACTION_ORDER.map((a) => {
                    const n = row.actions[a];
                    if (n === 0) return null;
                    return (
                      <span
                        key={a}
                        title={`${ASSESS_ACTION_META[a].label} ${n}`}
                        style={{
                          width: `${(n / row.count) * 100}%`,
                          background: ASSESS_ACTION_META[a].bar,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* legend */}
      <div className="flex flex-wrap gap-3 text-[0.74rem] text-ink-soft">
        {ASSESS_ACTION_ORDER.map((a) => (
          <span key={a} className="inline-flex items-center gap-1.5">
            <span
              className="size-3 rounded-full"
              style={{ background: ASSESS_ACTION_META[a].bar }}
            />
            {ASSESS_ACTION_META[a].label}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Compact label for the KPI tile. The assessment id is already a short code
 * ("GAD-7", "9Q", …), but if a full title is ever passed we pull the code out of
 * its trailing parenthesis — "แบบประเมินโรควิตกกังวล (GAD-7)" → "GAD-7".
 */
function shortName(idOrTitle: string): string {
  const paren = idOrTitle.match(/\(([^)]+)\)\s*$/);
  return (paren ? paren[1] : idOrTitle).trim();
}

export default AdminAssessmentStats;
