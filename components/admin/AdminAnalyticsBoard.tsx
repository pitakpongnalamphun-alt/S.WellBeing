"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Download, MapPin, Siren, TriangleAlert } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { useCasesStore } from "@/lib/store/useCasesStore";
import { isFalseAlarm, useSosStore } from "@/lib/store/useSosStore";
import {
  OFF_MAP_LOCATIONS,
  SCHOOL_MAP_BY_NAME,
  SCHOOL_MAP_IMAGE,
  SCHOOL_MAP_MARKERS,
} from "@/data/schoolMap";
import { downloadCsv } from "@/lib/csv";
import { localDay } from "@/lib/date";
import { cn } from "@/lib/utils";

/* ============================================================================
   วิเคราะห์จุดเกิดเหตุ — where things happen, ranked so a duty roster can act
   on it. The risk score is a TRANSPARENT formula (SOS×3 + urgent×2 + case×1),
   printed right on the board — a ranking nobody can audit is just a vibe.
   Rows expand into per-location detail: what kinds of trouble, what time of
   day, and the latest incidents (category + time only — no student identity).
   ========================================================================== */

const CATS = [
  { id: "bully", label: "บูลลี่", full: "กลั่นแกล้ง / บูลลี่" },
  { id: "academic", label: "เรียน", full: "เครียดเรื่องเรียน" },
  { id: "family", label: "ครอบครัว", full: "ปัญหาครอบครัว" },
  { id: "unsafe", label: "ไม่ปลอดภัย", full: "รู้สึกไม่ปลอดภัย" },
  { id: "harassment", label: "คุกคาม", full: "คุกคามทางเพศ" },
  { id: "other", label: "อื่นๆ", full: "เรื่องอื่น ๆ" },
] as const;
const CAT_FULL: Record<string, string> = Object.fromEntries(
  CATS.map((c) => [c.id, c.full]),
);

/** Coral heat buckets by count. */
function heat(n: number): { bg: string; fg: string } | null {
  if (n <= 0) return null;
  if (n <= 2) return { bg: "#FAECE7", fg: "#712B13" };
  if (n <= 4) return { bg: "#F5C4B3", fg: "#712B13" };
  if (n <= 6) return { bg: "#F0997B", fg: "#4A1B0C" };
  return { bg: "#D85A30", fg: "#ffffff" };
}

const DAY_MS = 24 * 60 * 60 * 1000;
const SCORE_W = { sos: 3, urgent: 2, normal: 1 } as const;

type RangeId = "all" | "30d" | "7d";
const RANGES: { id: RangeId; label: string }[] = [
  { id: "all", label: "ทั้งหมด" },
  { id: "30d", label: "30 วัน" },
  { id: "7d", label: "7 วัน" },
];

/** เช้า (ก่อนเที่ยง) / บ่าย (เที่ยง–ห้าโมง) / นอกเวลา (หลังห้าโมง) */
const HOUR_BUCKETS = ["เช้า", "บ่าย", "หลังเลิกเรียน"] as const;
const hourBucket = (iso: string) => {
  const h = new Date(iso).getHours();
  return h < 12 ? 0 : h < 17 ? 1 : 2;
};

type LatestItem = { at: string; label: string; kind: "sos" | "urgent" | "case" };

type LocRow = {
  th: string;
  total: number;
  sos: number;
  urgent: number;
  normal: number;
  score: number;
  cats: Record<string, number>;
  hours: [number, number, number];
  /** last 7 days vs the 7 before (always computed on all data). */
  trend: number;
  latest: LatestItem[];
  offMap: boolean;
  /** SOS ruled กดผิด/กดเล่น here — disclosed, never scored. */
  falseAlarms: number;
};

const fmtWhen = (iso: string) =>
  new Date(iso).toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const RANK_TINT = [
  "bg-risk-high text-white",
  "bg-[#F0997B] text-[#4A1B0C]",
  "bg-amber-300 text-amber-900",
] as const;

export function AdminAnalyticsBoard() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(0);
  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(t);
  }, []);
  const [imgOk, setImgOk] = useState(true);
  const [range, setRange] = useState<RangeId>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const allCases = useCasesStore((s) => s.cases);
  // เคส "ขอรับการดูแล (ผลประเมินใจ)" คือคำขอความช่วยเหลือที่นักเรียนยินยอมส่งเอง
  // ไม่ใช่รายงานเหตุการณ์ — ไม่มีจุดเกิดเหตุและไม่ควรถูกนับเป็น "เรื่องที่แจ้ง"
  // ในหน้าวิเคราะห์นี้ (ยังเห็นเต็ม ๆ ในหน้าจัดการเคสตามปกติ)
  const cases = useMemo(
    () => allCases.filter((c) => c.categoryId !== "self-assessment"),
    [allCases],
  );
  const anonymous = useCasesStore((s) => s.anonymous);
  const allAlerts = useSosStore((s) => s.alerts);
  // Two classes of SOS press: incidents, and presses the school itself ruled
  // out — self-cancelled ("ฉันกดผิด") or staff-tagged กดผิด/กดเล่น. The ruled-out
  // group must never move a RISK ranking (same principle as the insights
  // engine: a zone can't be a hotspot on data staff ruled non-emergency), but
  // it is disclosed per location below so the exclusion stays auditable.
  const alerts = useMemo(
    () => allAlerts.filter((a) => a.status !== "cancelled" && !isFalseAlarm(a.outcome)),
    [allAlerts],
  );
  const falseAlarmAlerts = useMemo(
    () => allAlerts.filter((a) => a.status !== "cancelled" && isFalseAlarm(a.outcome)),
    [allAlerts],
  );

  const { rows, byName, catRank, catSum, totalIncidents, sosCount, grandTotal } = useMemo(() => {
    const rangeMs = range === "7d" ? 7 * DAY_MS : range === "30d" ? 30 * DAY_MS : Infinity;
    const inRange = (iso: string) => now - new Date(iso).getTime() <= rangeMs;

    const map = new Map<string, LocRow>();
    const bump = (th: string) => {
      let r = map.get(th);
      if (!r) {
        r = {
          th, total: 0, sos: 0, urgent: 0, normal: 0, score: 0,
          cats: {}, hours: [0, 0, 0], trend: 0, latest: [],
          offMap: OFF_MAP_LOCATIONS.has(th), falseAlarms: 0,
        };
        map.set(th, r);
      }
      return r;
    };

    for (const c of cases) {
      if (!c.location || !inRange(c.createdAt)) continue;
      const r = bump(c.location.th);
      r.total += 1;
      if (c.expectation === "urgent") r.urgent += 1;
      else r.normal += 1;
      r.cats[c.categoryId] = (r.cats[c.categoryId] ?? 0) + 1;
      r.hours[hourBucket(c.createdAt)] += 1;
      r.latest.push({
        at: c.createdAt,
        label: c.categoryLabel,
        kind: c.expectation === "urgent" ? "urgent" : "case",
      });
    }
    for (const a of alerts) {
      if (!inRange(a.createdAt)) continue;
      const r = bump(a.place.th);
      r.total += 1;
      r.sos += 1;
      r.hours[hourBucket(a.createdAt)] += 1;
      r.latest.push({ at: a.createdAt, label: "SOS", kind: "sos" });
    }
    // Disclosure only — annotate ranked locations, never create or score rows.
    for (const a of falseAlarmAlerts) {
      if (!inRange(a.createdAt)) continue;
      const r = map.get(a.place.th);
      if (r) r.falseAlarms += 1;
    }

    // Trend is week-over-week on ALL data — a 7-day range can't see its own
    // previous week, so the comparison must not depend on the filter.
    const trendCount = (th: string, from: number, to: number) => {
      let n = 0;
      for (const c of cases) {
        if (!c.location || c.location.th !== th) continue;
        const t = new Date(c.createdAt).getTime();
        if (t >= from && t < to) n += 1;
      }
      for (const a of alerts) {
        if (a.place.th !== th) continue;
        const t = new Date(a.createdAt).getTime();
        if (t >= from && t < to) n += 1;
      }
      return n;
    };

    for (const r of map.values()) {
      r.score = r.sos * SCORE_W.sos + r.urgent * SCORE_W.urgent + r.normal * SCORE_W.normal;
      r.trend = trendCount(r.th, now - 7 * DAY_MS, now + 1) - trendCount(r.th, now - 14 * DAY_MS, now - 7 * DAY_MS);
      r.latest.sort((a, b) => b.at.localeCompare(a.at));
      r.latest = r.latest.slice(0, 3);
    }

    const rows = [...map.values()].sort(
      (a, b) => b.score - a.score || b.total - a.total || a.th.localeCompare(b.th, "th"),
    );
    const byName: Record<string, LocRow> = Object.fromEntries(rows.map((r) => [r.th, r]));
    const grandTotal = rows.reduce((s, r) => s + r.total, 0);

    const catTotals: Record<string, number> = {};
    for (const c of cases) if (inRange(c.createdAt)) catTotals[c.categoryId] = (catTotals[c.categoryId] ?? 0) + 1;
    for (const a of anonymous) if (inRange(a.createdAt)) catTotals[a.categoryId] = (catTotals[a.categoryId] ?? 0) + 1;
    const catSum = Object.values(catTotals).reduce((s, n) => s + n, 0);
    const catRank = CATS.map((c) => ({ ...c, n: catTotals[c.id] ?? 0 }))
      .filter((c) => c.n > 0)
      .sort((a, b) => b.n - a.n || a.id.localeCompare(b.id))
      .map((c, i) => ({ ...c, rank: i + 1, pct: catSum > 0 ? Math.round((c.n / catSum) * 100) : 0 }));

    const totalIncidents =
      cases.filter((c) => inRange(c.createdAt)).length +
      anonymous.filter((a) => inRange(a.createdAt)).length +
      alerts.filter((a) => inRange(a.createdAt)).length;
    const sosCount = alerts.filter((a) => inRange(a.createdAt)).length;

    return { rows, byName, catRank, catSum, totalIncidents, sosCount, grandTotal };
  }, [cases, anonymous, alerts, falseAlarmAlerts, now, range]);

  const tiles = [
    { label: "เหตุทั้งหมด", value: String(totalIncidents), sub: "เคส + ไม่ระบุตัวตน + SOS" },
    {
      label: "จุดเสี่ยงอันดับ 1",
      value: rows[0]?.th ?? "—",
      sub: rows[0] ? `คะแนน ${rows[0].score} · ${rows[0].total} ครั้ง` : "ยังไม่มีข้อมูล",
      small: true,
    },
    {
      // Percent base disclosed inline — this tile's base (reported cases) is
      // NOT the same as the "เหตุทั้งหมด" tile (which also counts SOS).
      label: "เรื่องพบบ่อยสุด",
      value: catRank[0] ? catRank[0].full : "—",
      sub: catRank[0]
        ? `${catRank[0].n} จาก ${catSum} เรื่องที่แจ้ง (${catRank[0].pct}%)`
        : "ยังไม่มีข้อมูล",
      small: true,
    },
    { label: "SOS ฉุกเฉิน", value: String(sosCount), sub: "ไม่นับยกเลิกเอง · กดผิด/กดเล่น" },
  ];

  if (!mounted || !now) {
    return (
      <div className="mx-auto max-w-5xl">
        <p className="py-12 text-center text-[0.88rem] text-ink-mute">กำลังโหลด…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display th:leading-snug text-[1.6rem] font-bold text-ink">
            วิเคราะห์จุดเกิดเหตุ
          </h1>
          <p className="mt-1 text-[0.88rem] text-ink-soft">
            อาคารไหนเกิดเหตุกี่ครั้ง เรื่องอะไร ช่วงเวลาไหน — จัดอันดับจากเคสที่ระบุสถานที่และ SOS
          </p>
        </div>
        {/* period filter */}
        <div className="flex gap-1.5">
          {RANGES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setRange(id);
                // A row expanded under one range must not silently re-expand
                // when its location re-enters a later range's list.
                setExpanded(null);
              }}
              aria-pressed={range === id}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[0.8rem] font-medium ring-1 transition",
                range === id
                  ? "bg-ink text-white ring-ink"
                  : "bg-white text-ink-soft ring-neutral-200 hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label} className="p-4">
            <p className="text-[0.78rem] text-ink-mute">{t.label}</p>
            <p
              className={cn(
                "mt-1.5 font-bold text-ink",
                t.small ? "text-[0.95rem] leading-snug" : "text-[1.6rem] tabular-nums",
              )}
            >
              {t.value}
            </p>
            <p className="mt-0.5 text-[0.72rem] text-ink-mute">{t.sub}</p>
          </Card>
        ))}
      </div>

      {/* Map with hotspot markers */}
      <Card className="p-5">
        <h2 className="flex items-center gap-1.5 text-[0.95rem] font-semibold text-ink">
          <MapPin className="size-4 text-ink-mute" aria-hidden="true" />
          แผนที่จุดเกิดเหตุ
        </h2>
        <p className="mt-0.5 text-[0.76rem] text-ink-soft">
          จุดยิ่งใหญ่/เข้ม = เกิดเหตุที่อาคารนั้นบ่อย ({RANGES.find((r) => r.id === range)?.label})
        </p>

        <div
          className="relative mt-3 w-full overflow-hidden rounded-xl bg-neutral-100"
          style={{ aspectRatio: "2000 / 1414" }}
        >
          {imgOk ? (
            <Image
              src={SCHOOL_MAP_IMAGE}
              alt="แผนผังอาคารภายในโรงเรียน"
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 960px"
              onError={() => setImgOk(false)}
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center p-6 text-center">
              <p className="text-[0.84rem] leading-relaxed text-ink-mute">
                วางรูปแผนที่โรงเรียนไว้ที่{" "}
                <code className="rounded bg-white px-1 py-0.5 text-[0.78rem] text-ink">
                  public/assets/school-map.png
                </code>{" "}
                แล้วรีเฟรช — จุดเกิดเหตุจะขึ้นบนแผนที่
              </p>
            </div>
          )}

          {imgOk &&
            SCHOOL_MAP_MARKERS.map((m) => {
              const n = byName[m.th]?.total ?? 0;
              if (n <= 0) return null;
              const h = heat(n)!;
              const size = 18 + Math.min(n, 8) * 3;
              return (
                <span
                  key={m.th}
                  className="absolute flex items-center justify-center rounded-full font-bold ring-2 ring-white/80"
                  style={{
                    left: `${m.x}%`,
                    top: `${m.y}%`,
                    width: size,
                    height: size,
                    transform: "translate(-50%, -50%)",
                    background: h.bg,
                    color: h.fg,
                    fontSize: size >= 26 ? 12 : 10,
                  }}
                  title={`${m.th} · ${n} ครั้ง`}
                >
                  {n}
                </span>
              );
            })}
        </div>

        {/* legend */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[0.72rem] text-ink-mute">
          <span className="inline-flex items-center gap-1.5">
            น้อย
            <span className="size-3 rounded-full" style={{ background: "#FAECE7" }} />
            <span className="size-3.5 rounded-full" style={{ background: "#F5C4B3" }} />
            <span className="size-4 rounded-full" style={{ background: "#F0997B" }} />
            <span className="size-[18px] rounded-full" style={{ background: "#D85A30" }} />
            มาก
          </span>
        </div>
      </Card>

      {/* ═══════════════════ RANKED RISK BOARD ═══════════════════ */}
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[0.95rem] font-semibold text-ink">อันดับจุดเสี่ยง</h2>
          <button
            type="button"
            onClick={() =>
              rows.length > 0 &&
              downloadCsv(`hotspots-${localDay()}.csv`, [
                ["อันดับ", "สถานที่", "คะแนน", "SOS", "เคสด่วน", "เคสทั่วไป", "รวม", "สัดส่วน %", "กดผิด/กดเล่น (ไม่นับคะแนน)"],
                ...rows.map((r, i) => [
                  i + 1,
                  r.th,
                  r.score,
                  r.sos,
                  r.urgent,
                  r.normal,
                  r.total,
                  grandTotal > 0 ? Math.round((r.total / grandTotal) * 100) : 0,
                  r.falseAlarms,
                ]),
              ])
            }
            disabled={rows.length === 0}
            title="ส่งออกตารางอันดับตามช่วงเวลาปัจจุบัน (ข้อมูลรวม ไม่มีข้อมูลรายบุคคล)"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[0.8rem] font-medium text-ink-soft ring-1 ring-neutral-200 transition hover:text-ink hover:ring-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="size-3.5" aria-hidden="true" />
            ส่งออก CSV
          </button>
        </div>
        <p className="mt-0.5 text-[0.76rem] text-ink-soft">
          คะแนนความเสี่ยง = SOS ×{SCORE_W.sos} + เคสด่วน ×{SCORE_W.urgent} + เคสทั่วไป ×{SCORE_W.normal} ·
          ไม่นับ SOS ที่ยกเลิกเองหรือครูสรุปว่ากดผิด/กดเล่น (แสดงแยกในรายละเอียด) ·
          แนวโน้มเทียบ 7 วันก่อนหน้า · กดแถวเพื่อดูรายละเอียด
        </p>

        {rows.length === 0 ? (
          <p className="py-4 text-[0.84rem] text-ink-mute">ยังไม่มีเหตุที่ระบุสถานที่ในช่วงนี้</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {rows.map((r, i) => {
              const rank = i + 1;
              const open = expanded === r.th;
              const share = grandTotal > 0 ? Math.round((r.total / grandTotal) * 100) : 0;
              const topHour = r.hours.indexOf(Math.max(...r.hours));
              return (
                <li key={r.th} className="overflow-hidden rounded-2xl ring-1 ring-neutral-200">
                  <button
                    type="button"
                    onClick={() => setExpanded(open ? null : r.th)}
                    aria-expanded={open}
                    className={cn(
                      "flex w-full items-center gap-3 p-3.5 text-left transition",
                      open ? "bg-neutral-50" : "bg-white hover:bg-neutral-50",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-xl text-[0.85rem] font-bold tabular-nums",
                        rank <= 3 ? RANK_TINT[rank - 1] : "bg-neutral-100 text-ink-soft",
                      )}
                    >
                      {rank}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-[0.9rem] font-semibold text-ink">{r.th}</span>
                        {r.offMap && (
                          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[0.64rem] font-medium text-ink-mute">
                            นอกแผนที่
                          </span>
                        )}
                        {r.trend !== 0 && (
                          <span
                            className={cn(
                              "text-[0.72rem] font-bold",
                              r.trend > 0 ? "text-risk-high" : "text-mint-700",
                            )}
                          >
                            {r.trend > 0 ? `▲ +${r.trend}` : `▼ ${r.trend}`}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-[0.72rem] text-ink-mute">
                        รวม {r.total} ครั้ง ({share}%) — SOS {r.sos} · ด่วน {r.urgent} · ทั่วไป {r.normal}
                      </span>
                    </span>

                    <span className="shrink-0 text-right">
                      <span className="block text-[1.15rem] font-bold tabular-nums text-ink">
                        {r.score}
                      </span>
                      <span className="block text-[0.64rem] text-ink-mute">คะแนน</span>
                    </span>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-ink-mute transition-transform",
                        open && "rotate-180",
                      )}
                      aria-hidden="true"
                    />
                  </button>

                  {/* drill-down */}
                  {open && (
                    <div className="space-y-3 border-t border-neutral-100 bg-neutral-50 p-3.5">
                      {/* categories at this spot */}
                      {(Object.keys(r.cats).length > 0 || r.sos > 0 || r.falseAlarms > 0) && (
                        <div>
                          <p className="mb-1.5 text-[0.7rem] font-medium text-ink-mute">
                            เรื่องที่เกิดที่จุดนี้
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(r.cats)
                              .sort((a, b) => b[1] - a[1])
                              .map(([id, n]) => (
                                <span
                                  key={id}
                                  className="rounded-full bg-white px-2.5 py-1 text-[0.74rem] text-ink-soft ring-1 ring-neutral-200"
                                >
                                  {CAT_FULL[id] ?? id}{" "}
                                  <span className="font-bold text-ink">{n}</span>
                                </span>
                              ))}
                            {r.sos > 0 && (
                              <span className="rounded-full bg-risk-high-bg px-2.5 py-1 text-[0.74rem] font-medium text-risk-high ring-1 ring-risk-high/30">
                                SOS <span className="font-bold">{r.sos}</span>
                              </span>
                            )}
                            {/* the auditable exclusion — ruled-out presses, never scored */}
                            {r.falseAlarms > 0 && (
                              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[0.74rem] text-ink-mute ring-1 ring-neutral-200">
                                กดผิด/กดเล่น <span className="font-bold">{r.falseAlarms}</span> · ไม่นับคะแนน
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* time-of-day pattern */}
                      <div>
                        <p className="mb-1.5 text-[0.7rem] font-medium text-ink-mute">
                          ช่วงเวลาที่เกิด (เกิดบ่อยสุด: {HOUR_BUCKETS[topHour]})
                        </p>
                        <div className="flex gap-1.5">
                          {HOUR_BUCKETS.map((b, bi) => (
                            <span
                              key={b}
                              className={cn(
                                "rounded-full px-2.5 py-1 text-[0.72rem] ring-1",
                                bi === topHour && r.hours[bi] > 0
                                  ? "bg-amber-50 font-semibold text-amber-700 ring-amber-200"
                                  : "bg-white text-ink-mute ring-neutral-200",
                              )}
                            >
                              {b} {r.hours[bi]}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* latest incidents — category + time only, no identity */}
                      {r.latest.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-[0.7rem] font-medium text-ink-mute">
                            เหตุล่าสุด
                          </p>
                          <ul className="space-y-1">
                            {r.latest.map((l) => (
                              <li
                                key={`${l.at}-${l.label}`}
                                className="flex items-center gap-2 text-[0.76rem] text-ink-soft"
                              >
                                {l.kind === "sos" ? (
                                  <Siren className="size-3.5 shrink-0 text-risk-high" aria-hidden="true" />
                                ) : l.kind === "urgent" ? (
                                  <TriangleAlert className="size-3.5 shrink-0 text-amber-500" aria-hidden="true" />
                                ) : (
                                  <span className="size-1.5 shrink-0 rounded-full bg-neutral-300" />
                                )}
                                <span className="font-medium text-ink">{l.label}</span>
                                {l.kind === "urgent" && (
                                  <span className="rounded-full bg-risk-high-bg px-1.5 py-0.5 text-[0.62rem] font-bold text-risk-high">
                                    ด่วน
                                  </span>
                                )}
                                <span className="ml-auto text-ink-mute">{fmtWhen(l.at)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Location x category heatmap — top 8 by rank */}
      <Card className="p-5">
        <h2 className="text-[0.95rem] font-semibold text-ink">จุดเกิดเหตุ × ประเภทเรื่อง</h2>
        <p className="mt-0.5 text-[0.76rem] text-ink-soft">ช่องยิ่งเข้ม = เกิดเหตุประเภทนั้นที่จุดนั้นบ่อย</p>
        {rows.length === 0 ? (
          <p className="py-4 text-[0.84rem] text-ink-mute">ยังไม่มีข้อมูล</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <div
              className="grid min-w-[600px] items-center gap-1.5"
              style={{ gridTemplateColumns: `150px repeat(${CATS.length + 1}, 1fr)` }}
            >
              <span />
              {CATS.map((c) => (
                <span key={c.id} className="text-center text-[0.7rem] text-ink-soft">
                  {c.label}
                </span>
              ))}
              <span className="text-center text-[0.7rem] text-ink-soft">SOS</span>

              {rows.slice(0, 8).map((r) => (
                <HeatRow key={r.th} row={r} />
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Category ranking */}
      <Card className="p-5">
        <h2 className="text-[0.95rem] font-semibold text-ink">อันดับประเภทเรื่องทั้งโรงเรียน</h2>
        <p className="mt-0.5 text-[0.76rem] text-ink-soft">
          นับเคสระบุตัวตน + ไม่ระบุตัวตน (SOS แยกต่างหาก)
        </p>
        {catRank.length === 0 ? (
          <p className="py-4 text-[0.84rem] text-ink-mute">ยังไม่มีข้อมูล</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {catRank.map((c) => (
              <div
                key={c.id}
                className="grid items-center gap-3"
                style={{ gridTemplateColumns: "24px minmax(110px, 150px) 1fr 84px" }}
              >
                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-lg text-[0.72rem] font-bold tabular-nums",
                    c.rank <= 3 ? RANK_TINT[c.rank - 1] : "bg-neutral-100 text-ink-soft",
                  )}
                >
                  {c.rank}
                </span>
                <span className="truncate text-[0.82rem] text-ink">{c.full}</span>
                <span>
                  <span
                    className="block h-4 rounded"
                    style={{
                      width: `${Math.max(4, (c.n / Math.max(1, catRank[0].n)) * 100)}%`,
                      background: "#D85A30",
                    }}
                  />
                </span>
                <span className="text-right text-[0.8rem] text-ink-soft">
                  <span className="font-semibold text-ink">{c.n}</span> · {c.pct}%
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function HeatRow({ row }: { row: LocRow }) {
  const marker = SCHOOL_MAP_BY_NAME[row.th];
  return (
    <>
      <span className="truncate text-[0.78rem] text-ink" title={row.th}>
        {marker ? `${marker.no}. ` : ""}
        {row.th}
      </span>
      {CATS.map((c) => {
        const n = row.cats[c.id] ?? 0;
        const h = heat(n);
        return (
          <span
            key={c.id}
            className="flex h-8 items-center justify-center rounded-md text-[0.76rem] font-medium"
            style={
              h ? { background: h.bg, color: h.fg } : { background: "#f6f6f4", color: "#b4b2a9" }
            }
          >
            {n > 0 ? n : "–"}
          </span>
        );
      })}
      <span
        className="flex h-8 items-center justify-center rounded-md text-[0.76rem] font-medium"
        style={
          heat(row.sos)
            ? { background: heat(row.sos)!.bg, color: heat(row.sos)!.fg }
            : { background: "#f6f6f4", color: "#b4b2a9" }
        }
      >
        {row.sos > 0 ? row.sos : "–"}
      </span>
    </>
  );
}

export default AdminAnalyticsBoard;
