"use client";

import { useCallback, useState } from "react";
import { ChevronLeft } from "lucide-react";

import { BurnoutRescueGame } from "@/components/BurnoutRescueGame";
import { DareToSayNoGame } from "@/components/DareToSayNoGame";
import { ExamEveGame } from "@/components/ExamEveGame";
import { HeartbreakCareGame } from "@/components/HeartbreakCareGame";
import { HeavyHopesGame } from "@/components/HeavyHopesGame";
import { InnerCheerGame } from "@/components/InnerCheerGame";
import { LifeSkillGame, SCENARIO_IDS } from "@/components/LifeSkillGame";
import { LifeSkillGameHub } from "@/components/LifeSkillGameHub";
import { MirrorHeartGame } from "@/components/MirrorHeartGame";
import { ParentTranslatorGame } from "@/components/ParentTranslatorGame";
import { RedFlagScanner } from "@/components/RedFlagScanner";
import { REWARDS, useGachaStore } from "@/lib/store/useGachaStore";
import { localDay } from "@/lib/date";

/**
 * ลานละเล่น: the Map-of-Growth hub is the front door; picking a playable game
 * launches it, and "กลับแผนที่" returns to the map. Game ids come from the hub —
 * scenario ids run in the LifeSkillGame engine, the rest are standalone games.
 */
const STANDALONE_GAMES = new Set([
  "red-flag-scanner",
  "mirror-heart",
  "inner-cheer",
  "parent-translator",
  "heavy-hopes",
  "burnout-rescue",
  "exam-eve",
  "heartbreak-care",
  "dare-to-say-no",
]);

export default function GamesPage() {
  const earn = useGachaStore((s) => s.earn);
  // null = showing the hub; otherwise the id of the game being played.
  const [playing, setPlaying] = useState<string | null>(null);

  // Finishing any game pays out once per day — enough to reward the practice
  // without turning it into a coin farm (the old scaffold flagged this).
  const handleComplete = useCallback(() => {
    earn(REWARDS.gameRound, `game:${localDay()}`);
  }, [earn]);

  const handlePlay = useCallback((gameId: string) => {
    if (STANDALONE_GAMES.has(gameId) || SCENARIO_IDS.includes(gameId)) {
      setPlaying(gameId);
    }
  }, []);

  if (playing === null) {
    return (
      <div className="py-2">
        <LifeSkillGameHub onPlay={handlePlay} />
      </div>
    );
  }

  const scenarioIndex = SCENARIO_IDS.indexOf(playing);

  return (
    <div className="flex flex-1 flex-col py-2">
      <button
        type="button"
        onClick={() => setPlaying(null)}
        className="mb-2 inline-flex items-center gap-1 self-start rounded-full px-3 py-1.5 text-[0.82rem] font-medium text-ink-soft ring-1 ring-neutral-200 transition hover:text-ink"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        กลับแผนที่
      </button>
      <div className="flex flex-1 flex-col justify-center">
        {playing === "red-flag-scanner" ? (
          <RedFlagScanner onComplete={handleComplete} />
        ) : playing === "mirror-heart" ? (
          <MirrorHeartGame onComplete={handleComplete} />
        ) : playing === "inner-cheer" ? (
          <InnerCheerGame onComplete={handleComplete} />
        ) : playing === "parent-translator" ? (
          <ParentTranslatorGame onComplete={handleComplete} />
        ) : playing === "heavy-hopes" ? (
          <HeavyHopesGame onComplete={handleComplete} />
        ) : playing === "burnout-rescue" ? (
          <BurnoutRescueGame onComplete={handleComplete} />
        ) : playing === "exam-eve" ? (
          <ExamEveGame onComplete={handleComplete} />
        ) : playing === "heartbreak-care" ? (
          <HeartbreakCareGame onComplete={handleComplete} />
        ) : playing === "dare-to-say-no" ? (
          <DareToSayNoGame onComplete={handleComplete} />
        ) : (
          <LifeSkillGame
            key={playing}
            startEpisode={Math.max(0, scenarioIndex)}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
}
