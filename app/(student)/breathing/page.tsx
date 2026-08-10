"use client";

import { useCallback } from "react";

import { BoxBreathing } from "@/components/BoxBreathing";
import { REWARDS, useGachaStore } from "@/lib/store/useGachaStore";
import { localDay } from "@/lib/date";

export default function BreathingPage() {
  const earn = useGachaStore((s) => s.earn);

  // Reward a completed session — the store dedupes on this key, so it pays out
  // once per day at most.
  const handleSessionComplete = useCallback(() => {
    earn(
      REWARDS.breathingSession,
      `breathing:${localDay()}`,
    );
  }, [earn]);

  return (
    <div className="flex flex-1 flex-col justify-center py-2">
      <BoxBreathing onSessionComplete={handleSessionComplete} />
    </div>
  );
}
