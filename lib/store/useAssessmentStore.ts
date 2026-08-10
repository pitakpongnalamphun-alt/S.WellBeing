import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Aggregate statistics for the self-assessment tools (2Q / 9Q / 8Q / ST-5 /
 * GAD-7 / PHQ-A). One record per completed session, tagged with the WORST
 * severity reached anywhere in the routed flow (a 9Q "รุนแรง" that routes to a
 * clean 8Q must land as the 9Q record — the crisis must not be laundered into
 * a safe-looking 8Q row by the last test taken).
 *
 * Deliberately ANONYMOUS: a mental-health result is private, so we store only
 * {assessment, score, severity, time} — never who took it. The admin sees
 * distributions and counts (how many, how severe, which tool), not individuals.
 * Identifying an at-risk student for follow-up would need a separate, consented
 * flow — this store is statistics only.
 */

export type AssessAction = "safe" | "monitor" | "warning" | "emergency";

export type AssessRecord = {
  id: string;
  at: string; // ISO
  assessmentId: string; // "2Q" | "9Q" | "8Q" | "ST-5" | "GAD-7" | "PHQ-A"
  score: number;
  action: AssessAction; // severity band
};

export const ASSESS_ACTION_ORDER: AssessAction[] = [
  "safe",
  "monitor",
  "warning",
  "emergency",
];

export const ASSESS_ACTION_META: Record<
  AssessAction,
  { label: string; bar: string; tint: string; dot: string }
> = {
  safe: { label: "ปกติ", bar: "#16a34a", tint: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  monitor: { label: "เฝ้าระวัง", bar: "#eab308", tint: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-400" },
  warning: { label: "ควรดูแล", bar: "#f97316", tint: "bg-orange-50 text-orange-700 ring-orange-200", dot: "bg-orange-500" },
  emergency: { label: "เร่งด่วน", bar: "#dc2626", tint: "bg-rose-50 text-rose-700 ring-rose-200", dot: "bg-rose-500" },
};

type AssessState = {
  records: AssessRecord[];
  record: (r: { assessmentId: string; score: number; action: AssessAction }) => void;
};

export const useAssessmentStore = create<AssessState>()(
  persist(
    (set) => ({
      records: [],
      record: (r) =>
        set((s) => ({
          records: [
            {
              ...r,
              id: `as-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
              at: new Date().toISOString(),
            },
            ...s.records,
          ],
        })),
    }),
    {
      name: "swb.assessments",
      partialize: (s) => ({ records: s.records }),
    },
  ),
);
