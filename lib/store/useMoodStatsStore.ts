import { create } from "zustand";
import { persist } from "zustand/middleware";

import { localDay } from "@/lib/date";

/**
 * Anonymous, aggregate mood signal for the school dashboard. One record per
 * daily check-in: {core emotion, tertiary "root" feeling, time} — and nothing
 * else. No student identity, no device link, no free text.
 *
 * The individual mood diary (the sticker book) stays private on the student's
 * device; this store keeps only de-identified data points so staff can read the
 * school's emotional climate in aggregate — never who felt what. Same privacy
 * shape as the anonymous reports and the assessment statistics.
 */

export type MoodRecord = {
  id: string;
  at: string; // ISO
  core: string; // CoreKey: yellow/purple/green/orange/red/gray/blue
  tertiary: string; // the specific root feeling, e.g. "โดดเดี่ยว"
};

type MoodStatsState = {
  records: MoodRecord[];
  /** Local day of the last recorded check-in — one record per day, matching the reward. */
  lastRecordedDay: string | null;
  record: (r: { core: string; tertiary: string }) => void;
};

export const useMoodStatsStore = create<MoodStatsState>()(
  persist(
    (set) => ({
      records: [],
      lastRecordedDay: null,
      record: (r) =>
        set((s) => {
          // Re-checking-in the same day must not inflate the aggregate — the coin
          // reward is already once-per-day, so the record is too.
          const today = localDay();
          if (s.lastRecordedDay === today) return {};
          return {
            lastRecordedDay: today,
            records: [
              {
                ...r,
                id: `md-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
                at: new Date().toISOString(),
              },
              ...s.records,
            ],
          };
        }),
    }),
    {
      name: "swb.moodstats",
      partialize: (s) => ({ records: s.records, lastRecordedDay: s.lastRecordedDay }),
    },
  ),
);
