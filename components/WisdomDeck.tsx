"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, ChevronLeft, ChevronRight, Heart, Quote, Sparkles } from "lucide-react";

import {
  CATEGORY_META,
  CATEGORY_ORDER,
  THEMES,
  WISDOMS,
  WISDOM_BY_ID,
  type Wisdom,
  type WisdomCategory,
} from "@/data/wisdom";
import { useWisdomStore } from "@/lib/store/useWisdomStore";
import { PsychAvatar } from "@/components/wisdom/PsychAvatar";
import { localDay } from "@/lib/date";
import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------- the card */

function WisdomCard({
  w,
  saved,
  onToggleSave,
}: {
  w: Wisdom;
  saved: boolean;
  onToggleSave: () => void;
}) {
  const theme = THEMES[w.category];
  const cat = CATEGORY_META[w.category];
  return (
    <div
      className="flex h-full select-none flex-col rounded-[1.75rem] p-6 shadow-sm ring-1 ring-black/5"
      style={{ background: theme.gradient }}
    >
      <div className="flex items-center justify-between">
        <span
          className="rounded-full px-3 py-1 text-[0.72rem] font-semibold"
          style={{ backgroundColor: theme.chip, color: theme.chipInk }}
        >
          {cat.label}
        </span>
        <button
          type="button"
          onClick={onToggleSave}
          aria-pressed={saved}
          aria-label={saved ? "เอาออกจากที่เก็บ" : "เก็บคำคมนี้ไว้"}
          className="grid size-9 place-items-center rounded-full bg-white/70 transition active:scale-90"
        >
          <Heart className={cn("size-[1.15rem]", saved ? "fill-rose-400 text-rose-400" : "text-slate-400")} />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-4 text-center">
        <Quote className="mb-2 size-6" style={{ color: theme.ink, opacity: 0.5 }} aria-hidden="true" />
        <p className="font-display text-[1.32rem] font-medium leading-relaxed text-slate-700">
          “{w.quote}”
        </p>
      </div>

      <div className="flex items-center gap-3">
        <PsychAvatar spec={w.avatar} size={50} />
        <div className="min-w-0">
          <p className="text-[0.92rem] font-bold text-slate-700">{w.name}</p>
          <p className="text-[0.72rem] text-slate-500">{w.field} · {w.era}</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white/55 p-3.5">
        <p className="mb-1 flex items-center gap-1.5 text-[0.72rem] font-semibold" style={{ color: theme.ink }}>
          <Sparkles className="size-3.5" aria-hidden="true" />
          แนวทางลองปรับใช้
        </p>
        <p className="text-[0.82rem] leading-relaxed text-slate-600">{w.application}</p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- component */

const swipeVariants = {
  enter: (dir: number) => ({ x: dir >= 0 ? 320 : -320, opacity: 0, scale: 0.94 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir >= 0 ? -320 : 320, opacity: 0, scale: 0.94 }),
};

export function WisdomDeck({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const saved = useWisdomStore((s) => s.saved);
  const toggleSave = useWisdomStore((s) => s.toggleSave);

  const [tab, setTab] = useState<"deck" | "saved">("deck");
  const [cat, setCat] = useState<WisdomCategory | "all">("all");
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(0);

  const deck = useMemo(() => (cat === "all" ? WISDOMS : WISDOMS.filter((w) => w.category === cat)), [cat]);

  // Open on a deep-linked card (?id=) if present, else a day-rotated "today's
  // pick". Client-only so it can't cause a hydration mismatch. Category changes
  // reset the index synchronously in chooseCat() — never via a [cat] effect —
  // so this mount value is never clobbered.
  useEffect(() => {
    setMounted(true);
    const wantId = new URLSearchParams(window.location.search).get("id");
    const deepIdx = wantId ? WISDOMS.findIndex((w) => w.id === wantId) : -1;
    if (deepIdx >= 0) {
      setIndex(deepIdx);
      return;
    }
    const s = localDay();
    let h = 0;
    for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    setIndex(h % WISDOMS.length);
  }, []);

  function chooseCat(c: WisdomCategory | "all") {
    setCat(c);
    setIndex(0);
    setDir(0);
  }

  // Only saved ids that still resolve to a card — keeps the badge, empty state,
  // and list in agreement even if a wisdom is later removed or renamed.
  const validSaved = useMemo(
    () => (mounted ? saved.filter((id) => WISDOM_BY_ID[id]) : []),
    [mounted, saved],
  );
  const savedCount = validSaved.length;

  const safeIndex = deck.length ? Math.min(index, deck.length - 1) : 0;
  const current = deck[safeIndex];

  function go(delta: number) {
    if (deck.length === 0) return;
    setDir(delta);
    setIndex((i) => (Math.min(i, deck.length - 1) + delta + deck.length) % deck.length);
  }

  return (
    <div className={cn("mx-auto w-full max-w-md ipad:max-w-3xl", className)}>
      {/* Header */}
      <header className="mb-4 flex items-center gap-2">
        <Sparkles className="size-5 text-lavender-500" aria-hidden="true" />
        <div>
          <h1 className="font-display th:leading-snug text-[1.3rem] font-bold text-ink">แง่คิดเติมใจ</h1>
          <p className="text-[0.8rem] text-ink-soft">น้องปุยมีความคิดดี ๆ มาฝากทุกวัน</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="mb-4 flex rounded-full bg-slate-100 p-1 text-sm font-semibold">
        {([
          ["deck", "สำรวจ"],
          ["saved", "ที่เก็บไว้"],
        ] as ["deck" | "saved", string][]).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 transition",
              tab === id ? "bg-white text-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-600",
            )}
          >
            {label}
            {id === "saved" && savedCount > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-rose-400 text-[0.68rem] font-bold text-white">
                {savedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "deck" ? (
        <>
          {/* Category filter */}
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {(["all", ...CATEGORY_ORDER] as const).map((c) => {
              const active = cat === c;
              const label = c === "all" ? "ทั้งหมด" : CATEGORY_META[c].label;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => chooseCat(c)}
                  aria-pressed={active}
                  className={cn(
                    "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition active:scale-95",
                    active ? "bg-lavender-500 text-white shadow-sm" : "bg-white text-slate-500 ring-1 ring-slate-200 hover:ring-lavender-200",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Swipe deck */}
          <div className="relative h-[26rem] w-full">
            {/* a peeking stack behind, for depth */}
            <div className="absolute inset-x-3 top-2 h-full rounded-[1.75rem] bg-white/50 ring-1 ring-black/5" aria-hidden="true" />
            <AnimatePresence initial={false} custom={dir}>
              {current && (
                <motion.div
                  key={current.id}
                  custom={dir}
                  variants={swipeVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.6}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -80) go(1);
                    else if (info.offset.x > 80) go(-1);
                  }}
                  className="absolute inset-0 cursor-grab active:cursor-grabbing"
                >
                  <WisdomCard
                    w={current}
                    saved={mounted && saved.includes(current.id)}
                    onToggleSave={() => toggleSave(current.id)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Announce the current card to screen readers as the deck advances. */}
          <p className="sr-only" aria-live="polite">
            {current ? `${current.name}: ${current.quote} — ${safeIndex + 1} จาก ${deck.length}` : ""}
          </p>

          {/* Nav */}
          <div className="mt-4 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="ก่อนหน้า"
              className="grid size-11 place-items-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:text-slate-700 active:scale-95"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <span className="text-sm font-semibold tabular-nums text-slate-400">
              {deck.length ? safeIndex + 1 : 0} / {deck.length}
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="ถัดไป"
              className="grid size-11 place-items-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:text-slate-700 active:scale-95"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-3 text-center text-[0.72rem] text-ink-mute">ปัดซ้าย-ขวา หรือกดลูกศรเพื่ออ่านต่อ · แตะหัวใจเพื่อเก็บไว้</p>
        </>
      ) : (
        <SavedList mounted={mounted} ids={validSaved} onToggle={toggleSave} onExplore={() => setTab("deck")} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------- saved view */

function SavedList({
  mounted,
  ids,
  onToggle,
  onExplore,
}: {
  mounted: boolean;
  ids: string[];
  onToggle: (id: string) => void;
  onExplore: () => void;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  if (!mounted) return <p className="py-10 text-center text-[0.85rem] text-ink-mute">กำลังโหลด…</p>;

  if (ids.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-slate-50 px-6 py-12 text-center ring-1 ring-slate-100">
        <span className="grid size-14 place-items-center rounded-2xl bg-white text-rose-300 shadow-sm">
          <Bookmark className="size-6" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[0.92rem] font-semibold text-ink">ยังไม่มีคำคมที่เก็บไว้</p>
          <p className="mt-1 text-[0.8rem] text-ink-mute">เจอคำคมที่โดนใจ แตะหัวใจเก็บไว้อ่านซ้ำได้เลย</p>
        </div>
        <button type="button" onClick={onExplore} className="rounded-full bg-lavender-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-lavender-600">
          ไปสำรวจคำคม
        </button>
      </div>
    );
  }

  return (
    <ul
      ref={listRef}
      tabIndex={-1}
      className="space-y-3 focus:outline-none ipad:grid ipad:grid-cols-2 ipad:gap-3 ipad:space-y-0"
    >
      {ids.map((id) => {
        const w = WISDOM_BY_ID[id];
        if (!w) return null;
        const theme = THEMES[w.category];
        return (
          <li key={id} className="rounded-2xl p-4 ring-1 ring-black/5" style={{ background: theme.gradient }}>
            <div className="flex items-start gap-3">
              <PsychAvatar spec={w.avatar} size={44} />
              <div className="min-w-0 flex-1">
                <p className="font-display text-[0.95rem] font-medium leading-snug text-slate-700">“{w.quote}”</p>
                <p className="mt-1.5 text-[0.74rem] text-slate-500">{w.name} · {w.field}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  listRef.current?.focus(); // keep focus on the list, not <body>, when the row unmounts
                  onToggle(id);
                }}
                aria-label="เอาออกจากที่เก็บ"
                className="grid size-8 shrink-0 place-items-center rounded-full bg-white/70 transition active:scale-90"
              >
                <Heart className="size-4 fill-rose-400 text-rose-400" aria-hidden="true" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default WisdomDeck;
