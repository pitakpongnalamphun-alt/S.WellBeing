"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, TrendingDown, TrendingUp, TriangleAlert } from "lucide-react";

import { Card } from "@/components/ui/Card";
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
   * แนวโน้มรายเดือน (ไม่เกิน 6 เดือนล่าสุดที่มีข้อมูล) — หัวใจของคำถาม "ก่อน-หลัง":
   * สัดส่วนผลระดับ "ควรดูแลขึ้นไป" ต่อเดือนบอกได้ว่าภาพรวมของโรงเรียน
   * ดีขึ้นหรือแย่ลงหลังเริ่มใช้งาน โดยยังนิรนามทั้งหมดเช่นเดิม
   */
  const monthly = useMemo(() => {
    const map = new Map<string, { key: string; label: string; count: number; risk: number }>();
    for (const r of records) {
      const d = new Date(r.at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const cur =
        map.get(key) ??
        {
          key,
          label: d.toLocaleDateString("th-TH", { month: "short", year: "2-digit" }),
          count: 0,
          risk: 0,
        };
      cur.count += 1;
      if (r.action === "warning" || r.action === "emergency") cur.risk += 1;
      map.set(key, cur);
    }
    return [...map.values()].sort((a, b) => a.key.localeCompare(b.key)).slice(-6);
  }, [records]);

  // เดือนที่มีไม่ถึง 5 ครั้งเปอร์เซ็นต์แกว่งแรงมาก (1 ครั้ง = 100 จุด) — อย่าให้ชิปสรุป
  // "ดีขึ้น/แย่ลง" จากตัวอย่างจิ๋วที่ผู้บริหารจะเอาไปอ้างต่อ
  const MIN_MONTH_N = 5;
  const firstMonth = monthly[0];
  const lastMonth = monthly[monthly.length - 1];
  const monthlyDelta =
    monthly.length >= 2 &&
    firstMonth.count >= MIN_MONTH_N &&
    lastMonth.count >= MIN_MONTH_N
      ? pct(lastMonth.risk, lastMonth.count) - pct(firstMonth.risk, firstMonth.count)
      : null;
  const monthlyTooSmall =
    monthly.length >= 2 &&
    (firstMonth.count < MIN_MONTH_N || lastMonth.count < MIN_MONTH_N);

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

      {/* Monthly trend — the "before vs after" evidence */}
      <Card className="p-5">
        <h2 className="text-[0.95rem] font-semibold text-ink">แนวโน้มรายเดือน (เทียบก่อน–หลัง)</h2>
        <p className="mt-0.5 text-[0.76rem] text-ink-soft">
          สัดส่วนผลระดับ &ldquo;ควรดูแลขึ้นไป&rdquo; ต่อเดือน — ใช้ติดตามว่าภาพรวมดีขึ้นหรือไม่หลังเริ่มใช้งาน
        </p>
        {!mounted ? (
          <p className="py-4 text-[0.84rem] text-ink-mute">กำลังโหลด…</p>
        ) : monthly.length === 0 ? (
          <p className="py-4 text-[0.84rem] text-ink-mute">ยังไม่มีข้อมูล</p>
        ) : (
          <>
            {monthlyDelta !== null && (
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
                {firstMonth.label}: {pct(firstMonth.risk, firstMonth.count)}% → {lastMonth.label}:{" "}
                {pct(lastMonth.risk, lastMonth.count)}%
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
            {monthly.length === 1 && (
              <p className="mt-3 text-[0.78rem] text-ink-mute">
                ยังมีข้อมูลเดือนเดียว — เมื่อเข้าเดือนถัดไปจะเริ่มเทียบก่อน-หลังให้อัตโนมัติ
              </p>
            )}
            <div className="mt-3 flex flex-col gap-2.5">
              {monthly.map((m) => {
                const riskPct = pct(m.risk, m.count);
                return (
                  <div
                    key={m.key}
                    className="grid items-center gap-3"
                    style={{ gridTemplateColumns: "90px 1fr 110px" }}
                  >
                    <span className="text-[0.82rem] text-ink">{m.label}</span>
                    <span className="h-4 overflow-hidden rounded bg-neutral-100">
                      <span
                        className="block h-full rounded"
                        style={{
                          width: `${riskPct}%`,
                          background:
                            riskPct >= 40 ? "#dc2626" : riskPct >= 20 ? "#f97316" : "#16a34a",
                        }}
                      />
                    </span>
                    <span className="text-right text-[0.78rem] text-ink-soft">
                      <span className="font-semibold text-ink">{riskPct}%</span> · {m.count} ครั้ง
                    </span>
                  </div>
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
