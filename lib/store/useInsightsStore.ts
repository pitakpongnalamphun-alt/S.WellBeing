import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { InsightLevel } from "@/lib/insights/signals";

/**
 * Cache of the last AI analysis so the insights page shows something at once
 * and the free-tier model isn't called on every visit. One record, overwritten
 * per run; the 1-hour cooldown is enforced by the page against `at`.
 */

export type AiInsight = {
  at: string; // ISO — when the analysis ran
  level: InsightLevel;
  summary: string;
  connections: string[];
  recommendations: string[];
  model?: string;
};

type InsightsState = {
  last: AiInsight | null;
  save: (r: AiInsight) => void;
};

export const useInsightsStore = create<InsightsState>()(
  persist(
    (set) => ({
      last: null,
      save: (r) => set({ last: r }),
    }),
    {
      name: "swb.insights",
      partialize: (s) => ({ last: s.last }),
    },
  ),
);
