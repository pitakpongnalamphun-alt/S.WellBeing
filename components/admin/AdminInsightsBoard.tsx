"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlarmClock,
  ClipboardList,
  CloudRain,
  Lock,
  Siren,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import {
  buildAiPayload,
  computeSignals,
  INSIGHT_LEVEL_META,
  INSIGHT_LEVEL_ORDER,
  moodTrend14,
  overallLevel,
  type AiPayload,
  type InsightLevel,
  type MoodTrendDay,
  type Signal,
} from "@/lib/insights/signals";
import { useInsightsStore, type AiInsight } from "@/lib/store/useInsightsStore";
import { useMoodStatsStore } from "@/lib/store/useMoodStatsStore";
import { useAssessmentStore } from "@/lib/store/useAssessmentStore";
import { useCasesStore } from "@/lib/store/useCasesStore";
import { useSosStore } from "@/lib/store/useSosStore";
import { cn } from "@/lib/utils";

const COOLDOWN_MS = 60 * 60 * 1000;

const SIGNAL_ICON: Record<Signal["id"], LucideIcon> = {
  mood_spike: CloudRain,
  assessment_severity: ClipboardList,
  category_spike: TrendingUp,
  sos_zone_repeat: Siren,
  sos_false_alarms: TriangleAlert,
  sla_overdue: AlarmClock,
};

const ERROR_MSG: Record<string, string> = {
  no_key:
    "ยังไม่ได้ตั้งค่า OPENROUTER_API_KEY ฝั่งเซิร์ฟเวอร์ — สัญญาณพื้นฐานด้านล่างยังทำงานตามปกติ",
  ai_failed: "AI ตอบกลับไม่สำเร็จ ลองอีกครั้งได้เลย (สัญญาณพื้นฐานยังแสดงตามปกติ)",
  bad_response: "AI ตอบกลับไม่สำเร็จ ลองอีกครั้งได้เลย (สัญญาณพื้นฐานยังแสดงตามปกติ)",
  default: "เชื่อมต่อไม่ได้ ลองใหม่อีกครั้ง (สัญญาณพื้นฐานยังแสดงตามปกติ)",
};

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export function AdminInsightsBoard() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(0);
  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    // Tick like AdminCasesBoard: keeps the cooldown counting down and lets a
    // case that crosses its SLA while the page is open fire the urgent signal.
    const t = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const moods = useMoodStatsStore((s) => s.records);
  const assessments = useAssessmentStore((s) => s.records);
  const cases = useCasesStore((s) => s.cases);
  const anonymous = useCasesStore((s) => s.anonymous);
  const alerts = useSosStore((s) => s.alerts);
  const last = useInsightsStore((s) => s.last);
  const save = useInsightsStore((s) => s.save);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const computed = useMemo(() => {
    if (!now) return null;
    const inp = { moods, assessments, cases, anonymous, alerts, now };
    const signals = computeSignals(inp);
    return {
      signals,
      payload: buildAiPayload(inp, signals),
      trend: moodTrend14(moods, now),
      ruleLevel: overallLevel(signals),
    };
  }, [moods, assessments, cases, anonymous, alerts, now]);

  if (!mounted || !computed) {
    return (
      <div className="mx-auto max-w-5xl">
        <p className="py-12 text-center text-[0.88rem] text-ink-mute">กำลังโหลด…</p>
      </div>
    );
  }

  const { signals, payload, trend, ruleLevel } = computed;

  // The cached record is persisted client-side, so treat its shape as data,
  // not gospel: a corrupted/older record must degrade, never crash the page
  // or brick the button.
  const aiSummary = typeof last?.summary === "string" ? last.summary : "";
  const aiConnections = Array.isArray(last?.connections)
    ? last.connections.filter((c): c is string => typeof c === "string")
    : [];
  const aiRecommendations = Array.isArray(last?.recommendations)
    ? last.recommendations.filter((r): r is string => typeof r === "string")
    : [];
  const lastAtMs = last ? Date.parse(last.at) : NaN;
  const lastAtValid = Number.isFinite(lastAtMs);

  // Never under-report: if the cached AI verdict is milder than what the live
  // rules see right now, the banner takes the worse of the two.
  const levelIdx = Math.max(
    INSIGHT_LEVEL_ORDER.indexOf(ruleLevel),
    last ? INSIGHT_LEVEL_ORDER.indexOf(last.level) : 0,
  );
  const bannerLevel: InsightLevel = INSIGHT_LEVEL_ORDER[levelIdx];
  const bannerMeta = INSIGHT_LEVEL_META[bannerLevel];

  // Invalid timestamp → no cooldown (the next successful run rewrites it);
  // clock skew (future at) is clamped so the wait can never exceed one hour.
  const sinceLast = lastAtValid ? Math.max(0, now - lastAtMs) : Infinity;
  const coolLeftMin = Math.max(0, Math.ceil((COOLDOWN_MS - sinceLast) / 60000));
  const canRun = !aiLoading && coolLeftMin === 0;

  async function runAi() {
    if (!payload || !canRun) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as
        | (AiInsight & { error?: string })
        | null;
      if (!res.ok || !data || data.error || !data.level) {
        setAiError(ERROR_MSG[data?.error ?? "default"] ?? ERROR_MSG.default);
        return;
      }
      save(data);
      // Re-anchor the clock so the cooldown counts from this run, not from mount.
      setNow(Date.now());
    } catch {
      setAiError(ERROR_MSG.default);
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display th:leading-snug text-[1.6rem] font-bold text-ink">
            AI วิเคราะห์แนวโน้มสุขภาพจิต
          </h1>
          <p className="mt-1 text-[0.88rem] text-ink-soft">
            ภาพรวมทั้งโรงเรียนจากข้อมูลรวมนิรนาม — ไม่ระบุตัวบุคคล และไม่ใช่การวินิจฉัย
          </p>
        </div>
        <div className="text-right">
          <button
            type="button"
            onClick={runAi}
            disabled={!canRun}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[0.86rem] font-medium transition",
              canRun
                ? "bg-mint-700 text-white hover:bg-mint-600"
                : "cursor-not-allowed bg-neutral-100 text-ink-mute",
            )}
          >
            <Sparkles className="size-4" aria-hidden="true" />
            {aiLoading
              ? "กำลังวิเคราะห์…"
              : coolLeftMin > 0
                ? `วิเคราะห์ได้อีกใน ${coolLeftMin} นาที`
                : "วิเคราะห์ด้วย AI"}
          </button>
          {last && lastAtValid && (
            <p className="mt-1.5 text-[0.7rem] text-ink-mute">
              วิเคราะห์ล่าสุด {fmtTime(last.at)} น.
            </p>
          )}
        </div>
      </header>

      {aiError && (
        <Card className="border-l-4 border-l-amber-400 p-4">
          <p className="text-[0.84rem] text-ink-soft">{aiError}</p>
        </Card>
      )}

      {/* Overall level + summary */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.78rem] font-bold ring-1",
              bannerMeta.tint,
            )}
          >
            <span className={cn("size-1.5 rounded-full", bannerMeta.dot)} />
            ระดับ: {bannerMeta.label}
          </span>
          <span className="text-[0.74rem] text-ink-mute">
            {last && aiSummary
              ? `สรุปโดย AI${lastAtValid ? ` · ${fmtTime(last.at)} น.` : ""}`
              : "สรุปจากสัญญาณพื้นฐาน (ยังไม่ได้รัน AI)"}
          </span>
        </div>
        <p className="mt-3 text-[0.9rem] leading-relaxed text-ink">
          {aiSummary
            ? aiSummary
            : signals.length === 0
              ? "ไม่พบสัญญาณผิดปกติในสัปดาห์นี้ ระบบยังเฝ้าดูต่อเนื่องทุกวัน"
              : `ระบบตรวจพบ ${signals.length} สัญญาณที่ควรติดตามในสัปดาห์นี้ — รายละเอียดอยู่ในการ์ดด้านล่าง กด "วิเคราะห์ด้วย AI" เพื่อให้ช่วยสรุปและเสนอมาตรการ`}
        </p>
      </Card>

      {/* Signal cards */}
      {signals.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-[0.9rem] font-medium text-ink">ไม่พบสัญญาณผิดปกติ</p>
          <p className="mt-1 text-[0.82rem] text-ink-soft">
            เมื่อสัญญาณใดเข้าเกณฑ์ (อารมณ์ลบพุ่ง ผลประเมินรุนแรง เหตุซ้ำจุดเดิม ฯลฯ) การ์ดจะปรากฏที่นี่
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {signals.map((s) => {
            const meta = INSIGHT_LEVEL_META[s.level];
            const Icon = SIGNAL_ICON[s.id];
            return (
              <Card key={s.id} className="p-4">
                <div className="flex items-center gap-2">
                  <Icon className="size-[1.15rem] shrink-0 text-ink-mute" aria-hidden="true" />
                  <h2 className="min-w-0 flex-1 text-[0.9rem] font-semibold text-ink">
                    {s.title}
                  </h2>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium ring-1",
                      meta.tint,
                    )}
                  >
                    {meta.label}
                  </span>
                </div>
                <p className="mt-2 text-[0.82rem] leading-relaxed text-ink-soft">{s.evidence}</p>
                <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink">
                  <span className="text-ink-mute">เสนอ:</span> {s.suggestion}
                </p>
                <p className="mt-2 text-[0.7rem] text-ink-mute">จาก: {s.source}</p>
              </Card>
            );
          })}
        </div>
      )}

      {/* AI narrative details */}
      {last && (aiConnections.length > 0 || aiRecommendations.length > 0) && (
        <Card className="p-5">
          <h2 className="flex items-center gap-1.5 text-[0.95rem] font-semibold text-ink">
            <Sparkles className="size-4 text-mint-600" aria-hidden="true" />
            มุมมองจาก AI
          </h2>
          {aiConnections.length > 0 && (
            <div className="mt-3">
              <p className="text-[0.78rem] font-medium text-ink-mute">
                การเชื่อมโยงที่ AI ตั้งข้อสังเกต (เป็นสมมติฐาน — โปรดใช้วิจารณญาณ)
              </p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[0.84rem] leading-relaxed text-ink-soft">
                {aiConnections.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          )}
          {aiRecommendations.length > 0 && (
            <div className="mt-3">
              <p className="text-[0.78rem] font-medium text-ink-mute">มาตรการระดับโรงเรียนที่เสนอ</p>
              <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-[0.84rem] leading-relaxed text-ink">
                {aiRecommendations.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ol>
            </div>
          )}
          <p className="mt-3 text-[0.68rem] text-ink-mute">
            โมเดล: {last.model ?? "—"} · ผลนี้เป็นคำแนะนำประกอบการตัดสินใจ ไม่ใช่ข้อวินิจฉัย
          </p>
        </Card>
      )}

      {/* 14-day mood trend */}
      <Card className="p-5">
        <h2 className="text-[0.95rem] font-semibold text-ink">
          เช็คอินอารมณ์ 14 วันล่าสุด
        </h2>
        <p className="mt-0.5 text-[0.76rem] text-ink-soft">
          ความสูง = จำนวนเช็คอินของวันนั้น · ส่วนสีชมพู = สัดส่วนอารมณ์ไม่สบายใจ
          {payload.mood.checkins7 < 5 && " · ข้อมูลสัปดาห์นี้ยังน้อย สัญญาณอาจแกว่ง"}
        </p>
        <TrendBars trend={trend} />
      </Card>

      {/* Transparency + human-in-the-loop */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="p-4">
          <p className="flex items-center gap-1.5 text-[0.84rem] font-semibold text-ink">
            <Lock className="size-3.5 text-mint-600" aria-hidden="true" />
            ข้อมูลที่ส่งให้ AI
          </p>
          <p className="mt-1.5 text-[0.78rem] leading-relaxed text-ink-soft">
            ตัวเลขรวมรายสัปดาห์เท่านั้น — ไม่มีชื่อ ไม่มีข้อความเหตุการณ์
            ไม่มีสิ่งที่ระบุตัวนักเรียนได้
          </p>
          <details className="mt-2">
            <summary className="cursor-pointer text-[0.74rem] font-medium text-mint-700 hover:underline">
              ดูข้อมูลทั้งหมดที่จะถูกส่ง
            </summary>
            <pre className="mt-2 max-h-64 overflow-auto rounded-xl bg-neutral-50 p-3 text-[0.68rem] leading-relaxed text-ink-soft">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </details>
        </Card>
        <Card className="p-4">
          <p className="flex items-center gap-1.5 text-[0.84rem] font-semibold text-ink">
            <UserCheck className="size-3.5 text-mint-600" aria-hidden="true" />
            ครูตัดสินใจเสมอ
          </p>
          <p className="mt-1.5 text-[0.78rem] leading-relaxed text-ink-soft">
            AI ชี้สัญญาณและเสนอแนะเท่านั้น ไม่วินิจฉัยและไม่ระบุตัวบุคคล —
            ถ้า AI ใช้งานไม่ได้ สัญญาณพื้นฐานในหน้านี้ยังคำนวณจากกติกาที่ตรวจสอบได้เสมอ
          </p>
        </Card>
      </div>
    </div>
  );
}

function TrendBars({ trend }: { trend: MoodTrendDay[] }) {
  const max = Math.max(1, ...trend.map((d) => d.total));
  return (
    <>
      <div className="mt-4 flex h-28 items-end gap-1.5">
        {trend.map((d) => {
          const h = (d.total / max) * 100;
          const negH = d.total > 0 ? (d.neg / d.total) * 100 : 0;
          return (
            <div
              key={d.day}
              className="flex flex-1 flex-col justify-end"
              title={`${d.day} · ${d.total} ครั้ง (ไม่สบายใจ ${d.neg})`}
            >
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
  );
}

export default AdminInsightsBoard;
