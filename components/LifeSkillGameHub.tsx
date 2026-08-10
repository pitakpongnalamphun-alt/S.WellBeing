"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, Lock, Play, Sparkles } from "lucide-react";

import { FluffyMascot } from "@/components/FluffyMascot";
import { REWARDS, useGachaStore } from "@/lib/store/useGachaStore";
import { cn } from "@/lib/utils";

/* ============================================================================
   ลานละเล่น & ฝึกทักษะชีวิต — the "Map of Growth" (แผนที่เกาะแห่งการเติบโต).

   Five pastel islands, one per life area a teenager actually wrestles with.
   Tapping an island slides in its game list; games that exist launch through
   `onPlay`, the rest are visible-but-locked so the map already shows the whole
   world it will grow into. Finishing a round pays REWARDS.gameRound Star Coins
   (the badge quotes that constant — the UI never promises coins the economy
   doesn't pay).
   ========================================================================== */

type GameEntry = {
  /** Playable ids match the LifeSkillGame scenario ids. */
  id: string;
  title: string;
  blurb: string;
  playable?: boolean;
};

type IslandId = "academics" | "family" | "romance" | "social" | "self";

type Island = {
  id: IslandId;
  emoji: string;
  title: string;
  tagline: string;
  /** Pastel skin for the card + detail view. */
  bg: string;
  ring: string;
  ink: string;
  games: GameEntry[];
};

const ISLANDS: Island[] = [
  {
    id: "academics",
    emoji: "📚",
    title: "การเรียน",
    tagline: "เคล็ดลับรับมือเรื่องเรียน ความเครียดสอบ และไฟที่เริ่มมอด",
    bg: "bg-sky-50",
    ring: "ring-sky-200",
    ink: "text-sky-700",
    games: [
      {
        id: "effort-no-reward",
        title: "ตั้งใจแล้วแต่คะแนนไม่มา",
        blurb: "เมื่อความพยายามยังไม่ออกดอกออกผล จะคุยกับตัวเองยังไงดี",
        playable: true,
      },
      {
        id: "burnout-rescue",
        title: "เกม: กู้ไฟหมดใจ",
        blurb: "สังเกตสัญญาณหมดไฟ ก่อนใจจะดับสนิท",
        playable: true,
      },
      {
        id: "exam-eve",
        title: "เกม: คืนก่อนสอบ",
        blurb: "จัดการคืนที่สมองไม่ยอมหยุดคิด",
        playable: true,
      },
    ],
  },
  {
    id: "family",
    emoji: "🏠",
    title: "ครอบครัว",
    tagline: "สื่อสารกับบ้านให้เข้าใจกันมากขึ้น แม้ความคาดหวังจะหนัก",
    bg: "bg-amber-50",
    ring: "ring-amber-200",
    ink: "text-amber-700",
    games: [
      {
        id: "parent-translator",
        title: "เกม: แปลภาษาใจพ่อแม่",
        blurb: "คำพูดแรง ๆ บางคำ แอบซ่อนความห่วงอยู่ข้างใน",
        playable: true,
      },
      {
        id: "heavy-hopes",
        title: "เกม: ความคาดหวังที่หนักเกินไป",
        blurb: "ฝึกบอกขอบเขตกับคนที่บ้านอย่างนุ่มนวล",
        playable: true,
      },
    ],
  },
  {
    id: "romance",
    emoji: "💖",
    title: "ความรัก",
    tagline: "รักอย่างไรให้ไม่ลืมรักตัวเอง",
    bg: "bg-rose-50",
    ring: "ring-rose-200",
    ink: "text-rose-600",
    games: [
      {
        id: "red-flag-scanner",
        title: "เกม: สแกนเนอร์ Red Flag",
        blurb: "ฝึกจับสัญญาณความสัมพันธ์ Toxic ก่อนใจจะเจ็บ",
        playable: true,
      },
      {
        id: "heartbreak-care",
        title: "เกม: ใจสลายไม่สลายใจ",
        blurb: "รับมือความผิดหวังโดยไม่ทำร้ายตัวเอง",
        playable: true,
      },
    ],
  },
  {
    id: "social",
    emoji: "💬",
    title: "เพื่อนฝูง",
    tagline: "กล้าปฏิเสธ รับมือแรงกดดัน และดราม่าในกลุ่มเพื่อน",
    bg: "bg-lavender-50",
    ring: "ring-lavender-200",
    ink: "text-lavender-700",
    games: [
      {
        id: "ghosting-group",
        title: "งานกลุ่มที่เพื่อนหายเงียบ",
        blurb: "เส้นตายใกล้เข้ามา แต่เพื่อนอ่านไม่ตอบ — ฝึกตั้งขอบเขต",
        playable: true,
      },
      {
        id: "public-comment",
        title: "โดนเมนต์แรงหน้าห้อง",
        blurb: "รับมือคำพูดแรง ๆ โดยไม่เผาบ้านตัวเอง",
        playable: true,
      },
      {
        id: "dare-to-say-no",
        title: "เกม: กล้าพูดว่า “ไม่”",
        blurb: "ฝึกปฏิเสธแบบที่ยังรักษามิตรภาพไว้ได้",
        playable: true,
      },
    ],
  },
  {
    id: "self",
    emoji: "🌱",
    title: "ตัวฉันเอง",
    tagline: "มั่นใจในแบบที่เป็นเรา ทั้งข้างในและกระจก",
    bg: "bg-mint-50",
    ring: "ring-mint-200",
    ink: "text-mint-700",
    games: [
      {
        id: "mirror-heart",
        title: "เกม: กระจกใจ",
        blurb: "มอง Body Image ของตัวเองด้วยสายตาที่ใจดีขึ้น",
        playable: true,
      },
      {
        id: "inner-cheer",
        title: "เกม: เสียงเชียร์ในหัว",
        blurb: "เปลี่ยนเสียงตำหนิในหัวให้เป็นเสียงเชียร์",
        playable: true,
      },
    ],
  },
];

const slide = {
  initial: { opacity: 0, x: 44 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -44 },
};

export type LifeSkillGameHubProps = {
  /** Launch a playable game (id = LifeSkillGame scenario id). */
  onPlay?: (gameId: string) => void;
  className?: string;
};

export function LifeSkillGameHub({ onPlay, className }: LifeSkillGameHubProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduce = useReducedMotion();

  const coins = useGachaStore((s) => s.coins);
  const [openIsland, setOpenIsland] = useState<Island | null>(null);

  return (
    <div className={cn("mx-auto w-full max-w-md", className)}>
      {/* Top bar — title + Star Coin balance */}
      <header className="mb-4 flex items-center justify-between gap-3">
        <h1 className="font-display th:leading-snug text-[1.25rem] font-bold text-ink">
          ลานละเล่น & ฝึกทักษะชีวิต 🎮
        </h1>
        <span
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-[0.85rem] font-bold text-amber-700 ring-1 ring-amber-200"
          title="เหรียญดาวสำหรับหมุนกาชาปอง"
        >
          🌟 {mounted ? coins : "—"}
        </span>
      </header>

      {/* Mascot greeting */}
      <div className="mb-5 flex items-end gap-3">
        <FluffyMascot size={92} floating={!reduce} className="shrink-0" />
        <div className="relative mb-3 flex-1 rounded-2xl rounded-bl-md bg-white p-3.5 ring-1 ring-neutral-200">
          <p className="text-[0.84rem] leading-relaxed text-ink">
            วันนี้อยากฝึกทักษะรับมือกับเรื่องไหนดี?
            เล่นจบรับเหรียญดาวไปหมุนกาชาปองกัน! ✨
          </p>
        </div>
      </div>

      {/* Sync mode (not "wait"): the incoming view mounts immediately, so a
          browser that throttles rAF hard can never strand the user on a blank
          or frozen screen while an exit animation waits to finish. */}
      <AnimatePresence initial={false}>
        {openIsland === null ? (
          /* ------------------------------------------------ the island map */
          <motion.div key="map" {...(reduce ? {} : slide)} className="space-y-3 pb-2">
            {ISLANDS.map((island) => (
              <motion.button
                key={island.id}
                type="button"
                onClick={() => setOpenIsland(island)}
                whileHover={reduce ? undefined : { scale: 1.02, y: -2 }}
                whileTap={reduce ? undefined : { scale: 0.98 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className={cn(
                  "block w-full rounded-3xl p-4 text-left ring-1 transition-shadow hover:shadow-[0_18px_35px_-24px_rgba(15,32,25,0.45)]",
                  island.bg,
                  island.ring,
                )}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/80 text-[1.7rem] shadow-sm"
                    aria-hidden="true"
                  >
                    {island.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className={cn("text-[1.02rem] font-bold", island.ink)}>
                        {island.title}
                      </span>
                      <span className="rounded-full bg-white/80 px-2 py-0.5 text-[0.68rem] font-semibold text-ink-soft">
                        🎁 +{REWARDS.gameRound} เหรียญดาว
                      </span>
                    </span>
                    <span className="mt-1 block text-[0.78rem] leading-snug text-ink-soft">
                      {island.tagline}
                    </span>
                    <span className="mt-1.5 block text-[0.7rem] text-ink-mute">
                      {island.games.filter((g) => g.playable).length > 0
                        ? `เล่นได้แล้ว ${island.games.filter((g) => g.playable).length} เกม · ทั้งหมด ${island.games.length} เกม`
                        : `${island.games.length} เกม · เร็ว ๆ นี้`}
                    </span>
                  </span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          /* ----------------------------------------------- one island open */
          <motion.div key={openIsland.id} {...(reduce ? {} : slide)} className="pb-2">
            <button
              type="button"
              onClick={() => setOpenIsland(null)}
              className="mb-3 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[0.82rem] font-medium text-ink-soft ring-1 ring-neutral-200 transition hover:text-ink"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              กลับแผนที่
            </button>

            <div className={cn("rounded-3xl p-4 ring-1", openIsland.bg, openIsland.ring)}>
              <div className="mb-3 flex items-center gap-3">
                <span
                  className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/80 text-[1.5rem]"
                  aria-hidden="true"
                >
                  {openIsland.emoji}
                </span>
                <div>
                  <h2 className={cn("text-[1rem] font-bold", openIsland.ink)}>
                    เกาะ{openIsland.title}
                  </h2>
                  <p className="text-[0.74rem] text-ink-soft">{openIsland.tagline}</p>
                </div>
              </div>

              <ul className="space-y-2">
                {openIsland.games.map((g) =>
                  g.playable ? (
                    <li key={g.id}>
                      <button
                        type="button"
                        onClick={() => onPlay?.(g.id)}
                        className="flex w-full items-center gap-3 rounded-2xl bg-white p-3.5 text-left ring-1 ring-neutral-200 transition active:scale-[0.99] hover:ring-neutral-300"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-mint-100 text-mint-700">
                          <Play className="size-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[0.88rem] font-semibold text-ink">
                            {g.title}
                          </span>
                          <span className="mt-0.5 block text-[0.72rem] leading-snug text-ink-mute">
                            {g.blurb}
                          </span>
                        </span>
                        <span className="inline-flex shrink-0 items-center gap-1 text-[0.7rem] font-bold text-mint-700">
                          <Sparkles className="size-3.5" aria-hidden="true" />
                          เล่นเลย
                        </span>
                      </button>
                    </li>
                  ) : (
                    <li
                      key={g.id}
                      aria-disabled="true"
                      className="flex w-full items-center gap-3 rounded-2xl bg-white/60 p-3.5 ring-1 ring-neutral-200/70"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-neutral-100 text-ink-mute">
                        <Lock className="size-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[0.88rem] font-semibold text-ink-soft">
                          {g.title}
                        </span>
                        <span className="mt-0.5 block text-[0.72rem] leading-snug text-ink-mute">
                          {g.blurb}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-1 text-[0.66rem] font-medium text-ink-mute">
                        เร็ว ๆ นี้
                      </span>
                    </li>
                  ),
                )}
              </ul>

              <p className="mt-3 text-center text-[0.7rem] text-ink-mute">
                เล่นจบ 1 ตอน รับ 🌟 {REWARDS.gameRound} เหรียญดาว (วันละครั้ง)
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LifeSkillGameHub;
