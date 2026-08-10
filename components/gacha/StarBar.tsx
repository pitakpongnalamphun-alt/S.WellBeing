"use client";

import { useEffect, useState } from "react";
import { Coins, Flame, Sparkles } from "lucide-react";

import { useGachaStore } from "@/lib/store/useGachaStore";

/** Compact coins · shards · streak badges. Guards hydration (store rehydrates after mount). */
export function StarBar({ className }: { className?: string }) {
  const coins = useGachaStore((s) => s.coins);
  const shards = useGachaStore((s) => s.shards);
  const streak = useGachaStore((s) => s.streak);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const show = (n: number) => (mounted ? n : "—");

  return (
    <div className={["flex flex-wrap items-center justify-center gap-2 text-sm font-semibold", className ?? ""].filter(Boolean).join(" ")}>
      <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
        <Coins className="size-4" aria-hidden="true" />
        <span className="tabular-nums">{show(coins)}</span>
        <span className="sr-only">เหรียญดาว</span>
      </span>
      <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
        <Sparkles className="size-4" aria-hidden="true" />
        <span className="tabular-nums">{show(shards)}</span>
        <span className="sr-only">เศษดาว</span>
      </span>
      <span className="flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-rose-600">
        <Flame className="size-4" aria-hidden="true" />
        <span className="tabular-nums">{show(streak)}</span>
        <span>วัน</span>
      </span>
    </div>
  );
}

export default StarBar;
