"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Transition } from "framer-motion";
import { Coins, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { DecoSprite } from "@/components/gacha/DecoSprite";
import { DECORATIONS, DECO_SLOTS, type Decoration } from "@/data/cozyShop";
import { useGachaStore } from "@/lib/store/useGachaStore";

/**
 * ร้านของตกแต่ง (Cozy Shop) — buy decorations directly with Star Coins.
 * No gacha, no random frustration: you see the price, you pay it, it's yours.
 * Items are grouped into the three slots (หมวก / ใบหน้า / ของถือ) so it's easy
 * to browse. Owned pieces get a soft "มีแล้ว" badge; the rest show a buy button.
 */

const SOFT: Transition = { duration: 0.3, ease: [0.4, 0, 0.2, 1] };

export function CozyShop({ className }: { className?: string }) {
  const coins = useGachaStore((s) => s.coins);
  const decorations = useGachaStore((s) => s.decorations);
  const buyDecoration = useGachaStore((s) => s.buyDecoration);

  // Hydration guard: the store rehydrates from localStorage after mount, so we
  // must not render persisted values on the first client paint.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [toast, setToast] = useState<{ key: number; text: string } | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const owned = (id: string) => mounted && decorations.includes(id);

  const handleBuy = (deco: Decoration) => {
    if (buyDecoration(deco.id)) {
      setToast({ key: Date.now(), text: `ได้ ${deco.name} แล้ว! 🎀` });
    }
  };

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-xl rounded-3xl bg-gradient-to-b from-rose-50 via-pink-50 to-violet-50 p-4 sm:p-6",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-700">ร้านของตกแต่ง</h2>
          <p className="text-xs text-pink-400">Cozy Shop</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-600 shadow-sm">
          <Coins className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm font-semibold tabular-nums">{mounted ? coins : "—"}</span>
        </div>
      </div>

      {/* Helper text */}
      <div className="mt-3 rounded-2xl bg-white/70 px-4 py-3 text-xs leading-relaxed text-slate-500">
        ซื้อของแต่งได้ตรง ๆ ไม่ต้องลุ้นสุ่ม 💗 เอาไปแต่งตัวให้เพื่อนปุยในหน้าคอลเลกชันได้เลย
      </div>

      {/* Sections by slot */}
      <div className="mt-5 space-y-6">
        {DECO_SLOTS.map((slotDef) => {
          const items = DECORATIONS.filter((d) => d.slot === slotDef.slot);
          return (
            <section key={slotDef.slot}>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xl" aria-hidden="true">
                  {slotDef.emoji}
                </span>
                <h3 className="text-sm font-semibold text-slate-600">{slotDef.label}</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {items.map((deco) => {
                  const isOwned = owned(deco.id);
                  const canAfford = mounted && !isOwned && coins >= deco.price;

                  return (
                    <div
                      key={deco.id}
                      className="flex flex-col items-center gap-1.5 rounded-3xl bg-white p-3 text-center shadow-sm ring-1 ring-slate-100"
                    >
                      <span className="text-4xl leading-none" aria-hidden="true">
                        <DecoSprite id={deco.id} size={34} fallback={deco.emoji} />
                      </span>
                      <p className="line-clamp-2 min-h-[2.5rem] text-xs font-medium text-slate-600">
                        {deco.name}
                      </p>

                      <div className="flex items-center gap-1 text-amber-600">
                        <Coins className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="text-sm font-semibold tabular-nums">{deco.price}</span>
                      </div>

                      {isOwned ? (
                        <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-500">
                          <Check className="h-3 w-3" aria-hidden="true" />
                          มีแล้ว
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleBuy(deco)}
                          disabled={!canAfford}
                          className={cn(
                            "mt-0.5 rounded-full px-5 py-1 text-xs font-semibold shadow transition active:scale-95",
                            canAfford
                              ? "bg-pink-400 text-white hover:bg-pink-500"
                              : "cursor-not-allowed bg-slate-100 text-slate-400 shadow-none",
                          )}
                        >
                          ซื้อ
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Buy-success pop */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.key}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={SOFT}
            className="pointer-events-none fixed inset-x-0 bottom-6 z-50 mx-auto w-fit max-w-[90%] rounded-full bg-white/95 px-5 py-2.5 text-sm font-semibold text-pink-500 shadow-lg ring-1 ring-pink-100 backdrop-blur"
            role="status"
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CozyShop;
