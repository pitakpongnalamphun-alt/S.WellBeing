import {
  isOpenStatus,
  slaState,
  type AnonReport,
  type SafeCase,
} from "@/lib/store/useCasesStore";
import type { AssessRecord } from "@/lib/store/useAssessmentStore";
import type { MoodRecord } from "@/lib/store/useMoodStatsStore";
import { isFalseAlarm, type SosAlert } from "@/lib/store/useSosStore";
import { localDay } from "@/lib/date";

/**
 * The rule-based signal engine behind the AI insights page. Every signal here
 * is a plain, checkable formula over the aggregate stores — no model, no
 * identity, no free text. The LLM layer (app/api/insights) only ever sees the
 * numbers this file computes, so "what did the AI know?" always has a concrete
 * answer: exactly `buildAiPayload()`.
 */

/** Shared severity scale — mirrors the assessment taxonomy the staff already read. */
export type InsightLevel = "ok" | "watch" | "attention" | "urgent";

export const INSIGHT_LEVEL_ORDER: InsightLevel[] = ["ok", "watch", "attention", "urgent"];

export const INSIGHT_LEVEL_META: Record<
  InsightLevel,
  { label: string; tint: string; dot: string }
> = {
  ok: { label: "ปกติ", tint: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  watch: { label: "เฝ้าระวัง", tint: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-400" },
  attention: { label: "ควรดูแล", tint: "bg-orange-50 text-orange-700 ring-orange-200", dot: "bg-orange-500" },
  urgent: { label: "เร่งด่วน", tint: "bg-rose-50 text-rose-700 ring-rose-200", dot: "bg-rose-500" },
};

export type Signal = {
  id:
    | "mood_spike"
    | "assessment_severity"
    | "category_spike"
    | "sos_zone_repeat"
    | "sos_false_alarms"
    | "sla_overdue";
  level: Exclude<InsightLevel, "ok">;
  title: string;
  /** The numbers behind the claim — always concrete, always reproducible. */
  evidence: string;
  /** A first sensible move, phrased as a suggestion, never an order. */
  suggestion: string;
  /** Where the data came from (and its anonymity guarantee). */
  source: string;
};

export type SignalInputs = {
  moods: MoodRecord[];
  assessments: AssessRecord[];
  cases: SafeCase[];
  anonymous: AnonReport[];
  alerts: SosAlert[];
  now: number;
};

/** Clearly-unpleasant cores — same set AdminMoodStats watches. */
const NEGATIVE_CORES = new Set(["green", "orange", "red", "gray", "blue"]);
const DAY_MS = 24 * 60 * 60 * 1000;
/** Below this many check-ins a ratio is noise, not a signal. */
const MOOD_MIN_N = 5;

const pct = (x: number) => `${Math.round(x * 100)}%`;
const inWindow = (iso: string, from: number, to: number) => {
  const t = new Date(iso).getTime();
  return t >= from && t < to;
};

export function computeSignals(inp: SignalInputs): Signal[] {
  const { moods, assessments, cases, anonymous, alerts, now } = inp;
  const w7 = now - 7 * DAY_MS;
  const w14 = now - 14 * DAY_MS;
  const signals: Signal[] = [];

  // 1 — mood spike (needs enough check-ins to mean anything)
  const mood7 = moods.filter((m) => inWindow(m.at, w7, now + 1));
  const moodPrev = moods.filter((m) => inWindow(m.at, w14, w7));
  const neg = (rs: MoodRecord[]) =>
    rs.length > 0 ? rs.filter((m) => NEGATIVE_CORES.has(m.core)).length / rs.length : 0;
  const neg7 = neg(mood7);
  const negPrev = neg(moodPrev);
  if (mood7.length >= MOOD_MIN_N) {
    // Only quote a week-over-week comparison when last week has enough data to
    // compare against — otherwise the "measured jump" would be fabricated.
    const prevComparable = moodPrev.length >= MOOD_MIN_N;
    const jumped = prevComparable && neg7 - negPrev >= 0.2;
    if (neg7 >= 0.5 || (jumped && neg7 >= 0.35)) {
      signals.push({
        id: "mood_spike",
        level: "attention",
        title: "อารมณ์เชิงลบสูงขึ้นชัดเจน",
        evidence: prevComparable
          ? `สัดส่วนอารมณ์ไม่สบายใจ ${pct(negPrev)} → ${pct(neg7)} (สัปดาห์ก่อน → สัปดาห์นี้) จากเช็คอิน ${mood7.length} ครั้ง`
          : `สัดส่วนอารมณ์ไม่สบายใจสัปดาห์นี้ ${pct(neg7)} จากเช็คอิน ${mood7.length} ครั้ง (สัปดาห์ก่อนข้อมูลไม่พอเปรียบเทียบ)`,
        suggestion: "พิจารณากิจกรรมผ่อนคลาย/พื้นที่รับฟังระดับชั้นในสัปดาห์นี้",
        source: "เช็คอินอารมณ์ (นิรนาม)",
      });
    } else if (neg7 >= 0.35) {
      signals.push({
        id: "mood_spike",
        level: "watch",
        title: "อารมณ์เชิงลบเกินเกณฑ์เฝ้าระวัง",
        evidence: `สัดส่วนอารมณ์ไม่สบายใจสัปดาห์นี้ ${pct(neg7)} (เกณฑ์ 35%) จากเช็คอิน ${mood7.length} ครั้ง`,
        suggestion: "ติดตามต่อเนื่องอีก 1 สัปดาห์ว่าแนวโน้มขึ้นหรือทรงตัว",
        source: "เช็คอินอารมณ์ (นิรนาม)",
      });
    }
  }

  // 2 — assessment severity
  const assess7 = assessments.filter((a) => inWindow(a.at, w7, now + 1));
  const emergency7 = assess7.filter((a) => a.action === "emergency").length;
  const warning7 = assess7.filter((a) => a.action === "warning").length;
  if (emergency7 >= 1) {
    signals.push({
      id: "assessment_severity",
      level: "urgent",
      title: "ผลประเมินเข้าเกณฑ์เร่งด่วน",
      evidence: `เข้าเกณฑ์เร่งด่วน ${emergency7} ครั้ง และระดับควรดูแล ${warning7} ครั้ง จากแบบประเมิน ${assess7.length} ครั้งในสัปดาห์นี้`,
      suggestion: "ทบทวนมาตรการดูแลเชิงรุกทั้งโรงเรียน และประชาสัมพันธ์ช่องทางขอความช่วยเหลือ",
      source: "แบบประเมินใจ (นิรนาม — ไม่ระบุว่าใครทำ)",
    });
  } else if (warning7 >= 3) {
    signals.push({
      id: "assessment_severity",
      level: "attention",
      title: "ผลประเมินระดับควรดูแลหลายราย",
      evidence: `ระดับควรดูแล ${warning7} ครั้ง จากแบบประเมิน ${assess7.length} ครั้งในสัปดาห์นี้`,
      suggestion: "เพิ่มการสื่อสารช่องทางนัดพูดคุย/คุยกับน้องปุย ให้เห็นง่ายขึ้น",
      source: "แบบประเมินใจ (นิรนาม)",
    });
  } else if (warning7 >= 1) {
    signals.push({
      id: "assessment_severity",
      level: "watch",
      title: "มีผลประเมินระดับควรดูแล",
      evidence: `ระดับควรดูแล ${warning7} ครั้ง จากแบบประเมิน ${assess7.length} ครั้งในสัปดาห์นี้`,
      suggestion: "ติดตามสัดส่วนระดับผลในสัปดาห์ถัดไป",
      source: "แบบประเมินใจ (นิรนาม)",
    });
  }

  // 3 — report-category spike (identified + anonymous, counted by category only)
  const catCount = (from: number, to: number) => {
    const m = new Map<string, number>();
    for (const c of cases) if (inWindow(c.createdAt, from, to)) m.set(c.categoryLabel, (m.get(c.categoryLabel) ?? 0) + 1);
    for (const a of anonymous) if (inWindow(a.createdAt, from, to)) m.set(a.categoryLabel, (m.get(a.categoryLabel) ?? 0) + 1);
    return m;
  };
  const cat7 = catCount(w7, now + 1);
  const catPrev = catCount(w14, w7);
  const spiking = [...cat7.entries()]
    .filter(([label, n]) => n >= 3 && n > (catPrev.get(label) ?? 0))
    .sort((a, b) => b[1] - a[1])[0];
  if (spiking) {
    const [label, n] = spiking;
    signals.push({
      id: "category_spike",
      level: n >= 5 ? "attention" : "watch",
      title: `เรื่อง "${label}" ถูกแจ้งถี่ขึ้น`,
      evidence: `${catPrev.get(label) ?? 0} → ${n} เรื่อง (สัปดาห์ก่อน → สัปดาห์นี้) นับรวมแจ้งแบบไม่ระบุตัวตน`,
      suggestion: "ทบทวนเคสหมวดนี้ที่ยังเปิดอยู่ร่วมกันในทีมแนะแนว",
      source: "แจ้งเหตุ (นับหมวด+เวลาเท่านั้น)",
    });
  }

  // 4 — repeated SOS from the same zone. Self-cancelled presses don't count,
  // and neither do alerts staff explicitly closed as กดผิด/กดเล่น — a zone must
  // not read as "urgent hotspot" from data staff already ruled non-emergency
  // (prank clustering is the sos_false_alarms signal's job, below).
  const sos14 = alerts.filter(
    (a) =>
      a.status !== "cancelled" &&
      !isFalseAlarm(a.outcome) &&
      inWindow(a.createdAt, w14, now + 1),
  );
  const zone = new Map<string, number>();
  for (const a of sos14) zone.set(a.place.th, (zone.get(a.place.th) ?? 0) + 1);
  const hotZone = [...zone.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1])[0];
  if (hotZone) {
    const [place, n] = hotZone;
    signals.push({
      id: "sos_zone_repeat",
      level: n >= 3 ? "urgent" : "attention",
      title: `จุดเสี่ยงซ้ำ: ${place}`,
      evidence: `SOS จากโซนเดียวกัน ${n} ครั้งใน 14 วัน`,
      suggestion: "เพิ่มการดูแลบริเวณนี้ช่วงพัก และติดตามว่าสัญญาณลดลงหรือไม่",
      source: "SOS ในเวลาเรียน (สถานที่+เวลา)",
    });
  }

  // 4b — SOS false-alarm cluster: pranks/accidents are never punished, but a
  // rising rate is a real signal that the button needs better norms/awareness.
  const falseAlarms14 = alerts.filter(
    (a) => isFalseAlarm(a.outcome) && inWindow(a.createdAt, w14, now + 1),
  ).length;
  if (falseAlarms14 >= 3) {
    signals.push({
      id: "sos_false_alarms",
      level: falseAlarms14 >= 6 ? "attention" : "watch",
      title: "กดผิด/กดเล่น SOS บ่อยขึ้น",
      evidence: `ครูสรุปเหตุเป็น "กดผิด/กดเล่น" ${falseAlarms14} ครั้งใน 14 วัน`,
      suggestion:
        "สื่อสารการใช้ปุ่ม SOS ให้ชัด (ทุกการกดมีครูไปจริง) และถ้าซ้ำจากจุด/ช่วงเวลาเดิม ให้ครูแนะแนวเข้าไปดูแลเชิงรุก — ไม่ใช่ลงโทษ",
      source: "ผลสรุปการปิดเหตุ SOS โดยครู",
    });
  }

  // 5 — unacknowledged cases past their SLA window
  const overdue = cases.filter(
    (c) => c.status === "pending" && slaState(c, now).state === "overdue",
  );
  if (overdue.length >= 1) {
    signals.push({
      id: "sla_overdue",
      level: "urgent",
      title: "เคสเกิน SLA ยังไม่มีผู้รับเรื่อง",
      evidence: `${overdue.length} เคสรอเกินเวลาที่สัญญากับนักเรียนไว้`,
      suggestion: "เข้าไปมอบหมายผู้รับผิดชอบในหน้าจัดการเคสทันที",
      source: "เคสแจ้งเหตุ (นับสถานะ ไม่อ่านเนื้อหา)",
    });
  }

  return signals;
}

/** Overall page level = the worst signal that fired. */
export function overallLevel(signals: Signal[]): InsightLevel {
  let worst = 0;
  for (const s of signals) worst = Math.max(worst, INSIGHT_LEVEL_ORDER.indexOf(s.level));
  return INSIGHT_LEVEL_ORDER[worst];
}

export type MoodTrendDay = { day: string; total: number; neg: number };

/** Last 14 days of check-in counts (total + negative share), oldest first. */
export function moodTrend14(moods: MoodRecord[], now: number): MoodTrendDay[] {
  const dayMap = new Map<string, { total: number; neg: number }>();
  for (const m of moods) {
    const day = localDay(new Date(m.at));
    const d = dayMap.get(day) ?? { total: 0, neg: 0 };
    d.total += 1;
    if (NEGATIVE_CORES.has(m.core)) d.neg += 1;
    dayMap.set(day, d);
  }
  // Step by CALENDAR days (setDate), not fixed 24h — a DST transition day is
  // 23/25h long, and fixed steps would duplicate or skip a local date there.
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const out: MoodTrendDay[] = [];
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const day = localDay(d);
    const v = dayMap.get(day) ?? { total: 0, neg: 0 };
    out.push({ day, total: v.total, neg: v.neg });
  }
  return out;
}

/**
 * EVERYTHING the AI is allowed to see — aggregate counts and the fired signals.
 * No names, no incident text, no per-student anything. The insights page shows
 * this exact object to staff, so the privacy claim is inspectable, not implied.
 */
export function buildAiPayload(inp: SignalInputs, signals: Signal[]) {
  const { moods, assessments, cases, anonymous, alerts, now } = inp;
  const w7 = now - 7 * DAY_MS;
  const w14 = now - 14 * DAY_MS;
  const r2 = (x: number) => Math.round(x * 100) / 100;

  const mood7 = moods.filter((m) => inWindow(m.at, w7, now + 1));
  const moodPrev = moods.filter((m) => inWindow(m.at, w14, w7));
  const negOf = (rs: MoodRecord[]) =>
    rs.length > 0 ? rs.filter((m) => NEGATIVE_CORES.has(m.core)).length / rs.length : 0;
  const topNegative = Object.entries(
    mood7
      .filter((m) => NEGATIVE_CORES.has(m.core))
      .reduce<Record<string, number>>((acc, m) => {
        acc[m.tertiary] = (acc[m.tertiary] ?? 0) + 1;
        return acc;
      }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label]) => label);

  const assess7 = assessments.filter((a) => inWindow(a.at, w7, now + 1));
  const byAction: Record<string, number> = { safe: 0, monitor: 0, warning: 0, emergency: 0 };
  for (const a of assess7) byAction[a.action] += 1;

  const reports7 = [
    ...cases.filter((c) => inWindow(c.createdAt, w7, now + 1)).map((c) => ({ cat: c.categoryLabel, urgent: c.expectation === "urgent", anon: false })),
    ...anonymous.filter((a) => inWindow(a.createdAt, w7, now + 1)).map((a) => ({ cat: a.categoryLabel, urgent: false, anon: true })),
  ];
  const reportsPrev =
    cases.filter((c) => inWindow(c.createdAt, w14, w7)).length +
    anonymous.filter((a) => inWindow(a.createdAt, w14, w7)).length;
  const byCategory: Record<string, number> = {};
  for (const r of reports7) byCategory[r.cat] = (byCategory[r.cat] ?? 0) + 1;

  // "Incidents" = not self-cancelled and not staff-ruled false alarms; the
  // false-alarm and cancelled tallies ride along as their own explicit fields
  // so the model reads a clean split instead of a polluted hotspot table.
  const sos14 = alerts.filter(
    (a) =>
      a.status !== "cancelled" &&
      !isFalseAlarm(a.outcome) &&
      inWindow(a.createdAt, w14, now + 1),
  );
  const byZone: Record<string, number> = {};
  for (const a of sos14) byZone[a.place.th] = (byZone[a.place.th] ?? 0) + 1;
  const falseAlarms14 = alerts.filter(
    (a) => isFalseAlarm(a.outcome) && inWindow(a.createdAt, w14, now + 1),
  ).length;
  const cancelled14 = alerts.filter(
    (a) => a.status === "cancelled" && inWindow(a.createdAt, w14, now + 1),
  ).length;

  return {
    window: "7 วันล่าสุด เทียบกับ 7 วันก่อนหน้า (SOS นับ 14 วัน)",
    mood: {
      checkins7: mood7.length,
      checkinsPrev7: moodPrev.length,
      negativeRatio7: r2(negOf(mood7)),
      negativeRatioPrev7: r2(negOf(moodPrev)),
      topNegativeFeelings: topNegative,
    },
    assessments7: { total: assess7.length, ...byAction },
    reports7: {
      total: reports7.length,
      prevTotal: reportsPrev,
      byCategory,
      urgentShare: r2(reports7.length ? reports7.filter((r) => r.urgent).length / reports7.length : 0),
      anonymousShare: r2(reports7.length ? reports7.filter((r) => r.anon).length / reports7.length : 0),
    },
    sos14: {
      total: sos14.length,
      byZone,
      falseAlarms: falseAlarms14,
      selfCancelled: cancelled14,
    },
    cases: {
      // Same definition every other board uses — followup is NOT an open case.
      open: cases.filter((c) => isOpenStatus(c.status)).length,
      overdueNow: cases.filter((c) => c.status === "pending" && slaState(c, now).state === "overdue").length,
    },
    firedSignals: signals.map((s) => ({ level: s.level, title: s.title, evidence: s.evidence })),
  };
}

export type AiPayload = ReturnType<typeof buildAiPayload>;
