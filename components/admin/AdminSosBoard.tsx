"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BellOff,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  HandHeart,
  MapPin,
  Siren,
  Undo2,
  User,
  X,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { setSosSoundEnabled, sosSoundEnabled } from "@/components/data/SosSiren";
import { downloadCsv } from "@/lib/csv";
import { daysInMonth, localDay, monthKey, monthLabel, shiftMonth } from "@/lib/date";
import {
  isFalseAlarm,
  SOS_OUTCOME_META,
  SOS_OUTCOME_ORDER,
  useSosStore,
  type SosAlert,
  type SosStatus,
} from "@/lib/store/useSosStore";
import { useStaffSession } from "@/lib/store/useStaffSessionStore";
import { cn } from "@/lib/utils";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const fmt = (iso: string) =>
  new Date(iso).toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

type StatusFilter = "all" | SosStatus;

/**
 * เส้นอ้างอิงแนวนอนของกราฟแท่ง
 *
 * ตอนค่าสูงสุดน้อย ๆ (เช่น 1) การหาร 3 ระดับจะได้ "1 / 1 / 0" ซึ่งอ่านแล้วเหมือน
 * กราฟพัง — จึงตัดค่าที่ซ้ำกันออก เหลือเท่าที่บอกอะไรได้จริง
 */
function gridTicks(max: number): number[] {
  return [...new Set([0, 0.5, 1].map((f) => Math.round(max * f)))];
}

export function AdminSosBoard() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(0);
  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const alerts = useSosStore((s) => s.alerts);
  const resolve = useSosStore((s) => s.resolve);
  const acknowledge = useSosStore((s) => s.acknowledge);
  // ชื่อที่จะไปโผล่ฝั่งนักเรียนว่า "ใครกำลังมา" — ต้องเป็นคนจริง ไม่ใช่ "เจ้าหน้าที่" ลอย ๆ
  const staffName = useStaffSession()?.name ?? "เจ้าหน้าที่";

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  // อ่านค่าหลัง mount เท่านั้น — ค่าอยู่ใน localStorage ซึ่งฝั่งเซิร์ฟเวอร์ไม่มี
  const [soundOn, setSoundOn] = useState(true);
  useEffect(() => setSoundOn(sosSoundEnabled()), []);
  const [zoneFilter, setZoneFilter] = useState<string>("all");
  // เดือนที่กำลังดูอยู่ (null = ยังไม่ mount ห้ามอ่านนาฬิกาก่อนหน้าจอพร้อม)
  const [month, setMonth] = useState<string | null>(null);
  useEffect(() => setMonth(monthKey(new Date())), []);
  // The alert whose "ปิดเหตุ" was clicked — its row shows the outcome picker.
  const [closingId, setClosingId] = useState<string | null>(null);
  const [visible, setVisible] = useState(10);
  useEffect(() => setVisible(10), [statusFilter, zoneFilter]);

  const activeCount = alerts.filter((a) => a.status === "active").length;
  const resolvedCount = alerts.filter((a) => a.status === "resolved").length;
  const weekCount = alerts.filter(
    (a) => a.status !== "cancelled" && now - new Date(a.createdAt).getTime() < WEEK_MS,
  ).length;
  const falseCount = alerts.filter((a) => isFalseAlarm(a.outcome)).length;

  /**
   * สรุปรายเดือน — เข้าชุดกับหน้าวิเคราะห์อารมณ์และสถิติประเมินใจ
   *
   * ตัวเลขที่ฝั่ง SOS ต่างจากหน้าอื่นคือ "เวลากว่าจะมีคนกดรับเรื่อง" ซึ่งเป็นตัวชี้วัด
   * เดียวในหน้านี้ที่วัดการทำงานของผู้ใหญ่ ไม่ใช่วัดพฤติกรรมของนักเรียน — เหตุที่กด
   * แล้วไม่มีใครกดรับเลยคือสิ่งที่ต้องเห็น ไม่ใช่ค่าที่ปล่อยให้จมอยู่ในรายการ
   *
   * เหตุที่ผู้แจ้งยกเลิกเองและเหตุที่ครูตัดสินว่ากดผิด ไม่นับเป็น "เหตุจริง" แต่ยัง
   * แสดงแยกไว้ เพราะจำนวนการกดผิดที่เยอะผิดปกติก็เป็นสัญญาณของอย่างอื่น
   */
  const monthly = useMemo(() => {
    if (!month) return null;

    const real = (a: SosAlert) => a.status !== "cancelled" && !isFalseAlarm(a.outcome);

    const byMonth = new Map<string, { real: number; noise: number }>();
    const byDay = new Map<string, { real: number; noise: number }>();
    const zoneOfMonth = new Map<string, number>();
    let ackCount = 0;
    let ackMs = 0;
    let neverAck = 0;

    for (const a of alerts) {
      const day = localDay(new Date(a.createdAt));
      const mk = day.slice(0, 7);
      const isReal = real(a);

      const m = byMonth.get(mk) ?? { real: 0, noise: 0 };
      if (isReal) m.real += 1;
      else m.noise += 1;
      byMonth.set(mk, m);

      if (mk === month) {
        const d = byDay.get(day) ?? { real: 0, noise: 0 };
        if (isReal) d.real += 1;
        else d.noise += 1;
        byDay.set(day, d);

        if (isReal) {
          zoneOfMonth.set(a.place.th, (zoneOfMonth.get(a.place.th) ?? 0) + 1);
          if (a.acknowledgedAt) {
            ackCount += 1;
            ackMs +=
              new Date(a.acknowledgedAt).getTime() - new Date(a.createdAt).getTime();
          } else if (a.status !== "active") {
            // ปิดไปแล้วโดยไม่มีใครกดรับเรื่องเลย = ไม่มีสัญญาณกลับไปหาคนที่กด
            neverAck += 1;
          }
        }
      }
    }

    const days: { day: string; dom: number; real: number; noise: number; total: number }[] = [];
    for (let i = 1; i <= daysInMonth(month); i += 1) {
      const day = `${month}-${String(i).padStart(2, "0")}`;
      const d = byDay.get(day) ?? { real: 0, noise: 0 };
      days.push({ day, dom: i, real: d.real, noise: d.noise, total: d.real + d.noise });
    }

    const series: { key: string; real: number; noise: number; total: number }[] = [];
    for (let i = 5; i >= 0; i -= 1) {
      const key = shiftMonth(month, -i);
      const v = byMonth.get(key) ?? { real: 0, noise: 0 };
      series.push({ key, real: v.real, noise: v.noise, total: v.real + v.noise });
    }

    const cur = byMonth.get(month) ?? { real: 0, noise: 0 };
    const prevKey = shiftMonth(month, -1);
    const prev = byMonth.get(prevKey) ?? { real: 0, noise: 0 };

    const oldest = alerts.length
      ? alerts.reduce(
          (min, a) => {
            const mk = localDay(new Date(a.createdAt)).slice(0, 7);
            return mk < min ? mk : min;
          },
          monthKey(new Date()),
        )
      : monthKey(new Date());

    return {
      days,
      dayMax: Math.max(1, ...days.map((d) => d.total)),
      cur,
      prev,
      prevKey,
      series,
      seriesMax: Math.max(1, ...series.map((m) => m.total)),
      topZones: [...zoneOfMonth.entries()]
        .map(([th, n]) => ({ th, n }))
        .sort((a, b) => b.n - a.n)
        .slice(0, 4),
      ackAvgMin: ackCount > 0 ? Math.round(ackMs / ackCount / 60000) : null,
      ackCount,
      neverAck,
      canPrev: month > oldest,
      canNext: month < monthKey(new Date()),
    };
  }, [alerts, month]);

  // Aggregate by zone — the "ดูตามโซน" view. Most active first, then busiest.
  // Self-cancelled presses are not incidents, so they don't heat up a zone.
  const byZone = useMemo(() => {
    const m = new Map<string, { th: string; total: number; active: number }>();
    for (const a of alerts) {
      if (a.status === "cancelled") continue;
      const cur = m.get(a.place.th) ?? { th: a.place.th, total: 0, active: 0 };
      cur.total += 1;
      if (a.status === "active") cur.active += 1;
      m.set(a.place.th, cur);
    }
    return [...m.values()].sort((x, y) => y.active - x.active || y.total - x.total);
  }, [alerts]);
  const maxTotal = byZone.reduce((mx, z) => Math.max(mx, z.total), 1);

  // History — active first, then newest.
  const shown = useMemo(() => {
    return alerts
      .filter((a) => statusFilter === "all" || a.status === statusFilter)
      .filter((a) => zoneFilter === "all" || a.place.th === zoneFilter)
      .slice()
      .sort(
        (a, b) =>
          (a.status === "active" ? 0 : 1) - (b.status === "active" ? 0 : 1) ||
          b.createdAt.localeCompare(a.createdAt),
      );
  }, [alerts, statusFilter, zoneFilter]);

  const statusTabs: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "ทั้งหมด" },
    { id: "active", label: "กำลังเกิดเหตุ" },
    { id: "resolved", label: "ปิดแล้ว" },
    { id: "cancelled", label: "ผู้แจ้งยกเลิกเอง" },
  ];

  const tiles = [
    { label: "กำลังเกิดเหตุ", value: activeCount, cls: "text-risk-high", sub: "" },
    { label: "ปิดแล้ว", value: resolvedCount, cls: "text-mint-700", sub: "" },
    { label: "สัปดาห์นี้", value: weekCount, cls: "text-ink", sub: "ไม่นับที่ยกเลิกเอง" },
    {
      label: "กดผิด/กดเล่น",
      value: falseCount,
      cls: falseCount > 0 ? "text-amber-600" : "text-ink",
      sub: resolvedCount > 0 ? `${Math.round((falseCount / resolvedCount) * 100)}% ของที่ปิดแล้ว` : "",
    },
  ];
  const show = (n: number) => (mounted ? n : "—");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display th:leading-snug text-[1.6rem] font-bold text-ink">
            แจ้งเหตุฉุกเฉิน · SOS
          </h1>
          <p className="mt-1 text-[0.88rem] text-ink-soft">
            เหตุที่นักเรียนกดขอความช่วยเหลือด่วน — ประวัติ ดูตามโซน และปิดเหตุ
          </p>
        </div>

        {/*
          ปิดเสียงได้ เพราะห้องพักครูมีทั้งประชุมและคาบสอน แต่ค่าตั้งต้นคือเปิด —
          เหตุฉุกเฉินควรดังก่อน แล้วค่อยให้คนปิดเมื่อจำเป็น ไม่ใช่กลับกัน
        */}
        <button
          type="button"
          onClick={() => {
            const next = !soundOn;
            setSoundOn(next);
            setSosSoundEnabled(next);
          }}
          aria-pressed={soundOn}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-[0.82rem] font-medium ring-1 transition-colors",
            soundOn
              ? "bg-rose-50 text-rose-700 ring-rose-200 hover:bg-rose-100"
              : "bg-neutral-50 text-ink-mute ring-neutral-200 hover:text-ink",
          )}
        >
          {soundOn ? (
            <Bell className="size-4" aria-hidden="true" />
          ) : (
            <BellOff className="size-4" aria-hidden="true" />
          )}
          {soundOn ? "เสียงแจ้งเตือน: เปิด" : "เสียงแจ้งเตือน: ปิด"}
        </button>
      </header>

      {/*
        พูดข้อจำกัดออกมาตรง ๆ ดีกว่าปล่อยให้ครูเชื่อว่าจะดังเสมอแล้วพลาดเหตุจริง
      */}
      <p className="-mt-3 text-[0.76rem] leading-relaxed text-ink-mute">
        เสียงจะดังเมื่อมีเหตุใหม่เข้ามาขณะเปิดหน้านี้ค้างไว้ (ช้าได้ถึง 15 วินาทีตามรอบดึงข้อมูล)
        — เบราว์เซอร์จะยอมให้เล่นเสียงหลังจากคลิกบนหน้านี้ครั้งแรกแล้ว และจะไม่มีเสียงถ้าปิดแท็บทิ้ง
      </p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map(({ label, value, cls, sub }) => (
          <Card key={label} className="p-4">
            <p className="text-[0.78rem] text-ink-mute">{label}</p>
            <p className={cn("mt-1.5 text-[1.6rem] font-bold tabular-nums", cls)}>
              {show(value)}
            </p>
            <p className="mt-0.5 min-h-4 text-[0.7rem] text-ink-mute">{mounted ? sub : ""}</p>
          </Card>
        ))}
      </div>

      {/* ---------------------------------------------------- สรุปรายเดือน */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[0.95rem] font-semibold text-ink">สรุปรายเดือน</h2>
            <p className="mt-0.5 text-[0.76rem] text-ink-soft">
              จำนวนเหตุรายวันตลอดเดือน — แถบสีแดงคือเหตุจริง สีเทาคือที่ยกเลิกเองหรือกดผิด
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
                  label: "เหตุจริงเดือนนี้",
                  value: String(monthly.cur.real),
                  sub: `ยกเลิกเอง/กดผิด ${monthly.cur.noise} ครั้ง`,
                },
                {
                  label: `เทียบ ${monthLabel(monthly.prevKey)}`,
                  value:
                    monthly.prev.real === 0 && monthly.cur.real === 0
                      ? "—"
                      : `${monthly.cur.real - monthly.prev.real > 0 ? "+" : ""}${monthly.cur.real - monthly.prev.real}`,
                  sub: `เดือนก่อน ${monthly.prev.real} ครั้ง`,
                  warn: monthly.cur.real > monthly.prev.real,
                },
                {
                  label: "เฉลี่ยกว่าจะมีคนรับเรื่อง",
                  value:
                    monthly.ackAvgMin === null ? "—" : `${monthly.ackAvgMin} นาที`,
                  sub:
                    monthly.ackAvgMin === null
                      ? "ยังไม่มีเหตุที่ถูกกดรับ"
                      : `จาก ${monthly.ackCount} เหตุ`,
                  warn: monthly.ackAvgMin !== null && monthly.ackAvgMin > 10,
                },
                {
                  label: "ปิดโดยไม่มีใครกดรับ",
                  value: String(monthly.neverAck),
                  sub: "คนกดไม่เคยรู้ว่ามีคนเห็น",
                  warn: monthly.neverAck > 0,
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

            {monthly.cur.real + monthly.cur.noise === 0 ? (
              <p className="py-8 text-center text-[0.84rem] text-ink-mute">
                เดือนนี้ไม่มีการแจ้งเหตุ
              </p>
            ) : (
              <>
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
                        title={`${d.dom} ${monthLabel(month!)} · เหตุจริง ${d.real} · ยกเลิก/กดผิด ${d.noise}`}
                      >
                        <div
                          className="absolute inset-x-0 bottom-0 overflow-hidden rounded-t bg-slate-300"
                          style={{
                            height: `${(d.total / monthly.dayMax) * 100}%`,
                            minHeight: d.total > 0 ? 3 : 0,
                          }}
                        >
                          <div
                            className="absolute inset-x-0 bottom-0 bg-rose-500"
                            style={{ height: d.total > 0 ? `${(d.real / d.total) * 100}%` : 0 }}
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
                    <span className="size-2.5 rounded-sm bg-rose-500" /> เหตุจริง
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-sm bg-slate-300" /> ยกเลิกเอง / กดผิด
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      downloadCsv(`sos-${month}.csv`, [
                        ["วันที่", "เหตุจริง", "ยกเลิกเอง/กดผิด", "รวม"],
                        ...monthly.days.map((d) => [d.day, d.real, d.noise, d.total]),
                      ])
                    }
                    className="ml-auto flex items-center gap-1.5 rounded-lg px-2 py-1 text-ink-mute transition-colors hover:text-ink"
                  >
                    <Download className="size-3.5" aria-hidden="true" />
                    ดาวน์โหลด CSV
                  </button>
                </div>

                {monthly.topZones.length > 0 && (
                  <div className="mt-5 border-t border-neutral-100 pt-4">
                    <h3 className="text-[0.84rem] font-semibold text-ink">
                      จุดที่เกิดเหตุจริงบ่อยที่สุดในเดือนนี้
                    </h3>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {monthly.topZones.map((z) => (
                        <span
                          key={z.th}
                          className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-[0.8rem] text-rose-700 ring-1 ring-rose-100"
                        >
                          <MapPin className="size-3.5" aria-hidden="true" />
                          {z.th}
                          <span className="font-bold tabular-nums">{z.n}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </Card>

      {/* ------------------------------------------- เทียบย้อนหลัง 6 เดือน */}
      <Card className="p-5">
        <h2 className="text-[0.95rem] font-semibold text-ink">เทียบย้อนหลัง 6 เดือน</h2>
        <p className="mt-0.5 text-[0.76rem] text-ink-soft">
          ความสูงคือจำนวนการแจ้งทั้งหมด ส่วนสีแดงคือเหตุจริง — กดที่แท่งเพื่อดูเดือนนั้น
        </p>
        {!mounted || !monthly ? (
          <p className="py-4 text-[0.84rem] text-ink-mute">กำลังโหลด…</p>
        ) : (
          <div className="mt-5 flex h-44 items-end gap-3">
            {monthly.series.map((m) => {
              const h = (m.total / monthly.seriesMax) * 100;
              const realH = m.total > 0 ? (m.real / m.total) * 100 : 0;
              const isCurrent = m.key === month;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMonth(m.key)}
                  title={`${monthLabel(m.key, true)} · เหตุจริง ${m.real} · ยกเลิก/กดผิด ${m.noise}`}
                  className="flex h-full flex-1 flex-col justify-end gap-1.5 rounded-lg p-1 transition-colors hover:bg-neutral-50"
                >
                  <span className="text-center text-[0.72rem] font-semibold tabular-nums text-ink-soft">
                    {m.total > 0 ? m.real : "—"}
                  </span>
                  <span
                    className="relative w-full overflow-hidden rounded-t bg-slate-300"
                    style={{ height: `${Math.max(h, m.total > 0 ? 4 : 1)}%` }}
                  >
                    <span
                      className="absolute inset-x-0 bottom-0 bg-rose-500"
                      style={{ height: `${realH}%` }}
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
                  {/* ตัวเลขบนหัวแท่งคือ "เหตุจริง" — ถ้าไม่บอกยอดรวมด้วย เดือนที่มีแต่
                      การกดผิดจะขึ้นเลข 0 บนแท่งสูง ๆ ซึ่งอ่านแล้วงง */}
                  <span className="text-center text-[0.66rem] tabular-nums text-ink-mute">
                    {m.total > 0 ? `จาก ${m.total} ครั้ง` : "ไม่มี"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {/* ดูตามโซน */}
      <Card className="p-5">
        <h2 className="flex items-center gap-1.5 text-[0.95rem] font-semibold text-ink">
          <MapPin className="size-4 text-ink-mute" aria-hidden="true" />
          ตามโซน
        </h2>
        {!mounted ? (
          <p className="py-4 text-[0.84rem] text-ink-mute">กำลังโหลด…</p>
        ) : byZone.length === 0 ? (
          <p className="py-4 text-[0.84rem] text-ink-mute">ยังไม่มีข้อมูล</p>
        ) : (
          <ul className="mt-3 space-y-2.5">
            {byZone.map((z) => (
              <li key={z.th}>
                <button
                  type="button"
                  onClick={() => setZoneFilter(z.th === zoneFilter ? "all" : z.th)}
                  className="w-full text-left"
                  aria-pressed={zoneFilter === z.th}
                >
                  <div className="flex items-baseline justify-between gap-2 text-[0.82rem]">
                    <span
                      className={cn(
                        "font-medium",
                        zoneFilter === z.th ? "text-mint-700" : "text-ink",
                      )}
                    >
                      {z.th}
                    </span>
                    <span className="text-ink-mute">
                      {z.active > 0 && (
                        <span className="font-semibold text-risk-high">{z.active} เกิดเหตุ · </span>
                      )}
                      {z.total} ครั้ง
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        z.active > 0 ? "bg-risk-high/70" : "bg-mint-400/70",
                      )}
                      style={{ width: `${Math.round((z.total / maxTotal) * 100)}%` }}
                    />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* ประวัติ */}
      <div className="flex flex-wrap items-center gap-2">
        {statusTabs.map(({ id, label }) => {
          const active = statusFilter === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setStatusFilter(id)}
              aria-pressed={active}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[0.82rem] font-medium ring-1 transition",
                active
                  ? "bg-ink text-white ring-ink"
                  : "bg-white text-ink-soft ring-neutral-200 hover:text-ink",
              )}
            >
              {label}
            </button>
          );
        })}
        {zoneFilter !== "all" && (
          <button
            type="button"
            onClick={() => setZoneFilter("all")}
            className="ml-auto inline-flex items-center gap-1 rounded-full bg-mint-50 px-3 py-1.5 text-[0.78rem] font-medium text-mint-700 ring-1 ring-mint-200"
          >
            โซน: {zoneFilter} ✕
          </button>
        )}
      </div>

      {!mounted ? (
        <p className="py-12 text-center text-[0.88rem] text-ink-mute">กำลังโหลด…</p>
      ) : shown.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-[0.9rem] font-medium text-ink">
            {alerts.length === 0 ? "ยังไม่มีการแจ้ง SOS" : "ไม่มีเหตุตามเงื่อนไขนี้"}
          </p>
          <p className="mt-1 text-[0.82rem] text-ink-soft">
            เมื่อนักเรียนกดขอความช่วยเหลือด่วน (ในเวลาเรียน) เหตุจะปรากฏที่นี่
          </p>
        </Card>
      ) : (
        <ul className="space-y-2">
          {shown.slice(0, visible).map((a) => {
            const active = a.status === "active";
            const cancelled = a.status === "cancelled";
            const closing = closingId === a.id;
            return (
              <li
                key={a.id}
                className={cn(
                  "rounded-2xl p-3.5 ring-1",
                  active
                    ? "bg-risk-high-bg ring-risk-high/30"
                    : cancelled
                      ? "bg-neutral-50 ring-neutral-200 opacity-75"
                      : "bg-white ring-neutral-200",
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl",
                      active ? "bg-risk-high text-white" : "bg-neutral-100 text-ink-mute",
                    )}
                  >
                    {cancelled ? (
                      <Undo2 className="size-4" aria-hidden="true" />
                    ) : (
                      <Siren
                        className={cn("size-4", active && "animate-pulse")}
                        aria-hidden="true"
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.88rem] font-medium text-ink">
                      📍 {a.place.th}
                    </span>
                    {/* Reporter first, then time — "who" is what a responder
                        scans for. No profile name → say so, not silence. */}
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[0.74rem] text-ink-mute">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 font-medium",
                          a.name ? "text-ink-soft" : "text-ink-mute",
                        )}
                      >
                        <User className="size-3" aria-hidden="true" />
                        {a.name || "ไม่ระบุชื่อ"}
                      </span>
                      · {fmt(a.createdAt)}
                    </span>
                    {a.acknowledgedAt ? (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-[0.72rem] font-medium text-risk-high ring-1 ring-risk-high/25">
                        <HandHeart className="size-3" aria-hidden="true" />
                        {a.acknowledgedBy ?? "เจ้าหน้าที่"} รับเรื่องแล้ว · {fmt(a.acknowledgedAt)}
                      </span>
                    ) : null}
                  </span>

                  {/* รับเรื่อง — บอกคนที่กดปุ่มฉุกเฉินว่ามีคนเห็นแล้วและกำลังไป
                      โดยที่เหตุยังเปิดอยู่ (คนละเรื่องกับปิดเหตุ) */}
                  {active && !closing && !a.acknowledgedAt && (
                    <button
                      type="button"
                      onClick={() => acknowledge(a.id, staffName)}
                      className="shrink-0 rounded-lg bg-risk-high px-3 py-1.5 text-[0.78rem] font-semibold text-white transition hover:opacity-90"
                    >
                      รับเรื่อง
                    </button>
                  )}
                  {active && !closing && (
                    <button
                      type="button"
                      onClick={() => setClosingId(a.id)}
                      className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-[0.78rem] font-medium text-risk-high ring-1 ring-risk-high/30 transition hover:bg-risk-high hover:text-white"
                    >
                      ปิดเหตุ
                    </button>
                  )}
                  {cancelled && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-[0.72rem] font-medium text-ink-mute">
                      <Undo2 className="size-3" aria-hidden="true" /> ผู้แจ้งยกเลิกเอง
                    </span>
                  )}
                  {a.status === "resolved" &&
                    (a.outcome ? (
                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[0.72rem] font-medium ring-1",
                          SOS_OUTCOME_META[a.outcome].tint,
                        )}
                      >
                        <Check className="size-3" aria-hidden="true" />
                        {SOS_OUTCOME_META[a.outcome].label}
                      </span>
                    ) : (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-mint-50 px-2.5 py-1 text-[0.72rem] font-medium text-mint-700 ring-1 ring-mint-200">
                        <Check className="size-3" aria-hidden="true" /> ปิดแล้ว
                      </span>
                    ))}
                </div>

                {/* Close-with-outcome: what actually happened becomes data. */}
                {active && closing && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-risk-high/10 pt-3">
                    <span className="mr-1 text-[0.74rem] font-medium text-ink-soft">
                      ปิดเหตุ — สรุปว่าเป็น:
                    </span>
                    {SOS_OUTCOME_ORDER.map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => {
                          resolve(a.id, o);
                          setClosingId(null);
                        }}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-[0.74rem] font-medium ring-1 transition hover:opacity-80",
                          SOS_OUTCOME_META[o].tint,
                        )}
                      >
                        {SOS_OUTCOME_META[o].label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setClosingId(null)}
                      aria-label="ยกเลิกการปิดเหตุ"
                      className="ml-auto grid size-7 place-items-center rounded-lg text-ink-mute transition hover:bg-white hover:text-ink"
                    >
                      <X className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
          {shown.length > visible && (
            <li>
              <button
                type="button"
                onClick={() => setVisible((v) => v + 10)}
                className="mx-auto block rounded-full bg-white px-5 py-2.5 text-[0.84rem] font-medium text-ink-soft ring-1 ring-neutral-200 transition hover:text-ink hover:ring-neutral-300"
              >
                แสดงเพิ่ม (เหลืออีก {shown.length - visible} เหตุ)
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export default AdminSosBoard;
