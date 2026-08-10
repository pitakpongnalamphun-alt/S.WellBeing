"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Transition } from "framer-motion";
import { Coins, Gift, RotateCw, Sparkles } from "lucide-react";

import { FriendAvatar } from "@/components/gacha/FriendAvatar";
import { RARITY_META } from "@/data/fluffyFriends";
import {
  GACHA_COST,
  useGachaStore,
  type PullResult,
} from "@/lib/store/useGachaStore";

/** Gentle, non-bouncy easing used everywhere in the reveal. */
const EASE: Transition = { duration: 0.3, ease: [0.4, 0, 0.2, 1] };

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

/** A cute two-tone gacha capsule that wobbles before it pops open. */
function Capsule() {
  return (
    <div className="relative h-28 w-28 overflow-hidden rounded-full shadow-lg ring-1 ring-white/60">
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-violet-200 to-pink-300" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white/85" />
      <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 bg-white/70" />
      <div className="absolute left-5 top-5 h-6 w-6 rounded-full bg-white/70 blur-[2px]" />
      <div className="absolute inset-0 grid place-items-center">
        <Sparkles className="h-6 w-6 text-violet-400/70" />
      </div>
    </div>
  );
}

/** The idle capsule-machine illustration (pure decoration). */
function MachineGraphic() {
  return (
    <div className="relative mx-auto mb-5 h-40 w-36" aria-hidden="true">
      {/* glass dome with floating capsules */}
      <div className="absolute inset-x-1 top-0 h-24 overflow-hidden rounded-[45%] rounded-b-3xl bg-gradient-to-b from-white/80 to-violet-100/70 ring-1 ring-violet-100">
        <div className="absolute left-4 top-4 h-4 w-8 rounded-full bg-white/70 blur-[2px]" />
        {[
          { c: "bg-pink-300", l: "18%", t: "48%", d: 0 },
          { c: "bg-violet-300", l: "54%", t: "38%", d: 0.4 },
          { c: "bg-amber-300", l: "38%", t: "62%", d: 0.8 },
          { c: "bg-sky-300", l: "68%", t: "60%", d: 1.2 },
        ].map((b, i) => (
          <motion.span
            key={i}
            className={cx("absolute h-6 w-6 rounded-full shadow-sm", b.c)}
            style={{ left: b.l, top: b.t }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: b.d }}
          />
        ))}
      </div>
      {/* body */}
      <div className="absolute inset-x-0 bottom-0 h-20 rounded-3xl bg-gradient-to-b from-pink-200 to-pink-300 shadow-inner">
        <div className="absolute left-1/2 top-4 h-6 w-6 -translate-x-1/2 rounded-full bg-white/85 ring-2 ring-pink-200" />
        <div className="absolute bottom-4 left-1/2 h-4 w-16 -translate-x-1/2 rounded-lg bg-pink-400/40" />
      </div>
    </div>
  );
}

export function GachaMachine({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const coins = useGachaStore((s) => s.coins);
  const shards = useGachaStore((s) => s.shards);
  const pull = useGachaStore((s) => s.pull);

  const [result, setResult] = useState<PullResult | null>(null);
  const [phase, setPhase] = useState<"capsule" | "revealed">("capsule");

  // Every new result starts as a wobbling capsule, then pops open.
  useEffect(() => {
    if (!result) return;
    setPhase("capsule");
    const t = setTimeout(() => setPhase("revealed"), 850);
    return () => clearTimeout(t);
  }, [result]);

  const canPull = mounted && coins >= GACHA_COST;
  const notEnough = mounted && coins < GACHA_COST;

  const handleSpin = () => {
    const r = pull();
    if (!r) return; // not enough coins — the button is already disabled + a note shows
    // Reset to the capsule *synchronously* so a re-spin never paints the new
    // friend already revealed for a frame before the effect below runs.
    setPhase("capsule");
    setResult(r);
  };

  const meta = result ? RARITY_META[result.friend.rarity] : null;

  return (
    <section
      className={cx(
        "relative overflow-hidden rounded-3xl bg-gradient-to-b from-violet-50 via-pink-50 to-white p-5 shadow-sm ring-1 ring-violet-100",
        className,
      )}
    >
      {/* header */}
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/70 text-pink-400 shadow-sm ring-1 ring-pink-100">
            <Gift className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-700">ตู้กาชาปองเพื่อนปุย</h2>
            <p className="text-xs text-slate-400">หมุนเพื่อพบเพื่อนปุยตัวใหม่ 🧸</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-600">
            <Coins className="h-4 w-4" />
            {mounted ? coins : "—"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-600">
            <Sparkles className="h-4 w-4" />
            {mounted ? shards : "—"}
          </span>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {result && meta ? (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={EASE}
            className="grid place-items-center gap-3"
          >
            {/* capsule → friend swap */}
            <div className="relative h-[210px] w-full">
              <AnimatePresence mode="wait">
                {phase === "capsule" ? (
                  <motion.div
                    key="capsule"
                    className="absolute inset-0 grid place-items-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, rotate: [0, -9, 7, -5, 3, 0] }}
                    exit={{ scale: 1.35, opacity: 0 }}
                    transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <Capsule />
                  </motion.div>
                ) : (
                  <motion.div
                    key="friend"
                    className="absolute inset-0 grid place-items-center"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={EASE}
                  >
                    <div className="relative" style={{ width: 200, height: 200 }}>
                      {/* rarity ring + glow */}
                      <div className="absolute inset-0 grid place-items-center">
                        <div
                          className={cx("rounded-full ring-4", meta.ring)}
                          style={{ width: 170, height: 170, boxShadow: `0 0 42px 6px ${meta.glow}` }}
                        />
                      </div>
                      {/* sparkle flourish for rare / super rare */}
                      {Array.from({ length: meta.sparkles }).map((_, i) => {
                        const angle = (i / meta.sparkles) * Math.PI * 2;
                        const x = Math.cos(angle) * 90;
                        const y = Math.sin(angle) * 90;
                        return (
                          <motion.span
                            key={i}
                            className="pointer-events-none absolute text-lg"
                            style={{ left: 100 + x - 9, top: 100 + y - 9 }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [0, 1, 0.85, 1], opacity: [0, 1, 0.7, 1] }}
                            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
                          >
                            ✨
                          </motion.span>
                        );
                      })}
                      <div className="absolute inset-0 grid place-items-center">
                        <FriendAvatar friend={result.friend} size={140} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* details + actions (only once opened) */}
            {phase === "revealed" && (
              <motion.div
                role="status"
                aria-live="polite"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={EASE}
                className="grid w-full place-items-center gap-2 text-center"
              >
                <span
                  className={cx(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    meta.chip,
                  )}
                >
                  <Sparkles className="h-3 w-3" />
                  {meta.label}
                </span>
                <h3 className="text-xl font-bold text-slate-700">{result.friend.name}</h3>
                <p className="max-w-[17rem] text-sm text-slate-500">{result.friend.desc}</p>

                {result.isNew ? (
                  <p className="text-sm font-semibold text-pink-500">เพื่อนใหม่เข้าแก๊ง! 🎉</p>
                ) : (
                  <p className="text-sm font-medium text-violet-500">
                    เจอเพื่อนเดิม เลยกลายเป็นเศษดาว +{result.shardsGained} ✨
                  </p>
                )}

                <div className="mt-2 flex w-full gap-2">
                  <button
                    type="button"
                    onClick={handleSpin}
                    disabled={!canPull}
                    className={cx(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-full py-3 text-sm font-bold text-white shadow-md shadow-pink-200 transition active:scale-95",
                      canPull
                        ? "bg-gradient-to-r from-violet-400 to-pink-400"
                        : "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none active:scale-100",
                    )}
                  >
                    <RotateCw className="h-4 w-4" />
                    หมุนอีกครั้ง
                  </button>
                  <button
                    type="button"
                    onClick={() => setResult(null)}
                    className="flex-1 rounded-full bg-white py-3 text-sm font-semibold text-slate-500 ring-1 ring-slate-200 transition active:scale-95"
                  >
                    ปิด
                  </button>
                </div>

                {notEnough && (
                  <p className="text-xs text-rose-400">เหรียญดาวยังไม่พอ หมุนได้เมื่อครบ 100 นะ 🌟</p>
                )}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="machine"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={EASE}
          >
            <MachineGraphic />

            <button
              type="button"
              onClick={handleSpin}
              disabled={!canPull}
              className={cx(
                "flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-base font-bold text-white shadow-md shadow-pink-200 transition active:scale-95",
                canPull
                  ? "bg-gradient-to-r from-violet-400 to-pink-400"
                  : "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none active:scale-100",
              )}
            >
              <Sparkles className="h-5 w-5" />
              หมุนกาชา · 100 เหรียญ
            </button>

            {notEnough && (
              <p className="mt-2 text-center text-xs text-rose-400">
                เหรียญดาวยังไม่พอ หมุนได้เมื่อครบ 100 นะ 🌟
              </p>
            )}

            <p className="mt-3 text-center text-[11px] text-slate-400">
              โอกาส: Common 60% · Rare 30% · Super Rare 10%
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default GachaMachine;
