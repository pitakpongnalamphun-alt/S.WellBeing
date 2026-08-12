"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Coins, Flame } from "lucide-react";

import { DailyMoodPet } from "@/components/DailyMoodPet";
import { MonthlyMoodStickerBook } from "@/components/MonthlyMoodStickerBook";
import { CloudHugsGalaxy } from "@/components/CloudHugsGalaxy";
import type { CoreKey } from "@/data/emotionWheel";
import { useGachaStore } from "@/lib/store/useGachaStore";
import { useMoodDiaryStore } from "@/lib/store/useMoodDiaryStore";
import { useMoodStatsStore } from "@/lib/store/useMoodStatsStore";
import { useUserStore } from "@/lib/store/useUserStore";

type Tab = "today" | "book" | "galaxy";
type Reward = { earned: number; streak: number; streakBonus: boolean };

export default function MoodPage() {
  return (
    <Suspense fallback={null}>
      <MoodPageInner />
    </Suspense>
  );
}

function MoodPageInner() {
  // Deep-link support: "ของฉัน" links here with ?tab=book to land on the
  // sticker-book history rather than today's check-in.
  const params = useSearchParams();
  const initialTab: Tab =
    params.get("tab") === "book"
      ? "book"
      : params.get("tab") === "galaxy"
        ? "galaxy"
        : "today";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [reward, setReward] = useState<Reward | null>(null);
  const dailyMoodCheckIn = useGachaStore((s) => s.dailyMoodCheckIn);
  const recordMood = useMoodStatsStore((s) => s.record);
  const recordDiary = useMoodDiaryStore((s) => s.record);
  const owner = useUserStore((s) => s.profile?.studentId);

  // Saving today's feeling pays coins + advances the daily streak (with a 7-day
  // bonus), then shows the sticker book. The individual entry stays private in
  // the sticker book; only an anonymous {core, tertiary} data point is recorded
  // for the school's aggregate mood statistics — never who felt what.
  const handleSave = useCallback(
    (entry: { core: string; secondary: string; tertiary: string }) => {
      // สมุดส่วนตัว: เขียนทุกครั้ง (เช็คอินซ้ำในวันเดียวกัน = เปลี่ยนใจ ทับดวงเดิม)
      recordDiary({
        core: entry.core as CoreKey,
        secondary: entry.secondary,
        tertiary: entry.tertiary,
        owner,
      });
      // สถิติโรงเรียน: นับครั้งแรกของวันเท่านั้น ตัวเลขรวมจะได้ไม่เฟ้อ
      recordMood({ core: entry.core, tertiary: entry.tertiary });
      const result = dailyMoodCheckIn();
      if (result.earned > 0) setReward(result);
      setTab("book");
    },
    [dailyMoodCheckIn, recordMood, recordDiary, owner],
  );

  // Auto-dismiss the little reward note.
  useEffect(() => {
    if (!reward) return;
    const t = setTimeout(() => setReward(null), 3200);
    return () => clearTimeout(t);
  }, [reward]);

  return (
    <div className="flex flex-1 flex-col gap-4 py-2">
      {/* Tab switcher */}
      <div className="mx-auto flex w-full max-w-md rounded-full bg-slate-100 p-1 text-sm font-semibold">
        {(
          [
            ["today", "วันนี้"],
            ["book", "สมุดสะสม"],
            ["galaxy", "กาแล็กซีกอด"],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 rounded-full py-2 transition ${
              tab === id ? "bg-white text-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "today" ? (
        <DailyMoodPet onSave={handleSave} onReleaseCloud={() => setTab("galaxy")} />
      ) : tab === "book" ? (
        <MonthlyMoodStickerBook />
      ) : (
        <CloudHugsGalaxy />
      )}

      {/* Reward toast */}
      <AnimatePresence>
        {reward && (
          <motion.div
            className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
            role="status"
            aria-live="polite"
          >
            <div className="flex flex-col items-center gap-1.5 rounded-3xl bg-white/95 px-6 py-3.5 text-center shadow-lg ring-1 ring-amber-100 backdrop-blur">
              <span className="inline-flex items-center gap-1.5 text-base font-bold text-amber-600">
                <Coins className="h-5 w-5" />
                +{reward.earned} เหรียญดาว
              </span>
              {reward.streakBonus ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-500">
                  <Flame className="h-3.5 w-3.5" />
                  ครบ {reward.streak} วันติด! โบนัสพิเศษ +50 🎉
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                  <Flame className="h-3.5 w-3.5 text-orange-300" />
                  มาต่อเนื่อง {reward.streak} วันแล้ว เก่งมาก 💛
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
