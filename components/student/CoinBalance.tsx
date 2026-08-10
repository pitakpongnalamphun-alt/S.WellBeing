"use client";

import { useEffect, useState } from "react";
import { Coins } from "lucide-react";

import { useGachaStore } from "@/lib/store/useGachaStore";

export function CoinBalance() {
  const coins = useGachaStore((s) => s.coins);

  // The store rehydrates from storage after mount, so rendering the real value
  // on the server would mismatch the client. Show the shape, fill it in after.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[0.82rem] font-semibold text-amber-700">
      <Coins className="size-4" aria-hidden="true" />
      <span className="tabular-nums">{mounted ? coins : "—"}</span>
      <span className="sr-only">เหรียญ</span>
    </span>
  );
}
